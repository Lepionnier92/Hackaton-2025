import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface ConversationItem {
  id: number;
  companyName: string;
  missionTitle: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  avatar: string;
  borderColor: string;
}

export default function MessagesScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [activeChat, setActiveChat] = useState<ConversationItem | null>(null);
  const [messageText, setMessageText] = useState('');

  const [conversations] = useState<ConversationItem[]>([
    {
      id: 1,
      companyName: 'Schneider Electric',
      missionTitle: 'Maintenance électrique urgente',
      lastMessage: 'Merci, pouvez-vous venir demain à 8h?',
      time: 'Il y a 5min',
      unreadCount: 2,
      avatar: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop',
      borderColor: '#f97316',
    },
    {
      id: 2,
      companyName: 'Bouygues Énergies',
      missionTitle: 'Installation CVC industriel',
      lastMessage: 'Le projet est confirmé pour la semaine proc...',
      time: 'Il y a 2h',
      unreadCount: 0,
      avatar: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=100&h=100&fit=crop',
      borderColor: theme.cardBorder,
    },
    {
      id: 3,
      companyName: 'Total Énergies',
      missionTitle: 'Réparation système hydraulique',
      lastMessage: 'Documents reçus, merci!',
      time: 'Hier',
      unreadCount: 0,
      avatar: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop',
      borderColor: theme.cardBorder,
    },
  ]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  // Chat view
  if (activeChat) {
    return (
      <KeyboardAvoidingView
        className="flex-1"
        style={{ backgroundColor: theme.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        {/* Chat Header */}
        <View className="pt-14 pb-4 px-4" style={{ borderBottomWidth: 1, borderBottomColor: theme.divider }}>
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => setActiveChat(null)}
              className="mr-3"
            >
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>
            <Image
              source={{ uri: activeChat.avatar }}
              className="w-10 h-10 rounded-full mr-3"
            />
            <View className="flex-1">
              <Text style={{ color: theme.text }} className="font-semibold">{activeChat.companyName}</Text>
              <Text style={{ color: theme.textMuted }} className="text-sm">{activeChat.missionTitle}</Text>
            </View>
            <TouchableOpacity className="p-2">
              <Ionicons name="call-outline" size={22} color={theme.accent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <ScrollView className="flex-1 px-4 pt-4">
          {/* Sample messages */}
          <View className="items-start mb-4">
            <View className="rounded-2xl rounded-tl-sm p-3 max-w-[80%]" style={{ backgroundColor: theme.card }}>
              <Text style={{ color: theme.text }}>Bonjour, nous avons besoin d'une intervention urgente.</Text>
              <Text style={{ color: theme.textMuted }} className="text-xs mt-1">09:30</Text>
            </View>
          </View>
          <View className="items-end mb-4">
            <View className="rounded-2xl rounded-tr-sm p-3 max-w-[80%]" style={{ backgroundColor: theme.accent }}>
              <Text className="text-white">Bien reçu, je suis disponible demain matin.</Text>
              <Text className="text-white/70 text-xs mt-1">09:35</Text>
            </View>
          </View>
          <View className="items-start mb-4">
            <View className="rounded-2xl rounded-tl-sm p-3 max-w-[80%]" style={{ backgroundColor: theme.card }}>
              <Text style={{ color: theme.text }}>{activeChat.lastMessage}</Text>
              <Text style={{ color: theme.textMuted }} className="text-xs mt-1">10:00</Text>
            </View>
          </View>
        </ScrollView>

        {/* Input */}
        <View className="px-4 py-3" style={{ borderTopWidth: 1, borderTopColor: theme.divider }}>
          <View className="flex-row items-center rounded-full px-4" style={{ backgroundColor: theme.card }}>
            <TextInput
              className="flex-1 py-3"
              style={{ color: theme.text }}
              placeholder="Écrire un message..."
              placeholderTextColor={theme.textMuted}
              value={messageText}
              onChangeText={setMessageText}
            />
            <TouchableOpacity className="ml-2">
              <Ionicons name="send" size={22} color={theme.accent} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // Conversations list
  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <View className="pt-14 pb-4 px-4 flex-row items-center justify-between">
        <Text style={{ color: theme.text }} className="text-3xl font-bold">Messages</Text>
        <TouchableOpacity className="rounded-full p-3" style={{ backgroundColor: theme.card }}>
          <Ionicons name="search" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.text}
          />
        }
      >
        {conversations.map((conv) => (
          <TouchableOpacity
            key={conv.id}
            onPress={() => setActiveChat(conv)}
            className="rounded-2xl p-4 mb-3"
            style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: conv.unreadCount > 0 ? theme.warning : theme.cardBorder }}
          >
            <View className="flex-row">
              {/* Avatar */}
              <Image
                source={{ uri: conv.avatar }}
                className="w-14 h-14 rounded-full"
              />

              {/* Content */}
              <View className="flex-1 ml-3">
                <View className="flex-row items-center justify-between">
                  <Text style={{ color: theme.text }} className="font-semibold text-base">
                    {conv.companyName}
                  </Text>
                  <Text style={{ color: theme.textMuted }} className="text-xs">{conv.time}</Text>
                </View>
                <Text style={{ color: theme.textMuted }} className="text-sm mt-0.5">
                  {conv.missionTitle}
                </Text>
                <View className="flex-row items-center justify-between mt-1">
                  <Text style={{ color: theme.textMuted }} className="text-sm flex-1" numberOfLines={1}>
                    {conv.lastMessage}
                  </Text>
                  {conv.unreadCount > 0 && (
                    <View className="rounded-full w-6 h-6 items-center justify-center ml-2" style={{ backgroundColor: theme.accent }}>
                      <Text className="text-white text-xs font-bold">{conv.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
