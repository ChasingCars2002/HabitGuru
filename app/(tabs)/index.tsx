import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Colors } from '@/constants';
import { useHabitsForToday } from '@/hooks';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { HabitCard } from '@/components/habit/HabitCard';
import { EmptyState } from '@/components/ui/EmptyState';

export default function HomeScreen() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? Colors.dark : Colors.light;
  const { todayHabits, completed, completionRate, todayKey } =
    useHabitsForToday();

  const today = new Date();
  const greeting = getGreeting();

  function getGreeting(): string {
    const h = today.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: 8,
          }}
        >
          <View>
            <Text
              style={{ fontSize: 14, color: colors.textSecondary, fontWeight: '500' }}
            >
              {format(today, 'EEEE, MMMM d')}
            </Text>
            <Text
              style={{ fontSize: 26, fontWeight: '700', color: colors.textPrimary, marginTop: 2 }}
            >
              {greeting} 👋
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/(modals)/add-habit')}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Progress Summary */}
        <View
          style={{
            marginHorizontal: 24,
            marginTop: 20,
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 20,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <ProgressRing
            progress={completionRate}
            size={80}
            strokeWidth={8}
            color={colors.primary}
            backgroundColor={colors.border}
          />
          <View style={{ marginLeft: 20, flex: 1 }}>
            <Text
              style={{ fontSize: 28, fontWeight: '800', color: colors.textPrimary }}
            >
              {completed.length}
              <Text style={{ fontSize: 18, color: colors.textSecondary }}>
                /{todayHabits.length}
              </Text>
            </Text>
            <Text
              style={{ fontSize: 14, color: colors.textSecondary, marginTop: 2 }}
            >
              habits completed today
            </Text>
            {completed.length > 0 && completed.length === todayHabits.length && (
              <Text
                style={{
                  fontSize: 13,
                  color: colors.success,
                  fontWeight: '600',
                  marginTop: 6,
                }}
              >
                Perfect day! 🎉
              </Text>
            )}
          </View>
        </View>

        {/* Habit List */}
        <View style={{ marginTop: 28, paddingHorizontal: 24 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.textPrimary,
              marginBottom: 14,
            }}
          >
            Today's Habits
          </Text>

          {todayHabits.length === 0 ? (
            <EmptyState
              icon="leaf-outline"
              title="No habits yet"
              subtitle="Tap + to add your first habit and start building a better you."
              actionLabel="Add Habit"
              onAction={() => router.push('/(modals)/add-habit')}
            />
          ) : (
            todayHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                todayKey={todayKey}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
