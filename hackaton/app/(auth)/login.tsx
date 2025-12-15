import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);

    try {
      const result = await login(username.trim(), password);
      
      if (result.success) {
        router.replace('/(tabs)');
      } else {
        setError(result.error || 'Erreur de connexion');
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header avec logo */}
        <View className="bg-[#006241] pt-16 pb-12 px-6 rounded-b-[40px]">
          <TouchableOpacity 
            onPress={() => router.push('/(auth)/welcome')}
            className="absolute top-12 left-4 p-2"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View className="items-center">
            {/* Logo Tenexa */}
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-lg">
              <View className="flex-row items-center">
                <View className="bg-[#006241] rounded-lg p-2 mr-2">
                  <Ionicons name="flash" size={28} color="white" />
                </View>
                <Text className="text-[#006241] text-2xl font-bold">Tenexa</Text>
              </View>
            </View>
            <Text className="text-white text-xl font-semibold">Workforce</Text>
            <Text className="text-white/70 mt-2">Application Techniciens</Text>
          </View>
        </View>

        {/* Formulaire */}
        <View className="flex-1 px-6 pt-8">
          <Text className="text-2xl font-bold text-[#2e3932] mb-2">
            Heureux de vous revoir !
          </Text>
          <Text className="text-gray-500 mb-6">
            Connectez-vous pour accéder à vos missions
          </Text>

          {/* Message d'erreur */}
          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex-row items-center">
              <Ionicons name="alert-circle" size={20} color="#ef4444" />
              <Text className="text-red-600 ml-2 flex-1">{error}</Text>
            </View>
          ) : null}

          {/* Champ email/username */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Email ou nom d'utilisateur</Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl px-4 border border-gray-200">
              <Ionicons name="person-outline" size={20} color="#6b7280" />
              <TextInput
                className="flex-1 py-4 px-3 text-gray-800"
                placeholder="Entrez votre identifiant"
                placeholderTextColor="#9ca3af"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Champ mot de passe */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Mot de passe</Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl px-4 border border-gray-200">
              <Ionicons name="lock-closed-outline" size={20} color="#6b7280" />
              <TextInput
                className="flex-1 py-4 px-3 text-gray-800"
                placeholder="Entrez votre mot de passe"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                  size={20} 
                  color="#6b7280" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Options */}
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity 
              onPress={() => setRememberMe(!rememberMe)}
              className="flex-row items-center"
            >
              <Ionicons 
                name={rememberMe ? 'checkbox' : 'square-outline'} 
                size={22} 
                color={rememberMe ? '#006241' : '#6b7280'} 
              />
              <Text className="text-gray-600 ml-2">Se souvenir de moi</Text>
            </TouchableOpacity>
            
            <TouchableOpacity>
              <Text className="text-[#006241] font-medium">Mot de passe oublié ?</Text>
            </TouchableOpacity>
          </View>

          {/* Bouton de connexion */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className={`py-4 rounded-xl items-center shadow-md ${
              loading ? 'bg-[#006241]/70' : 'bg-[#006241]'
            }`}
            style={{ shadowColor: '#006241', shadowOpacity: 0.3, shadowRadius: 8 }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="log-in" size={20} color="white" />
                <Text className="text-white font-bold text-lg ml-2">Se connecter</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Séparateur */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="text-gray-400 mx-4">ou</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Biométrie */}
          <TouchableOpacity
            className="flex-row items-center justify-center py-4 border-2 border-[#006241] rounded-xl mb-4"
          >
            <Ionicons name="finger-print" size={24} color="#006241" />
            <Text className="text-[#006241] font-semibold text-lg ml-2">
              Face ID / Touch ID
            </Text>
          </TouchableOpacity>

          {/* Toggle vers inscription */}
          <View className="flex-row justify-center items-center mt-4">
            <Text className="text-gray-600">Pas encore inscrit ?</Text>
            <TouchableOpacity 
              onPress={() => router.push('/(auth)/register')} 
              className="ml-2"
            >
              <Text className="text-[#006241] font-semibold">Créer un compte</Text>
            </TouchableOpacity>
          </View>

          {/* Comptes de test */}
          <View className="bg-[#d4e9e2]/50 rounded-xl p-4 mt-6 mb-8">
            <Text className="text-[#2e3932] font-medium mb-2">🔧 Comptes de démonstration :</Text>
            <View className="flex-row items-center mb-1">
              <Ionicons name="person" size={14} color="#006241" />
              <Text className="text-[#2e3932] text-sm ml-2">Technicien: <Text className="font-mono">tech / tech123</Text></Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="shield" size={14} color="#006241" />
              <Text className="text-[#2e3932] text-sm ml-2">Admin: <Text className="font-mono">admin / admin123</Text></Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
