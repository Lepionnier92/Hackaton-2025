import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TenexColors } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      <View className="flex-1 px-6">
        {/* Header avec logo */}
        <View className="items-center pt-16 pb-8">
          {/* Logo Tenexa */}
          <View className="flex-row items-center mb-4">
            <View className="bg-[#006241] rounded-xl p-3 mr-3">
              <Ionicons name="flash" size={32} color="white" />
            </View>
            <Text className="text-[#1a5336] text-4xl font-bold tracking-tight">
              Tenexa
            </Text>
          </View>
          
          {/* Tagline */}
          <Text className="text-[#2e3932] text-lg text-center mt-2">
            Your 1st step to the innovation
          </Text>
        </View>

        {/* Points clés */}
        <View className="flex-1 justify-center py-8">
          <View className="bg-[#d4e9e2]/30 rounded-2xl p-6 mb-4">
            <View className="flex-row items-center mb-4">
              <View className="bg-[#006241] rounded-full p-3 mr-4">
                <Ionicons name="rocket-outline" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-[#2e3932] font-semibold text-base">
                  Missions personnalisées par IA
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  Des propositions adaptées à vos compétences
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-center mb-4">
              <View className="bg-[#006241] rounded-full p-3 mr-4">
                <Ionicons name="wallet" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-[#2e3932] font-semibold text-base">
                  Gestion simplifiée de votre activité
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  Suivez vos missions et revenus facilement
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-center">
              <View className="bg-[#006241] rounded-full p-3 mr-4">
                <Ionicons name="shield-checkmark" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-[#2e3932] font-semibold text-base">
                  Entreprises vérifiées et de confiance
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  Travaillez en toute sérénité
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Boutons CTA */}
        <View className="pb-8">
          {/* Créer un compte - Bouton primaire */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/register' as any)}
            className="bg-[#006241] rounded-2xl py-4 mb-4 shadow-lg"
            style={{ shadowColor: '#006241', shadowOpacity: 0.3, shadowRadius: 10 }}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="person-add" size={20} color="white" />
              <Text className="text-white text-lg font-semibold ml-2">
                Créer un compte
              </Text>
            </View>
          </TouchableOpacity>

          {/* Se connecter - Bouton secondaire */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            className="border-2 border-[#006241] rounded-2xl py-4 mb-4"
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="log-in" size={20} color="#006241" />
              <Text className="text-[#006241] text-lg font-semibold ml-2">
                Se connecter
              </Text>
            </View>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-4">
            <View className="flex-1 h-[1px] bg-gray-200" />
            <Text className="text-gray-400 mx-4">ou</Text>
            <View className="flex-1 h-[1px] bg-gray-200" />
          </View>

          {/* AI Assistant / Voice Call */}
          <TouchableOpacity
            className="flex-row items-center justify-center py-3"
            onPress={() => router.push('/(auth)/login')}
          >
            <View className="bg-[#d4e9e2] rounded-full p-2 mr-2">
              <Ionicons name="mic" size={18} color="#006241" />
            </View>
            <Text className="text-gray-600">
              Parler à l'assistant <Text className="text-[#006241] font-semibold">Tenexa</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View className="items-center pb-4">
        <Text className="text-gray-400 text-xs">
          © 2025 TENEX Workforce
        </Text>
      </View>
    </SafeAreaView>
  );
}
