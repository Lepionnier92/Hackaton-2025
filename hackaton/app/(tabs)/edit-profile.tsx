import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function EditProfileScreen() {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    bio: '',
    jobTitle: '',
    hourlyRate: '',
  });

  const handleSave = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert('Erreur', 'Le prénom et le nom sont obligatoires');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      Alert.alert('Erreur', 'Email invalide');
      return;
    }

    setSaving(true);
    try {
      await updateUser({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
      });
      Alert.alert('Succès', 'Profil mis à jour !', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    } finally {
      setSaving(false);
    }
  };

  const InputField = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    keyboardType = 'default',
    multiline = false,
    icon,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
    multiline?: boolean;
    icon: keyof typeof Ionicons.glyphMap;
  }) => (
    <View className="mb-4">
      <Text style={{ color: theme.textMuted }} className="text-sm mb-2">{label}</Text>
      <View className="rounded-xl flex-row items-center px-4" style={{ backgroundColor: theme.inputBackground }}>
        <Ionicons name={icon} size={20} color={theme.textMuted} />
        <TextInput
          className={`flex-1 py-4 px-3 ${multiline ? 'min-h-[100px]' : ''}`}
          style={{ color: theme.text }}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          keyboardType={keyboardType}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </View>
    </View>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="pt-14 px-4 pb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => router.back()} className="mr-3">
                <Ionicons name="arrow-back" size={24} color={theme.text} />
              </TouchableOpacity>
              <Text style={{ color: theme.text }} className="text-2xl font-bold">Modifier le profil</Text>
            </View>
            <TouchableOpacity 
              onPress={handleSave}
              disabled={saving}
              className="rounded-full px-4 py-2"
              style={{ backgroundColor: theme.accent }}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white font-semibold">Sauvegarder</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {/* Profile Photo */}
          <View className="items-center mb-6">
            <View className="relative">
              <View className="w-24 h-24 rounded-full items-center justify-center" style={{ backgroundColor: `${theme.accent}30` }}>
                <Text style={{ color: theme.accent }} className="text-3xl font-bold">
                  {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                </Text>
              </View>
              <TouchableOpacity 
                className="absolute bottom-0 right-0 rounded-full p-2"
                style={{ backgroundColor: theme.accent }}
              >
                <Ionicons name="camera" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={{ color: theme.textMuted }} className="text-sm mt-2">Changer la photo</Text>
          </View>

          {/* Personal Info */}
          <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: theme.card }}>
            <Text style={{ color: theme.text }} className="text-lg font-bold mb-4">Informations personnelles</Text>
            
            <InputField
              label="Prénom"
              value={formData.firstName}
              onChangeText={(text) => setFormData({ ...formData, firstName: text })}
              placeholder="Votre prénom"
              icon="person-outline"
            />

            <InputField
              label="Nom"
              value={formData.lastName}
              onChangeText={(text) => setFormData({ ...formData, lastName: text })}
              placeholder="Votre nom"
              icon="person-outline"
            />

            <InputField
              label="Email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="votre@email.com"
              keyboardType="email-address"
              icon="mail-outline"
            />

            <InputField
              label="Téléphone"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="+33 6 12 34 56 78"
              keyboardType="phone-pad"
              icon="call-outline"
            />
          </View>

          {/* Professional Info */}
          <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: theme.card }}>
            <Text style={{ color: theme.text }} className="text-lg font-bold mb-4">Informations professionnelles</Text>
            
            <InputField
              label="Titre du poste"
              value={formData.jobTitle}
              onChangeText={(text) => setFormData({ ...formData, jobTitle: text })}
              placeholder="Ex: Technicien de maintenance"
              icon="briefcase-outline"
            />

            <InputField
              label="Taux horaire (€)"
              value={formData.hourlyRate}
              onChangeText={(text) => setFormData({ ...formData, hourlyRate: text })}
              placeholder="35"
              keyboardType="numeric"
              icon="cash-outline"
            />

            <InputField
              label="Bio"
              value={formData.bio}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              placeholder="Décrivez votre expérience et vos compétences..."
              multiline
              icon="document-text-outline"
            />
          </View>

          {/* Danger Zone */}
          <View className="rounded-2xl p-4 mb-8" style={{ backgroundColor: theme.card }}>
            <Text style={{ color: theme.text }} className="text-lg font-bold mb-4">Zone de danger</Text>
            
            <TouchableOpacity 
              className="flex-row items-center py-3"
              style={{ borderBottomWidth: 1, borderBottomColor: theme.divider }}
              onPress={() => Alert.alert('Info', 'Cette fonctionnalité arrive bientôt')}
            >
              <Ionicons name="key-outline" size={20} color={theme.warning} />
              <Text style={{ color: theme.warning }} className="ml-3">Changer le mot de passe</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center py-3"
              onPress={() => Alert.alert(
                'Supprimer le compte',
                'Cette action est irréversible. Êtes-vous sûr ?',
                [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'Supprimer', style: 'destructive' },
                ]
              )}
            >
              <Ionicons name="trash-outline" size={20} color={theme.error} />
              <Text style={{ color: theme.error }} className="ml-3">Supprimer mon compte</Text>
            </TouchableOpacity>
          </View>

          <View className="h-24" />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
