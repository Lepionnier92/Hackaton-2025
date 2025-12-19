import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  iconColor?: string;
  labelColor?: string;
  rightElement?: React.ReactNode;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const router = useRouter();

  const MenuItem = ({ icon, label, value, onPress, showArrow = true, iconColor, labelColor, rightElement }: MenuItemProps) => (
    <TouchableOpacity 
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center py-4"
      style={{ borderBottomWidth: 1, borderBottomColor: theme.divider }}
    >
      <View 
        className="rounded-full w-10 h-10 items-center justify-center mr-3"
        style={{ backgroundColor: theme.inputBackground }}
      >
        <Ionicons name={icon} size={20} color={iconColor || theme.accent} />
      </View>
      <View className="flex-1">
        <Text style={{ color: labelColor || theme.text }} className="text-base font-medium">{label}</Text>
      </View>
      {value && (
        <Text style={{ color: theme.textMuted }} className="text-sm mr-2">{value}</Text>
      )}
      {rightElement}
      {showArrow && !rightElement && (
        <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
      )}
    </TouchableOpacity>
  );

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  const handleAdminPanel = () => {
    router.push('/(admin)/admin');
  };

  const stats = {
    missionsCompleted: 47,
    yearsExperience: 8,
    rating: 4.9,
  };

  const skills = ['Électricité', 'Plomberie', 'CVC', 'Maintenance industrielle'];

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="pt-14 px-4 pb-6">
          <View className="flex-row items-center justify-between">
            <Text style={{ color: theme.text }} className="text-2xl font-bold">Profil</Text>
            <TouchableOpacity 
              onPress={handleEditProfile}
              className="rounded-full p-2"
              style={{ backgroundColor: theme.card }}
            >
              <Ionicons name="settings-outline" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Card */}
        <View className="px-4 mb-6">
          <View className="rounded-2xl p-5" style={{ backgroundColor: theme.card }}>
            <View className="flex-row items-center">
              <View className="relative">
                <Image
                  source={{ uri: 'https://i.pravatar.cc/100' }}
                  className="w-20 h-20 rounded-full"
                />
                <View className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-2" style={{ backgroundColor: theme.success, borderColor: theme.card }} />
              </View>
              <View className="ml-4 flex-1">
                <Text style={{ color: theme.text }} className="text-xl font-bold">
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text style={{ color: theme.accent }} className="text-sm mt-1">
                  {user?.role === 'admin' ? 'Administrateur' : 'Technicien Expert'}
                </Text>
                <View className="flex-row items-center mt-2">
                  <Ionicons name="location-outline" size={14} color={theme.textMuted} />
                  <Text style={{ color: theme.textMuted }} className="text-sm ml-1">Paris, France</Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={handleEditProfile}
                className="rounded-full p-2"
                style={{ backgroundColor: `${theme.accent}20` }}
              >
                <Ionicons name="create-outline" size={20} color={theme.accent} />
              </TouchableOpacity>
            </View>

            {/* Stats */}
            <View className="flex-row mt-6 pt-5" style={{ borderTopWidth: 1, borderTopColor: theme.divider }}>
              <View className="flex-1 items-center">
                <Text style={{ color: theme.text }} className="text-2xl font-bold">{stats.missionsCompleted}</Text>
                <Text style={{ color: theme.textMuted }} className="text-xs mt-1">Missions</Text>
              </View>
              <View className="w-px" style={{ backgroundColor: theme.divider }} />
              <View className="flex-1 items-center">
                <Text style={{ color: theme.text }} className="text-2xl font-bold">{stats.yearsExperience}</Text>
                <Text style={{ color: theme.textMuted }} className="text-xs mt-1">Ans d'exp.</Text>
              </View>
              <View className="w-px" style={{ backgroundColor: theme.divider }} />
              <View className="flex-1 items-center">
                <View className="flex-row items-center">
                  <Text style={{ color: theme.text }} className="text-2xl font-bold">{stats.rating}</Text>
                  <Ionicons name="star" size={16} color="#eab308" style={{ marginLeft: 4 }} />
                </View>
                <Text style={{ color: theme.textMuted }} className="text-xs mt-1">Note</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Theme Toggle */}
        <View className="px-4 mb-6">
          <View className="rounded-2xl p-4" style={{ backgroundColor: theme.card }}>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View 
                  className="rounded-full w-10 h-10 items-center justify-center mr-3"
                  style={{ backgroundColor: theme.inputBackground }}
                >
                  <Ionicons 
                    name={isDark ? 'moon' : 'sunny'} 
                    size={20} 
                    color={theme.accent} 
                  />
                </View>
                <View>
                  <Text style={{ color: theme.text }} className="text-base font-medium">
                    Mode {isDark ? 'Sombre' : 'Clair'}
                  </Text>
                  <Text style={{ color: theme.textMuted }} className="text-xs">
                    Appuyez pour changer
                  </Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#d4e9e2', true: '#006241' }}
                thumbColor={isDark ? '#dff9ba' : '#006241'}
              />
            </View>
          </View>
        </View>

        {/* Admin Panel Button (only for admins) */}
        {user?.role === 'admin' && (
          <View className="px-4 mb-6">
            <TouchableOpacity 
              onPress={handleAdminPanel}
              className="rounded-2xl py-4 flex-row items-center justify-center"
              style={{ backgroundColor: theme.accent }}
            >
              <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
              <Text className="text-white font-semibold ml-2">Panel Administrateur</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Skills */}
        <View className="px-4 mb-6">
          <Text style={{ color: theme.text }} className="text-lg font-bold mb-3">Compétences</Text>
          <View className="flex-row flex-wrap">
            {skills.map((skill, index) => (
              <View 
                key={index}
                className="rounded-full px-4 py-2 mr-2 mb-2"
                style={{ backgroundColor: theme.card }}
              >
                <Text style={{ color: theme.accent }} className="text-sm font-medium">{skill}</Text>
              </View>
            ))}
            <TouchableOpacity 
              className="rounded-full px-4 py-2 mr-2 mb-2 flex-row items-center"
              style={{ backgroundColor: `${theme.accent}20` }}
            >
              <Ionicons name="add" size={16} color={theme.accent} />
              <Text style={{ color: theme.accent }} className="text-sm font-medium ml-1">Ajouter</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Section */}
        <View className="px-4">
          <Text style={{ color: theme.text }} className="text-lg font-bold mb-3">Paramètres</Text>
          <View className="rounded-2xl px-4" style={{ backgroundColor: theme.card }}>
            <MenuItem 
              icon="person-outline" 
              label="Informations personnelles" 
              onPress={handleEditProfile}
            />
            <MenuItem 
              icon="document-text-outline" 
              label="Documents" 
              value="5 fichiers"
              onPress={() => Alert.alert('Info', 'Cette fonctionnalité arrive bientôt')}
            />
            <MenuItem 
              icon="card-outline" 
              label="Paiements" 
              onPress={() => router.push('/activity')}
            />
            <MenuItem 
              icon="notifications-outline" 
              label="Notifications" 
              onPress={() => router.push('/notifications')}
            />
            <MenuItem 
              icon="shield-checkmark-outline" 
              label="Confidentialité" 
              onPress={() => Alert.alert('Info', 'Cette fonctionnalité arrive bientôt')}
            />
            <MenuItem 
              icon="help-circle-outline" 
              label="Aide & Support" 
              onPress={() => Alert.alert('Info', 'Cette fonctionnalité arrive bientôt')}
            />
          </View>
        </View>

        {/* Logout */}
        <View className="px-4 mt-6 mb-8">
          <TouchableOpacity 
            onPress={handleLogout}
            className="rounded-2xl py-4 flex-row items-center justify-center"
            style={{ backgroundColor: `${theme.error}15` }}
          >
            <Ionicons name="log-out-outline" size={20} color={theme.error} />
            <Text style={{ color: theme.error }} className="font-semibold ml-2">Déconnexion</Text>
          </TouchableOpacity>
        </View>

        {/* Version */}
        <View className="items-center pb-8">
          <Text style={{ color: theme.textMuted }} className="text-xs">Version 1.0.0</Text>
        </View>

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
