import * as SQLite from 'expo-sqlite';

// Types
export interface DBUser {
  id: number;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'technician';
  profilePicture: string | null;
  createdAt: string;
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

// Missions assigned by admin
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

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    this.db = await SQLite.openDatabaseAsync('tenex_workforce.db');
    await this.createTables();
    await this.seedDefaultData();
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;

    // Users table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT DEFAULT 'technician',
        profilePicture TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Friend requests table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS friend_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fromUserId INTEGER NOT NULL,
        toUserId INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (fromUserId) REFERENCES users(id),
        FOREIGN KEY (toUserId) REFERENCES users(id)
      );
    `);

    // Conversations table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user1Id INTEGER NOT NULL,
        user2Id INTEGER NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        lastMessageAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user1Id) REFERENCES users(id),
        FOREIGN KEY (user2Id) REFERENCES users(id)
      );
    `);

    // Messages table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversationId INTEGER NOT NULL,
        senderId INTEGER NOT NULL,
        content TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        read INTEGER DEFAULT 0,
        FOREIGN KEY (conversationId) REFERENCES conversations(id),
        FOREIGN KEY (senderId) REFERENCES users(id)
      );
    `);

    // Missions table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS missions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        location TEXT,
        address TEXT,
        startDate TEXT,
        endDate TEXT,
        duration INTEGER,
        budget REAL,
        urgency TEXT DEFAULT 'medium',
        skills TEXT,
        status TEXT DEFAULT 'proposed',
        assignedToUserId INTEGER,
        createdByUserId INTEGER NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assignedToUserId) REFERENCES users(id),
        FOREIGN KEY (createdByUserId) REFERENCES users(id)
      );
    `);
  }

  private async seedDefaultData(): Promise<void> {
    if (!this.db) return;

    // Check if admin exists
    const existingAdmin = await this.db.getFirstAsync<DBUser>(
      'SELECT * FROM users WHERE username = ?',
      ['admin']
    );

    if (!existingAdmin) {
      // Create default admin
      await this.db.runAsync(
        `INSERT INTO users (username, password, firstName, lastName, email, role) VALUES (?, ?, ?, ?, ?, ?)`,
        ['admin', 'admin123', 'Admin', 'TENEX', 'admin@tenex.fr', 'admin']
      );

      // Create demo technician
      await this.db.runAsync(
        `INSERT INTO users (username, password, firstName, lastName, email, role, profilePicture) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['tech', 'tech123', 'Jean', 'Dupont', 'jean.dupont@email.com', 'technician', 'https://i.pravatar.cc/150?u=jean']
      );
    }
  }

  // ==================== USER METHODS ====================

  async login(username: string, password: string): Promise<DBUser | null> {
    if (!this.db) return null;
    return await this.db.getFirstAsync<DBUser>(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
  }

  async getUserById(id: number): Promise<DBUser | null> {
    if (!this.db) return null;
    return await this.db.getFirstAsync<DBUser>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
  }

  async searchUsersByUsername(query: string, currentUserId: number): Promise<DBUser[]> {
    if (!this.db) return [];
    return await this.db.getAllAsync<DBUser>(
      'SELECT * FROM users WHERE username LIKE ? AND id != ? LIMIT 20',
      [`%${query}%`, currentUserId]
    );
  }

  async createUser(user: Omit<DBUser, 'id' | 'createdAt'>): Promise<number> {
    if (!this.db) return -1;
    const result = await this.db.runAsync(
      `INSERT INTO users (username, password, firstName, lastName, email, role, profilePicture) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user.username, user.password, user.firstName, user.lastName, user.email, user.role, user.profilePicture]
    );
    return result.lastInsertRowId;
  }

  async updateUser(id: number, updates: Partial<DBUser>): Promise<void> {
    if (!this.db) return;
    const fields = Object.keys(updates).filter(k => k !== 'id' && k !== 'createdAt');
    const values = fields.map(f => (updates as any)[f]);
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    await this.db.runAsync(
      `UPDATE users SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
  }

  async getAllUsers(): Promise<DBUser[]> {
    if (!this.db) return [];
    return await this.db.getAllAsync<DBUser>('SELECT * FROM users ORDER BY createdAt DESC');
  }

  async deleteUser(id: number): Promise<void> {
    if (!this.db) return;
    await this.db.runAsync('DELETE FROM users WHERE id = ?', [id]);
  }

  // ==================== FRIEND REQUEST METHODS ====================

  async sendFriendRequest(fromUserId: number, toUserId: number): Promise<number> {
    if (!this.db) return -1;
    
    // Check if request already exists
    const existing = await this.db.getFirstAsync<FriendRequest>(
      'SELECT * FROM friend_requests WHERE (fromUserId = ? AND toUserId = ?) OR (fromUserId = ? AND toUserId = ?)',
      [fromUserId, toUserId, toUserId, fromUserId]
    );
    
    if (existing) {
      throw new Error('Une demande existe déjà');
    }

    // Check if already friends
    const existingConv = await this.db.getFirstAsync<Conversation>(
      'SELECT * FROM conversations WHERE (user1Id = ? AND user2Id = ?) OR (user1Id = ? AND user2Id = ?)',
      [fromUserId, toUserId, toUserId, fromUserId]
    );

    if (existingConv) {
      throw new Error('Vous êtes déjà amis');
    }

    const result = await this.db.runAsync(
      'INSERT INTO friend_requests (fromUserId, toUserId) VALUES (?, ?)',
      [fromUserId, toUserId]
    );
    return result.lastInsertRowId;
  }

  async getPendingFriendRequests(userId: number): Promise<FriendRequest[]> {
    if (!this.db) return [];
    const requests = await this.db.getAllAsync<FriendRequest & { fromUsername: string; fromFirstName: string; fromLastName: string; fromProfilePicture: string }>(
      `SELECT fr.*, u.username as fromUsername, u.firstName as fromFirstName, u.lastName as fromLastName, u.profilePicture as fromProfilePicture
       FROM friend_requests fr
       JOIN users u ON fr.fromUserId = u.id
       WHERE fr.toUserId = ? AND fr.status = 'pending'
       ORDER BY fr.createdAt DESC`,
      [userId]
    );
    
    return requests.map(r => ({
      ...r,
      fromUser: {
        id: r.fromUserId,
        username: r.fromUsername,
        firstName: r.fromFirstName,
        lastName: r.fromLastName,
        profilePicture: r.fromProfilePicture,
      } as DBUser
    }));
  }

  async getSentFriendRequests(userId: number): Promise<FriendRequest[]> {
    if (!this.db) return [];
    return await this.db.getAllAsync<FriendRequest>(
      `SELECT fr.*, u.username as toUsername, u.firstName as toFirstName, u.lastName as toLastName
       FROM friend_requests fr
       JOIN users u ON fr.toUserId = u.id
       WHERE fr.fromUserId = ? AND fr.status = 'pending'`,
      [userId]
    );
  }

  async acceptFriendRequest(requestId: number, userId: number): Promise<number> {
    if (!this.db) return -1;
    
    const request = await this.db.getFirstAsync<FriendRequest>(
      'SELECT * FROM friend_requests WHERE id = ? AND toUserId = ?',
      [requestId, userId]
    );
    
    if (!request) {
      throw new Error('Demande non trouvée');
    }

    // Update request status
    await this.db.runAsync(
      'UPDATE friend_requests SET status = ? WHERE id = ?',
      ['accepted', requestId]
    );

    // Create conversation
    const result = await this.db.runAsync(
      'INSERT INTO conversations (user1Id, user2Id) VALUES (?, ?)',
      [request.fromUserId, request.toUserId]
    );

    return result.lastInsertRowId;
  }

  async rejectFriendRequest(requestId: number, userId: number): Promise<void> {
    if (!this.db) return;
    await this.db.runAsync(
      'UPDATE friend_requests SET status = ? WHERE id = ? AND toUserId = ?',
      ['rejected', requestId, userId]
    );
  }

  // ==================== CONVERSATION & MESSAGE METHODS ====================

  async getConversations(userId: number): Promise<Conversation[]> {
    if (!this.db) return [];
    
    const conversations = await this.db.getAllAsync<Conversation & { otherUserId: number; otherUsername: string; otherFirstName: string; otherLastName: string; otherProfilePicture: string }>(
      `SELECT c.*,
        CASE WHEN c.user1Id = ? THEN c.user2Id ELSE c.user1Id END as otherUserId,
        CASE WHEN c.user1Id = ? THEN u2.username ELSE u1.username END as otherUsername,
        CASE WHEN c.user1Id = ? THEN u2.firstName ELSE u1.firstName END as otherFirstName,
        CASE WHEN c.user1Id = ? THEN u2.lastName ELSE u1.lastName END as otherLastName,
        CASE WHEN c.user1Id = ? THEN u2.profilePicture ELSE u1.profilePicture END as otherProfilePicture
       FROM conversations c
       JOIN users u1 ON c.user1Id = u1.id
       JOIN users u2 ON c.user2Id = u2.id
       WHERE c.user1Id = ? OR c.user2Id = ?
       ORDER BY c.lastMessageAt DESC`,
      [userId, userId, userId, userId, userId, userId, userId]
    );

    // Get last message and unread count for each conversation
    const result: Conversation[] = [];
    for (const conv of conversations) {
      const lastMessage = await this.db.getFirstAsync<DBMessage>(
        'SELECT * FROM messages WHERE conversationId = ? ORDER BY createdAt DESC LIMIT 1',
        [conv.id]
      );
      
      const unreadResult = await this.db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM messages WHERE conversationId = ? AND senderId != ? AND read = 0',
        [conv.id, userId]
      );

      result.push({
        ...conv,
        otherUser: {
          id: conv.otherUserId,
          username: conv.otherUsername,
          firstName: conv.otherFirstName,
          lastName: conv.otherLastName,
          profilePicture: conv.otherProfilePicture,
        } as DBUser,
        lastMessage: lastMessage || undefined,
        unreadCount: unreadResult?.count || 0,
      });
    }

    return result;
  }

  async getMessages(conversationId: number): Promise<DBMessage[]> {
    if (!this.db) return [];
    return await this.db.getAllAsync<DBMessage>(
      'SELECT * FROM messages WHERE conversationId = ? ORDER BY createdAt ASC',
      [conversationId]
    );
  }

  async sendMessage(conversationId: number, senderId: number, content: string): Promise<number> {
    if (!this.db) return -1;
    
    const result = await this.db.runAsync(
      'INSERT INTO messages (conversationId, senderId, content) VALUES (?, ?, ?)',
      [conversationId, senderId, content]
    );

    // Update conversation lastMessageAt
    await this.db.runAsync(
      'UPDATE conversations SET lastMessageAt = CURRENT_TIMESTAMP WHERE id = ?',
      [conversationId]
    );

    return result.lastInsertRowId;
  }

  async markMessagesAsRead(conversationId: number, userId: number): Promise<void> {
    if (!this.db) return;
    await this.db.runAsync(
      'UPDATE messages SET read = 1 WHERE conversationId = ? AND senderId != ?',
      [conversationId, userId]
    );
  }

  // ==================== MISSION METHODS ====================

  async getMissionsForUser(userId: number): Promise<DBMission[]> {
    if (!this.db) return [];
    return await this.db.getAllAsync<DBMission>(
      'SELECT * FROM missions WHERE assignedToUserId = ? ORDER BY createdAt DESC',
      [userId]
    );
  }

  async getAllMissions(): Promise<DBMission[]> {
    if (!this.db) return [];
    return await this.db.getAllAsync<DBMission>(
      'SELECT * FROM missions ORDER BY createdAt DESC'
    );
  }

  async createMission(mission: Omit<DBMission, 'id' | 'createdAt'>): Promise<number> {
    if (!this.db) return -1;
    const result = await this.db.runAsync(
      `INSERT INTO missions (title, description, location, address, startDate, endDate, duration, budget, urgency, skills, status, assignedToUserId, createdByUserId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [mission.title, mission.description, mission.location, mission.address, mission.startDate, mission.endDate, mission.duration, mission.budget, mission.urgency, mission.skills, mission.status, mission.assignedToUserId, mission.createdByUserId]
    );
    return result.lastInsertRowId;
  }

  async updateMissionStatus(missionId: number, status: DBMission['status']): Promise<void> {
    if (!this.db) return;
    await this.db.runAsync(
      'UPDATE missions SET status = ? WHERE id = ?',
      [status, missionId]
    );
  }

  async assignMission(missionId: number, userId: number): Promise<void> {
    if (!this.db) return;
    await this.db.runAsync(
      'UPDATE missions SET assignedToUserId = ?, status = ? WHERE id = ?',
      [userId, 'proposed', missionId]
    );
  }
}

export const db = new DatabaseService();
