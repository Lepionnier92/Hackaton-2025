import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface DBUser {
  id: number;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'technician';
  profilePicture: string | null;
  createdAt: string;
  // Données technicien
  skills?: string[];
  certifications?: string[];
  experience?: number; // années d'expérience
  bio?: string;
  // Disponibilités
  availableDays?: string[]; // ['Lundi', 'Mardi', ...]
  availableTimeSlots?: string; // 'Matin', 'Après-midi', 'Journée complète'
  maxDistance?: number; // km
  availabilityZones?: string[]; // ['Paris', 'Île-de-France', ...]
  availabilityStatus?: 'available' | 'unavailable' | 'on-mission';
  // Informations professionnelles
  jobTitle?: string;
  hourlyRate?: number;
  vehicleType?: string; // 'Voiture', 'Moto', 'Vélo', 'Transport en commun'
  hasDriverLicense?: boolean;
}

export interface TechnicianStats {
  totalMissions: number;
  completedMissions: number;
  acceptedMissions: number;
  rejectedMissions: number;
  totalRevenue: number;
  averageRating: number;
  monthlyStats: {
    month: string;
    year: number;
    missions: number;
    revenue: number;
  }[];
}

export interface PaySlip {
  id: number;
  userId: number;
  month: string;
  year: number;
  grossAmount: number;
  netAmount: number;
  missions: number;
  createdAt: string;
  downloadUrl?: string;
}

export interface FriendRequest {
  id: number;
  fromUserId: number;
  toUserId: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  fromUser?: DBUser;
  toUser?: DBUser;
}

export interface DBMessage {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: number;
  user1Id: number;
  user2Id: number;
  createdAt: string;
  lastMessageAt: string;
  otherUser?: DBUser;
  lastMessage?: DBMessage;
  unreadCount?: number;
}

export interface DBMission {
  id: number;
  title: string;
  description: string;
  location: string;
  address: string;
  startDate: string;
  endDate: string;
  duration: number;
  budget: number;
  urgency: 'low' | 'medium' | 'high';
  skills: string;
  status: 'proposed' | 'accepted' | 'in_progress' | 'completed' | 'rejected';
  assignedToUserId: number | null;
  createdByUserId: number;
  createdAt: string;
}

// Storage keys
const KEYS = {
  USERS: '@tenex_users',
  FRIEND_REQUESTS: '@tenex_friend_requests',
  CONVERSATIONS: '@tenex_conversations',
  MESSAGES: '@tenex_messages',
  MISSIONS: '@tenex_missions',
  PAYSLIPS: '@tenex_payslips',
  INITIALIZED: '@tenex_initialized',
  NEXT_USER_ID: '@tenex_nextUserId',
};

