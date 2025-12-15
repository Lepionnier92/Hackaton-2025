import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { db, DBMission } from '@/services/database';

export default function MissionDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const [mission, setMission] = useState<DBMission | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    loadMission();
  }, [id]);

  const loadMission = async () => {
    try {
      const missions = await db.getAllMissions();
      const found = missions.find(m => m.id === Number(id));
      setMission(found || null);
    } catch (error) {
      console.error('Error loading mission:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!mission) return;
    Alert.alert(
      'Accepter la mission',
      'Êtes-vous sûr de vouloir accepter cette mission ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Accepter',
          onPress: async () => {
            setAccepting(true);
            try {
              await db.updateMissionStatus(mission.id, 'accepted');
              Alert.alert(
                'Mission acceptée',
                'La mission a été acceptée avec succès.',
                [{ text: 'OK', onPress: () => router.back() }]
              );
            } catch (error) {
              Alert.alert('Erreur', 'Impossible d\'accepter la mission');
            } finally {
              setAccepting(false);
            }
          },
        },
      ]
    );
  };

  const handleReject = async () => {
    if (!mission) return;
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
              await db.updateMissionStatus(mission.id, 'rejected');
              Alert.alert('Mission refusée', 'La mission a été refusée.', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de refuser la mission');
            }
          },
        },
      ]
    );
  };

  const handleComplete = async () => {
    if (!mission) return;
    Alert.alert(
      'Terminer la mission',
      'Confirmez-vous avoir terminé cette mission ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              await db.updateMissionStatus(mission.id, 'completed');
              Alert.alert('Mission terminée', 'Félicitations !', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de terminer la mission');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#B8C901" />
      </View>
    );
  }

  if (!mission) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Ionicons name="alert-circle-outline" size={48} color="#d1d5db" />
        <Text className="text-gray-500 mt-4">Mission non trouvée</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-[#B8C901] px-6 py-3 rounded-lg">
          <Text className="text-white font-medium">Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const urgencyColors = {
    low: { bg: 'bg-green-100', text: 'text-green-800' },
    medium: { bg: 'bg-orange-100', text: 'text-orange-800' },
    high: { bg: 'bg-red-100', text: 'text-red-800' },
  };

  const urgencyLabels = {
    low: 'Priorité normale',
    medium: 'Priorité moyenne',
    high: 'Urgente',
  };

  const statusLabels = {
    proposed: 'Proposée',
    accepted: 'Acceptée',
    in_progress: 'En cours',
    completed: 'Terminée',
    rejected: 'Refusée',
  };

  const skills = mission.skills ? mission.skills.split(',').map(s => s.trim()) : [];

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-[#B8C901] pt-12 pb-6 px-4">
          <TouchableOpacity onPress={() => router.back()} className="mb-4 flex-row items-center">
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text className="text-white ml-2">Retour</Text>
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold mb-2">{mission.title}</Text>
          <View className="flex-row items-center">
            <View className={`px-3 py-1 rounded-full ${urgencyColors[mission.urgency].bg}`}>
              <Text className={`text-sm font-medium ${urgencyColors[mission.urgency].text}`}>
                {urgencyLabels[mission.urgency]}
              </Text>
            </View>
            <View className="bg-white/20 px-3 py-1 rounded-full ml-2">
              <Text className="text-white text-sm">{statusLabels[mission.status]}</Text>
            </View>
          </View>
        </View>

        {/* Informations clés */}
        <View className="bg-white mx-4 -mt-4 rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
          <View className="flex-row items-center mb-4">
            <Ionicons name="calendar" size={20} color="#B8C901" />
            <View className="ml-3 flex-1">
              <Text className="text-gray-600 text-sm">Dates</Text>
              <Text className="text-gray-800 font-semibold">
                Du {new Date(mission.startDate).toLocaleDateString('fr-FR')} au{' '}
                {new Date(mission.endDate).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mb-4">
            <Ionicons name="time" size={20} color="#B8C901" />
            <View className="ml-3 flex-1">
              <Text className="text-gray-600 text-sm">Durée</Text>
              <Text className="text-gray-800 font-semibold">{mission.duration} jour(s)</Text>
            </View>
          </View>

          <View className="flex-row items-center mb-4">
            <Ionicons name="location" size={20} color="#B8C901" />
            <View className="ml-3 flex-1">
              <Text className="text-gray-600 text-sm">Lieu</Text>
              <Text className="text-gray-800 font-semibold">{mission.location}</Text>
              {mission.address && (
                <Text className="text-gray-500 text-sm">{mission.address}</Text>
              )}
            </View>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="cash" size={20} color="#10b981" />
            <View className="ml-3 flex-1">
              <Text className="text-gray-600 text-sm">Rémunération</Text>
              <Text className="text-green-600 font-bold text-lg">{mission.budget} €</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {mission.description && (
          <View className="bg-white mx-4 rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
            <Text className="text-lg font-bold mb-3 text-gray-800">Description</Text>
            <Text className="text-gray-700 leading-6">{mission.description}</Text>
          </View>
        )}

        {/* Compétences requises */}
        {skills.length > 0 && (
          <View className="bg-white mx-4 rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
            <Text className="text-lg font-bold mb-3 text-gray-800">Compétences requises</Text>
            <View className="flex-row flex-wrap">
              {skills.map((skill, index) => (
                <View key={index} className="bg-[#B8C901]/10 px-3 py-2 rounded-full mr-2 mb-2">
                  <Text className="text-[#B8C901]">{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className="h-24" />
      </ScrollView>

      {/* Boutons d'action */}
      {mission.status === 'proposed' && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleReject}
              className="flex-1 bg-gray-200 py-4 rounded-xl items-center"
            >
              <Text className="text-gray-700 font-semibold">Refuser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAccept}
              disabled={accepting}
              className="flex-1 bg-[#B8C901] py-4 rounded-xl items-center"
            >
              <Text className="text-white font-semibold">
                {accepting ? 'Envoi...' : 'Accepter'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {(mission.status === 'accepted' || mission.status === 'in_progress') && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <TouchableOpacity
            onPress={handleComplete}
            className="bg-green-500 py-4 rounded-xl items-center"
          >
            <Text className="text-white font-semibold">Marquer comme terminée</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
