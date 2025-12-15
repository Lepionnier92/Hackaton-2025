import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { TenexColors } from '@/constants/theme';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [resendCountdown, setResendCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCountdown]);

  const handleResend = () => {
    if (canResend) {
      setResendCountdown(60);
      setCanResend(false);
      // TODO: Appel API pour renvoyer l'email
    }
  };

  const maskEmail = (email: string) => {
    if (!email) return '';
    const [name, domain] = email.split('@');
    if (!name || !domain) return email;
    const maskedName = name.slice(0, 2) + '***' + (name.length > 3 ? name.slice(-1) : '');
    return `${maskedName}@${domain}`;
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-[#006241] pt-12 pb-8 px-4 items-center">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="absolute top-12 left-4 bg-white/20 rounded-full p-2"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View className="bg-white rounded-full p-6 mb-4 shadow-lg">
          <Ionicons name="mail" size={48} color={TenexColors.primary} />
        </View>
        <Text className="text-white text-2xl font-bold text-center">
          Vérifiez votre email
        </Text>
      </View>

      {/* Content */}
      <View className="flex-1 px-6 py-8">
        <View className="bg-[#d4e9e2] rounded-2xl p-6 mb-6">
          <Text className="text-gray-700 text-center text-lg mb-2">
            Nous avons envoyé un email à :
          </Text>
          <Text className="text-[#006241] text-center text-xl font-bold">
            {maskEmail(email || '')}
          </Text>
        </View>

        <Text className="text-gray-600 text-center mb-6">
          Cliquez sur le lien dans l'email pour activer votre compte.
        </Text>

        {/* Code OTP (optionnel) */}
        <View className="mb-6">
          <Text className="text-gray-700 font-medium mb-3 text-center">
            Ou entrez le code à 6 chiffres :
          </Text>
          <View className="flex-row justify-center">
            {[1, 2, 3, 4, 5, 6].map((_, index) => (
              <TextInput
                key={index}
                className="w-12 h-14 bg-gray-100 rounded-xl mx-1 text-center text-2xl font-bold text-gray-800 border-2 border-gray-200"
                maxLength={1}
                keyboardType="number-pad"
              />
            ))}
          </View>
        </View>

        {/* Timer de renvoi */}
        <View className="items-center mb-6">
          <Text className="text-gray-500 mb-2">Vous n'avez pas reçu l'email ?</Text>
          <TouchableOpacity
            onPress={handleResend}
            disabled={!canResend}
            className={`px-6 py-3 rounded-xl ${canResend ? 'bg-[#006241]' : 'bg-gray-200'}`}
          >
            <Text className={`font-semibold ${canResend ? 'text-white' : 'text-gray-500'}`}>
              {canResend ? 'Renvoyer le code' : `Renvoyer (${resendCountdown}s)`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View className="border-t border-gray-200 pt-6">
          <TouchableOpacity 
            onPress={() => router.push('/(auth)/register' as any)}
            className="py-3 items-center"
          >
            <Text className="text-[#006241] font-medium">Modifier l'email</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => router.replace('/(auth)/login' as any)}
            className="py-3 items-center"
          >
            <Text className="text-gray-500">Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer info */}
      <View className="px-6 pb-8">
        <View className="bg-gray-100 rounded-xl p-4 flex-row items-start">
          <Ionicons name="information-circle" size={20} color="#6b7280" />
          <Text className="text-gray-500 text-sm ml-2 flex-1">
            Si vous ne trouvez pas l'email, vérifiez vos spams ou dossier indésirables.
          </Text>
        </View>
      </View>
    </View>
  );
}
