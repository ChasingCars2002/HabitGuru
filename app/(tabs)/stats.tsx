import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  useColorScheme,
  StyleSheet,
} from 'react-native';
import { format, subDays } from 'date-fns';
import { router } from 'expo-router';
import { Colors } from '@/constants';
import { useHabitStore } from '@/store';
import { StatCard } from '@/components/ui/StatCard';
import { WeeklyGrid } from '@/components/habit/WeeklyGrid';

export default function StatsScreen() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? Colors.dark : Colors.light;
  const { habits, isPremium } = useHabitStore();

  const today = new Date();

  const totalCompletions = habits.reduce(
    (sum, h) => sum + Object.keys(h.completions).length,
    0
  );
  const longestStreak = habits.reduce(
    (max, h) => Math.max(max, h.longestStreak),
    0
  );
  const activeStreaks = habits.filter((h) => h.streak > 0).length;

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i);
    const key = format(d, 'yyyy-MM-dd');
    const done = habits.filter((h) => h.completions[key]).length;
    const total = habits.length;
    return { date: d, key, done, total, rate: total > 0 ? done / total : 0 };
  });

  // Sort habits by streak desc for the list
  const sortedHabits = [...habits].sort((a, b) => b.streak - a.streak);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header ─── */}
        <View style={styles.header}>
          <Text style={[styles.overline, { color: colors.textSecondary }]}>
            Overview
          </Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Your Progress
          </Text>
        </View>

        {/* ─── Stat Cards ─── */}
        <View style={styles.statRow}>
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
            label="Active"
            value={activeStreaks}
            icon="trending-up"
            color={colors.primary}
            colors={colors}
          />
        </View>

        {/* ─── Weekly Activity ─── */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Last 7 Days
          </Text>
          <WeeklyGrid days={last7} colors={colors} accentColor={colors.primary} />
        </View>

        {/* ─── Habit Streaks ─── */}
        {sortedHabits.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              Habit Streaks
            </Text>
            {sortedHabits.map((habit) => {
              const totalDone = Object.keys(habit.completions).length;
              return (
                <TouchableOpacity
                  key={habit.id}
                  onPress={() =>
                    router.push({
                      pathname: '/(modals)/habit-detail',
                      params: { id: habit.id },
                    })
                  }
                  activeOpacity={0.75}
                  style={[
                    styles.habitRow,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  {/* Icon */}
                  <View
                    style={[
                      styles.habitIcon,
                      { backgroundColor: `${habit.color}20` },
                    ]}
                  >
                    <Text style={{ fontSize: 22 }}>{habit.icon}</Text>
                  </View>

                  {/* Info */}
                  <View style={styles.habitInfo}>
                    <Text
                      style={[styles.habitName, { color: colors.textPrimary }]}
                    >
                      {habit.name}
                    </Text>
                    <Text
                      style={[styles.habitMeta, { color: colors.textSecondary }]}
                    >
                      {totalDone} total completions
                    </Text>
                  </View>

                  {/* Streak */}
                  <View style={styles.habitStreak}>
                    <Text
                      style={[
                        styles.streakValue,
                        {
                          color:
                            habit.streak > 0 ? colors.accent : colors.textMuted,
                        },
                      ]}
                    >
                      {habit.streak}
                      {habit.streak > 0 ? '🔥' : ''}
                    </Text>
                    <Text
                      style={[styles.streakLabel, { color: colors.textMuted }]}
                    >
                      day streak
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Empty state */}
        {habits.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              No data yet
            </Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              Start tracking habits to see your progress here.
            </Text>
          </View>
        )}

        {/* ─── AdMob Banner Placeholder (Phase 4) ─── */}
        {!isPremium && (
          <View
            style={[
              styles.adPlaceholder,
              { backgroundColor: colors.elevated, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.adLabel, { color: colors.textMuted }]}>
              Ad Banner · Phase 4
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 40 },
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8 },
  overline: { fontSize: 14, fontWeight: '500' },
  title: { fontSize: 26, fontWeight: '700', marginTop: 2 },
  statRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 16,
    gap: 12,
  },
  card: {
    marginHorizontal: 24,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  section: { marginHorizontal: 24, marginTop: 24 },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  habitIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  habitInfo: { flex: 1 },
  habitName: { fontSize: 15, fontWeight: '600' },
  habitMeta: { fontSize: 12, marginTop: 2 },
  habitStreak: { alignItems: 'flex-end' },
  streakValue: { fontSize: 20, fontWeight: '800' },
  streakLabel: { fontSize: 10, fontWeight: '500' },
  emptyWrap: {
    marginTop: 60,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16, textAlign: 'center' },
  emptySub: { fontSize: 14, marginTop: 8, textAlign: 'center' },
  adPlaceholder: {
    marginHorizontal: 24,
    marginTop: 24,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  adLabel: { fontSize: 12 },
});
