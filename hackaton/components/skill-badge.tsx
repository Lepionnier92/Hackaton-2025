import React from 'react';
import { View, Text } from 'react-native';

interface SkillBadgeProps {
  skill: string;
  selected?: boolean;
  onPress?: () => void;
}

export function SkillBadge({ skill, selected = false, onPress }: SkillBadgeProps) {
  return (
    <View 
      className={`px-3 py-2 rounded-full mr-2 mb-2 ${
        selected ? 'bg-[#B8C901]' : 'bg-gray-200'
      }`}
    >
      <Text className={`text-sm ${selected ? 'text-white' : 'text-gray-700'}`}>
        {skill}
      </Text>
    </View>
  );
}
