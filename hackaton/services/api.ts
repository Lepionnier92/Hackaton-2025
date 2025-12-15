// Configuration de l'API TENEX Workforce
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// Types pour les données
export interface Technician {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePicture?: string;
  skills: string[];
  experience: number;
  certifications: string[];
  availabilityZones: string[];
  availableDays: string[];
  maxDistance: number;
  status: 'available' | 'unavailable' | 'on-mission';
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  location: string;
  address: string;
  startDate: string;
  endDate: string;
  duration: number;
  skills: string[];
  budget: number;
  urgency: 'low' | 'medium' | 'high';
  status: 'proposed' | 'accepted' | 'in-progress' | 'completed' | 'rejected';
  clientName: string;
  clientCompany: string;
  distance?: number;
}

export interface Message {
  id: string;
  missionId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface ActivityStats {
  totalMissions: number;
  completedMissions: number;
  totalRevenue: number;
  monthlyStats: {
    month: string;
    missions: number;
    revenue: number;
  }[];
}

// Service API
class ApiService {
  private async fetch(endpoint: string, options?: RequestInit) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Profil technicien
  async getTechnician(id: string): Promise<Technician> {
    return this.fetch(`/technicians/${id}`);
  }

  async updateTechnician(id: string, data: Partial<Technician>): Promise<Technician> {
    return this.fetch(`/technicians/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Missions
  async getProposedMissions(technicianId: string): Promise<Mission[]> {
    return this.fetch(`/technicians/${technicianId}/missions/proposed`);
  }

  async getAcceptedMissions(technicianId: string): Promise<Mission[]> {
    return this.fetch(`/technicians/${technicianId}/missions/accepted`);
  }

  async acceptMission(missionId: string): Promise<Mission> {
    return this.fetch(`/missions/${missionId}/accept`, {
      method: 'POST',
    });
  }

  async rejectMission(missionId: string, reason?: string): Promise<void> {
    return this.fetch(`/missions/${missionId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Messagerie
  async getMessages(missionId: string): Promise<Message[]> {
    return this.fetch(`/missions/${missionId}/messages`);
  }

  async sendMessage(missionId: string, content: string): Promise<Message> {
    return this.fetch(`/missions/${missionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    return this.fetch(`/messages/${messageId}/read`, {
      method: 'PUT',
    });
  }

  // Statistiques
  async getActivityStats(technicianId: string): Promise<ActivityStats> {
    return this.fetch(`/technicians/${technicianId}/stats`);
  }
}

export default new ApiService();
