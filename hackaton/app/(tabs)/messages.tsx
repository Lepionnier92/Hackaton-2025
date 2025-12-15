import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Image, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { db, DBUser, FriendRequest, Conversation, DBMessage } from '@/services/database';

type Tab = 'conversations' | 'requests' | 'search';

export default function MessagesScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('conversations');
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<DBUser[]>([]);
  const [messages, setMessages] = useState<DBMessage[]>([]);
  const [sendingRequest, setSendingRequest] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [convs, requests] = await Promise.all([
        db.getConversations(user.id),
        db.getPendingFriendRequests(user.id),
      ]);
      setConversations(convs);
      setFriendRequests(requests);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!user || query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await db.searchUsersByUsername(query, user.id);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSendFriendRequest = async (toUserId: number) => {
    if (!user) return;
    setSendingRequest(toUserId);
    try {
      await db.sendFriendRequest(user.id, toUserId);
      Alert.alert('Demande envoyée', 'Votre demande d\'ami a été envoyée.');
      setSearchResults(prev => prev.filter(u => u.id !== toUserId));
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible d\'envoyer la demande.');
    } finally {
      setSendingRequest(null);
    }
  };

  const handleAcceptRequest = async (request: FriendRequest) => {
    if (!user) return;
    try {
      await db.acceptFriendRequest(request.id, user.id);
      Alert.alert('Demande acceptée', `Vous êtes maintenant ami avec ${request.fromUser?.firstName}`);
      loadData();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible d\'accepter la demande.');
    }
  };

  const handleRejectRequest = async (request: FriendRequest) => {
    if (!user) return;
    try {
      await db.rejectFriendRequest(request.id, user.id);
      loadData();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de refuser la demande.');
    }
  };

  const openConversation = async (conv: Conversation) => {
    if (!user) return;
    setActiveConversation(conv);
    try {
      const msgs = await db.getMessages(conv.id);
      setMessages(msgs);
      await db.markMessagesAsRead(conv.id, user.id);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!user || !activeConversation || !messageText.trim()) return;
    try {
      await db.sendMessage(activeConversation.id, user.id, messageText.trim());
      const msgs = await db.getMessages(activeConversation.id);
      setMessages(msgs);
      setMessageText('');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer le message.');
    }
  };

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#B8C901" />
      </View>
    );
  }

  // Chat view
  if (activeConversation) {
    return (
      <KeyboardAvoidingView 
        className="flex-1 bg-white"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View className="bg-[#B8C901] pt-12 pb-4 px-4">
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => { setActiveConversation(null); loadData(); }} 
              className="bg-white/20 rounded-full p-2 mr-3"
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            {activeConversation.otherUser?.profilePicture ? (
              <Image 
                source={{ uri: activeConversation.otherUser.profilePicture }}
                className="w-10 h-10 rounded-full mr-3 border-2 border-white/30"
              />
            ) : (
              <View className="w-10 h-10 rounded-full mr-3 bg-white/30 items-center justify-center">
                <Ionicons name="person" size={20} color="white" />
              </View>
            )}
            <View className="flex-1">
              <Text className="text-white font-bold">
                {activeConversation.otherUser?.firstName} {activeConversation.otherUser?.lastName}
              </Text>
              <Text className="text-white/70 text-sm">@{activeConversation.otherUser?.username}</Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView className="flex-1 px-4 py-4 bg-gray-50">
          {messages.length === 0 ? (
            <View className="items-center py-12">
              <Text className="text-gray-400">Aucun message. Dites bonjour ! 👋</Text>
            </View>
          ) : (
            messages.map((message) => (
              <View
                key={message.id}
                className={`mb-3 ${message.senderId === user.id ? 'items-end' : 'items-start'}`}
              >
                <View
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.senderId === user.id 
                      ? 'bg-[#B8C901] rounded-br-md' 
                      : 'bg-white border border-gray-200 rounded-bl-md'
                  }`}
                >
                  <Text className={message.senderId === user.id ? 'text-white' : 'text-gray-800'}>
                    {message.content}
                  </Text>
                  <Text
                    className={`text-xs mt-1 ${
                      message.senderId === user.id ? 'text-white/70' : 'text-gray-400'
                    }`}
                  >
                    {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Input */}
        <View className="bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
          <View className="flex-row items-center">
            <TextInput
              className="flex-1 bg-gray-100 rounded-full px-4 py-3 mr-2"
              placeholder="Votre message..."
              placeholderTextColor="#9ca3af"
              value={messageText}
              onChangeText={setMessageText}
              multiline
            />
            <TouchableOpacity
              onPress={sendMessage}
              className={`rounded-full w-10 h-10 items-center justify-center ${
                messageText.trim() ? 'bg-[#B8C901]' : 'bg-gray-300'
              }`}
            >
              <Ionicons name="send" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-[#B8C901] pt-12 pb-4 px-4">
        <View className="flex-row items-center mb-4">
          <View className="bg-white/20 rounded-lg p-2 mr-3">
            <Ionicons name="chatbubbles" size={24} color="white" />
          </View>
          <View>
            <Text className="text-white text-2xl font-bold">Messages</Text>
            <Text className="text-white/70 text-sm">Discutez avec vos amis</Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row bg-white/20 rounded-lg p-1">
          <TouchableOpacity
            onPress={() => setActiveTab('conversations')}
            className={`flex-1 py-2 rounded-md ${activeTab === 'conversations' ? 'bg-white' : ''}`}
          >
            <Text className={`text-center font-medium ${activeTab === 'conversations' ? 'text-[#B8C901]' : 'text-white'}`}>
              Discussions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('requests')}
            className={`flex-1 py-2 rounded-md relative ${activeTab === 'requests' ? 'bg-white' : ''}`}
          >
            <Text className={`text-center font-medium ${activeTab === 'requests' ? 'text-[#B8C901]' : 'text-white'}`}>
              Demandes {friendRequests.length > 0 && `(${friendRequests.length})`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('search')}
            className={`flex-1 py-2 rounded-md ${activeTab === 'search' ? 'bg-white' : ''}`}
          >
            <Text className={`text-center font-medium ${activeTab === 'search' ? 'text-[#B8C901]' : 'text-white'}`}>
              Rechercher
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
          {/* Conversations Tab */}
          {activeTab === 'conversations' && (
            <>
              {conversations.length === 0 ? (
                <View className="items-center py-12 px-4">
                  <View className="bg-gray-100 rounded-full p-6 mb-4">
                    <Ionicons name="people-outline" size={48} color="#d1d5db" />
                  </View>
                  <Text className="text-gray-600 font-medium text-center">Aucune conversation</Text>
                  <Text className="text-gray-400 text-sm text-center mt-1">
                    Ajoutez des amis pour commencer à discuter
                  </Text>
                </View>
              ) : (
                conversations.map((conv) => (
                  <TouchableOpacity
                    key={conv.id}
                    onPress={() => openConversation(conv)}
                    className={`bg-white border-b border-gray-100 px-4 py-4 ${
                      conv.unreadCount && conv.unreadCount > 0 ? 'bg-[#B8C901]/5' : ''
                    }`}
                  >
                    <View className="flex-row items-center">
                      {conv.otherUser?.profilePicture ? (
                        <Image 
                          source={{ uri: conv.otherUser.profilePicture }}
                          className="w-12 h-12 rounded-full mr-3"
                        />
                      ) : (
                        <View className="w-12 h-12 rounded-full mr-3 bg-gray-200 items-center justify-center">
                          <Ionicons name="person" size={24} color="#9ca3af" />
                        </View>
                      )}
                      <View className="flex-1">
                        <View className="flex-row items-center justify-between mb-1">
                          <Text className="font-semibold text-gray-800">
                            {conv.otherUser?.firstName} {conv.otherUser?.lastName}
                          </Text>
                          {conv.lastMessage && (
                            <Text className={`text-xs ${conv.unreadCount && conv.unreadCount > 0 ? 'text-[#B8C901] font-medium' : 'text-gray-400'}`}>
                              {new Date(conv.lastMessage.createdAt).toLocaleDateString('fr-FR')}
                            </Text>
                          )}
                        </View>
                        <View className="flex-row items-center justify-between">
                          <Text className="text-gray-500 text-sm flex-1 mr-2" numberOfLines={1}>
                            {conv.lastMessage?.content || 'Pas encore de message'}
                          </Text>
                          {conv.unreadCount && conv.unreadCount > 0 && (
                            <View className="bg-[#B8C901] rounded-full min-w-[20px] h-5 items-center justify-center px-1">
                              <Text className="text-white text-xs font-bold">{conv.unreadCount}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </>
          )}

          {/* Friend Requests Tab */}
          {activeTab === 'requests' && (
            <>
              {friendRequests.length === 0 ? (
                <View className="items-center py-12 px-4">
                  <View className="bg-gray-100 rounded-full p-6 mb-4">
                    <Ionicons name="mail-outline" size={48} color="#d1d5db" />
                  </View>
                  <Text className="text-gray-600 font-medium text-center">Aucune demande</Text>
                  <Text className="text-gray-400 text-sm text-center mt-1">
                    Vos demandes d'ami apparaîtront ici
                  </Text>
                </View>
              ) : (
                friendRequests.map((request) => (
                  <View key={request.id} className="bg-white border-b border-gray-100 px-4 py-4">
                    <View className="flex-row items-center">
                      {request.fromUser?.profilePicture ? (
                        <Image 
                          source={{ uri: request.fromUser.profilePicture }}
                          className="w-12 h-12 rounded-full mr-3"
                        />
                      ) : (
                        <View className="w-12 h-12 rounded-full mr-3 bg-gray-200 items-center justify-center">
                          <Ionicons name="person" size={24} color="#9ca3af" />
                        </View>
                      )}
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-800">
                          {request.fromUser?.firstName} {request.fromUser?.lastName}
                        </Text>
                        <Text className="text-gray-500 text-sm">@{request.fromUser?.username}</Text>
                      </View>
                      <View className="flex-row">
                        <TouchableOpacity
                          onPress={() => handleRejectRequest(request)}
                          className="bg-gray-200 px-4 py-2 rounded-lg mr-2"
                        >
                          <Ionicons name="close" size={20} color="#6b7280" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleAcceptRequest(request)}
                          className="bg-[#B8C901] px-4 py-2 rounded-lg"
                        >
                          <Ionicons name="checkmark" size={20} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </>
          )}

          {/* Search Tab */}
          {activeTab === 'search' && (
            <View className="p-4">
              <View className="flex-row items-center bg-white rounded-xl px-4 py-3 mb-4 border border-gray-200">
                <Ionicons name="search" size={20} color="#9ca3af" />
                <TextInput
                  className="flex-1 ml-2"
                  placeholder="Rechercher par nom d'utilisateur..."
                  placeholderTextColor="#9ca3af"
                  value={searchQuery}
                  onChangeText={handleSearch}
                  autoCapitalize="none"
                />
              </View>

              {searchQuery.length < 2 ? (
                <View className="items-center py-8">
                  <Ionicons name="search-outline" size={48} color="#d1d5db" />
                  <Text className="text-gray-400 text-center mt-2">
                    Entrez au moins 2 caractères pour rechercher
                  </Text>
                </View>
              ) : searchResults.length === 0 ? (
                <View className="items-center py-8">
                  <Ionicons name="person-outline" size={48} color="#d1d5db" />
                  <Text className="text-gray-400 text-center mt-2">
                    Aucun utilisateur trouvé
                  </Text>
                </View>
              ) : (
                searchResults.map((searchUser) => (
                  <View key={searchUser.id} className="bg-white rounded-xl px-4 py-4 mb-2 border border-gray-100">
                    <View className="flex-row items-center">
                      {searchUser.profilePicture ? (
                        <Image 
                          source={{ uri: searchUser.profilePicture }}
                          className="w-12 h-12 rounded-full mr-3"
                        />
                      ) : (
                        <View className="w-12 h-12 rounded-full mr-3 bg-gray-200 items-center justify-center">
                          <Ionicons name="person" size={24} color="#9ca3af" />
                        </View>
                      )}
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-800">
                          {searchUser.firstName} {searchUser.lastName}
                        </Text>
                        <Text className="text-gray-500 text-sm">@{searchUser.username}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleSendFriendRequest(searchUser.id)}
                        disabled={sendingRequest === searchUser.id}
                        className="bg-[#B8C901] px-4 py-2 rounded-lg"
                      >
                        {sendingRequest === searchUser.id ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <Text className="text-white font-medium">Ajouter</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
