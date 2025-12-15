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
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
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
        <View className="bg-[#B8C901] pt-16 pb-12 px-6 rounded-b-[40px]">
          <View className="items-center">
            {/* Logo TENEX */}
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-lg">
              <View className="flex-row items-center">
                <View className="bg-[#B8C901] rounded-lg p-2 mr-2">
                  <Ionicons name="construct" size={28} color="white" />
                </View>
                <Text className="text-[#B8C901] text-2xl font-bold">TENEX</Text>
              </View>
            </View>
            <Text className="text-white text-xl font-semibold">Workforce</Text>
            <Text className="text-white/70 mt-2">Application Techniciens</Text>
          </View>
        </View>

        {/* Formulaire */}
        <View className="flex-1 px-6 pt-8">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            {isLogin ? 'Connexion' : 'Créer un compte'}
          </Text>
          <Text className="text-gray-500 mb-6">
            {isLogin 
              ? 'Connectez-vous pour accéder à vos missions'
              : 'Contactez un administrateur pour créer votre compte'}
          </Text>

          {/* Message d'erreur */}
          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex-row items-center">
              <Ionicons name="alert-circle" size={20} color="#ef4444" />
              <Text className="text-red-600 ml-2 flex-1">{error}</Text>
            </View>
          ) : null}

          {/* Champ nom d'utilisateur */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Nom d'utilisateur</Text>
            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 border border-gray-200">
              <Ionicons name="person-outline" size={20} color="#6b7280" />
              <TextInput
                className="flex-1 py-4 px-3 text-gray-800"
                placeholder="Entrez votre nom d'utilisateur"
                placeholderTextColor="#9ca3af"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Champ mot de passe */}
          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">Mot de passe</Text>
            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 border border-gray-200">
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

          {/* Bouton de connexion */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className={`py-4 rounded-xl items-center ${
              loading ? 'bg-[#B8C901]/80' : 'bg-[#B8C901]'
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">
                {isLogin ? 'Se connecter' : 'Créer mon compte'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Lien mot de passe oublié */}
          {isLogin && (
            <TouchableOpacity className="mt-4 items-center">
              <Text className="text-[#B8C901]">Mot de passe oublié ?</Text>
            </TouchableOpacity>
          )}

          {/* Séparateur */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="text-gray-500 mx-4">ou</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Toggle login/signup */}
          <View className="flex-row justify-center items-center">
            <Text className="text-gray-600">
              {isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)} className="ml-2">
              <Text className="text-[#B8C901] font-semibold">
                {isLogin ? 'Créer un compte' : 'Se connecter'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info pour création de compte */}
          {!isLogin && (
            <View className="bg-[#B8C901]/5 border border-[#B8C901]/20 rounded-lg p-4 mt-4">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#B8C901" />
                <Text className="text-[#B8C901] ml-2 flex-1">
                  Les comptes techniciens sont créés par un administrateur TENEX. 
                  Contactez votre responsable pour obtenir vos identifiants.
                </Text>
              </View>
            </View>
          )}

          {/* Comptes de test */}
          <View className="bg-gray-100 rounded-lg p-4 mt-6 mb-8">
            <Text className="text-gray-600 font-medium mb-2">Comptes de démonstration :</Text>
            <View className="flex-row items-center mb-1">
              <Ionicons name="person" size={14} color="#6b7280" />
              <Text className="text-gray-500 text-sm ml-2">Technicien: tech / tech123</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="shield" size={14} color="#6b7280" />
              <Text className="text-gray-500 text-sm ml-2">Admin: admin / admin123</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
