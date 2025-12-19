import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface Notification {
  id: number;
  type: 'urgent' | 'accepted' | 'payment' | 'proposal';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const [notifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'urgent',
      title: 'Nouvelle mission urgente',
      description: 'Maintenance électrique urgente à Lyon 3ème. Match à 95%. Répondez rapidement!',
      time: 'Il y a 10min',
      read: false,
    },
    {
      id: 2,
      type: 'accepted',
      title: 'Mission acceptée',
      description: 'Schneider Electric a accepté votre proposition pour la maintenance du 25 janvier.',
      time: 'Il y a 2h',
      read: false,
    },
    {
      id: 3,
      type: 'payment',
      title: 'Paiement reçu',
      description: 'Vous avez reçu €1,850.00 pour la mission chez Bouygues Énergies.',
      time: 'Hier',
      read: true,
    },
    {
      id: 4,
      type: 'proposal',
      title: 'Nouvelle proposition',
      description: '3 nouvelles missions correspondent à votre profil. Consultez-les maintenant!',
      time: 'Il y a 2 jours',
      read: true,
    },
  ]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getNotificationStyle = (type: Notification['type']) => {
    switch (type) {
      case 'urgent':
        return {
          borderColor: theme.error,
          iconBg: `${theme.error}20`,
          iconColor: theme.error,
          icon: 'alert-circle' as const,
        };
      case 'accepted':
        return {
          borderColor: theme.success,
          iconBg: `${theme.success}20`,
          iconColor: theme.success,
          icon: 'checkmark-circle' as const,
        };
      case 'payment':
        return {
          borderColor: theme.cardBorder,
          iconBg: `${theme.warning}20`,
          iconColor: theme.warning,
          icon: 'logo-usd' as const,
        };
      case 'proposal':
        return {
          borderColor: theme.cardBorder,
          iconBg: `${theme.accent}20`,
          iconColor: theme.accent,
          icon: 'gift' as const,
        };
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <View className="pt-14 pb-4 px-4">
        <Text style={{ color: theme.text }} className="text-3xl font-bold">Notifications</Text>
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
        {notifications.map((notification) => {
          const style = getNotificationStyle(notification.type);
          return (
            <TouchableOpacity
              key={notification.id}
              className="rounded-2xl p-4 mb-3"
              style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: style.borderColor }}
            >
              <View className="flex-row">
                {/* Icon */}
                <View 
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: style.iconBg }}
                >
                  <Ionicons name={style.icon} size={24} color={style.iconColor} />
                </View>

                {/* Content */}
                <View className="flex-1 ml-3">
                  <View className="flex-row items-center justify-between">
                    <Text style={{ color: theme.text }} className="font-semibold text-base flex-1">
                      {notification.title}
                    </Text>
                    {!notification.read && (
                      <View className="w-2.5 h-2.5 rounded-full ml-2" style={{ backgroundColor: theme.error }} />
                    )}
                  </View>
                  <Text style={{ color: theme.textMuted }} className="text-sm mt-1 leading-5">
                    {notification.description}
                  </Text>
                  <Text style={{ color: theme.textMuted }} className="text-xs mt-2">
                    {notification.time}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
