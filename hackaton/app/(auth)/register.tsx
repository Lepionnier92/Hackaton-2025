import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { db } from '@/services/database';
import { TenexColors } from '@/constants/theme';

type Step = 1 | 2 | 3 | 4;

interface FormData {
  // Étape 1 - Informations personnelles
  civility: 'M.' | 'Mme';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  
  // Étape 2 - Sécurité
  password: string;
  confirmPassword: string;
  
  // Étape 3 - Profil professionnel
  jobTitle: string;
  experience: number;
  qualification: string;
  professionalStatus: string;
  siret: string;
  
  // Étape 4 - Préférences
  maxDistance: number;
  availability: string;
  acceptCGU: boolean;
  acceptPrivacy: boolean;
  acceptNewsletter: boolean;
}

const JOBS = [
  'Électricien',
  'Plombier',
  'Chauffagiste',
  'Technicien CVC',
  'Technicien de maintenance',
  'Installateur photovoltaïque',
  'Technicien fibre optique',
  'Menuisier',
  'Serrurier',
  'Autre',
];

const QUALIFICATIONS = [
  'CAP/BEP',
  'Bac Pro',
  'BTS/DUT',
  'Licence',
  'Master/Ingénieur',
];

const STATUSES = [
  'Salarié',
  'Auto-entrepreneur',
  'Freelance',
  'En recherche d\'emploi',
];

const AVAILABILITIES = [
  'Temps plein (35-40h/sem)',
  'Temps partiel (20-30h/sem)',
  'Missions courtes uniquement',
  'Totalement flexible',
];

