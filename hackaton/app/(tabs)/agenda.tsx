import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { db, DBMission } from '@/services/database';

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  missions: DBMission[];
}

export default function AgendaScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [missions, setMissions] = useState<DBMission[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  const loadMissions = useCallback(async () => {
    if (!user) return;
    try {
      const allMissions = await db.getMissionsForUser(user.id);
      const scheduledMissions = allMissions.filter(
        (m: DBMission) => m.status === 'accepted' || m.status === 'in_progress'
      );
      setMissions(scheduledMissions);
    } catch (error) {
      console.error('Erreur chargement missions:', error);
    }
  }, [user]);

  useEffect(() => {
    loadMissions();
  }, [loadMissions]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate, missions]);

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    let startDay = firstDayOfMonth.getDay() - 1;
    if (startDay < 0) startDay = 6;
    
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: false,
        missions: getMissionsForDate(date),
      });
    }
    
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);
      
      days.push({
        date,
        day,
        isCurrentMonth: true,
        isToday: dateOnly.getTime() === today.getTime(),
        missions: getMissionsForDate(date),
      });
    }
    
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        day,
        isCurrentMonth: false,
        isToday: false,
        missions: getMissionsForDate(date),
      });
    }
    
    setCalendarDays(days);
  };

  const getMissionsForDate = (date: Date): DBMission[] => {
    const dateStr = date.toISOString().split('T')[0];
    return missions.filter(m => {
      const missionStart = new Date(m.startDate).toISOString().split('T')[0];
      const missionEnd = new Date(m.endDate).toISOString().split('T')[0];
      return dateStr >= missionStart && dateStr <= missionEnd;
    });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMissions();
    setRefreshing(false);
  }, [loadMissions]);

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const selectedDateMissions = selectedDate ? getMissionsForDate(selectedDate) : [];

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return theme.error;
      case 'medium': return theme.warning;
      case 'low': return theme.success;
      default: return theme.textMuted;
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.text} />
        }
      >
        {/* Header */}
        <View className="pt-14 px-4 pb-4">
          <View className="flex-row items-center justify-between">
            <Text style={{ color: theme.text }} className="text-2xl font-bold">Agenda</Text>
            <TouchableOpacity 
              onPress={goToToday}
              className="rounded-full px-4 py-2"
              style={{ backgroundColor: `${theme.accent}20` }}
            >
              <Text style={{ color: theme.accent }} className="font-medium">Aujourd'hui</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Month Navigation */}
        <View className="px-4 mb-4">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={goToPrevMonth} className="p-2">
              <Ionicons name="chevron-back" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={{ color: theme.text }} className="text-xl font-bold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
            <TouchableOpacity onPress={goToNextMonth} className="p-2">
              <Ionicons name="chevron-forward" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar Grid */}
        <View className="px-4 mb-4">
          <View className="rounded-2xl p-3" style={{ backgroundColor: theme.card }}>
            {/* Day headers */}
            <View className="flex-row mb-2">
              {dayNames.map((day, index) => (
                <View key={index} className="flex-1 items-center py-2">
                  <Text style={{ color: theme.textMuted }} className="text-xs font-medium">{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar days */}
            <View className="flex-row flex-wrap">
              {calendarDays.map((day, index) => {
                const isSelected = selectedDate?.toDateString() === day.date.toDateString();
                const hasMissions = day.missions.length > 0;
                
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedDate(day.date)}
                    className="w-[14.28%] aspect-square items-center justify-center"
                  >
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: isSelected ? theme.accent : day.isToday ? `${theme.accent}30` : 'transparent'
                      }}
                    >
                      <Text
                        style={{
                          color: isSelected ? '#fff' : !day.isCurrentMonth ? theme.divider : day.isToday ? theme.accent : theme.text
                        }}
                        className="text-sm font-medium"
                      >
                        {day.day}
                      </Text>
                    </View>
                    {hasMissions && (
                      <View className="flex-row mt-1">
                        {day.missions.slice(0, 3).map((m, i) => (
                          <View
                            key={i}
                            className="w-1.5 h-1.5 rounded-full mx-0.5"
                            style={{ backgroundColor: getUrgencyColor(m.urgency) }}
                          />
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Selected Day Missions */}
        <View className="px-4">
          <Text style={{ color: theme.text }} className="text-lg font-bold mb-3">
            {selectedDate 
              ? `Missions du ${selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}`
              : 'Sélectionnez une date'
            }
          </Text>

          {selectedDate && selectedDateMissions.length === 0 && (
            <View className="rounded-2xl p-6 items-center" style={{ backgroundColor: theme.card }}>
              <Ionicons name="calendar-outline" size={48} color={theme.textMuted} />
              <Text style={{ color: theme.textMuted }} className="mt-3">Aucune mission ce jour</Text>
            </View>
          )}

          {selectedDateMissions.map((mission) => (
            <View
              key={mission.id}
              className="rounded-2xl p-4 mb-3"
              style={{ backgroundColor: theme.card, borderLeftWidth: 4, borderLeftColor: getUrgencyColor(mission.urgency) }}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text style={{ color: theme.text }} className="font-semibold text-base">{mission.title}</Text>
                  <Text style={{ color: theme.textMuted }} className="text-sm mt-1">{mission.location}</Text>
                </View>
                <View 
                  className="px-2 py-1 rounded-full"
                  style={{ backgroundColor: mission.status === 'in_progress' ? '#3b82f620' : `${theme.success}20` }}
                >
                  <Text 
                    style={{ color: mission.status === 'in_progress' ? '#3b82f6' : theme.success }}
                    className="text-xs font-medium"
                  >
                    {mission.status === 'in_progress' ? 'En cours' : 'Acceptée'}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center mt-3 pt-3" style={{ borderTopWidth: 1, borderTopColor: theme.divider }}>
                <View className="flex-row items-center mr-4">
                  <Ionicons name="time-outline" size={16} color={theme.textMuted} />
                  <Text style={{ color: theme.textMuted }} className="text-sm ml-1">
                    {formatTime(mission.startDate)}
                  </Text>
                </View>
                <View className="flex-row items-center mr-4">
                  <Ionicons name="hourglass-outline" size={16} color={theme.textMuted} />
                  <Text style={{ color: theme.textMuted }} className="text-sm ml-1">
                    {mission.duration} jour{mission.duration > 1 ? 's' : ''}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="cash-outline" size={16} color={theme.success} />
                  <Text style={{ color: theme.success }} className="text-sm ml-1 font-medium">
                    {mission.budget}€
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center mt-2">
                <Ionicons name="location-outline" size={16} color={theme.textMuted} />
                <Text style={{ color: theme.textMuted }} className="text-sm ml-1 flex-1">{mission.address}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Upcoming Missions Summary */}
        <View className="px-4 mt-6">
          <Text style={{ color: theme.text }} className="text-lg font-bold mb-3">Missions à venir</Text>
          
          {missions.filter(m => new Date(m.startDate) > new Date()).length === 0 ? (
            <View className="rounded-2xl p-6 items-center" style={{ backgroundColor: theme.card }}>
              <Ionicons name="checkmark-circle-outline" size={48} color={theme.success} />
              <Text style={{ color: theme.textMuted }} className="mt-3">Aucune mission planifiée</Text>
            </View>
          ) : (
            missions
              .filter(m => new Date(m.startDate) > new Date())
              .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
              .slice(0, 5)
              .map((mission) => {
                const startDate = new Date(mission.startDate);
                return (
                  <TouchableOpacity
                    key={mission.id}
                    className="rounded-2xl p-4 mb-3 flex-row items-center"
                    style={{ backgroundColor: theme.card }}
                    onPress={() => setSelectedDate(startDate)}
                  >
                    <View className="rounded-xl p-3 mr-3 items-center" style={{ backgroundColor: `${theme.accent}20` }}>
                      <Text style={{ color: theme.accent }} className="text-xs font-medium">
                        {startDate.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()}
                      </Text>
                      <Text style={{ color: theme.text }} className="text-xl font-bold">
                        {startDate.getDate()}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text style={{ color: theme.text }} className="font-semibold">{mission.title}</Text>
                      <Text style={{ color: theme.textMuted }} className="text-sm">{mission.location}</Text>
                      <View className="flex-row items-center mt-1">
                        <Text style={{ color: theme.textMuted }} className="text-xs">
                          {formatTime(mission.startDate)} • {mission.duration}j
                        </Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text style={{ color: theme.success }} className="font-bold">{mission.budget}€</Text>
                      <View
                        className="w-2 h-2 rounded-full mt-2"
                        style={{ backgroundColor: getUrgencyColor(mission.urgency) }}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })
          )}
        </View>

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
