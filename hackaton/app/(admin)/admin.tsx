import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { db, DBUser, DBMission } from '@/services/database';

type Tab = 'users' | 'missions';

export default function AdminScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [users, setUsers] = useState<DBUser[]>([]);
  const [missions, setMissions] = useState<DBMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modals
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [missionModalVisible, setMissionModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);

  // New user form
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    role: 'technician' as 'technician' | 'admin',
  });

  // New mission form
  const [newMission, setNewMission] = useState({
    title: '',
    description: '',
    location: '',
    address: '',
    startDate: '',
    duration: '1',
    budget: '',
    urgency: 'medium' as 'low' | 'medium' | 'high',
    skills: '',
    assignedToUserId: null as number | null,
  });

  const loadData = useCallback(async () => {
    try {
      const [allUsers, allMissions] = await Promise.all([
        db.getAllUsers(),
        db.getAllMissions(),
      ]);
      setUsers(allUsers);
      setMissions(allMissions);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.firstName || !newUser.lastName || !newUser.email) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setCreating(true);
    try {
      await db.createUser({
        username: newUser.username,
        password: newUser.password,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        profilePicture: null,
      });
      Alert.alert('Succès', 'Utilisateur créé avec succès');
      setUserModalVisible(false);
      setNewUser({ username: '', password: '', firstName: '', lastName: '', email: '', role: 'technician' });
      loadData();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer l\'utilisateur');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateMission = async () => {
    if (!newMission.title || !newMission.location || !newMission.budget) {
      Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires');
      return;
    }

    if (!user) return;

    setCreating(true);
    try {
      const startDate = newMission.startDate || new Date().toISOString();
      const duration = parseInt(newMission.duration) || 1;
      const endDate = new Date(new Date(startDate).getTime() + duration * 24 * 60 * 60 * 1000).toISOString();

      await db.createMission({
        title: newMission.title,
        description: newMission.description,
        location: newMission.location,
        address: newMission.address,
        startDate,
        endDate,
        duration,
        budget: parseFloat(newMission.budget),
        urgency: newMission.urgency,
        skills: newMission.skills,
        status: newMission.assignedToUserId ? 'proposed' : 'proposed',
        assignedToUserId: newMission.assignedToUserId,
        createdByUserId: user.id,
      });
      Alert.alert('Succès', 'Mission créée avec succès');
      setMissionModalVisible(false);
      setNewMission({ title: '', description: '', location: '', address: '', startDate: '', duration: '1', budget: '', urgency: 'medium', skills: '', assignedToUserId: null });
      loadData();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer la mission');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = (userId: number) => {
    Alert.alert(
      'Supprimer l\'utilisateur',
      'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await db.deleteUser(userId);
              loadData();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer l\'utilisateur');
            }
          },
        },
      ]
    );
  };

  if (!user || user.role !== 'admin') {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#B8C901" />
      </View>
    );
  }

  const technicians = users.filter(u => u.role === 'technician');

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-[#B8C901] pt-12 pb-4 px-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="bg-white/20 rounded-lg p-2 mr-3">
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            <View>
              <Text className="text-white text-xl font-bold">Panel Admin</Text>
              <Text className="text-white/70 text-sm">TENEX Workforce</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row bg-white/20 rounded-lg p-1">
          <TouchableOpacity
            onPress={() => setActiveTab('users')}
            className={`flex-1 py-2 rounded-md ${activeTab === 'users' ? 'bg-white' : ''}`}
          >
            <Text className={`text-center font-medium ${activeTab === 'users' ? 'text-[#B8C901]' : 'text-white'}`}>
              Utilisateurs ({users.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('missions')}
            className={`flex-1 py-2 rounded-md ${activeTab === 'missions' ? 'bg-white' : ''}`}
          >
            <Text className={`text-center font-medium ${activeTab === 'missions' ? 'text-[#B8C901]' : 'text-white'}`}>
              Missions ({missions.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#B8C901" />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#B8C901']} />}
        >
          {/* Users Tab */}
          {activeTab === 'users' && (
            <View className="p-4">
              <TouchableOpacity
                onPress={() => setUserModalVisible(true)}
                className="bg-[#B8C901] py-4 rounded-xl flex-row items-center justify-center mb-4"
              >
                <Ionicons name="person-add" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Créer un utilisateur</Text>
              </TouchableOpacity>

              {users.map((u) => (
                <View key={u.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
                  <View className="flex-row items-center">
                    {u.profilePicture ? (
                      <Image source={{ uri: u.profilePicture }} className="w-12 h-12 rounded-full mr-3" />
                    ) : (
                      <View className={`w-12 h-12 rounded-full mr-3 items-center justify-center ${u.role === 'admin' ? 'bg-purple-100' : 'bg-[#B8C901]/10'}`}>
                        <Ionicons name={u.role === 'admin' ? 'shield' : 'person'} size={24} color={u.role === 'admin' ? '#9333ea' : '#B8C901'} />
                      </View>
                    )}
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-800">{u.firstName} {u.lastName}</Text>
                      <Text className="text-gray-500 text-sm">@{u.username}</Text>
                      <View className={`self-start px-2 py-0.5 rounded-full mt-1 ${u.role === 'admin' ? 'bg-purple-100' : 'bg-[#B8C901]/10'}`}>
                        <Text className={`text-xs ${u.role === 'admin' ? 'text-purple-700' : 'text-[#B8C901]'}`}>
                          {u.role === 'admin' ? 'Admin' : 'Technicien'}
                        </Text>
                      </View>
                    </View>
                    {u.id !== user.id && (
                      <TouchableOpacity onPress={() => handleDeleteUser(u.id)} className="p-2">
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Missions Tab */}
          {activeTab === 'missions' && (
            <View className="p-4">
              <TouchableOpacity
                onPress={() => setMissionModalVisible(true)}
                className="bg-[#B8C901] py-4 rounded-xl flex-row items-center justify-center mb-4"
              >
                <Ionicons name="add-circle" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Créer une mission</Text>
              </TouchableOpacity>

              {missions.length === 0 ? (
                <View className="items-center py-8">
                  <Ionicons name="briefcase-outline" size={48} color="#d1d5db" />
                  <Text className="text-gray-400 mt-2">Aucune mission créée</Text>
                </View>
              ) : (
                missions.map((mission) => {
                  const assignedUser = users.find(u => u.id === mission.assignedToUserId);
                  return (
                    <View key={mission.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
                      <View className="flex-row justify-between items-start mb-2">
                        <Text className="font-semibold text-gray-800 flex-1">{mission.title}</Text>
                        <View className={`px-2 py-1 rounded-full ${
                          mission.status === 'completed' ? 'bg-green-100' :
                          mission.status === 'accepted' ? 'bg-blue-100' :
                          mission.status === 'rejected' ? 'bg-red-100' : 'bg-orange-100'
                        }`}>
                          <Text className={`text-xs ${
                            mission.status === 'completed' ? 'text-green-700' :
                            mission.status === 'accepted' ? 'text-blue-700' :
                            mission.status === 'rejected' ? 'text-red-700' : 'text-orange-700'
                          }`}>
                            {mission.status === 'completed' ? 'Terminée' :
                             mission.status === 'accepted' ? 'Acceptée' :
                             mission.status === 'rejected' ? 'Refusée' : 'Proposée'}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center mb-2">
                        <Ionicons name="location-outline" size={16} color="#6b7280" />
                        <Text className="text-gray-500 ml-1">{mission.location}</Text>
                      </View>
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <Ionicons name="person-outline" size={16} color="#6b7280" />
                          <Text className="text-gray-500 ml-1">
                            {assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : 'Non assignée'}
                          </Text>
                        </View>
                        <Text className="text-[#B8C901] font-bold">{mission.budget} €</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* User Modal */}
      <Modal visible={userModalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[90%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">Nouvel utilisateur</Text>
              <TouchableOpacity onPress={() => setUserModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-gray-600 mb-2">Nom d'utilisateur *</Text>
              <TextInput
                className="bg-gray-100 rounded-xl px-4 py-3 mb-4"
                placeholder="jean.dupont"
                value={newUser.username}
                onChangeText={(text) => setNewUser({ ...newUser, username: text })}
                autoCapitalize="none"
              />

              <Text className="text-gray-600 mb-2">Mot de passe *</Text>
              <TextInput
                className="bg-gray-100 rounded-xl px-4 py-3 mb-4"
                placeholder="••••••••"
                value={newUser.password}
                onChangeText={(text) => setNewUser({ ...newUser, password: text })}
                secureTextEntry
              />

              <View className="flex-row mb-4">
                <View className="flex-1 mr-2">
                  <Text className="text-gray-600 mb-2">Prénom *</Text>
                  <TextInput
                    className="bg-gray-100 rounded-xl px-4 py-3"
                    placeholder="Jean"
                    value={newUser.firstName}
                    onChangeText={(text) => setNewUser({ ...newUser, firstName: text })}
                  />
                </View>
                <View className="flex-1 ml-2">
                  <Text className="text-gray-600 mb-2">Nom *</Text>
                  <TextInput
                    className="bg-gray-100 rounded-xl px-4 py-3"
                    placeholder="Dupont"
                    value={newUser.lastName}
                    onChangeText={(text) => setNewUser({ ...newUser, lastName: text })}
                  />
                </View>
              </View>

              <Text className="text-gray-600 mb-2">Email *</Text>
              <TextInput
                className="bg-gray-100 rounded-xl px-4 py-3 mb-4"
                placeholder="jean@example.com"
                value={newUser.email}
                onChangeText={(text) => setNewUser({ ...newUser, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text className="text-gray-600 mb-2">Rôle</Text>
              <View className="flex-row mb-6">
                <TouchableOpacity
                  onPress={() => setNewUser({ ...newUser, role: 'technician' })}
                  className={`flex-1 py-3 rounded-xl mr-2 items-center ${newUser.role === 'technician' ? 'bg-[#B8C901]' : 'bg-gray-100'}`}
                >
                  <Text className={newUser.role === 'technician' ? 'text-white font-medium' : 'text-gray-600'}>Technicien</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setNewUser({ ...newUser, role: 'admin' })}
                  className={`flex-1 py-3 rounded-xl ml-2 items-center ${newUser.role === 'admin' ? 'bg-purple-500' : 'bg-gray-100'}`}
                >
                  <Text className={newUser.role === 'admin' ? 'text-white font-medium' : 'text-gray-600'}>Admin</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleCreateUser}
                disabled={creating}
                className={`py-4 rounded-xl items-center ${creating ? 'bg-[#B8C901]/50' : 'bg-[#B8C901]'}`}
              >
                {creating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold">Créer l'utilisateur</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Mission Modal */}
      <Modal visible={missionModalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[90%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">Nouvelle mission</Text>
              <TouchableOpacity onPress={() => setMissionModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-gray-600 mb-2">Titre *</Text>
              <TextInput
                className="bg-gray-100 rounded-xl px-4 py-3 mb-4"
                placeholder="Installation fibre optique"
                value={newMission.title}
                onChangeText={(text) => setNewMission({ ...newMission, title: text })}
              />

              <Text className="text-gray-600 mb-2">Description</Text>
              <TextInput
                className="bg-gray-100 rounded-xl px-4 py-3 mb-4"
                placeholder="Détails de la mission..."
                value={newMission.description}
                onChangeText={(text) => setNewMission({ ...newMission, description: text })}
                multiline
                numberOfLines={3}
              />

              <Text className="text-gray-600 mb-2">Lieu *</Text>
              <TextInput
                className="bg-gray-100 rounded-xl px-4 py-3 mb-4"
                placeholder="Paris 15e"
                value={newMission.location}
                onChangeText={(text) => setNewMission({ ...newMission, location: text })}
              />

              <Text className="text-gray-600 mb-2">Adresse</Text>
              <TextInput
                className="bg-gray-100 rounded-xl px-4 py-3 mb-4"
                placeholder="42 Rue de la Convention"
                value={newMission.address}
                onChangeText={(text) => setNewMission({ ...newMission, address: text })}
              />

              <View className="flex-row mb-4">
                <View className="flex-1 mr-2">
                  <Text className="text-gray-600 mb-2">Durée (jours)</Text>
                  <TextInput
                    className="bg-gray-100 rounded-xl px-4 py-3"
                    placeholder="3"
                    value={newMission.duration}
                    onChangeText={(text) => setNewMission({ ...newMission, duration: text })}
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1 ml-2">
                  <Text className="text-gray-600 mb-2">Budget (€) *</Text>
                  <TextInput
                    className="bg-gray-100 rounded-xl px-4 py-3"
                    placeholder="1500"
                    value={newMission.budget}
                    onChangeText={(text) => setNewMission({ ...newMission, budget: text })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text className="text-gray-600 mb-2">Urgence</Text>
              <View className="flex-row mb-4">
                <TouchableOpacity
                  onPress={() => setNewMission({ ...newMission, urgency: 'low' })}
                  className={`flex-1 py-3 rounded-xl mr-2 items-center ${newMission.urgency === 'low' ? 'bg-green-500' : 'bg-gray-100'}`}
                >
                  <Text className={newMission.urgency === 'low' ? 'text-white font-medium' : 'text-gray-600'}>Normal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setNewMission({ ...newMission, urgency: 'medium' })}
                  className={`flex-1 py-3 rounded-xl mx-1 items-center ${newMission.urgency === 'medium' ? 'bg-orange-500' : 'bg-gray-100'}`}
                >
                  <Text className={newMission.urgency === 'medium' ? 'text-white font-medium' : 'text-gray-600'}>Moyenne</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setNewMission({ ...newMission, urgency: 'high' })}
                  className={`flex-1 py-3 rounded-xl ml-2 items-center ${newMission.urgency === 'high' ? 'bg-red-500' : 'bg-gray-100'}`}
                >
                  <Text className={newMission.urgency === 'high' ? 'text-white font-medium' : 'text-gray-600'}>Urgente</Text>
                </TouchableOpacity>
              </View>

              <Text className="text-gray-600 mb-2">Assigner à</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                <TouchableOpacity
                  onPress={() => setNewMission({ ...newMission, assignedToUserId: null })}
                  className={`px-4 py-2 rounded-lg mr-2 ${!newMission.assignedToUserId ? 'bg-[#B8C901]' : 'bg-gray-100'}`}
                >
                  <Text className={!newMission.assignedToUserId ? 'text-white' : 'text-gray-600'}>Non assignée</Text>
                </TouchableOpacity>
                {technicians.map((tech) => (
                  <TouchableOpacity
                    key={tech.id}
                    onPress={() => setNewMission({ ...newMission, assignedToUserId: tech.id })}
                    className={`px-4 py-2 rounded-lg mr-2 ${newMission.assignedToUserId === tech.id ? 'bg-[#B8C901]' : 'bg-gray-100'}`}
                  >
                    <Text className={newMission.assignedToUserId === tech.id ? 'text-white' : 'text-gray-600'}>
                      {tech.firstName} {tech.lastName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                onPress={handleCreateMission}
                disabled={creating}
                className={`py-4 rounded-xl items-center ${creating ? 'bg-[#B8C901]/50' : 'bg-[#B8C901]'}`}
              >
                {creating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold">Créer la mission</Text>
                )}
              </TouchableOpacity>

              <View className="h-6" />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
