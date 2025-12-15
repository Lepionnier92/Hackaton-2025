import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { db, DBMission } from '@/services/database';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [missions, setMissions] = useState<DBMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMissions = useCallback(async () => {
    if (!user) return;
    try {
      const userMissions = await db.getMissionsForUser(user.id);
      setMissions(userMissions);
    } catch (error) {
      console.error('Error loading missions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadMissions();
  }, [loadMissions]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMissions();
  }, [loadMissions]);

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#B8C901" />
      </View>
    );
  }

  const proposedMissions = missions.filter(m => m.status === 'proposed');
  const acceptedMissions = missions.filter(m => m.status === 'accepted' || m.status === 'in_progress');
  const completedMissions = missions.filter(m => m.status === 'completed');

  const urgencyColors = {
    low: { bg: 'bg-green-100', text: 'text-green-800', label: 'Normal' },
    medium: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Moyenne' },
    high: { bg: 'bg-red-100', text: 'text-red-800', label: 'Urgente' },
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-[#B8C901] pt-12 pb-6 px-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="bg-white rounded-lg p-2 mr-2">
              <Ionicons name="construct" size={20} color="#B8C901" />
            </View>
            <Text className="text-white text-xl font-bold">TENEX</Text>
            <Text className="text-white/70 ml-1">Workforce</Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/profile' as any)}
            className="bg-white/20 rounded-full p-1"
          >
            {user.profilePicture ? (
              <Image source={{ uri: user.profilePicture }} className="w-10 h-10 rounded-full" />
            ) : (
              <View className="w-10 h-10 rounded-full bg-white/30 items-center justify-center">
                <Ionicons name="person" size={20} color="white" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View className="bg-white/20 rounded-xl p-4">
          <Text className="text-white/70 text-sm">Bonjour,</Text>
          <Text className="text-white text-xl font-bold">{user.firstName} {user.lastName}</Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#B8C901" />
        </View>
      ) : (
        <ScrollView 
          className="flex-1 px-4 pt-4"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#B8C901']} />}
        >
          {/* Stats rapides */}
          <View className="flex-row mb-6">
            <View className="flex-1 bg-white rounded-xl p-4 mr-2 shadow-sm">
              <View className="flex-row items-center">
                <View className="bg-[#B8C901]/10 rounded-lg p-2 mr-3">
                  <Ionicons name="time" size={20} color="#B8C901" />
                </View>
                <View>
                  <Text className="text-gray-500 text-xs">En attente</Text>
                  <Text className="text-2xl font-bold text-gray-800">{proposedMissions.length}</Text>
                </View>
              </View>
            </View>
            <View className="flex-1 bg-white rounded-xl p-4 ml-2 shadow-sm">
              <View className="flex-row items-center">
                <View className="bg-green-100 rounded-lg p-2 mr-3">
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                </View>
                <View>
                  <Text className="text-gray-500 text-xs">Terminées</Text>
                  <Text className="text-2xl font-bold text-gray-800">{completedMissions.length}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Missions proposées */}
          {proposedMissions.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-800 mb-3">Nouvelles propositions</Text>
              {proposedMissions.map((mission) => (
                <TouchableOpacity
                  key={mission.id}
                  onPress={() => router.push(`/mission/${mission.id}` as any)}
                  className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-gray-800 font-semibold flex-1 mr-2">{mission.title}</Text>
                    <View className={`px-2 py-1 rounded-full ${urgencyColors[mission.urgency].bg}`}>
                      <Text className={`text-xs font-medium ${urgencyColors[mission.urgency].text}`}>
                        {urgencyColors[mission.urgency].label}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="location-outline" size={16} color="#6b7280" />
                    <Text className="text-gray-500 ml-1">{mission.location}</Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                      <Text className="text-gray-500 ml-1">
                        {new Date(mission.startDate).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>
                    <Text className="text-[#B8C901] font-bold">{mission.budget} €</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Missions en cours */}
          {acceptedMissions.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-800 mb-3">Missions en cours</Text>
              {acceptedMissions.map((mission) => (
                <TouchableOpacity
                  key={mission.id}
                  onPress={() => router.push(`/mission/${mission.id}` as any)}
                  className="bg-white rounded-xl p-4 mb-3 shadow-sm border-l-4 border-[#B8C901]"
                >
                  <Text className="text-gray-800 font-semibold mb-2">{mission.title}</Text>
                  <View className="flex-row items-center">
                    <Ionicons name="location-outline" size={16} color="#6b7280" />
                    <Text className="text-gray-500 ml-1">{mission.location}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* État vide */}
          {missions.length === 0 && (
            <View className="items-center py-12">
              <View className="bg-gray-100 rounded-full p-6 mb-4">
                <Ionicons name="briefcase-outline" size={48} color="#d1d5db" />
              </View>
              <Text className="text-gray-600 font-medium text-center text-lg">
                Aucune mission pour le moment
              </Text>
              <Text className="text-gray-400 text-sm text-center mt-2 px-8">
                Les administrateurs TENEX vous proposeront des missions adaptées à vos compétences.
              </Text>
            </View>
          )}

          <View className="h-8" />
        </ScrollView>
      )}
    </View>
  );
}
