import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  useColorScheme,
} from 'react-native';
import { format, subDays, startOfWeek, eachDayOfInterval } from 'date-fns';
import { Colors } from '@/constants';
import { useHabitStore } from '@/store';
import { StatCard } from '@/components/ui/StatCard';
import { WeeklyGrid } from '@/components/habit/WeeklyGrid';

export default function StatsScreen() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? Colors.dark : Colors.light;
  const habits = useHabitStore((s) => s.habits);

  const today = new Date();
  const todayKey = format(today, 'yyyy-MM-dd');

  const totalCompletions = habits.reduce(
    (sum, h) => sum + Object.keys(h.completions).length,
    0
  );
  const longestStreak = habits.reduce(
    (max, h) => Math.max(max, h.longestStreak),
    0
  );
  const currentStreaks = habits.reduce(
    (sum, h) => sum + (h.streak > 0 ? 1 : 0),
    0
  );

  // Last 7 days completion rate
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i);
    const key = format(d, 'yyyy-MM-dd');
    const done = habits.filter((h) => h.completions[key]).length;
    const total = habits.length;
    return { date: d, key, done, total, rate: total > 0 ? done / total : 0 };
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8 }}>
          <Text style={{ fontSize: 14, color: colors.textSecondary, fontWeight: '500' }}>
            Overview
          </Text>
          <Text style={{ fontSize: 26, fontWeight: '700', color: colors.textPrimary, marginTop: 2 }}>
            Your Progress
          </Text>
        </View>

        {/* Stat Cards Row */}
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 24,
            marginTop: 16,
            gap: 12,
          }}
        >
          <StatCard
            label="Total Done"
            value={totalCompletions}
            icon="checkmark-circle"
            color={colors.success}
            colors={colors}
          />
          <StatCard
            label="Best Streak"
            value={longestStreak}
            icon="flame"
            color={colors.accent}
            colors={colors}
            suffix="d"
          />
          <StatCard
            label="On Track"
            value={currentStreaks}
            icon="trending-up"
            color={colors.primary}
            colors={colors}
          />
        </View>

        {/* Weekly Activity */}
        <View
          style={{
            marginHorizontal: 24,
            marginTop: 24,
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: colors.textPrimary,
              marginBottom: 16,
            }}
          >
            Last 7 Days
          </Text>
          <WeeklyGrid days={last7} colors={colors} />
        </View>

        {/* Per-Habit Streaks */}
        {habits.length > 0 && (
          <View style={{ marginHorizontal: 24, marginTop: 24 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: colors.textPrimary,
                marginBottom: 14,
              }}
            >
              Habit Streaks
            </Text>
            {habits.map((habit) => (
              <View
                key={habit.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.card,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 28, marginRight: 14 }}>{habit.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '600',
                      color: colors.textPrimary,
                    }}
                  >
                    {habit.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                    {Object.keys(habit.completions).length} total completions
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text
                    style={{
                      fontSize: 22,
                      fontWeight: '800',
                      color: habit.streak > 0 ? colors.accent : colors.textMuted,
                    }}
                  >
                    {habit.streak}🔥
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>
                    day streak
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {habits.length === 0 && (
          <View
            style={{ marginTop: 60, alignItems: 'center', paddingHorizontal: 40 }}
          >
            <Text style={{ fontSize: 40 }}>📊</Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.textPrimary,
                marginTop: 16,
                textAlign: 'center',
              }}
            >
              No data yet
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                marginTop: 8,
                textAlign: 'center',
              }}
            >
              Start tracking habits to see your progress here.
            </Text>
          </View>
        )}

        {/* AdMob Banner Placeholder — Phase 4 */}
        <View
          style={{
            marginHorizontal: 24,
            marginTop: 24,
            height: 52,
            backgroundColor: colors.elevated,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border,
            borderStyle: 'dashed',
          }}
        >
          <Text style={{ fontSize: 12, color: colors.textMuted }}>
            Ad Banner (Phase 4)
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
