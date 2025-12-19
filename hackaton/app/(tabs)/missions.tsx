import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Platform, Alert } from 'react-native';
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
  const [processingId, setProcessingId] = useState<number | null>(null);

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

  const handleAcceptMission = async (missionId: number) => {
    setProcessingId(missionId);
    try {
      await db.updateMissionStatus(missionId, 'accepted');
      await loadMissions();
      if (Platform.OS === 'web') {
        window.alert('Mission acceptée avec succès !');
      } else {
        Alert.alert('Succès', 'Mission acceptée avec succès !');
      }
    } catch (error) {
      console.error('Error accepting mission:', error);
      if (Platform.OS === 'web') {
        window.alert('Erreur lors de l\'acceptation');
      } else {
        Alert.alert('Erreur', 'Impossible d\'accepter la mission');
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectMission = async (missionId: number) => {
    const doReject = async () => {
      setProcessingId(missionId);
      try {
        await db.updateMissionStatus(missionId, 'rejected');
        await loadMissions();
      } catch (error) {
        console.error('Error rejecting mission:', error);
      } finally {
        setProcessingId(null);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Êtes-vous sûr de vouloir refuser cette mission ?')) {
        await doReject();
      }
    } else {
      Alert.alert(
        'Refuser la mission',
        'Êtes-vous sûr de vouloir refuser cette mission ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Refuser', style: 'destructive', onPress: doReject },
        ]
      );
    }
  };

  const handleCompleteMission = async (missionId: number) => {
    const doComplete = async () => {
      setProcessingId(missionId);
      try {
        await db.updateMissionStatus(missionId, 'completed');
        await loadMissions();
        if (Platform.OS === 'web') {
          window.alert('Mission marquée comme terminée !');
        } else {
          Alert.alert('Succès', 'Mission marquée comme terminée !');
        }
      } catch (error) {
        console.error('Error completing mission:', error);
      } finally {
        setProcessingId(null);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Marquer cette mission comme terminée ?')) {
        await doComplete();
      }
    } else {
      Alert.alert(
        'Terminer la mission',
        'Marquer cette mission comme terminée ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Terminer', onPress: doComplete },
        ]
      );
    }
  };

  const handleStartMission = async (missionId: number) => {
    setProcessingId(missionId);
    try {
      await db.updateMissionStatus(missionId, 'in_progress');
      await loadMissions();
    } catch (error) {
      console.error('Error starting mission:', error);
    } finally {
      setProcessingId(null);
    }
  };

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
        <ActivityIndicator size="large" color="#006241" />
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
      <View className="bg-[#006241] pt-12 pb-4 px-4">
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
            <Text className={`text-center font-medium ${activeTab === 'proposed' ? 'text-[#006241]' : 'text-white'}`}>
              Proposées ({tabCounts.proposed})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('accepted')}
            className={`flex-1 py-2 rounded-md ${activeTab === 'accepted' ? 'bg-white' : ''}`}
          >
            <Text className={`text-center font-medium ${activeTab === 'accepted' ? 'text-[#006241]' : 'text-white'}`}>
              En cours ({tabCounts.accepted})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('completed')}
            className={`flex-1 py-2 rounded-md ${activeTab === 'completed' ? 'bg-white' : ''}`}
          >
            <Text className={`text-center font-medium ${activeTab === 'completed' ? 'text-[#006241]' : 'text-white'}`}>
              Terminées ({tabCounts.completed})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#006241" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-4"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#006241']} />}
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
                  <Text className="text-[#006241] font-bold">{mission.budget} €</Text>
                </View>

                {/* Skills tags */}
                {mission.skills && (
                  <View className="flex-row flex-wrap mt-2">
                    {mission.skills.split(',').slice(0, 3).map((skill, index) => (
                      <View key={index} className="bg-[#006241]/10 px-2 py-1 rounded mr-1 mb-1">
                        <Text className="text-[#006241] text-xs">{skill.trim()}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Boutons Accepter/Refuser pour missions proposées */}
                {mission.status === 'proposed' && (
                  <View className="flex-row mt-3 pt-3 border-t border-gray-100">
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleRejectMission(mission.id);
                      }}
                      disabled={processingId === mission.id}
                      className="flex-1 flex-row items-center justify-center py-2 mr-2 bg-red-50 rounded-lg border border-red-200"
                    >
                      {processingId === mission.id ? (
                        <ActivityIndicator size="small" color="#ef4444" />
                      ) : (
                        <>
                          <Ionicons name="close-circle-outline" size={18} color="#ef4444" />
                          <Text className="text-red-500 font-medium ml-1">Refuser</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleAcceptMission(mission.id);
                      }}
                      disabled={processingId === mission.id}
                      className="flex-1 flex-row items-center justify-center py-2 bg-[#006241] rounded-lg"
                    >
                      {processingId === mission.id ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <>
                          <Ionicons name="checkmark-circle-outline" size={18} color="white" />
                          <Text className="text-white font-medium ml-1">Accepter</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {/* Statut pour missions en cours */}
                {(mission.status === 'accepted' || mission.status === 'in_progress') && (
                  <View className="mt-3 pt-3 border-t border-gray-100">
                    <View className="flex-row items-center justify-between mb-3">
                      <View className={`flex-row items-center px-3 py-1 rounded-full ${mission.status === 'in_progress' ? 'bg-blue-100' : 'bg-green-100'}`}>
                        <Ionicons 
                          name={mission.status === 'in_progress' ? 'construct' : 'checkmark-circle'} 
                          size={14} 
                          color={mission.status === 'in_progress' ? '#3b82f6' : '#22c55e'} 
                        />
                        <Text className={`ml-1 text-sm font-medium ${mission.status === 'in_progress' ? 'text-blue-600' : 'text-green-600'}`}>
                          {mission.status === 'in_progress' ? 'En cours' : 'Acceptée'}
                        </Text>
                      </View>
                    </View>
                    
                    {/* Boutons d'action pour missions en cours */}
                    <View className="flex-row">
                      {mission.status === 'accepted' && (
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            handleStartMission(mission.id);
                          }}
                          disabled={processingId === mission.id}
                          className="flex-1 flex-row items-center justify-center py-2 mr-2 bg-blue-500 rounded-lg"
                        >
                          {processingId === mission.id ? (
                            <ActivityIndicator size="small" color="white" />
                          ) : (
                            <>
                              <Ionicons name="play" size={16} color="white" />
                              <Text className="text-white font-medium ml-1">Démarrer</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleCompleteMission(mission.id);
                        }}
                        disabled={processingId === mission.id}
                        className={`flex-1 flex-row items-center justify-center py-2 bg-green-500 rounded-lg ${mission.status === 'accepted' ? '' : ''}`}
                      >
                        {processingId === mission.id ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <>
                            <Ionicons name="checkmark-done" size={16} color="white" />
                            <Text className="text-white font-medium ml-1">Terminer</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Badge terminée */}
                {mission.status === 'completed' && (
                  <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100">
                    <View className="flex-row items-center px-3 py-1 rounded-full bg-green-100">
                      <Ionicons name="checkmark-done-circle" size={14} color="#22c55e" />
                      <Text className="ml-1 text-sm font-medium text-green-600">Terminée</Text>
                    </View>
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