class DatabaseService {
        /**
         * Supprime un message d'une conversation (seul l'auteur peut supprimer)
         */
        async deleteMessage(messageId: number, userId: number): Promise<void> {
          const messages = await this.getAllMessages();
          const index = messages.findIndex(m => m.id === messageId && m.senderId === userId);
          if (index !== -1) {
            messages.splice(index, 1);
            await AsyncStorage.setItem(KEYS.MESSAGES, JSON.stringify(messages));
          } else {
            throw new Error("Suppression non autorisée");
          }
        }
      /**
       * Envoie une demande d'ami à un utilisateur via son nom d'utilisateur.
       * @param fromUserId L'utilisateur qui envoie la demande
       * @param toUsername Le nom d'utilisateur du destinataire
       */
      async sendFriendRequestByUsername(fromUserId: number, toUsername: string): Promise<number> {
        const users = await this.getAllUsers();
        const toUser = users.find(u => u.username.toLowerCase() === toUsername.toLowerCase());
        if (!toUser) {
          throw new Error("Utilisateur introuvable");
        }
        if (toUser.id === fromUserId) {
          throw new Error("Vous ne pouvez pas vous ajouter vous-même");
        }
        return this.sendFriendRequest(fromUserId, toUser.id);
      }
    /**
     * Assigne automatiquement les missions non attribuées aux utilisateurs en fonction de la localisation, du métier et des certifications.
     * Critères :
     *   - Localisation (mission.location == user.availabilityZones OU user.location)
     *   - Métier (mission.skills ou mission.title inclus dans user.jobTitle)
     *   - Diplômes/Certifications (mission.skills inclus dans user.certifications)
     *   - Statut disponible
     * Attribution au meilleur score (pondération simple)
     */
    async autoAssignMissions(): Promise<{ missionId: number; userId: number }[]> {
      const missions = await this.getAllMissions();
      const users = await this.getAllUsers();
      const assignments: { missionId: number; userId: number }[] = [];

      // Pour chaque mission non attribuée
      for (const mission of missions) {
        if (mission.assignedToUserId) continue;

        let bestScore = 0;
        let bestUser: DBUser | null = null;

        for (const user of users) {
          if (user.role !== 'technician' || user.availabilityStatus !== 'available') continue;

          let score = 0;

          // 1. Localisation
          if (user.availabilityZones && user.availabilityZones.includes(mission.location)) {
            score += 3;
          } else if (user.location && mission.location && user.location === mission.location) {
            score += 2;
          }

          // 2. Métier
          if (user.jobTitle && (mission.title?.toLowerCase().includes(user.jobTitle.toLowerCase()) || (mission.skills && user.jobTitle.toLowerCase().includes(mission.skills.toLowerCase())))) {
            score += 2;
          }

          // 3. Diplômes/Certifications
          if (user.certifications && mission.skills) {
            const missionSkills = mission.skills.split(',').map(s => s.trim().toLowerCase());
            const userCerts = user.certifications.map(c => c.toLowerCase());
            const match = missionSkills.some(skill => userCerts.includes(skill));
            if (match) score += 2;
          }

          // 4. Disponibilité (optionnel: maxDistance, créneau horaire...)
          // TODO: Ajouter d'autres critères si besoin

          if (score > bestScore) {
            bestScore = score;
            bestUser = user;
          }
        }

        if (bestUser && bestScore > 0) {
          await this.assignMission(mission.id, bestUser.id);
          assignments.push({ missionId: mission.id, userId: bestUser.id });
        }
      }
      return assignments;
    }
  private nextUserId = 1;
  private nextRequestId = 1;
  private nextConversationId = 1;
  private nextMessageId = 1;
  private nextMissionId = 1;
  private nextPaySlipId = 1;

  async init(): Promise<void> {
    const initialized = await AsyncStorage.getItem(KEYS.INITIALIZED);
    if (!initialized) {
      await this.seedDefaultData();
      await AsyncStorage.setItem(KEYS.INITIALIZED, 'true');
    } else {
      // Load current IDs
      await this.loadNextIds();
    }
  }

  private async loadNextIds(): Promise<void> {
    const users = await this.getAllUsers();
    const requests = await this.getAllFriendRequests();
    const conversations = await this.getAllConversations();
    const messages = await this.getAllMessages();
    const missions = await this.getAllMissions();
    const payslips = await this.getAllPaySlips();

    this.nextUserId = Math.max(...users.map(u => u.id), 0) + 1;
    this.nextRequestId = Math.max(...requests.map(r => r.id), 0) + 1;
    this.nextConversationId = Math.max(...conversations.map(c => c.id), 0) + 1;
    this.nextMessageId = Math.max(...messages.map(m => m.id), 0) + 1;
    this.nextMissionId = Math.max(...missions.map(m => m.id), 0) + 1;
    this.nextPaySlipId = Math.max(...payslips.map(p => p.id), 0) + 1;
  }

  private async seedDefaultData(): Promise<void> {
    // Réinitialisation totale : aucun utilisateur, mission, message, conversation, fiche de paie par défaut
    await AsyncStorage.setItem(KEYS.USERS, JSON.stringify([]));
    await AsyncStorage.setItem(KEYS.FRIEND_REQUESTS, JSON.stringify([]));
    await AsyncStorage.setItem(KEYS.CONVERSATIONS, JSON.stringify([]));
    await AsyncStorage.setItem(KEYS.MESSAGES, JSON.stringify([]));
    await AsyncStorage.setItem(KEYS.MISSIONS, JSON.stringify([]));
    await AsyncStorage.setItem(KEYS.PAYSLIPS, JSON.stringify([]));

    this.nextUserId = 1;
    this.nextMissionId = 1;
    this.nextPaySlipId = 1;
  }

  // ==================== USER METHODS ====================

