import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Alert, Modal, ActivityIndicator, Platform, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [editEmail, setEditEmail] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#B8C901" />
      </View>
    );
  }

  const openEditModal = () => {
    setEditEmail(user.email);
    setEditUsername(user.username);
    setEditPassword('');
    setConfirmPassword('');
    setShowEditModal(true);
  };

  const handleSaveChanges = async () => {
    if (editPassword && editPassword !== confirmPassword) {
      if (Platform.OS === 'web') {
        window.alert('Les mots de passe ne correspondent pas');
      } else {
        Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      }
      return;
    }

    setSaving(true);
    try {
      const updates: any = {};
      if (editEmail !== user.email) updates.email = editEmail;
      if (editUsername !== user.username) updates.username = editUsername;
      if (editPassword) updates.password = editPassword;

      if (Object.keys(updates).length > 0) {
        await updateUser(updates);
        if (Platform.OS === 'web') {
          window.alert('Profil mis à jour avec succès !');
        } else {
          Alert.alert('Succès', 'Profil mis à jour avec succès !');
        }
      }
      setShowEditModal(false);
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Erreur lors de la mise à jour');
      } else {
        Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        await logout();
        router.replace('/(auth)/login' as any);
      }
    } else {
      Alert.alert(
        'Déconnexion',
        'Êtes-vous sûr de vouloir vous déconnecter ?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Déconnexion',
            style: 'destructive',
            onPress: async () => {
              await logout();
              router.replace('/(auth)/login' as any);
            },
          },
        ]
      );
    }
  };

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin de la permission d\'accéder à votre galerie.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setUploadingImage(true);
      setShowImagePicker(false);
      try {
        await updateUser({ profilePicture: result.assets[0].uri });
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de mettre à jour la photo');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin de la permission d\'utiliser la caméra.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setUploadingImage(true);
      setShowImagePicker(false);
      try {
        await updateUser({ profilePicture: result.assets[0].uri });
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de mettre à jour la photo');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header avec Logo TENEX */}
        <View className="bg-[#B8C901] pt-8 pb-8 px-4">
          {/* Logo TENEX */}
          <View className="items-center mb-4">
            <View className="bg-white rounded-2xl px-6 py-3 shadow-lg">
              <Text className="text-2xl font-black tracking-wider">
                <Text className="text-[#B8C901]">TENEX</Text>
                <Text className="text-gray-800"> Workforce</Text>
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <View className="bg-white/20 rounded-lg p-2 mr-3">
                <Ionicons name="person" size={24} color="white" />
              </View>
              <Text className="text-white text-2xl font-bold">Mon profil</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} className="bg-white/20 p-2 rounded-lg">
              <Ionicons name="log-out-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <View className="items-center">
            {/* Photo de profil */}
            <TouchableOpacity onPress={() => setShowImagePicker(true)} className="relative">
              {uploadingImage ? (
                <View className="w-28 h-28 rounded-full border-4 border-white bg-white/20 items-center justify-center">
                  <ActivityIndicator size="large" color="white" />
                </View>
              ) : user.profilePicture ? (
                <Image
                  source={{ uri: user.profilePicture }}
                  className="w-28 h-28 rounded-full border-4 border-white"
                />
              ) : (
                <View className="w-28 h-28 rounded-full border-4 border-white bg-white/20 items-center justify-center">
                  <Ionicons name="person" size={48} color="white" />
                </View>
              )}
              <View className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg">
                <Ionicons name="camera" size={18} color="#B8C901" />
              </View>
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold mt-3">
              {user.firstName} {user.lastName}
            </Text>
            <Text className="text-white/70">@{user.username}</Text>
            <Text className="text-white/50 text-sm">{user.email}</Text>
            
            {/* Badge rôle */}
            <View className={`mt-3 px-4 py-1 rounded-full ${user.role === 'admin' ? 'bg-purple-500' : 'bg-white/20'}`}>
              <Text className="text-white font-medium">
                {user.role === 'admin' ? '👑 Administrateur' : '🔧 Technicien'}
              </Text>
            </View>

            {/* Bouton modifier profil */}
            <TouchableOpacity
              onPress={openEditModal}
              className="mt-4 bg-white/20 px-6 py-2 rounded-full flex-row items-center"
            >
              <Ionicons name="create-outline" size={18} color="white" />
              <Text className="text-white font-medium ml-2">Modifier le profil</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Options admin */}
        {user.role === 'admin' && (
          <View className="mx-4 -mt-4 mb-4">
            <TouchableOpacity
              onPress={() => router.push('/(admin)/admin' as any)}
              className="bg-purple-500 rounded-xl p-4 flex-row items-center justify-between shadow-lg"
            >
              <View className="flex-row items-center">
                <View className="bg-white/20 rounded-lg p-2 mr-3">
                  <Ionicons name="shield-checkmark" size={20} color="white" />
                </View>
                <View>
                  <Text className="text-white font-bold">Panel Administrateur</Text>
                  <Text className="text-white/70 text-sm">Gérer utilisateurs et missions</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {/* Informations du compte */}
        <View className="bg-white mx-4 rounded-xl shadow-sm p-4 mb-4 border border-gray-100 mt-4">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="bg-[#B8C901]/10 rounded-lg p-2 mr-3">
                <Ionicons name="information-circle" size={20} color="#B8C901" />
              </View>
              <Text className="text-lg font-bold text-gray-800">Informations</Text>
            </View>
            <TouchableOpacity onPress={openEditModal}>
              <Ionicons name="create-outline" size={20} color="#B8C901" />
            </TouchableOpacity>
          </View>

          <View className="space-y-3">
            <View className="flex-row items-center py-3 border-b border-gray-100">
              <Ionicons name="person-outline" size={20} color="#6b7280" />
              <Text className="text-gray-600 ml-3 flex-1">Nom complet</Text>
              <Text className="text-gray-800 font-medium">{user.firstName} {user.lastName}</Text>
            </View>
            <View className="flex-row items-center py-3 border-b border-gray-100">
              <Ionicons name="at" size={20} color="#6b7280" />
              <Text className="text-gray-600 ml-3 flex-1">Nom d'utilisateur</Text>
              <Text className="text-gray-800 font-medium">@{user.username}</Text>
            </View>
            <View className="flex-row items-center py-3 border-b border-gray-100">
              <Ionicons name="mail-outline" size={20} color="#6b7280" />
              <Text className="text-gray-600 ml-3 flex-1">Email</Text>
              <Text className="text-gray-800 font-medium">{user.email}</Text>
            </View>
            <View className="flex-row items-center py-3">
              <Ionicons name="shield-outline" size={20} color="#6b7280" />
              <Text className="text-gray-600 ml-3 flex-1">Rôle</Text>
              <Text className={`font-medium ${user.role === 'admin' ? 'text-purple-600' : 'text-[#B8C901]'}`}>
                {user.role === 'admin' ? 'Administrateur' : 'Technicien'}
              </Text>
            </View>
          </View>
        </View>

        {/* Déconnexion */}
        <TouchableOpacity
          onPress={handleLogout}
          className="mx-4 mb-8 bg-red-50 rounded-xl p-4 flex-row items-center justify-center"
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text className="text-red-500 font-semibold ml-2">Déconnexion</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal édition profil */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showEditModal}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[85%]">
            <View className="items-center mb-4">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>
            
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">Modifier le profil</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-gray-600 mb-2 font-medium">Nom d'utilisateur</Text>
              <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mb-4">
                <Ionicons name="at" size={20} color="#6b7280" />
                <TextInput
                  className="flex-1 ml-2 text-gray-800"
                  placeholder="Nom d'utilisateur"
                  value={editUsername}
                  onChangeText={setEditUsername}
                  autoCapitalize="none"
                />
              </View>

              <Text className="text-gray-600 mb-2 font-medium">Email</Text>
              <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mb-4">
                <Ionicons name="mail-outline" size={20} color="#6b7280" />
                <TextInput
                  className="flex-1 ml-2 text-gray-800"
                  placeholder="Email"
                  value={editEmail}
                  onChangeText={setEditEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <Text className="text-gray-600 mb-2 font-medium">Nouveau mot de passe</Text>
              <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mb-4">
                <Ionicons name="lock-closed-outline" size={20} color="#6b7280" />
                <TextInput
                  className="flex-1 ml-2 text-gray-800"
                  placeholder="Laisser vide pour ne pas changer"
                  value={editPassword}
                  onChangeText={setEditPassword}
                  secureTextEntry
                />
              </View>

              {editPassword.length > 0 && (
                <>
                  <Text className="text-gray-600 mb-2 font-medium">Confirmer le mot de passe</Text>
                  <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mb-4">
                    <Ionicons name="lock-closed-outline" size={20} color="#6b7280" />
                    <TextInput
                      className="flex-1 ml-2 text-gray-800"
                      placeholder="Confirmer le mot de passe"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                    />
                  </View>
                  {editPassword !== confirmPassword && confirmPassword.length > 0 && (
                    <Text className="text-red-500 text-sm mb-4">Les mots de passe ne correspondent pas</Text>
                  )}
                </>
              )}

              <TouchableOpacity
                onPress={handleSaveChanges}
                disabled={saving || (editPassword.length > 0 && editPassword !== confirmPassword)}
                className={`py-4 rounded-xl items-center mt-2 ${saving || (editPassword.length > 0 && editPassword !== confirmPassword) ? 'bg-[#B8C901]/50' : 'bg-[#B8C901]'}`}
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold">Enregistrer les modifications</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                className="py-4 items-center mt-2"
              >
                <Text className="text-gray-500 font-medium">Annuler</Text>
              </TouchableOpacity>

              <View className="h-6" />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal choix photo */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showImagePicker}
        onRequestClose={() => setShowImagePicker(false)}
      >
        <TouchableOpacity 
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setShowImagePicker(false)}
        >
          <View className="bg-white rounded-t-3xl p-6">
            <View className="items-center mb-4">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>
            <Text className="text-xl font-bold text-gray-800 mb-6 text-center">
              Modifier la photo de profil
            </Text>

            <TouchableOpacity
              onPress={pickImageFromGallery}
              className="flex-row items-center bg-gray-100 rounded-xl p-4 mb-3"
            >
              <View className="bg-[#B8C901] rounded-full p-3 mr-4">
                <Ionicons name="images" size={24} color="white" />
              </View>
              <View>
                <Text className="text-gray-800 font-semibold">Galerie photos</Text>
                <Text className="text-gray-500 text-sm">Choisir une photo existante</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={takePhoto}
              className="flex-row items-center bg-gray-100 rounded-xl p-4 mb-6"
            >
              <View className="bg-green-500 rounded-full p-3 mr-4">
                <Ionicons name="camera" size={24} color="white" />
              </View>
              <View>
                <Text className="text-gray-800 font-semibold">Prendre une photo</Text>
                <Text className="text-gray-500 text-sm">Utiliser la caméra</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowImagePicker(false)}
              className="py-4 items-center"
            >
              <Text className="text-gray-500 font-medium">Annuler</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
