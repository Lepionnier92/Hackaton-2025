import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, DBUser } from '@/services/database';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'technician' | 'admin';
  firstName: string;
  lastName: string;
  profilePicture?: string | null;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = '@tenex_auth_v2';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbInitialized, setDbInitialized] = useState(false);

  // Initialiser la base de données au démarrage
  useEffect(() => {
    const initDatabase = async () => {
      try {
        await db.init();
        setDbInitialized(true);
      } catch (error) {
        console.error('Erreur initialisation DB:', error);
      }
    };
    initDatabase();
  }, []);

  // Charger l'utilisateur connecté une fois la DB initialisée
  useEffect(() => {
    if (dbInitialized) {
      loadStoredAuth();
    }
  }, [dbInitialized]);

  const loadStoredAuth = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUserId) {
        const userId = parseInt(storedUserId, 10);
        const dbUser = await db.getUserById(userId);
        if (dbUser) {
          setUser(convertDBUser(dbUser));
        } else {
          await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Erreur chargement auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const convertDBUser = (dbUser: DBUser): User => ({
    id: dbUser.id,
    username: dbUser.username,
    email: dbUser.email,
    role: dbUser.role,
    firstName: dbUser.firstName,
    lastName: dbUser.lastName,
    profilePicture: dbUser.profilePicture,
    createdAt: dbUser.createdAt,
  });

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const dbUser = await db.login(username, password);

      if (!dbUser) {
        return { success: false, error: 'Identifiants incorrects' };
      }

      // Sauvegarder l'ID de l'utilisateur
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, dbUser.id.toString());
      setUser(convertDBUser(dbUser));

      return { success: true };
    } catch (error) {
      console.error('Erreur login:', error);
      return { success: false, error: 'Une erreur est survenue' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.error('Erreur logout:', error);
    }
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;

    try {
      await db.updateUser(user.id, data as Partial<DBUser>);
      const updatedDbUser = await db.getUserById(user.id);
      if (updatedDbUser) {
        setUser(convertDBUser(updatedDbUser));
      }
    } catch (error) {
      console.error('Erreur mise à jour utilisateur:', error);
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const dbUser = await db.getUserById(user.id);
      if (dbUser) {
        setUser(convertDBUser(dbUser));
      }
    } catch (error) {
      console.error('Erreur refresh utilisateur:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}
