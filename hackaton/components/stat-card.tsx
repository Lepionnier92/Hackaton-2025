import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color?: string;
}

export function StatCard({ icon, label, value, color = '#B8C901' }: StatCardProps) {
  return (
    <View className="bg-white rounded-lg p-4 flex-1 mx-1 shadow-sm border border-gray-200">
      <View className="flex-row items-center mb-2">
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text className="text-2xl font-bold mb-1">{value}</Text>
      <Text className="text-gray-600 text-sm">{label}</Text>
    </View>
  );
}
