import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TenexColors } from '@/constants/theme';

interface MissionCardProps {
  mission: {
    id: string | number;
    title: string;
    location: string;
    startDate: string;
    duration: number;
    budget: number;
    urgency: 'low' | 'medium' | 'high';
    skills: string[];
    distance?: number;
    matchScore?: number;
    isNew?: boolean;
    isPremium?: boolean;
    companyName?: string;
    companyRating?: number;
    responseDeadline?: string;
  };
  onPress?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  showActions?: boolean;
}

export function MissionCard({ 
  mission, 
  onPress, 
  onAccept, 
  onReject,
  showActions = false 
}: MissionCardProps) {
  const urgencyConfig = {
    low: { bg: 'bg-green-100', text: 'text-green-700', label: 'Normal' },
    medium: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Moyenne' },
    high: { bg: 'bg-red-100', text: 'text-red-700', label: 'Urgente' },
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return TenexColors.match.excellent;
    if (score >= 75) return TenexColors.match.good;
    if (score >= 50) return TenexColors.match.average;
    return TenexColors.match.low;
  };

  const urgency = urgencyConfig[mission.urgency];
  const matchScore = mission.matchScore || Math.floor(Math.random() * 15) + 80;

  return (
    <TouchableOpacity 
      onPress={onPress}
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
      activeOpacity={0.7}
    >
      {/* Badges Row */}
      <View className="flex-row flex-wrap mb-3">
        {mission.isNew !== false && (
          <View className="bg-[#006241] rounded-full px-2.5 py-1 mr-2 mb-1">
            <Text className="text-white text-xs font-bold">🆕 NOUVEAU</Text>
          </View>
        )}
        {matchScore >= 85 && (
          <View className="bg-orange-100 rounded-full px-2.5 py-1 mr-2 mb-1">
            <Text className="text-orange-700 text-xs font-bold">🔥 TOP MATCH {matchScore}%</Text>
          </View>
        )}
        {mission.urgency === 'high' && (
          <View className="bg-red-100 rounded-full px-2.5 py-1 mr-2 mb-1">
            <Text className="text-red-700 text-xs font-bold">⚡ URGENT</Text>
          </View>
        )}
        {mission.isPremium && (
          <View className="bg-purple-100 rounded-full px-2.5 py-1 mr-2 mb-1">
            <Text className="text-purple-700 text-xs font-bold">💎 PREMIUM</Text>
          </View>
        )}
      </View>

      {/* Title & Company */}
      <Text className="text-gray-800 font-bold text-lg mb-1">{mission.title}</Text>
      {mission.companyName && (
        <View className="flex-row items-center mb-2">
          {mission.companyRating && (
            <View className="flex-row items-center mr-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons 
                  key={star}
                  name={star <= mission.companyRating! ? 'star' : 'star-outline'} 
                  size={12} 
                  color="#f59e0b" 
                />
              ))}
            </View>
          )}
          <Text className="text-gray-500">{mission.companyName}</Text>
        </View>
      )}

      {/* Info Row */}
      <View className="flex-row flex-wrap items-center mb-3">
        <View className="flex-row items-center mr-4 mb-1">
          <Ionicons name="location-outline" size={16} color="#6b7280" />
          <Text className="text-gray-600 ml-1">{mission.location}</Text>
          {mission.distance && (
            <Text className="text-gray-400 ml-1">({mission.distance} km)</Text>
          )}
        </View>
        <View className="flex-row items-center mr-4 mb-1">
          <Ionicons name="calendar-outline" size={16} color="#6b7280" />
          <Text className="text-gray-600 ml-1">
            {new Date(mission.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </Text>
        </View>
        <View className="flex-row items-center mb-1">
          <Ionicons name="time-outline" size={16} color="#6b7280" />
          <Text className="text-gray-600 ml-1">{mission.duration} jour(s)</Text>
        </View>
      </View>

      {/* Budget & Urgency */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-[#006241] font-bold text-xl">{mission.budget} €</Text>
        <View className={`px-3 py-1 rounded-full ${urgency.bg}`}>
          <Text className={`text-sm font-medium ${urgency.text}`}>{urgency.label}</Text>
        </View>
      </View>

      {/* Match Progress */}
      <View className="mb-3">
        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-500 text-sm">Compatibilité</Text>
          <Text className="font-semibold text-sm" style={{ color: getMatchColor(matchScore) }}>
            {matchScore}%
          </Text>
        </View>
        <View className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <View 
            className="h-full rounded-full" 
            style={{ 
              width: `${matchScore}%`,
              backgroundColor: getMatchColor(matchScore),
            }} 
          />
        </View>
      </View>

      {/* Skills */}
      <View className="flex-row flex-wrap mb-3">
        {mission.skills.slice(0, 3).map((skill, index) => (
          <View key={index} className="bg-[#d4e9e2] px-2.5 py-1 rounded-lg mr-2 mb-1">
            <Text className="text-[#006241] text-xs font-medium">{skill}</Text>
          </View>
        ))}
        {mission.skills.length > 3 && (
          <View className="bg-gray-100 px-2.5 py-1 rounded-lg mb-1">
            <Text className="text-gray-600 text-xs">+{mission.skills.length - 3}</Text>
          </View>
        )}
      </View>

      {/* Response Deadline */}
      {mission.responseDeadline && (
        <Text className="text-gray-400 text-xs mb-3">
          ⏰ Répondre avant : {mission.responseDeadline}
        </Text>
      )}

      {/* Action Buttons */}
      {showActions && (
        <View className="flex-row pt-3 border-t border-gray-100">
          <TouchableOpacity 
            onPress={onPress}
            className="flex-1 bg-gray-100 rounded-xl py-3 mr-2 items-center"
          >
            <Text className="text-gray-700 font-semibold">Voir</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={onAccept}
            className="flex-1 bg-[#006241] rounded-xl py-3 mr-2 items-center"
          >
            <Text className="text-white font-semibold">Accepter</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={onReject}
            className="flex-1 border border-gray-300 rounded-xl py-3 items-center"
          >
            <Text className="text-gray-600 font-semibold">Refuser</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}
