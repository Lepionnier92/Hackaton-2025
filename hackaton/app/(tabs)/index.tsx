import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { db, DBMission } from '@/services/database';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [missions, setMissions] = useState<DBMission[]>([]);
  const [stats, setStats] = useState({
    activeMissions: 0,
    completedThisMonth: 0,
    earnings: 0,
    rating: 4.9,
  });

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const allMissions = await db.getMissionsForUser(user.id);
      setMissions(allMissions);
      
      const activeMissions = allMissions.filter(m => m.status === 'accepted' || m.status === 'in_progress').length;
      const completedMissions = allMissions.filter(m => m.status === 'completed');
      const currentMonth = new Date().getMonth();
      const completedThisMonth = completedMissions.filter(m => 
        new Date(m.endDate).getMonth() === currentMonth
      ).length;
      const earnings = completedMissions.reduce((sum, m) => sum + m.budget, 0);
      
      setStats({
        activeMissions,
        completedThisMonth,
        earnings,
        rating: 4.9,
      });
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const currentMission = missions.find(m => m.status === 'in_progress' || m.status === 'accepted');
  const proposals = missions.filter(m => m.status === 'proposed').slice(0, 2);

  const handleAccept = async (missionId: number) => {
    try {
      await db.updateMissionStatus(missionId, 'accepted');
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleReject = async (missionId: number) => {
    try {
      await db.updateMissionStatus(missionId, 'rejected');
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.text}
          />
        }
      >
        {/* Header */}
        <View className="pt-14 px-4 pb-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text style={{ color: theme.textMuted }} className="text-base">{getGreeting()},</Text>
              <Text style={{ color: theme.text }} className="text-2xl font-bold">
                {user?.firstName || 'Technicien'}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/profile' as any)}
              className="rounded-full p-1"
              style={{ backgroundColor: theme.card }}
            >
              <Image
                source={{ uri: 'https://i.pravatar.cc/100' }}
                className="w-12 h-12 rounded-full"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Grid */}
        <View className="px-4 flex-row flex-wrap">
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/missions-list' as any)}
            className="w-1/2 pr-2 mb-3"
          >
            <View className="rounded-2xl p-4" style={{ backgroundColor: theme.card }}>
              <View className="rounded-full w-10 h-10 items-center justify-center mb-2" style={{ backgroundColor: `${theme.accent}20` }}>
                <Ionicons name="briefcase-outline" size={20} color={theme.accent} />
              </View>
              <Text style={{ color: theme.text }} className="text-2xl font-bold">{stats.activeMissions}</Text>
              <Text style={{ color: theme.textMuted }} className="text-sm">Missions actives</Text>
            </View>
          </TouchableOpacity>
          <View className="w-1/2 pl-2 mb-3">
            <View className="rounded-2xl p-4" style={{ backgroundColor: theme.card }}>
              <View className="rounded-full w-10 h-10 items-center justify-center mb-2" style={{ backgroundColor: `${theme.success}20` }}>
                <Ionicons name="checkmark-circle-outline" size={20} color={theme.success} />
              </View>
              <Text style={{ color: theme.text }} className="text-2xl font-bold">{stats.completedThisMonth}</Text>
              <Text style={{ color: theme.textMuted }} className="text-sm">Ce mois</Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/activity' as any)}
            className="w-1/2 pr-2"
          >
            <View className="rounded-2xl p-4" style={{ backgroundColor: theme.card }}>
              <View className="rounded-full w-10 h-10 items-center justify-center mb-2" style={{ backgroundColor: '#3b82f620' }}>
                <Ionicons name="wallet-outline" size={20} color="#3b82f6" />
              </View>
              <Text style={{ color: theme.text }} className="text-2xl font-bold">€{stats.earnings.toLocaleString()}</Text>
              <Text style={{ color: theme.textMuted }} className="text-sm">Revenus</Text>
            </View>
          </TouchableOpacity>
          <View className="w-1/2 pl-2">
            <View className="rounded-2xl p-4" style={{ backgroundColor: theme.card }}>
              <View className="rounded-full w-10 h-10 items-center justify-center mb-2" style={{ backgroundColor: '#eab30820' }}>
                <Ionicons name="star-outline" size={20} color="#eab308" />
              </View>
              <Text style={{ color: theme.text }} className="text-2xl font-bold">{stats.rating}</Text>
              <Text style={{ color: theme.textMuted }} className="text-sm">Note moyenne</Text>
            </View>
          </View>
        </View>

        {/* Mission en cours */}
        {currentMission && (
          <View className="px-4 mt-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text style={{ color: theme.text }} className="text-xl font-bold">Mission en cours</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/missions-list' as any)}>
                <Text style={{ color: theme.accent }} className="font-medium">Voir tout</Text>
              </TouchableOpacity>
            </View>
            <View className="rounded-2xl p-4" style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: `${theme.accent}50` }}>
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1">
                  <Text style={{ color: theme.text }} className="font-semibold text-lg">{currentMission.title}</Text>
                  <Text style={{ color: theme.textMuted }} className="text-sm">{currentMission.location}</Text>
                </View>
                <View className="rounded-full px-3 py-1" style={{ backgroundColor: currentMission.status === 'in_progress' ? '#3b82f620' : `${theme.success}20` }}>
                  <Text style={{ color: currentMission.status === 'in_progress' ? '#3b82f6' : theme.success }} className="text-sm font-medium">
                    {currentMission.status === 'in_progress' ? 'En cours' : 'Acceptée'}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-center mt-2">
                <View className="flex-row items-center mr-4">
                  <Ionicons name="calendar-outline" size={16} color={theme.textMuted} />
                  <Text style={{ color: theme.textMuted }} className="text-sm ml-1">
                    {new Date(currentMission.startDate).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="cash-outline" size={16} color={theme.success} />
                  <Text style={{ color: theme.success }} className="text-sm ml-1 font-medium">{currentMission.budget}€</Text>
                </View>
              </View>

              <TouchableOpacity 
                onPress={() => router.push('/(tabs)/missions-list' as any)}
                className="rounded-xl py-3 mt-4 items-center"
                style={{ backgroundColor: theme.accent }}
              >
                <Text className="text-white font-semibold">Voir les détails</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Nouvelles propositions */}
        <View className="px-4 mt-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text style={{ color: theme.text }} className="text-xl font-bold">Nouvelles propositions</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/missions-list' as any)}>
              <Text style={{ color: theme.accent }} className="font-medium">Voir tout</Text>
            </TouchableOpacity>
          </View>

          {proposals.length === 0 ? (
            <View className="rounded-2xl p-6 items-center" style={{ backgroundColor: theme.card }}>
              <Ionicons name="document-text-outline" size={48} color={theme.textMuted} />
              <Text style={{ color: theme.textMuted }} className="mt-3">Aucune nouvelle proposition</Text>
            </View>
          ) : (
            proposals.map((proposal) => (
              <TouchableOpacity
                key={proposal.id}
                className="rounded-2xl p-4 mb-3"
                style={{ 
                  backgroundColor: theme.card,
                  borderWidth: 1, 
                  borderColor: proposal.urgency === 'high' ? theme.error : theme.cardBorder 
                }}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      {proposal.urgency === 'high' && (
                        <View className="rounded-full px-2 py-0.5 mr-2" style={{ backgroundColor: `${theme.error}20` }}>
                          <Text style={{ color: theme.error }} className="text-xs font-medium">Urgent</Text>
                        </View>
                      )}
                    </View>
                    <Text style={{ color: theme.text }} className="font-semibold text-base mt-2">{proposal.title}</Text>
                    <Text style={{ color: theme.textMuted }} className="text-sm">{proposal.location}</Text>
                  </View>
                  <Text style={{ color: theme.text }} className="font-bold text-lg">€{proposal.budget.toLocaleString()}</Text>
                </View>

                <View className="flex-row items-center mt-3">
                  <View className="flex-row items-center mr-4">
                    <Ionicons name="location-outline" size={16} color={theme.textMuted} />
                    <Text style={{ color: theme.textMuted }} className="text-sm ml-1">{proposal.location}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={16} color={theme.textMuted} />
                    <Text style={{ color: theme.textMuted }} className="text-sm ml-1">{proposal.duration} jour(s)</Text>
                  </View>
                </View>

                <View className="flex-row mt-4">
                  <TouchableOpacity 
                    onPress={() => handleAccept(proposal.id)}
                    className="flex-1 rounded-xl py-3 mr-2 items-center"
                    style={{ backgroundColor: theme.accent }}
                  >
                    <Text className="text-white font-semibold">Accepter</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleReject(proposal.id)}
                    className="flex-1 rounded-xl py-3 ml-2 items-center"
                    style={{ backgroundColor: theme.inputBackground }}
                  >
                    <Text style={{ color: theme.textMuted }} className="font-semibold">Refuser</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View className="px-4 mt-6">
          <Text style={{ color: theme.text }} className="text-xl font-bold mb-4">Accès rapide</Text>
          <View className="flex-row">
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/agenda' as any)}
              className="flex-1 rounded-2xl p-4 mr-2 items-center"
              style={{ backgroundColor: theme.card }}
            >
              <View className="rounded-full w-12 h-12 items-center justify-center mb-2" style={{ backgroundColor: `${theme.accent}20` }}>
                <Ionicons name="calendar-outline" size={24} color={theme.accent} />
              </View>
              <Text style={{ color: theme.text }} className="font-medium">Agenda</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/messages' as any)}
              className="flex-1 rounded-2xl p-4 mx-2 items-center"
              style={{ backgroundColor: theme.card }}
            >
              <View className="rounded-full w-12 h-12 items-center justify-center mb-2" style={{ backgroundColor: '#3b82f620' }}>
                <Ionicons name="chatbubble-outline" size={24} color="#3b82f6" />
              </View>
              <Text style={{ color: theme.text }} className="font-medium">Messages</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/activity' as any)}
              className="flex-1 rounded-2xl p-4 ml-2 items-center"
              style={{ backgroundColor: theme.card }}
            >
              <View className="rounded-full w-12 h-12 items-center justify-center mb-2" style={{ backgroundColor: `${theme.success}20` }}>
                <Ionicons name="wallet-outline" size={24} color={theme.success} />
              </View>
              <Text style={{ color: theme.text }} className="font-medium">Revenus</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
