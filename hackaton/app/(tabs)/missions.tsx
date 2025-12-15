import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { db, DBMission } from '@/services/database';

type Tab = 'proposed' | 'accepted' | 'completed';

export default function MissionsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('proposed');
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

  const filteredMissions = missions.filter(m => {
    if (activeTab === 'proposed') return m.status === 'proposed';
    if (activeTab === 'accepted') return m.status === 'accepted' || m.status === 'in_progress';
    if (activeTab === 'completed') return m.status === 'completed';
    return false;
  });

  const urgencyColors = {
    low: { bg: 'bg-green-100', text: 'text-green-800', label: 'Normal' },
    medium: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Moyenne' },
    high: { bg: 'bg-red-100', text: 'text-red-800', label: 'Urgente' },
  };

  const tabCounts = {
    proposed: missions.filter(m => m.status === 'proposed').length,
    accepted: missions.filter(m => m.status === 'accepted' || m.status === 'in_progress').length,
    completed: missions.filter(m => m.status === 'completed').length,
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-[#B8C901] pt-12 pb-4 px-4">
        <View className="flex-row items-center mb-4">
          <View className="bg-white/20 rounded-lg p-2 mr-3">
            <Ionicons name="briefcase" size={24} color="white" />
          </View>
          <View>
            <Text className="text-white text-2xl font-bold">Mes missions</Text>
            <Text className="text-white/70 text-sm">{missions.length} mission(s) au total</Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row bg-white/20 rounded-lg p-1">
          <TouchableOpacity
            onPress={() => setActiveTab('proposed')}
            className={`flex-1 py-2 rounded-md ${activeTab === 'proposed' ? 'bg-white' : ''}`}
          >
            <Text className={`text-center font-medium ${activeTab === 'proposed' ? 'text-[#B8C901]' : 'text-white'}`}>
              Proposées ({tabCounts.proposed})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('accepted')}
            className={`flex-1 py-2 rounded-md ${activeTab === 'accepted' ? 'bg-white' : ''}`}
          >
            <Text className={`text-center font-medium ${activeTab === 'accepted' ? 'text-[#B8C901]' : 'text-white'}`}>
              En cours ({tabCounts.accepted})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('completed')}
            className={`flex-1 py-2 rounded-md ${activeTab === 'completed' ? 'bg-white' : ''}`}
          >
            <Text className={`text-center font-medium ${activeTab === 'completed' ? 'text-[#B8C901]' : 'text-white'}`}>
              Terminées ({tabCounts.completed})
            </Text>
          </TouchableOpacity>
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
          {filteredMissions.length === 0 ? (
            <View className="items-center py-12">
              <View className="bg-gray-100 rounded-full p-6 mb-4">
                <Ionicons 
                  name={activeTab === 'proposed' ? 'time-outline' : activeTab === 'accepted' ? 'construct-outline' : 'checkmark-done-outline'} 
                  size={48} 
                  color="#d1d5db" 
                />
              </View>
              <Text className="text-gray-600 font-medium text-center">
                {activeTab === 'proposed' && 'Aucune mission proposée'}
                {activeTab === 'accepted' && 'Aucune mission en cours'}
                {activeTab === 'completed' && 'Aucune mission terminée'}
              </Text>
              <Text className="text-gray-400 text-sm text-center mt-1">
                {activeTab === 'proposed' && 'Les nouvelles missions apparaîtront ici'}
                {activeTab === 'accepted' && 'Acceptez une mission pour commencer'}
                {activeTab === 'completed' && 'Vos missions terminées apparaîtront ici'}
              </Text>
            </View>
          ) : (
            filteredMissions.map((mission) => (
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

                {mission.description && (
                  <Text className="text-gray-500 text-sm mb-2" numberOfLines={2}>
                    {mission.description}
                  </Text>
                )}

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
                    {mission.duration && (
                      <Text className="text-gray-400 ml-2">• {mission.duration} jour(s)</Text>
                    )}
                  </View>
                  <Text className="text-[#B8C901] font-bold">{mission.budget} €</Text>
                </View>

                {/* Skills tags */}
                {mission.skills && (
                  <View className="flex-row flex-wrap mt-2">
                    {mission.skills.split(',').slice(0, 3).map((skill, index) => (
                      <View key={index} className="bg-[#B8C901]/10 px-2 py-1 rounded mr-1 mb-1">
                        <Text className="text-[#B8C901] text-xs">{skill.trim()}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}

          <View className="h-8" />
        </ScrollView>
      )}
    </View>
  );
}
