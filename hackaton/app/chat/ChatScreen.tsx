import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Keyboard, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Utilisation d'un sélecteur d'emoji custom simple (React Native ne supporte pas emoji-picker-react)
import { db, DBMessage, Conversation } from '@/services/database';
import { useAuth } from '@/contexts/AuthContext';

interface ChatScreenProps {
  conversation: Conversation;
}

export default function ChatScreen({ conversation }: ChatScreenProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DBMessage[]>([]);
  const [input, setInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Chargement initial et "temps réel" (polling simple)
  useEffect(() => {
    let mounted = true;
    const fetchMessages = async () => {
      const all = await db.getAllMessagesForConversation(conversation.id);
      if (mounted) setMessages(all);
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 1500); // "temps réel" simple
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [conversation.id]);

  // Envoi message (Entrée ou bouton)
  const handleSend = async () => {
    if (!input.trim()) return;
    await db.sendMessage(conversation.id, user.id, input);
    setInput('');
    setShowEmoji(false);
    Keyboard.dismiss();
  };

  // Suppression message (si auteur)
  const handleDelete = async (msgId: number) => {
    await db.deleteMessage(msgId, user.id);
    setMessages(msgs => msgs.filter(m => m.id !== msgId));
  };

  // Ajout emoji
  const onEmojiClick = (event: any, emojiObject: any) => {
    setInput(input + emojiObject.emoji);
  };

  // Entrée = envoi
  const onInputKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Enter' && !e.shiftKey) {
      e.preventDefault?.();
      handleSend();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f7f6' }}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', margin: 8, alignSelf: item.senderId === user.id ? 'flex-end' : 'flex-start' }}>
            <Text style={{ backgroundColor: item.senderId === user.id ? '#B8C901' : '#e8efe9', color: '#1e3932', borderRadius: 16, padding: 10, maxWidth: 250 }}>{item.content}</Text>
            {item.senderId === user.id && (
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ marginLeft: 4 }}>
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        )}
        inverted
      />
      {showEmoji && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#fff', padding: 8, borderTopWidth: 1, borderColor: '#e8efe9' }}>
          {['😀','😂','😍','😎','😭','😡','👍','🙏','🎉','🔥','❤️','😅','😇','😜','🤔','🥳','😏','😬','😱','🤩','😤','😢','😋','😴','😳','😃','😉','😆','😝','😚','😌','😔','😑','😒','😕','😲','😡','😩','😤','😮','😯','😪','😫','😴','😵','😷','🤒','🤕','🤑','🤠','😈','👿','👻','💀','☠️','👽','🤖','💩','😺','😸','😹','😻','😼','😽','🙀','😿','😾'].map(e => (
            <TouchableOpacity key={e} onPress={() => setInput(input + e)} style={{ padding: 4 }}>
              <Text style={{ fontSize: 28 }}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: '#fff' }}>
        <TouchableOpacity onPress={() => setShowEmoji(v => !v)}>
          <Ionicons name="happy-outline" size={28} color="#B8C901" />
        </TouchableOpacity>
        <TextInput
          style={{ flex: 1, marginHorizontal: 8, backgroundColor: '#e8efe9', borderRadius: 16, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 12 : 8 }}
          placeholder="Message..."
          value={input}
          onChangeText={setInput}
          onKeyPress={onInputKeyPress}
          multiline
        />
        <TouchableOpacity onPress={handleSend} disabled={!input.trim()}>
          <Ionicons name="send" size={28} color={input.trim() ? '#006241' : '#d4e9e2'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
