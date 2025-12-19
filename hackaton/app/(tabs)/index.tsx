import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Image, Modal, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { db, DBMission } from '@/services/database';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [missions, setMissions] = useState<DBMission[]>([]);
  const [stats, setStats] = useState({
    activeMissions: 0,
    completedThisMonth: 0,
    earnings: 0,
    rating: 4.9,
  });

  // Modals
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'year' | 'all'>('month');

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const allMissions = await db.getMissionsForUser(user.id);
      setMissions(allMissions);
      
      const activeMissions = allMissions.filter(m => m.status === 'accepted' || m.status === 'in_progress').length;
      const completedMissions = allMissions.filter(m => m.status === 'completed');
      const currentMonth = new Date().getMonth();
      const completedThisMonth = completedMissions.filter(m => 
        new Date(m.endDate).getMonth() === currentMonth
      ).length;
      const earnings = completedMissions.reduce((sum, m) => sum + m.budget, 0);
      
      setStats({
        activeMissions,
        completedThisMonth,
        earnings,
        rating: 4.9,
      });
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const currentMission = missions.find(m => m.status === 'in_progress' || m.status === 'accepted');
  const proposals = missions.filter(m => m.status === 'proposed').slice(0, 2);
  
  // Missions terminées ce mois
  const currentMonthIndex = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const completedThisMonth = missions.filter(m => {
    if (m.status !== 'completed') return false;
    const endDate = new Date(m.endDate);
    return endDate.getMonth() === currentMonthIndex && endDate.getFullYear() === currentYear;
  });
  const monthlyEarnings = completedThisMonth.reduce((sum, m) => sum + m.budget, 0);

  // Missions pour le rapport
  const getFilteredMissions = () => {
    const now = new Date();
    const completed = missions.filter(m => m.status === 'completed');
    return completed.filter(m => {
      const endDate = new Date(m.endDate);
      if (selectedPeriod === 'month') {
        return endDate.getMonth() === now.getMonth() && endDate.getFullYear() === now.getFullYear();
      } else if (selectedPeriod === 'year') {
        return endDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const filteredMissions = getFilteredMissions();
  const totalRevenue = filteredMissions.reduce((sum, m) => sum + m.budget, 0);
  const avgPerMission = filteredMissions.length > 0 ? totalRevenue / filteredMissions.length : 0;

  const getPeriodLabel = () => {
    const now = new Date();
    if (selectedPeriod === 'month') {
      return now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    } else if (selectedPeriod === 'year') {
      return `Année ${now.getFullYear()}`;
    }
    return 'Toutes les périodes';
  };

  const handleAccept = async (missionId: number) => {
    try {
      await db.updateMissionStatus(missionId, 'accepted');
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleReject = async (missionId: number) => {
    try {
      await db.updateMissionStatus(missionId, 'rejected');
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const generatePDF = async () => {
    if (filteredMissions.length === 0) {
      if (Platform.OS === 'web') {
        window.alert('Aucune mission à exporter pour cette période');
      }
      return;
    }

    setGenerating(true);
    try {
      const now = new Date();
      const periodLabel = getPeriodLabel();

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Rapport de revenus - ${user?.firstName} ${user?.lastName}</title>
          <style>
            body { font-family: 'Helvetica', Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #B8C901; padding-bottom: 20px; }
            .logo { font-size: 28px; font-weight: bold; color: #B8C901; }
            .title { font-size: 24px; margin-top: 10px; }
            .period { color: #666; font-size: 16px; margin-top: 5px; }
            .info-box { background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 30px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .summary { display: flex; justify-content: space-around; margin: 30px 0; }
            .summary-item { text-align: center; padding: 20px; background: #f0f0f0; border-radius: 10px; min-width: 150px; }
            .summary-value { font-size: 28px; font-weight: bold; color: #B8C901; }
            .summary-label { color: #666; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #B8C901; color: white; padding: 12px; text-align: left; }
            td { padding: 12px; border-bottom: 1px solid #ddd; }
            tr:nth-child(even) { background: #f8f9fa; }
            .total-row { font-weight: bold; background: #e8f5e9 !important; }
            .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
            .amount { text-align: right; color: #22c55e; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">TENEX Workforce</div>
            <div class="title">Rapport de Revenus</div>
            <div class="period">${periodLabel}</div>
          </div>

          <div class="info-box">
            <div class="info-row">
              <span><strong>Technicien:</strong></span>
              <span>${user?.firstName} ${user?.lastName}</span>
            </div>
            <div class="info-row">
              <span><strong>Email:</strong></span>
              <span>${user?.email}</span>
            </div>
            <div class="info-row">
              <span><strong>Date du rapport:</strong></span>
              <span>${now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          <div class="summary">
            <div class="summary-item">
              <div class="summary-value">${filteredMissions.length}</div>
              <div class="summary-label">Missions terminées</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">€${totalRevenue.toLocaleString('fr-FR')}</div>
              <div class="summary-label">Revenus totaux</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">€${avgPerMission.toFixed(0)}</div>
              <div class="summary-label">Moyenne par mission</div>
            </div>
          </div>

          <h3>Détail des missions</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Mission</th>
                <th>Lieu</th>
                <th>Durée</th>
                <th style="text-align: right;">Montant</th>
              </tr>
            </thead>
            <tbody>
              ${filteredMissions.map(m => `
                <tr>
                  <td>${new Date(m.endDate).toLocaleDateString('fr-FR')}</td>
                  <td>${m.title}</td>
                  <td>${m.location}</td>
                  <td>${m.duration} jour(s)</td>
                  <td class="amount">€${m.budget.toLocaleString('fr-FR')}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="4"><strong>TOTAL</strong></td>
                <td class="amount">€${totalRevenue.toLocaleString('fr-FR')}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <p>Document généré automatiquement par TENEX Workforce</p>
            <p>Ce document est à conserver pour vos déclarations</p>
          </div>
        </body>
        </html>
      `;

      if (Platform.OS === 'web') {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          printWindow.print();
        }
      } else {
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      }
    } catch (error) {
      console.error('Erreur génération PDF:', error);
    } finally {
      setGenerating(false);
    }
  };

  const generateCSV = async () => {
    if (filteredMissions.length === 0) {
      if (Platform.OS === 'web') {
        window.alert('Aucune mission à exporter pour cette période');
      }
      return;
    }

    setGenerating(true);
    try {
      const headers = ['Date', 'Mission', 'Description', 'Lieu', 'Durée (jours)', 'Montant (€)'];
      const rows = filteredMissions.map(m => [
        new Date(m.endDate).toLocaleDateString('fr-FR'),
        `"${m.title}"`,
        `"${m.description || ''}"`,
        `"${m.location}"`,
        m.duration.toString(),
        m.budget.toString()
      ]);
      rows.push(['', '', '', '', 'TOTAL', totalRevenue.toString()]);
      
      const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');

      if (Platform.OS === 'web') {
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `revenus_${user?.lastName}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
      } else {
        const fileUri = FileSystem.documentDirectory + `revenus_${user?.lastName}_${new Date().toISOString().split('T')[0]}.csv`;
        await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });
        await Sharing.shareAsync(fileUri, { mimeType: 'text/csv' });
      }
    } catch (error) {
      console.error('Erreur génération CSV:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.text}
          />
        }
      >
        {/* Header */}
        <View className="pt-14 px-4 pb-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text style={{ color: theme.textMuted }} className="text-base">{getGreeting()},</Text>
              <Text style={{ color: theme.text }} className="text-2xl font-bold">
                {user?.firstName || 'Technicien'}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/profile' as any)}
              className="rounded-full p-1"
              style={{ backgroundColor: theme.card }}
            >
              <Image
                source={{ uri: 'https://i.pravatar.cc/100' }}
                className="w-12 h-12 rounded-full"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Grid */}
        <View className="px-4 flex-row flex-wrap">
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/missions-list' as any)}
            className="w-1/2 pr-2 mb-3"
          >
            <View className="rounded-2xl p-4" style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.cardBorder, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 }}>
              <View className="rounded-full w-10 h-10 items-center justify-center mb-2" style={{ backgroundColor: `${theme.accent}20` }}>
                <Ionicons name="briefcase-outline" size={20} color={theme.accent} />
              </View>
              <Text style={{ color: theme.text }} className="text-2xl font-bold">{stats.activeMissions}</Text>
              <Text style={{ color: theme.textMuted }} className="text-sm">Missions actives</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setShowMonthlyModal(true)}
            className="w-1/2 pl-2 mb-3"
          >
            <View className="rounded-2xl p-4" style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.cardBorder, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 }}>
              <View className="rounded-full w-10 h-10 items-center justify-center mb-2" style={{ backgroundColor: `${theme.success}20` }}>
                <Ionicons name="checkmark-circle-outline" size={20} color={theme.success} />
              </View>
              <Text style={{ color: theme.text }} className="text-2xl font-bold">{stats.completedThisMonth}</Text>
              <Text style={{ color: theme.textMuted }} className="text-sm">Ce mois</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setShowReportModal(true)}
            className="w-1/2 pr-2"
          >
            <View className="rounded-2xl p-4" style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.cardBorder, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 }}>
              <View className="rounded-full w-10 h-10 items-center justify-center mb-2" style={{ backgroundColor: '#3b82f620' }}>
                <Ionicons name="wallet-outline" size={20} color="#3b82f6" />
              </View>
              <Text style={{ color: theme.text }} className="text-2xl font-bold">€{stats.earnings.toLocaleString()}</Text>
              <Text style={{ color: theme.textMuted }} className="text-sm">Revenus</Text>
            </View>
          </TouchableOpacity>
          <View className="w-1/2 pl-2">
            <View className="rounded-2xl p-4" style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.cardBorder, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 }}>
              <View className="rounded-full w-10 h-10 items-center justify-center mb-2" style={{ backgroundColor: '#eab30820' }}>
                <Ionicons name="star-outline" size={20} color="#eab308" />
              </View>
              <Text style={{ color: theme.text }} className="text-2xl font-bold">{stats.rating}</Text>
              <Text style={{ color: theme.textMuted }} className="text-sm">Note moyenne</Text>
            </View>
          </View>
        </View>

        {/* Mission en cours */}
        {currentMission && (
          <View className="px-4 mt-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text style={{ color: theme.text }} className="text-xl font-bold">Mission en cours</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/missions-list' as any)}>
                <Text style={{ color: theme.accent }} className="font-medium">Voir tout</Text>
              </TouchableOpacity>
            </View>
            <View className="rounded-2xl p-4" style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: `${theme.accent}50` }}>
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1">
                  <Text style={{ color: theme.text }} className="font-semibold text-lg">{currentMission.title}</Text>
                  <Text style={{ color: theme.textMuted }} className="text-sm">{currentMission.location}</Text>
                </View>
                <View className="rounded-full px-3 py-1" style={{ backgroundColor: currentMission.status === 'in_progress' ? '#3b82f620' : `${theme.success}20` }}>
                  <Text style={{ color: currentMission.status === 'in_progress' ? '#3b82f6' : theme.success }} className="text-sm font-medium">
                    {currentMission.status === 'in_progress' ? 'En cours' : 'Acceptée'}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-center mt-2">
                <View className="flex-row items-center mr-4">
                  <Ionicons name="calendar-outline" size={16} color={theme.textMuted} />
                  <Text style={{ color: theme.textMuted }} className="text-sm ml-1">
                    {new Date(currentMission.startDate).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="cash-outline" size={16} color={theme.success} />
                  <Text style={{ color: theme.success }} className="text-sm ml-1 font-medium">{currentMission.budget}€</Text>
                </View>
              </View>

              <TouchableOpacity 
                onPress={() => router.push('/(tabs)/missions-list' as any)}
                className="rounded-xl py-3 mt-4 items-center"
                style={{ backgroundColor: theme.accent }}
              >
                <Text className="text-white font-semibold">Voir les détails</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Nouvelles propositions */}
        <View className="px-4 mt-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text style={{ color: theme.text }} className="text-xl font-bold">Nouvelles propositions</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/missions-list' as any)}>
              <Text style={{ color: theme.accent }} className="font-medium">Voir tout</Text>
            </TouchableOpacity>
          </View>

          {proposals.length === 0 ? (
            <View className="rounded-2xl p-6 items-center" style={{ backgroundColor: theme.card }}>
              <Ionicons name="document-text-outline" size={48} color={theme.textMuted} />
              <Text style={{ color: theme.textMuted }} className="mt-3">Aucune nouvelle proposition</Text>
            </View>
          ) : (
            proposals.map((proposal) => (
              <TouchableOpacity
                key={proposal.id}
                className="rounded-2xl p-4 mb-3"
                style={{ 
                  backgroundColor: theme.card,
                  borderWidth: 1, 
                  borderColor: proposal.urgency === 'high' ? theme.error : theme.cardBorder 
                }}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      {proposal.urgency === 'high' && (
                        <View className="rounded-full px-2 py-0.5 mr-2" style={{ backgroundColor: `${theme.error}20` }}>
                          <Text style={{ color: theme.error }} className="text-xs font-medium">Urgent</Text>
                        </View>
                      )}
                    </View>
                    <Text style={{ color: theme.text }} className="font-semibold text-base mt-2">{proposal.title}</Text>
                    <Text style={{ color: theme.textMuted }} className="text-sm">{proposal.location}</Text>
                  </View>
                  <Text style={{ color: theme.text }} className="font-bold text-lg">€{proposal.budget.toLocaleString()}</Text>
                </View>

                <View className="flex-row items-center mt-3">
                  <View className="flex-row items-center mr-4">
                    <Ionicons name="location-outline" size={16} color={theme.textMuted} />
                    <Text style={{ color: theme.textMuted }} className="text-sm ml-1">{proposal.location}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={16} color={theme.textMuted} />
                    <Text style={{ color: theme.textMuted }} className="text-sm ml-1">{proposal.duration} jour(s)</Text>
                  </View>
                </View>

                <View className="flex-row mt-4">
                  <TouchableOpacity 
                    onPress={() => handleAccept(proposal.id)}
                    className="flex-1 rounded-xl py-3 mr-2 items-center"
                    style={{ backgroundColor: theme.accent }}
                  >
                    <Text className="text-white font-semibold">Accepter</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleReject(proposal.id)}
                    className="flex-1 rounded-xl py-3 ml-2 items-center"
                    style={{ backgroundColor: theme.inputBackground }}
                  >
                    <Text style={{ color: theme.textMuted }} className="font-semibold">Refuser</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View className="px-4 mt-6">
          <Text style={{ color: theme.text }} className="text-xl font-bold mb-4">Accès rapide</Text>
          <View className="flex-row">
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/agenda' as any)}
              className="flex-1 rounded-2xl p-4 mr-2 items-center"
              style={{ backgroundColor: theme.card }}
            >
              <View className="rounded-full w-12 h-12 items-center justify-center mb-2" style={{ backgroundColor: `${theme.accent}20` }}>
                <Ionicons name="calendar-outline" size={24} color={theme.accent} />
              </View>
              <Text style={{ color: theme.text }} className="font-medium">Agenda</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/messages' as any)}
              className="flex-1 rounded-2xl p-4 mx-2 items-center"
              style={{ backgroundColor: theme.card }}
            >
              <View className="rounded-full w-12 h-12 items-center justify-center mb-2" style={{ backgroundColor: '#3b82f620' }}>
                <Ionicons name="chatbubble-outline" size={24} color="#3b82f6" />
              </View>
              <Text style={{ color: theme.text }} className="font-medium">Messages</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setShowReportModal(true)}
              className="flex-1 rounded-2xl p-4 ml-2 items-center"
              style={{ backgroundColor: theme.card }}
            >
              <View className="rounded-full w-12 h-12 items-center justify-center mb-2" style={{ backgroundColor: '#ef444420' }}>
                <Ionicons name="document-text-outline" size={24} color="#ef4444" />
              </View>
              <Text style={{ color: theme.text }} className="font-medium">Rapport</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Modal Missions terminées ce mois */}
      <Modal
        visible={showMonthlyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMonthlyModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="rounded-t-3xl max-h-[85%]" style={{ backgroundColor: theme.background }}>
            <View className="p-6">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-6">
                <View>
                  <Text style={{ color: theme.text }} className="text-xl font-bold">Missions terminées</Text>
                  <Text style={{ color: theme.textMuted }} className="text-sm capitalize">
                    {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowMonthlyModal(false)}>
                  <Ionicons name="close" size={24} color={theme.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Stats */}
              <View className="flex-row mb-6">
                <View className="flex-1 mr-2 rounded-2xl p-4" style={{ backgroundColor: theme.card }}>
                  <Text style={{ color: theme.success }} className="text-3xl font-bold">{completedThisMonth.length}</Text>
                  <Text style={{ color: theme.textMuted }} className="text-sm">Missions</Text>
                </View>
                <View className="flex-1 ml-2 rounded-2xl p-4" style={{ backgroundColor: theme.card }}>
                  <Text style={{ color: theme.text }} className="text-3xl font-bold">€{monthlyEarnings.toLocaleString()}</Text>
                  <Text style={{ color: theme.textMuted }} className="text-sm">Revenus</Text>
                </View>
              </View>

              {/* Liste */}
              <ScrollView className="max-h-80">
                {completedThisMonth.length === 0 ? (
                  <View className="items-center py-8">
                    <Ionicons name="document-text-outline" size={48} color={theme.textMuted} />
                    <Text style={{ color: theme.textMuted }} className="mt-3 text-center">
                      Aucune mission terminée ce mois-ci
                    </Text>
                  </View>
                ) : (
                  completedThisMonth.map((mission) => (
                    <View
                      key={mission.id}
                      className="rounded-xl p-4 mb-2"
                      style={{ backgroundColor: theme.card }}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1 mr-3">
                          <Text style={{ color: theme.text }} className="font-semibold">{mission.title}</Text>
                          <Text style={{ color: theme.textMuted }} className="text-sm">
                            {new Date(mission.endDate).toLocaleDateString('fr-FR')} • {mission.location}
                          </Text>
                        </View>
                        <Text style={{ color: theme.success }} className="font-bold">+€{mission.budget}</Text>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Rapport de revenus */}
      <Modal
        visible={showReportModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReportModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="rounded-t-3xl max-h-[90%]" style={{ backgroundColor: theme.background }}>
            <View className="p-6">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-6">
                <View>
                  <Text style={{ color: theme.text }} className="text-xl font-bold">Rapport de revenus</Text>
                  <Text style={{ color: theme.textMuted }} className="text-sm">Générer vos fiches de paie</Text>
                </View>
                <TouchableOpacity onPress={() => setShowReportModal(false)}>
                  <Ionicons name="close" size={24} color={theme.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Sélecteur de période */}
                <Text style={{ color: theme.textMuted }} className="mb-3 font-medium">Période</Text>
                <View className="flex-row mb-4">
                  <TouchableOpacity
                    onPress={() => setSelectedPeriod('month')}
                    className="flex-1 rounded-xl py-3 mr-2 items-center"
                    style={{ backgroundColor: selectedPeriod === 'month' ? theme.accent : theme.card }}
                  >
                    <Text style={{ color: selectedPeriod === 'month' ? 'white' : theme.text }} className="font-medium">Ce mois</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setSelectedPeriod('year')}
                    className="flex-1 rounded-xl py-3 mx-1 items-center"
                    style={{ backgroundColor: selectedPeriod === 'year' ? theme.accent : theme.card }}
                  >
                    <Text style={{ color: selectedPeriod === 'year' ? 'white' : theme.text }} className="font-medium">Cette année</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setSelectedPeriod('all')}
                    className="flex-1 rounded-xl py-3 ml-2 items-center"
                    style={{ backgroundColor: selectedPeriod === 'all' ? theme.accent : theme.card }}
                  >
                    <Text style={{ color: selectedPeriod === 'all' ? 'white' : theme.text }} className="font-medium">Tout</Text>
                  </TouchableOpacity>
                </View>

                {/* Statistiques */}
                <View className="rounded-2xl p-5 mb-4" style={{ backgroundColor: theme.card }}>
                  <Text style={{ color: theme.textMuted }} className="text-sm mb-1 capitalize">{getPeriodLabel()}</Text>
                  <Text style={{ color: theme.text }} className="text-4xl font-bold">€{totalRevenue.toLocaleString('fr-FR')}</Text>
                  <View className="flex-row mt-4">
                    <View className="flex-1">
                      <Text style={{ color: theme.textMuted }} className="text-sm">Missions</Text>
                      <Text style={{ color: theme.text }} className="text-xl font-bold">{filteredMissions.length}</Text>
                    </View>
                    <View className="flex-1">
                      <Text style={{ color: theme.textMuted }} className="text-sm">Moyenne</Text>
                      <Text style={{ color: theme.text }} className="text-xl font-bold">€{avgPerMission.toFixed(0)}</Text>
                    </View>
                  </View>
                </View>

                {/* Boutons d'export */}
                <Text style={{ color: theme.textMuted }} className="mb-3 font-medium">Exporter</Text>
                
                <TouchableOpacity
                  onPress={generatePDF}
                  disabled={generating}
                  className="rounded-2xl p-4 mb-3 flex-row items-center"
                  style={{ backgroundColor: theme.card, opacity: generating ? 0.6 : 1 }}
                >
                  <View className="w-12 h-12 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: '#ef444420' }}>
                    <Ionicons name="document-text" size={24} color="#ef4444" />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: theme.text }} className="font-semibold">Export PDF</Text>
                    <Text style={{ color: theme.textMuted }} className="text-sm">Fiche de paie formatée</Text>
                  </View>
                  {generating ? (
                    <ActivityIndicator size="small" color={theme.accent} />
                  ) : (
                    <Ionicons name="download-outline" size={24} color={theme.textMuted} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={generateCSV}
                  disabled={generating}
                  className="rounded-2xl p-4 flex-row items-center"
                  style={{ backgroundColor: theme.card, opacity: generating ? 0.6 : 1 }}
                >
                  <View className="w-12 h-12 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: '#22c55e20' }}>
                    <Ionicons name="grid" size={24} color="#22c55e" />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: theme.text }} className="font-semibold">Export Excel (CSV)</Text>
                    <Text style={{ color: theme.textMuted }} className="text-sm">Données pour tableur</Text>
                  </View>
                  {generating ? (
                    <ActivityIndicator size="small" color={theme.accent} />
                  ) : (
                    <Ionicons name="download-outline" size={24} color={theme.textMuted} />
                  )}
                </TouchableOpacity>

                <View className="h-6" />
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
