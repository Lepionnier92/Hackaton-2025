import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Modal, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

interface Payment {
  id: number;
  missionTitle: string;
  clientName: string;
  amount: number;
  status: 'paid' | 'pending' | 'late';
  date: string;
  hours: number;
}

export default function RevenusScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'year' | 'all'>('month');

  const stats = {
    hoursInvoiced: 131,
    hoursChange: '+12%',
    invoices: 12,
    invoicesChange: '+3',
  };

  const payments: Payment[] = [
    {
      id: 1,
      missionTitle: 'Maintenance électrique',
      clientName: 'Schneider Electric',
      amount: 2340,
      status: 'paid',
      date: '15 Déc 2024',
      hours: 36,
    },
    {
      id: 2,
      missionTitle: 'Installation CVC',
      clientName: 'Bouygues Énergies',
      amount: 3150,
      status: 'pending',
      date: '10 Déc 2024',
      hours: 45,
    },
    {
      id: 3,
      missionTitle: 'Réparation hydraulique',
      clientName: 'Total Énergies',
      amount: 1860,
      status: 'paid',
      date: '5 Déc 2024',
      hours: 30,
    },
    {
      id: 4,
      missionTitle: 'Audit électrique',
      clientName: 'EDF',
      amount: 1100,
      status: 'late',
      date: '28 Nov 2024',
      hours: 20,
    },
  ];

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getStatusStyle = (status: Payment['status']) => {
    switch (status) {
      case 'paid':
        return {
          bg: `${theme.success}20`,
          color: theme.success,
          label: 'Payé',
          icon: 'checkmark-circle' as const,
        };
      case 'pending':
        return {
          bg: `${theme.warning}20`,
          color: theme.warning,
          label: 'En attente',
          icon: 'time' as const,
        };
      case 'late':
        return {
          bg: `${theme.error}20`,
          color: theme.error,
          label: 'En retard',
          icon: 'close-circle' as const,
        };
    }
  };

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalHours = payments.reduce((sum, p) => sum + p.hours, 0);

  const getPeriodLabel = () => {
    const now = new Date();
    if (selectedPeriod === 'month') {
      return now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    } else if (selectedPeriod === 'year') {
      return `Année ${now.getFullYear()}`;
    }
    return 'Toutes les périodes';
  };

  const generateInvoicePDF = async (payment: Payment) => {
    setGenerating(true);
    try {
      const invoiceNumber = `FAC-${new Date().getFullYear()}-${String(payment.id).padStart(4, '0')}`;
      const statusStyle = getStatusStyle(payment.status);

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Facture ${invoiceNumber}</title>
          <style>
            body { font-family: 'Helvetica', Arial, sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .logo { font-size: 28px; font-weight: bold; color: #006241; }
            .invoice-info { text-align: right; }
            .invoice-number { font-size: 24px; font-weight: bold; color: #333; }
            .invoice-date { color: #666; margin-top: 5px; }
            .status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; margin-top: 10px; }
            .status-paid { background: #d1fae5; color: #065f46; }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-late { background: #fee2e2; color: #991b1b; }
            .parties { display: flex; justify-content: space-between; margin: 30px 0; }
            .party { width: 45%; }
            .party-title { font-weight: bold; color: #006241; margin-bottom: 10px; border-bottom: 2px solid #006241; padding-bottom: 5px; }
            .details-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            .details-table th { background: #006241; color: white; padding: 12px; text-align: left; }
            .details-table td { padding: 12px; border-bottom: 1px solid #ddd; }
            .details-table tr:nth-child(even) { background: #f8f9fa; }
            .total-section { margin-top: 30px; text-align: right; }
            .total-row { display: flex; justify-content: flex-end; margin: 10px 0; }
            .total-label { width: 150px; text-align: right; margin-right: 20px; }
            .total-value { width: 100px; text-align: right; font-weight: bold; }
            .grand-total { font-size: 24px; color: #006241; border-top: 3px solid #006241; padding-top: 15px; }
            .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">TENEX Workforce</div>
              <p style="color: #666; margin-top: 5px;">Services techniques professionnels</p>
            </div>
            <div class="invoice-info">
              <div class="invoice-number">${invoiceNumber}</div>
              <div class="invoice-date">Date: ${payment.date}</div>
              <div class="status status-${payment.status}">${statusStyle.label}</div>
            </div>
          </div>

          <div class="parties">
            <div class="party">
              <div class="party-title">Prestataire</div>
              <p><strong>${user?.firstName} ${user?.lastName}</strong></p>
              <p>${user?.email}</p>
              <p>TENEX Workforce</p>
            </div>
            <div class="party">
              <div class="party-title">Client</div>
              <p><strong>${payment.clientName}</strong></p>
              <p>Service comptabilité</p>
            </div>
          </div>

          <table class="details-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Heures</th>
                <th>Taux horaire</th>
                <th style="text-align: right;">Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${payment.missionTitle}</td>
                <td>${payment.hours}h</td>
                <td>€${(payment.amount / payment.hours).toFixed(2)}/h</td>
                <td style="text-align: right;">€${payment.amount.toLocaleString('fr-FR')}</td>
              </tr>
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row">
              <span class="total-label">Sous-total HT:</span>
              <span class="total-value">€${(payment.amount / 1.2).toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span class="total-label">TVA (20%):</span>
              <span class="total-value">€${(payment.amount - payment.amount / 1.2).toFixed(2)}</span>
            </div>
            <div class="total-row grand-total">
              <span class="total-label">Total TTC:</span>
              <span class="total-value">€${payment.amount.toLocaleString('fr-FR')}</span>
            </div>
          </div>

          <div class="footer">
            <p>TENEX Workforce - Document généré automatiquement</p>
            <p>Ce document fait office de facture officielle</p>
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
      console.error('Erreur génération facture:', error);
    } finally {
      setGenerating(false);
    }
  };

  const generateReportPDF = async () => {
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
            .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #006241; padding-bottom: 20px; }
            .logo { font-size: 28px; font-weight: bold; color: #006241; }
            .title { font-size: 24px; margin-top: 10px; }
            .period { color: #666; font-size: 16px; margin-top: 5px; }
            .info-box { background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 30px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .summary { display: flex; justify-content: space-around; margin: 30px 0; }
            .summary-item { text-align: center; padding: 20px; background: #f0f0f0; border-radius: 10px; min-width: 150px; }
            .summary-value { font-size: 28px; font-weight: bold; color: #006241; }
            .summary-label { color: #666; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #006241; color: white; padding: 12px; text-align: left; }
            td { padding: 12px; border-bottom: 1px solid #ddd; }
            tr:nth-child(even) { background: #f8f9fa; }
            .total-row { font-weight: bold; background: #e8f5e9 !important; }
            .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
            .amount { text-align: right; color: #22c55e; font-weight: bold; }
            .status-paid { color: #22c55e; }
            .status-pending { color: #f59e0b; }
            .status-late { color: #ef4444; }
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
              <div class="summary-value">${payments.length}</div>
              <div class="summary-label">Factures</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">€${totalRevenue.toLocaleString('fr-FR')}</div>
              <div class="summary-label">Revenus totaux</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${totalHours}h</div>
              <div class="summary-label">Heures facturées</div>
            </div>
          </div>

          <h3>Détail des paiements</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Mission</th>
                <th>Client</th>
                <th>Heures</th>
                <th>Statut</th>
                <th style="text-align: right;">Montant</th>
              </tr>
            </thead>
            <tbody>
              ${payments.map(p => {
                const status = getStatusStyle(p.status);
                return `
                <tr>
                  <td>${p.date}</td>
                  <td>${p.missionTitle}</td>
                  <td>${p.clientName}</td>
                  <td>${p.hours}h</td>
                  <td class="status-${p.status}">${status.label}</td>
                  <td class="amount">€${p.amount.toLocaleString('fr-FR')}</td>
                </tr>
              `}).join('')}
              <tr class="total-row">
                <td colspan="3"><strong>TOTAL</strong></td>
                <td><strong>${totalHours}h</strong></td>
                <td></td>
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
      console.error('Erreur génération rapport:', error);
    } finally {
      setGenerating(false);
    }
  };

  const generateReportCSV = async () => {
    setGenerating(true);
    try {
      const headers = ['Date', 'Mission', 'Client', 'Heures', 'Statut', 'Montant (€)'];
      const rows = payments.map(p => {
        const status = getStatusStyle(p.status);
        return [
          p.date,
          `"${p.missionTitle}"`,
          `"${p.clientName}"`,
          p.hours.toString(),
          status.label,
          p.amount.toString()
        ];
      });
      rows.push(['', '', '', totalHours.toString(), 'TOTAL', totalRevenue.toString()]);
      
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
        {/* Stats Cards */}
        <View className="pt-14 px-4">
          <View className="flex-row">
            {/* Heures facturées */}
            <View className="flex-1 rounded-2xl p-4 mr-2" style={{ backgroundColor: theme.card }}>
              <View className="flex-row items-center mb-2">
                <View className="rounded-full p-2 mr-2" style={{ backgroundColor: `${theme.accent}20` }}>
                  <Ionicons name="time-outline" size={18} color={theme.accent} />
                </View>
                <Text style={{ color: theme.textMuted }} className="text-sm">Heures facturées</Text>
              </View>
              <Text style={{ color: theme.text }} className="text-3xl font-bold">{stats.hoursInvoiced}h</Text>
              <Text style={{ color: theme.success }} className="text-sm mt-1">↗ {stats.hoursChange}</Text>
            </View>

            {/* Factures */}
            <View className="flex-1 rounded-2xl p-4 ml-2" style={{ backgroundColor: theme.card }}>
              <View className="flex-row items-center mb-2">
                <View className="rounded-full p-2 mr-2" style={{ backgroundColor: '#3b82f620' }}>
                  <Ionicons name="document-text-outline" size={18} color="#3b82f6" />
                </View>
                <Text style={{ color: theme.textMuted }} className="text-sm">Factures</Text>
              </View>
              <Text style={{ color: theme.text }} className="text-3xl font-bold">{stats.invoices}</Text>
              <Text style={{ color: theme.success }} className="text-sm mt-1">↗ {stats.invoicesChange}</Text>
            </View>
          </View>
        </View>

        {/* Paiements récents */}
        <View className="px-4 mt-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text style={{ color: theme.text }} className="text-xl font-bold">Paiements récents</Text>
          </View>

          {payments.map((payment) => {
            const statusStyle = getStatusStyle(payment.status);
            return (
              <View
                key={payment.id}
                className="rounded-2xl p-4 mb-3"
                style={{ backgroundColor: theme.card }}
              >
                {/* Header */}
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <Text style={{ color: theme.text }} className="font-semibold text-base">
                      {payment.missionTitle}
                    </Text>
                    <Text style={{ color: theme.textMuted }} className="text-sm mt-0.5">
                      {payment.clientName}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text style={{ color: theme.text }} className="font-bold text-lg">
                      €{payment.amount.toLocaleString()}
                    </Text>
                    <View 
                      className="flex-row items-center rounded-full px-2 py-1 mt-1"
                      style={{ backgroundColor: statusStyle.bg }}
                    >
                      <Ionicons name={statusStyle.icon} size={14} color={statusStyle.color} />
                      <Text style={{ color: statusStyle.color }} className="text-xs font-medium ml-1">
                        {statusStyle.label}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Divider */}
                <View className="h-px my-3" style={{ backgroundColor: theme.divider }} />

                {/* Footer */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons name="calendar-outline" size={16} color={theme.textMuted} />
                    <Text style={{ color: theme.textMuted }} className="text-sm ml-1">{payment.date}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={16} color={theme.textMuted} />
                    <Text style={{ color: theme.textMuted }} className="text-sm ml-1">{payment.hours}h</Text>
                  </View>
                  <TouchableOpacity 
                    className="flex-row items-center rounded-lg px-3 py-2"
                    style={{ backgroundColor: `${theme.accent}15` }}
                    onPress={() => generateInvoicePDF(payment)}
                    disabled={generating}
                  >
                    {generating ? (
                      <ActivityIndicator size="small" color={theme.accent} />
                    ) : (
                      <>
                        <Ionicons name="download-outline" size={16} color={theme.accent} />
                        <Text style={{ color: theme.accent }} className="text-sm font-medium ml-1">Facture</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Actions rapides */}
        <View className="px-4 mt-4 mb-8">
          <Text style={{ color: theme.text }} className="text-xl font-bold mb-4">Actions rapides</Text>
          
          <TouchableOpacity 
            className="rounded-2xl p-4 flex-row items-center"
            style={{ backgroundColor: theme.card }}
            onPress={() => setShowReportModal(true)}
          >
            <View className="rounded-full p-3 mr-4" style={{ backgroundColor: `${theme.accent}20` }}>
              <Ionicons name="download-outline" size={24} color={theme.accent} />
            </View>
            <View className="flex-1">
              <Text style={{ color: theme.text }} className="font-semibold">Générer un rapport</Text>
              <Text style={{ color: theme.textMuted }} className="text-sm">Export PDF ou Excel</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        <View className="h-24" />
      </ScrollView>

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
                      <Text style={{ color: theme.textMuted }} className="text-sm">Factures</Text>
                      <Text style={{ color: theme.text }} className="text-xl font-bold">{payments.length}</Text>
                    </View>
                    <View className="flex-1">
                      <Text style={{ color: theme.textMuted }} className="text-sm">Heures</Text>
                      <Text style={{ color: theme.text }} className="text-xl font-bold">{totalHours}h</Text>
                    </View>
                  </View>
                </View>

                {/* Boutons d'export */}
                <Text style={{ color: theme.textMuted }} className="mb-3 font-medium">Exporter</Text>
                
                <TouchableOpacity
                  onPress={generateReportPDF}
                  disabled={generating}
                  className="rounded-2xl p-4 mb-3 flex-row items-center"
                  style={{ backgroundColor: theme.card, opacity: generating ? 0.6 : 1 }}
                >
                  <View className="w-12 h-12 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: '#ef444420' }}>
                    <Ionicons name="document-text" size={24} color="#ef4444" />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: theme.text }} className="font-semibold">Export PDF</Text>
                    <Text style={{ color: theme.textMuted }} className="text-sm">Rapport formaté</Text>
                  </View>
                  {generating ? (
                    <ActivityIndicator size="small" color={theme.accent} />
                  ) : (
                    <Ionicons name="download-outline" size={24} color={theme.textMuted} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={generateReportCSV}
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
