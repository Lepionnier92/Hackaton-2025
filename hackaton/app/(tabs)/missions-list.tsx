import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { db, DBMission } from '@/services/database';

type TabType = 'proposed' | 'accepted' | 'completed';

export default function MissionsListScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('proposed');
  const [missions, setMissions] = useState<DBMission[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadMissions = useCallback(async () => {
    if (!user) return;
    try {
      const allMissions = await db.getMissionsForUser(user.id);
      setMissions(allMissions);
    } catch (error) {
      console.error('Erreur chargement missions:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadMissions();
  }, [loadMissions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMissions();
    setRefreshing(false);
  }, [loadMissions]);

  const filteredMissions = missions.filter(m => {
    switch (activeTab) {
      case 'proposed':
        return m.status === 'proposed';
      case 'accepted':
        return m.status === 'accepted' || m.status === 'in_progress';
      case 'completed':
        return m.status === 'completed';
      default:
        return true;
    }
  });

  const handleAccept = async (missionId: number) => {
    try {
      await db.updateMissionStatus(missionId, 'accepted');
      Alert.alert('Succès', 'Mission acceptée !');
      loadMissions();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'accepter la mission');
    }
  };

  const handleReject = async (missionId: number) => {
    Alert.alert(
      'Refuser la mission',
      'Êtes-vous sûr de vouloir refuser cette mission ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Refuser',
          style: 'destructive',
          onPress: async () => {
            try {
              await db.updateMissionStatus(missionId, 'rejected');
              loadMissions();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de refuser la mission');
            }
          },
        },
      ]
    );
  };

  const handleStart = async (missionId: number) => {
    try {
      await db.updateMissionStatus(missionId, 'in_progress');
      Alert.alert('Succès', 'Mission démarrée !');
      loadMissions();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de démarrer la mission');
    }
  };

  const handleComplete = async (missionId: number) => {
    Alert.alert(
      'Terminer la mission',
      'Confirmer que la mission est terminée ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              await db.updateMissionStatus(missionId, 'completed');
              Alert.alert('Succès', 'Mission terminée !');
              loadMissions();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de terminer la mission');
            }
          },
        },
      ]
    );
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return theme.error;
      case 'medium': return theme.warning;
      case 'low': return theme.success;
      default: return theme.textMuted;
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'Urgent';
      case 'medium': return 'Moyen';
      case 'low': return 'Normal';
      default: return urgency;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'proposed', label: 'Proposées', count: missions.filter(m => m.status === 'proposed').length },
    { key: 'accepted', label: 'En cours', count: missions.filter(m => m.status === 'accepted' || m.status === 'in_progress').length },
    { key: 'completed', label: 'Terminées', count: missions.filter(m => m.status === 'completed').length },
  ];

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <View className="pt-14 px-4 pb-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={{ color: theme.text }} className="text-2xl font-bold">Mes Missions</Text>
        </View>
      </View>

      {/* Tabs */}
      <View className="px-4 mb-4">
        <View className="flex-row rounded-xl p-1" style={{ backgroundColor: theme.card }}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className="flex-1 py-3 px-2 rounded-lg items-center"
              style={{ backgroundColor: activeTab === tab.key ? theme.accent : 'transparent' }}
            >
              <Text 
                className="font-semibold"
                style={{ color: activeTab === tab.key ? '#fff' : theme.textMuted }}
              >
                {tab.label}
              </Text>
              {tab.count > 0 && (
                <View 
                  className="mt-1 px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : theme.inputBackground }}
                >
                  <Text 
                    className="text-xs font-medium"
                    style={{ color: activeTab === tab.key ? '#fff' : theme.textMuted }}
                  >
                    {tab.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.text} />
        }
      >
        {filteredMissions.length === 0 ? (
          <View className="rounded-2xl p-8 items-center mt-4" style={{ backgroundColor: theme.card }}>
            <Ionicons 
              name={activeTab === 'proposed' ? 'document-text-outline' : 
                    activeTab === 'accepted' ? 'briefcase-outline' : 'checkmark-circle-outline'} 
              size={48} 
              color={theme.textMuted} 
            />
            <Text style={{ color: theme.textMuted }} className="mt-3 text-center">
              {activeTab === 'proposed' ? 'Aucune mission proposée' :
               activeTab === 'accepted' ? 'Aucune mission en cours' : 'Aucune mission terminée'}
            </Text>
          </View>
        ) : (
          filteredMissions.map((mission) => (
            <View
              key={mission.id}
              className="rounded-2xl p-4 mb-3"
              style={{ 
                backgroundColor: theme.card, 
                borderWidth: 1, 
                borderColor: mission.urgency === 'high' ? theme.error : theme.cardBorder 
              }}
            >
              {/* Header */}
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <View 
                      className="rounded-full px-2 py-0.5 mr-2"
                      style={{ backgroundColor: `${getUrgencyColor(mission.urgency)}20` }}
                    >
                      <Text style={{ color: getUrgencyColor(mission.urgency) }} className="text-xs font-medium">
                        {getUrgencyLabel(mission.urgency)}
                      </Text>
                    </View>
                    {mission.status === 'in_progress' && (
                      <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: '#3b82f620' }}>
                        <Text style={{ color: '#3b82f6' }} className="text-xs font-medium">En cours</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ color: theme.text }} className="font-semibold text-lg">{mission.title}</Text>
                </View>
                <Text style={{ color: theme.success }} className="font-bold text-lg">{mission.budget}€</Text>
              </View>

              {/* Description */}
              <Text style={{ color: theme.textMuted }} className="text-sm mb-3" numberOfLines={2}>
                {mission.description}
              </Text>

              {/* Details */}
              <View className="flex-row flex-wrap mb-3">
                <View className="flex-row items-center mr-4 mb-2">
                  <Ionicons name="location-outline" size={16} color={theme.textMuted} />
                  <Text style={{ color: theme.textMuted }} className="text-sm ml-1">{mission.location}</Text>
                </View>
                <View className="flex-row items-center mr-4 mb-2">
                  <Ionicons name="calendar-outline" size={16} color={theme.textMuted} />
                  <Text style={{ color: theme.textMuted }} className="text-sm ml-1">{formatDate(mission.startDate)}</Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="time-outline" size={16} color={theme.textMuted} />
                  <Text style={{ color: theme.textMuted }} className="text-sm ml-1">{mission.duration} jour(s)</Text>
                </View>
              </View>

              {/* Skills */}
              <View className="flex-row flex-wrap mb-4">
                {mission.skills.split(',').map((skill, index) => (
                  <View key={index} className="rounded-full px-3 py-1 mr-2 mb-1" style={{ backgroundColor: `${theme.accent}20` }}>
                    <Text style={{ color: theme.accent }} className="text-xs">{skill.trim()}</Text>
                  </View>
                ))}
              </View>

              {/* Actions */}
              {activeTab === 'proposed' && (
                <View className="flex-row">
                  <TouchableOpacity 
                    onPress={() => handleAccept(mission.id)}
                    className="flex-1 rounded-xl py-3 mr-2 items-center"
                    style={{ backgroundColor: theme.accent }}
                  >
                    <Text className="text-white font-semibold">Accepter</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleReject(mission.id)}
                    className="flex-1 rounded-xl py-3 ml-2 items-center"
                    style={{ backgroundColor: theme.inputBackground }}
                  >
                    <Text style={{ color: theme.textMuted }} className="font-semibold">Refuser</Text>
                  </TouchableOpacity>
                </View>
              )}

              {activeTab === 'accepted' && mission.status === 'accepted' && (
                <TouchableOpacity 
                  onPress={() => handleStart(mission.id)}
                  className="rounded-xl py-3 items-center"
                  style={{ backgroundColor: '#3b82f6' }}
                >
                  <Text className="text-white font-semibold">Démarrer la mission</Text>
                </TouchableOpacity>
              )}

              {activeTab === 'accepted' && mission.status === 'in_progress' && (
                <TouchableOpacity 
                  onPress={() => handleComplete(mission.id)}
                  className="rounded-xl py-3 items-center"
                  style={{ backgroundColor: theme.success }}
                >
                  <Text className="text-white font-semibold">Marquer comme terminée</Text>
                </TouchableOpacity>
              )}

              {activeTab === 'completed' && (
                <View className="flex-row items-center justify-center py-2">
                  <Ionicons name="checkmark-circle" size={20} color={theme.success} />
                  <Text style={{ color: theme.success }} className="font-medium ml-2">Mission terminée</Text>
                </View>
              )}
            </View>
          ))
        )}

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
