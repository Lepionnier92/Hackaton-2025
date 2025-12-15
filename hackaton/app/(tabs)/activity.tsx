import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

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
            <TouchableOpacity>
              <Text style={{ color: theme.accent }} className="font-medium">Voir tout</Text>
            </TouchableOpacity>
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
                  <TouchableOpacity className="flex-row items-center">
                    <Ionicons name="document-outline" size={16} color={theme.accent} />
                    <Text style={{ color: theme.accent }} className="text-sm ml-1">Facture</Text>
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
    </View>
  );
}
