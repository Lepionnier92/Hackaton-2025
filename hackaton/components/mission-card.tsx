import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MissionCardProps {
  mission: {
    id: string;
    title: string;
    location: string;
    startDate: string;
    duration: number;
    budget: number;
    urgency: 'low' | 'medium' | 'high';
    skills: string[];
    distance?: number;
  };
  onPress?: () => void;
}

export function MissionCard({ mission, onPress }: MissionCardProps) {
  const urgencyColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-orange-100 text-orange-800',
    high: 'bg-red-100 text-red-800',
  };

  const urgencyLabels = {
    low: 'Normale',
    medium: 'Moyenne',
    high: 'Urgente',
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200"
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-bold flex-1">{mission.title}</Text>
        <View className={`px-2 py-1 rounded-full ${urgencyColors[mission.urgency]}`}>
          <Text className="text-xs font-semibold">{urgencyLabels[mission.urgency]}</Text>
        </View>
      </View>

      <View className="flex-row items-center mb-2">
        <Ionicons name="location-outline" size={16} color="#666" />
        <Text className="text-gray-600 ml-1">{mission.location}</Text>
        {mission.distance && (
          <Text className="text-gray-500 ml-2">({mission.distance} km)</Text>
        )}
      </View>

      <View className="flex-row items-center mb-2">
        <Ionicons name="calendar-outline" size={16} color="#666" />
        <Text className="text-gray-600 ml-1">
          {new Date(mission.startDate).toLocaleDateString('fr-FR')} • {mission.duration} jours
        </Text>
      </View>

      <View className="flex-row items-center mb-3">
        <Ionicons name="cash-outline" size={16} color="#666" />
        <Text className="text-gray-600 ml-1">{mission.budget} €</Text>
      </View>

      <View className="flex-row flex-wrap gap-1">
        {mission.skills.slice(0, 3).map((skill, index) => (
          <View key={index} className="bg-[#B8C901]/5 px-2 py-1 rounded">
            <Text className="text-[#B8C901] text-xs">{skill}</Text>
          </View>
        ))}
        {mission.skills.length > 3 && (
          <View className="bg-gray-100 px-2 py-1 rounded">
            <Text className="text-gray-600 text-xs">+{mission.skills.length - 3}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