  async login(username: string, password: string): Promise<DBUser | null> {
    const users = await this.getAllUsers();
    return users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password) || null;
  }

  async getUserById(id: number): Promise<DBUser | null> {
    const users = await this.getAllUsers();
    return users.find(u => u.id === id) || null;
  }

  async searchUsersByUsername(query: string, currentUserId: number): Promise<DBUser[]> {
    const users = await this.getAllUsers();
    return users.filter(u => 
      u.username.toLowerCase().includes(query.toLowerCase()) && u.id !== currentUserId
    ).slice(0, 20);
  }

  async createUser(user: Omit<DBUser, 'id' | 'createdAt'>): Promise<number> {
    // Charger le compteur d'ID depuis AsyncStorage
    let nextId = this.nextUserId;
    const storedId = await AsyncStorage.getItem(KEYS.NEXT_USER_ID);
    if (storedId) {
      nextId = parseInt(storedId, 10);
    }
    const users = await this.getAllUsers();
    const newUser: DBUser = {
      ...user,
      id: nextId,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(users));
    // Incrémenter et sauvegarder le compteur d'ID
    this.nextUserId = nextId + 1;
    await AsyncStorage.setItem(KEYS.NEXT_USER_ID, String(this.nextUserId));
    return newUser.id;
  }

  async updateUser(id: number, updates: Partial<DBUser>): Promise<void> {
    const users = await this.getAllUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(users));
    }
  }

  async getAllUsers(): Promise<DBUser[]> {
    const data = await AsyncStorage.getItem(KEYS.USERS);
    return data ? JSON.parse(data) : [];
  }

  async deleteUser(id: number): Promise<void> {
    const users = await this.getAllUsers();
    const filtered = users.filter(u => u.id !== id);
    await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(filtered));
  }

  // ==================== FRIEND REQUEST METHODS ====================

  private async getAllFriendRequests(): Promise<FriendRequest[]> {
    const data = await AsyncStorage.getItem(KEYS.FRIEND_REQUESTS);
    return data ? JSON.parse(data) : [];
  }

  async sendFriendRequest(fromUserId: number, toUserId: number): Promise<number> {
    const requests = await this.getAllFriendRequests();
    
    // Check if request already exists
    const existing = requests.find(r => 
      (r.fromUserId === fromUserId && r.toUserId === toUserId) ||
      (r.fromUserId === toUserId && r.toUserId === fromUserId)
    );
    
    if (existing) {
      throw new Error('Une demande existe déjà');
    }

    // Check if already friends
    const conversations = await this.getAllConversations();
    const existingConv = conversations.find(c =>
      (c.user1Id === fromUserId && c.user2Id === toUserId) ||
      (c.user1Id === toUserId && c.user2Id === fromUserId)
    );

    if (existingConv) {
      throw new Error('Vous êtes déjà amis');
    }

    const newRequest: FriendRequest = {
      id: this.nextRequestId++,
      fromUserId,
      toUserId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    requests.push(newRequest);
    await AsyncStorage.setItem(KEYS.FRIEND_REQUESTS, JSON.stringify(requests));
    return newRequest.id;
  }

  async getPendingFriendRequests(userId: number): Promise<FriendRequest[]> {
    const requests = await this.getAllFriendRequests();
    const users = await this.getAllUsers();
    
    return requests
      .filter(r => r.toUserId === userId && r.status === 'pending')
      .map(r => ({
        ...r,
        fromUser: users.find(u => u.id === r.fromUserId),
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getSentFriendRequests(userId: number): Promise<FriendRequest[]> {
    const requests = await this.getAllFriendRequests();
    const users = await this.getAllUsers();
    
    return requests
      .filter(r => r.fromUserId === userId && r.status === 'pending')
      .map(r => ({
        ...r,
        toUser: users.find(u => u.id === r.toUserId),
      }));
  }

  async acceptFriendRequest(requestId: number, userId: number): Promise<number> {
    const requests = await this.getAllFriendRequests();
    const index = requests.findIndex(r => r.id === requestId && r.toUserId === userId);
    
    if (index === -1) {
      throw new Error('Demande non trouvée');
    }

    const request = requests[index];
    requests[index] = { ...request, status: 'accepted' };
    await AsyncStorage.setItem(KEYS.FRIEND_REQUESTS, JSON.stringify(requests));

    // Create conversation
    const conversations = await this.getAllConversations();
    const newConversation: Conversation = {
      id: this.nextConversationId++,
      user1Id: request.fromUserId,
      user2Id: request.toUserId,
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
    };
    conversations.push(newConversation);
    await AsyncStorage.setItem(KEYS.CONVERSATIONS, JSON.stringify(conversations));

    return newConversation.id;
  }

  async rejectFriendRequest(requestId: number, userId: number): Promise<void> {
    const requests = await this.getAllFriendRequests();
    const index = requests.findIndex(r => r.id === requestId && r.toUserId === userId);
    
    if (index !== -1) {
      requests[index] = { ...requests[index], status: 'rejected' };
      await AsyncStorage.setItem(KEYS.FRIEND_REQUESTS, JSON.stringify(requests));
    }
  }

  // ==================== CONVERSATION & MESSAGE METHODS ====================

  private async getAllConversations(): Promise<Conversation[]> {
    const data = await AsyncStorage.getItem(KEYS.CONVERSATIONS);
    return data ? JSON.parse(data) : [];
  }

  private async getAllMessages(): Promise<DBMessage[]> {
    const data = await AsyncStorage.getItem(KEYS.MESSAGES);
    return data ? JSON.parse(data) : [];
  }

  async getConversations(userId: number): Promise<Conversation[]> {
    const conversations = await this.getAllConversations();
    const users = await this.getAllUsers();
    const messages = await this.getAllMessages();
    
    return conversations
      .filter(c => c.user1Id === userId || c.user2Id === userId)
      .map(c => {
        const otherUserId = c.user1Id === userId ? c.user2Id : c.user1Id;
        const conversationMessages = messages.filter(m => m.conversationId === c.id);
        const lastMessage = conversationMessages.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        const unreadCount = conversationMessages.filter(m => 
          m.senderId !== userId && !m.read
        ).length;

        return {
          ...c,
          otherUser: users.find(u => u.id === otherUserId),
          lastMessage,
          unreadCount,
        };
      })
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }

  async getMessages(conversationId: number): Promise<DBMessage[]> {
    const messages = await this.getAllMessages();
    return messages
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async sendMessage(conversationId: number, senderId: number, content: string): Promise<number> {
    const messages = await this.getAllMessages();
    const newMessage: DBMessage = {
      id: this.nextMessageId++,
      conversationId,
      senderId,
      content,
      createdAt: new Date().toISOString(),
      read: false,
    };
    messages.push(newMessage);
    await AsyncStorage.setItem(KEYS.MESSAGES, JSON.stringify(messages));

    // Update conversation lastMessageAt
    const conversations = await this.getAllConversations();
    const index = conversations.findIndex(c => c.id === conversationId);
    if (index !== -1) {
      conversations[index] = { ...conversations[index], lastMessageAt: new Date().toISOString() };
      await AsyncStorage.setItem(KEYS.CONVERSATIONS, JSON.stringify(conversations));
    }

    return newMessage.id;
  }

  async markMessagesAsRead(conversationId: number, userId: number): Promise<void> {
    const messages = await this.getAllMessages();
    const updated = messages.map(m => {
      if (m.conversationId === conversationId && m.senderId !== userId && !m.read) {
        return { ...m, read: true };
      }
      return m;
    });
    await AsyncStorage.setItem(KEYS.MESSAGES, JSON.stringify(updated));
  }

  // ==================== MISSION METHODS ====================

  async getMissionsForUser(userId: number): Promise<DBMission[]> {
    const missions = await this.getAllMissions();
    return missions
      .filter(m => m.assignedToUserId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAllMissions(): Promise<DBMission[]> {
    const data = await AsyncStorage.getItem(KEYS.MISSIONS);
    return data ? JSON.parse(data) : [];
  }

  async createMission(mission: Omit<DBMission, 'id' | 'createdAt'>): Promise<number> {
    const missions = await this.getAllMissions();
    const newMission: DBMission = {
      ...mission,
      id: this.nextMissionId++,
      createdAt: new Date().toISOString(),
    };
    missions.push(newMission);
    await AsyncStorage.setItem(KEYS.MISSIONS, JSON.stringify(missions));
    return newMission.id;
  }

  async updateMissionStatus(missionId: number, status: DBMission['status']): Promise<void> {
    const missions = await this.getAllMissions();
    const index = missions.findIndex(m => m.id === missionId);
    if (index !== -1) {
      missions[index] = { ...missions[index], status };
      await AsyncStorage.setItem(KEYS.MISSIONS, JSON.stringify(missions));
    }
  }

  async assignMission(missionId: number, userId: number): Promise<void> {
    const missions = await this.getAllMissions();
    const index = missions.findIndex(m => m.id === missionId);
    if (index !== -1) {
      missions[index] = { ...missions[index], assignedToUserId: userId, status: 'proposed' };
      await AsyncStorage.setItem(KEYS.MISSIONS, JSON.stringify(missions));
    }
  }

  async deleteMission(missionId: number): Promise<void> {
    const missions = await this.getAllMissions();
    const filtered = missions.filter(m => m.id !== missionId);
    await AsyncStorage.setItem(KEYS.MISSIONS, JSON.stringify(filtered));
  }

  async updateMission(missionId: number, updates: Partial<DBMission>): Promise<void> {
    const missions = await this.getAllMissions();
    const index = missions.findIndex(m => m.id === missionId);
    if (index !== -1) {
      missions[index] = { ...missions[index], ...updates };
      await AsyncStorage.setItem(KEYS.MISSIONS, JSON.stringify(missions));
    }
  }

  async getMissionById(missionId: number): Promise<DBMission | null> {
    const missions = await this.getAllMissions();
    return missions.find(m => m.id === missionId) || null;
  }

  // ==================== TECHNICIAN STATS METHODS ====================

  async getTechnicianStats(userId: number): Promise<TechnicianStats> {
    const missions = await this.getMissionsForUser(userId);
    
    const totalMissions = missions.length;
    const completedMissions = missions.filter(m => m.status === 'completed').length;
    const acceptedMissions = missions.filter(m => m.status === 'accepted' || m.status === 'in_progress').length;
    const rejectedMissions = missions.filter(m => m.status === 'rejected').length;
    const totalRevenue = missions
      .filter(m => m.status === 'completed')
      .reduce((sum, m) => sum + m.budget, 0);
    
    // Simulate rating
    const averageRating = 4.5 + Math.random() * 0.5;
    
    // Calculate monthly stats
    const monthlyStats: TechnicianStats['monthlyStats'] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.toLocaleDateString('fr-FR', { month: 'short' });
      const year = date.getFullYear();
      const monthMissions = missions.filter(m => {
        const mDate = new Date(m.createdAt);
        return mDate.getMonth() === date.getMonth() && mDate.getFullYear() === date.getFullYear();
      });
      monthlyStats.push({
        month,
        year,
        missions: monthMissions.filter(m => m.status === 'completed').length,
        revenue: monthMissions
          .filter(m => m.status === 'completed')
          .reduce((sum, m) => sum + m.budget, 0),
      });
    }
    
    return {
      totalMissions,
      completedMissions,
      acceptedMissions,
      rejectedMissions,
      totalRevenue,
      averageRating,
      monthlyStats,
    };
  }

  // ==================== PAYSLIPS METHODS ====================

  private async getAllPaySlips(): Promise<PaySlip[]> {
    const data = await AsyncStorage.getItem(KEYS.PAYSLIPS);
    return data ? JSON.parse(data) : [];
  }

  async getPaySlips(userId: number): Promise<PaySlip[]> {
    const payslips = await this.getAllPaySlips();
    return payslips
      .filter(p => p.userId === userId)
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 
                       'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
        return months.indexOf(b.month.toLowerCase()) - months.indexOf(a.month.toLowerCase());
      });
  }

  async createPaySlip(payslip: Omit<PaySlip, 'id' | 'createdAt'>): Promise<number> {
    const payslips = await this.getAllPaySlips();
    const newPaySlip: PaySlip = {
      ...payslip,
      id: this.nextPaySlipId++,
      createdAt: new Date().toISOString(),
    };
    payslips.push(newPaySlip);
    await AsyncStorage.setItem(KEYS.PAYSLIPS, JSON.stringify(payslips));
    return newPaySlip.id;
  }

  // Reset database (for testing)
  async resetDatabase(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.INITIALIZED);
    await AsyncStorage.removeItem(KEYS.USERS);
    await AsyncStorage.removeItem(KEYS.FRIEND_REQUESTS);
    await AsyncStorage.removeItem(KEYS.CONVERSATIONS);
    await AsyncStorage.removeItem(KEYS.MESSAGES);
    await AsyncStorage.removeItem(KEYS.MISSIONS);
    await this.init();
  }
}

export const db = new DatabaseService();