export default function RegisterScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<FormData>({
    civility: 'M.',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    password: '',
    confirmPassword: '',
    jobTitle: '',
    experience: 0,
    qualification: '',
    professionalStatus: '',
    siret: '',
    maxDistance: 50,
    availability: '',
    acceptCGU: false,
    acceptPrivacy: false,
    acceptNewsletter: false,
  });

  const updateForm = (key: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Prénom requis';
    if (!formData.lastName.trim()) newErrors.lastName = 'Nom requis';
    if (!formData.email.trim()) {
      newErrors.email = 'Email requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Téléphone requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Au moins 8 caractères';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.jobTitle) newErrors.jobTitle = 'Métier requis';
    if (!formData.qualification) newErrors.qualification = 'Qualification requise';
    if (!formData.professionalStatus) newErrors.professionalStatus = 'Statut requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.acceptCGU) newErrors.acceptCGU = 'Vous devez accepter les CGU';
    if (!formData.acceptPrivacy) newErrors.acceptPrivacy = 'Vous devez accepter la politique de confidentialité';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    let isValid = false;
    switch (step) {
      case 1: isValid = validateStep1(); break;
      case 2: isValid = validateStep2(); break;
      case 3: isValid = validateStep3(); break;
    }
    if (isValid && step < 4) {
      setStep((step + 1) as Step);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
    } else {
      router.back();
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return { label: 'Faible', color: '#ef4444', width: '25%' };
    if (score <= 4) return { label: 'Moyen', color: '#f59e0b', width: '50%' };
    if (score <= 5) return { label: 'Fort', color: '#10b981', width: '75%' };
    return { label: 'Très fort', color: '#006241', width: '100%' };
  };

  const handleSubmit = async () => {
    if (!validateStep4()) return;
    
    setLoading(true);
    try {
      // Créer le compte via la base de données
      const username = formData.email.split('@')[0];
      await db.createUser({
        username,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: 'technician',
        profilePicture: null,
        jobTitle: formData.jobTitle,
        experience: formData.experience,
        maxDistance: formData.maxDistance,
        skills: [],
        certifications: [],
        availableDays: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
        availableTimeSlots: formData.availability,
        availabilityStatus: 'available',
      });
      
      Alert.alert(
        'Compte créé !',
        'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de créer le compte');
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => (
    <View className="flex-row items-center justify-center py-4">
      {[1, 2, 3, 4].map((s, i) => (
        <React.Fragment key={s}>
          <View
            className={`w-8 h-8 rounded-full items-center justify-center ${
              s <= step ? 'bg-[#006241]' : 'bg-gray-200'
            }`}
          >
            {s < step ? (
              <Ionicons name="checkmark" size={16} color="white" />
            ) : (
              <Text className={s <= step ? 'text-white font-bold' : 'text-gray-500'}>
                {s}
              </Text>
            )}
          </View>
          {i < 3 && (
            <View
              className={`h-1 w-12 ${s < step ? 'bg-[#006241]' : 'bg-gray-200'}`}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View>
      <Text className="text-2xl font-bold text-[#2e3932] mb-2">
        Créons votre profil
      </Text>
      <Text className="text-gray-500 mb-6">
        Informations personnelles
      </Text>

      {/* Civilité */}
      <Text className="text-gray-700 font-medium mb-2">Civilité</Text>
      <View className="flex-row mb-4">
        <TouchableOpacity
          onPress={() => updateForm('civility', 'M.')}
          className={`flex-row items-center px-4 py-2 rounded-lg mr-4 ${
            formData.civility === 'M.' ? 'bg-[#006241]' : 'bg-gray-100'
          }`}
        >
          <Ionicons
            name={formData.civility === 'M.' ? 'radio-button-on' : 'radio-button-off'}
            size={20}
            color={formData.civility === 'M.' ? 'white' : '#6b7280'}
          />
          <Text className={`ml-2 ${formData.civility === 'M.' ? 'text-white' : 'text-gray-700'}`}>
            M.
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => updateForm('civility', 'Mme')}
          className={`flex-row items-center px-4 py-2 rounded-lg ${
            formData.civility === 'Mme' ? 'bg-[#006241]' : 'bg-gray-100'
          }`}
        >
          <Ionicons
            name={formData.civility === 'Mme' ? 'radio-button-on' : 'radio-button-off'}
            size={20}
            color={formData.civility === 'Mme' ? 'white' : '#6b7280'}
          />
          <Text className={`ml-2 ${formData.civility === 'Mme' ? 'text-white' : 'text-gray-700'}`}>
            Mme
          </Text>
        </TouchableOpacity>
      </View>

      {/* Prénom */}
      <Text className="text-gray-700 font-medium mb-2">Prénom *</Text>
      <TextInput
        className={`bg-gray-100 rounded-xl px-4 py-3 mb-1 ${errors.firstName ? 'border border-red-500' : ''}`}
        placeholder="Votre prénom"
        value={formData.firstName}
        onChangeText={(text) => updateForm('firstName', text)}
      />
      {errors.firstName && <Text className="text-red-500 text-sm mb-3">{errors.firstName}</Text>}
      {!errors.firstName && <View className="mb-3" />}

      {/* Nom */}
      <Text className="text-gray-700 font-medium mb-2">Nom *</Text>
      <TextInput
        className={`bg-gray-100 rounded-xl px-4 py-3 mb-1 ${errors.lastName ? 'border border-red-500' : ''}`}
        placeholder="Votre nom"
        value={formData.lastName}
        onChangeText={(text) => updateForm('lastName', text)}
      />
      {errors.lastName && <Text className="text-red-500 text-sm mb-3">{errors.lastName}</Text>}
      {!errors.lastName && <View className="mb-3" />}

      {/* Email */}
      <Text className="text-gray-700 font-medium mb-2">Email *</Text>
      <TextInput
        className={`bg-gray-100 rounded-xl px-4 py-3 mb-1 ${errors.email ? 'border border-red-500' : ''}`}
        placeholder="votre@email.com"
        value={formData.email}
        onChangeText={(text) => updateForm('email', text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email && <Text className="text-red-500 text-sm mb-3">{errors.email}</Text>}
      {!errors.email && formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
        <View className="flex-row items-center mb-3">
          <Ionicons name="checkmark-circle" size={16} color="#10b981" />
          <Text className="text-green-600 text-sm ml-1">Email valide</Text>
        </View>
      )}
      {!errors.email && !formData.email && <View className="mb-3" />}

      {/* Téléphone */}
      <Text className="text-gray-700 font-medium mb-2">Téléphone *</Text>
      <TextInput
        className={`bg-gray-100 rounded-xl px-4 py-3 mb-1 ${errors.phone ? 'border border-red-500' : ''}`}
        placeholder="+33 6 12 34 56 78"
        value={formData.phone}
        onChangeText={(text) => updateForm('phone', text)}
        keyboardType="phone-pad"
      />
      {errors.phone && <Text className="text-red-500 text-sm mb-3">{errors.phone}</Text>}
    </View>
  );

  const renderStep2 = () => {
    const strength = getPasswordStrength();
    
    return (
      <View>
        <Text className="text-2xl font-bold text-[#2e3932] mb-2">
          Sécurisez votre compte
        </Text>
        <Text className="text-gray-500 mb-6">
          Choisissez un mot de passe sécurisé
        </Text>

        {/* Mot de passe */}
        <Text className="text-gray-700 font-medium mb-2">Mot de passe *</Text>
        <View className="relative mb-2">
          <TextInput
            className={`bg-gray-100 rounded-xl px-4 py-3 pr-12 ${errors.password ? 'border border-red-500' : ''}`}
            placeholder="Votre mot de passe"
            value={formData.password}
            onChangeText={(text) => updateForm('password', text)}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            className="absolute right-3 top-3"
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
        {errors.password && <Text className="text-red-500 text-sm mb-2">{errors.password}</Text>}

        {/* Indicateur de force */}
        {formData.password && (
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-gray-500 text-sm">Force du mot de passe :</Text>
              <Text style={{ color: strength.color }} className="text-sm font-medium">
                {strength.label}
              </Text>
            </View>
            <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{ width: strength.width as any, backgroundColor: strength.color }}
              />
            </View>
          </View>
        )}

        {/* Critères */}
        <View className="bg-gray-50 rounded-xl p-4 mb-4">
          <Text className="text-gray-700 font-medium mb-2">Votre mot de passe doit contenir :</Text>
          <View className="space-y-1">
            <View className="flex-row items-center">
              <Ionicons
                name={formData.password.length >= 8 ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={formData.password.length >= 8 ? '#10b981' : '#ef4444'}
              />
              <Text className="text-gray-600 ml-2 text-sm">Au moins 8 caractères</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons
                name={/[A-Z]/.test(formData.password) ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={/[A-Z]/.test(formData.password) ? '#10b981' : '#ef4444'}
              />
              <Text className="text-gray-600 ml-2 text-sm">1 majuscule</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons
                name={/[a-z]/.test(formData.password) ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={/[a-z]/.test(formData.password) ? '#10b981' : '#ef4444'}
              />
              <Text className="text-gray-600 ml-2 text-sm">1 minuscule</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons
                name={/[0-9]/.test(formData.password) ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={/[0-9]/.test(formData.password) ? '#10b981' : '#ef4444'}
              />
              <Text className="text-gray-600 ml-2 text-sm">1 chiffre</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons
                name={/[^A-Za-z0-9]/.test(formData.password) ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={/[^A-Za-z0-9]/.test(formData.password) ? '#10b981' : '#ef4444'}
              />
              <Text className="text-gray-600 ml-2 text-sm">1 caractère spécial</Text>
            </View>
          </View>
        </View>

        {/* Confirmer mot de passe */}
        <Text className="text-gray-700 font-medium mb-2">Confirmer le mot de passe *</Text>
        <View className="relative">
          <TextInput
            className={`bg-gray-100 rounded-xl px-4 py-3 pr-12 ${errors.confirmPassword ? 'border border-red-500' : ''}`}
            placeholder="Confirmez votre mot de passe"
            value={formData.confirmPassword}
            onChangeText={(text) => updateForm('confirmPassword', text)}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            className="absolute right-3 top-3"
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && (
          <Text className="text-red-500 text-sm mt-1">{errors.confirmPassword}</Text>
        )}
        {formData.confirmPassword && formData.password === formData.confirmPassword && (
          <View className="flex-row items-center mt-1">
            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
            <Text className="text-green-600 text-sm ml-1">Les mots de passe correspondent</Text>
          </View>
        )}
      </View>
    );
  };

  const renderStep3 = () => (
    <View>
      <Text className="text-2xl font-bold text-[#2e3932] mb-2">
        Votre profil professionnel
      </Text>
      <Text className="text-gray-500 mb-6">
        Aidez-nous à vous proposer les meilleures missions
      </Text>

      {/* Métier */}
      <Text className="text-gray-700 font-medium mb-2">Métier principal *</Text>
      <View className="flex-row flex-wrap mb-4">
        {JOBS.slice(0, 6).map((job) => (
          <TouchableOpacity
            key={job}
            onPress={() => updateForm('jobTitle', job)}
            className={`px-3 py-2 rounded-lg mr-2 mb-2 ${
              formData.jobTitle === job ? 'bg-[#006241]' : 'bg-gray-100'
            }`}
          >
            <Text className={formData.jobTitle === job ? 'text-white' : 'text-gray-700'}>
              {job}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.jobTitle && <Text className="text-red-500 text-sm mb-3">{errors.jobTitle}</Text>}

      {/* Expérience */}
      <Text className="text-gray-700 font-medium mb-2">Années d'expérience</Text>
      <View className="flex-row items-center mb-4">
        <TouchableOpacity
          onPress={() => updateForm('experience', Math.max(0, formData.experience - 1))}
          className="bg-gray-100 w-10 h-10 rounded-lg items-center justify-center"
        >
          <Ionicons name="remove" size={20} color="#6b7280" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold text-[#006241]">{formData.experience} ans</Text>
        </View>
        <TouchableOpacity
          onPress={() => updateForm('experience', formData.experience + 1)}
          className="bg-gray-100 w-10 h-10 rounded-lg items-center justify-center"
        >
          <Ionicons name="add" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Qualification */}
      <Text className="text-gray-700 font-medium mb-2">Niveau de qualification *</Text>
      <View className="mb-4">
        {QUALIFICATIONS.map((qual) => (
          <TouchableOpacity
            key={qual}
            onPress={() => updateForm('qualification', qual)}
            className={`flex-row items-center px-4 py-3 rounded-lg mb-2 ${
              formData.qualification === qual ? 'bg-[#006241]' : 'bg-gray-100'
            }`}
          >
            <Ionicons
              name={formData.qualification === qual ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={formData.qualification === qual ? 'white' : '#6b7280'}
            />
            <Text className={`ml-2 ${formData.qualification === qual ? 'text-white' : 'text-gray-700'}`}>
              {qual}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.qualification && <Text className="text-red-500 text-sm mb-3">{errors.qualification}</Text>}

      {/* Statut */}
      <Text className="text-gray-700 font-medium mb-2">Statut professionnel *</Text>
      <View className="flex-row flex-wrap">
        {STATUSES.map((status) => (
          <TouchableOpacity
            key={status}
            onPress={() => updateForm('professionalStatus', status)}
            className={`px-3 py-2 rounded-lg mr-2 mb-2 ${
              formData.professionalStatus === status ? 'bg-[#006241]' : 'bg-gray-100'
            }`}
          >
            <Text className={formData.professionalStatus === status ? 'text-white' : 'text-gray-700'}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.professionalStatus && <Text className="text-red-500 text-sm mt-2">{errors.professionalStatus}</Text>}
    </View>
  );

  const renderStep4 = () => (
    <View>
      <Text className="text-2xl font-bold text-[#2e3932] mb-2">
        Dernières informations
      </Text>
      <Text className="text-gray-500 mb-6">
        Préférences et conditions
      </Text>

      {/* Rayon de déplacement */}
      <Text className="text-gray-700 font-medium mb-2">Rayon de déplacement</Text>
      <View className="bg-gray-50 rounded-xl p-4 mb-4">
        <Text className="text-center text-2xl font-bold text-[#006241] mb-2">
          {formData.maxDistance} km
        </Text>
        <View className="flex-row items-center">
          <Text className="text-gray-500 text-sm">0</Text>
          <View className="flex-1 mx-2">
            <View className="h-2 bg-gray-200 rounded-full">
              <View
                className="h-2 bg-[#006241] rounded-full"
                style={{ width: `${(formData.maxDistance / 200) * 100}%` }}
              />
            </View>
          </View>
          <Text className="text-gray-500 text-sm">200</Text>
        </View>
        <View className="flex-row justify-between mt-3">
          {[25, 50, 100, 150, 200].map((dist) => (
            <TouchableOpacity
              key={dist}
              onPress={() => updateForm('maxDistance', dist)}
              className={`px-2 py-1 rounded ${
                formData.maxDistance === dist ? 'bg-[#006241]' : 'bg-gray-200'
              }`}
            >
              <Text className={formData.maxDistance === dist ? 'text-white text-xs' : 'text-gray-600 text-xs'}>
                {dist}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Disponibilité */}
      <Text className="text-gray-700 font-medium mb-2">Disponibilité générale</Text>
      <View className="mb-4">
        {AVAILABILITIES.map((avail) => (
          <TouchableOpacity
            key={avail}
            onPress={() => updateForm('availability', avail)}
            className={`flex-row items-center px-4 py-3 rounded-lg mb-2 ${
              formData.availability === avail ? 'bg-[#006241]' : 'bg-gray-100'
            }`}
          >
            <Ionicons
              name={formData.availability === avail ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={formData.availability === avail ? 'white' : '#6b7280'}
            />
            <Text className={`ml-2 ${formData.availability === avail ? 'text-white' : 'text-gray-700'}`}>
              {avail}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* CGU */}
      <View className="border-t border-gray-200 pt-4 mt-4">
        <TouchableOpacity
          onPress={() => updateForm('acceptCGU', !formData.acceptCGU)}
          className="flex-row items-start mb-3"
        >
          <Ionicons
            name={formData.acceptCGU ? 'checkbox' : 'square-outline'}
            size={24}
            color={formData.acceptCGU ? '#006241' : '#6b7280'}
          />
          <View className="flex-1 ml-3">
            <Text className="text-gray-700">
              J'accepte les <Text className="text-[#006241] underline">Conditions Générales d'Utilisation</Text> *
            </Text>
          </View>
        </TouchableOpacity>
        {errors.acceptCGU && <Text className="text-red-500 text-sm mb-2">{errors.acceptCGU}</Text>}

        <TouchableOpacity
          onPress={() => updateForm('acceptPrivacy', !formData.acceptPrivacy)}
          className="flex-row items-start mb-3"
        >
          <Ionicons
            name={formData.acceptPrivacy ? 'checkbox' : 'square-outline'}
            size={24}
            color={formData.acceptPrivacy ? '#006241' : '#6b7280'}
          />
          <View className="flex-1 ml-3">
            <Text className="text-gray-700">
              J'accepte la <Text className="text-[#006241] underline">Politique de Confidentialité</Text> *
            </Text>
          </View>
        </TouchableOpacity>
        {errors.acceptPrivacy && <Text className="text-red-500 text-sm mb-2">{errors.acceptPrivacy}</Text>}

        <TouchableOpacity
          onPress={() => updateForm('acceptNewsletter', !formData.acceptNewsletter)}
          className="flex-row items-start"
        >
          <Ionicons
            name={formData.acceptNewsletter ? 'checkbox' : 'square-outline'}
            size={24}
            color={formData.acceptNewsletter ? '#006241' : '#6b7280'}
          />
          <View className="flex-1 ml-3">
            <Text className="text-gray-700">
              J'accepte de recevoir la newsletter et les offres
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View className="bg-[#d4e9e2] rounded-xl p-4 mt-6">
        <Text className="text-[#006241] text-center">
          En créant un compte, vous rejoignez <Text className="font-bold">10 000+ techniciens</Text> sur TENEX
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1">
        {/* Header */}
        <View className="bg-[#006241] pt-12 pb-4 px-4">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={prevStep} className="p-2">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-lg font-semibold flex-1 text-center mr-8">
              Inscription
            </Text>
          </View>
          {renderProgressBar()}
        </View>

        {/* Content */}
        <ScrollView
          className="flex-1 px-6 pt-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}

          <View className="h-24" />
        </ScrollView>

        {/* Footer */}
        <View className="px-6 pb-8 pt-4 bg-white border-t border-gray-100">
          {step < 4 ? (
            <TouchableOpacity
              onPress={nextStep}
              className="bg-[#006241] rounded-2xl py-4"
            >
              <View className="flex-row items-center justify-center">
                <Text className="text-white text-lg font-semibold">Continuer</Text>
                <Ionicons name="arrow-forward" size={20} color="white" className="ml-2" />
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className={`rounded-2xl py-4 ${loading ? 'bg-gray-300' : 'bg-[#006241]'}`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <View className="flex-row items-center justify-center">
                  <Ionicons name="rocket" size={20} color="white" />
                  <Text className="text-white text-lg font-semibold ml-2">
                    Créer mon compte
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          
          <Text className="text-gray-400 text-xs text-center mt-4">
            * Champs obligatoires
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
