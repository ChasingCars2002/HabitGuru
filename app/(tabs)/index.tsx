import { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  useColorScheme,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import { Colors, FREE_HABIT_LIMIT } from '@/constants';
import { useHabitStore } from '@/store';
import { useHabitsForToday } from '@/hooks';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { CelebrationBanner } from '@/components/ui/CelebrationBanner';
import { HabitCard } from '@/components/habit/HabitCard';
import { EmptyState } from '@/components/ui/EmptyState';

export default function HomeScreen() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? Colors.dark : Colors.light;
  const { isPremium } = useHabitStore();
  const { todayHabits, completed, pending, completionRate, todayKey } =
    useHabitsForToday();

  const today = new Date();
  const allDone = todayHabits.length > 0 && completed.length === todayHabits.length;

  // FAB press animation
  const fabScale = useSharedValue(1);
  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  function handleAddPress() {
    fabScale.value = withSpring(0.88, { damping: 10, stiffness: 400 }, () => {
      fabScale.value = withSpring(1, { damping: 12, stiffness: 300 });
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(modals)/add-habit');
  }

  const greeting = (() => {
    const h = today.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const atLimit = !isPremium && todayHabits.length >= FREE_HABIT_LIMIT;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Celebration Banner (absolutely positioned) */}
      <CelebrationBanner visible={allDone} colors={colors} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header ─── */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>
              {format(today, 'EEEE, MMMM d')}
            </Text>
            <Text style={[styles.greeting, { color: colors.textPrimary }]}>
              {greeting} 👋
            </Text>
          </View>
          <Animated.View style={fabStyle}>
            <TouchableOpacity
              onPress={handleAddPress}
              activeOpacity={1}
              style={[styles.fab, { backgroundColor: atLimit ? colors.elevated : colors.primary }]}
            >
              <Ionicons
                name={atLimit ? 'lock-closed' : 'add'}
                size={24}
                color={atLimit ? colors.textMuted : '#FFFFFF'}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* ─── Progress Card ─── */}
        <View
          style={[
            styles.progressCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <ProgressRing
            progress={completionRate}
            size={86}
            strokeWidth={9}
            color={allDone ? colors.success : colors.primary}
            backgroundColor={colors.border}
            showLabel
            labelColor={allDone ? colors.success : colors.primary}
          />
          <View style={styles.progressInfo}>
            <Text style={[styles.progressCount, { color: colors.textPrimary }]}>
              {completed.length}
              <Text style={[styles.progressTotal, { color: colors.textSecondary }]}>
                /{todayHabits.length}
              </Text>
            </Text>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
              habits completed
            </Text>
            {pending.length > 0 && (
              <Text style={[styles.progressRemaining, { color: colors.textMuted }]}>
                {pending.length} remaining
              </Text>
            )}
          </View>
        </View>

        {/* ─── Free-tier limit notice ─── */}
        {atLimit && (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/settings')}
            activeOpacity={0.85}
            style={[styles.limitBadge, { backgroundColor: `${colors.accent}15`, borderColor: `${colors.accent}40` }]}
          >
            <Ionicons name="lock-closed-outline" size={14} color={colors.accent} />
            <Text style={[styles.limitText, { color: colors.accent }]}>
              Free limit reached · Upgrade for unlimited habits
            </Text>
            <Ionicons name="arrow-forward" size={14} color={colors.accent} />
          </TouchableOpacity>
        )}

        {/* ─── Habit List ─── */}
        <View style={styles.listSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Today's Habits
          </Text>

          {todayHabits.length === 0 ? (
            <EmptyState
              icon="leaf-outline"
              title="No habits yet"
              subtitle="Tap + to add your first habit and start building a better you."
              actionLabel="Add First Habit"
              onAction={handleAddPress}
            />
          ) : (
            <>
              {/* Pending first */}
              {pending.map((habit) => (
                <HabitCard key={habit.id} habit={habit} todayKey={todayKey} />
              ))}
              {/* Completed at bottom */}
              {completed.length > 0 && (
                <>
                  {pending.length > 0 && (
                    <Text
                      style={[styles.completedDivider, { color: colors.textMuted }]}
                    >
                      Completed
                    </Text>
                  )}
                  {completed.map((habit) => (
                    <HabitCard key={habit.id} habit={habit} todayKey={todayKey} />
                  ))}
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },
  dateLabel: { fontSize: 14, fontWeight: '500' },
  greeting: { fontSize: 26, fontWeight: '700', marginTop: 2 },
  fab: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C6FCD',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  progressCard: {
    marginHorizontal: 24,
    marginTop: 20,
    borderRadius: 22,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  progressInfo: { marginLeft: 20, flex: 1 },
  progressCount: { fontSize: 30, fontWeight: '800' },
  progressTotal: { fontSize: 18 },
  progressLabel: { fontSize: 14, marginTop: 2 },
  progressRemaining: { fontSize: 12, marginTop: 4, fontWeight: '500' },
  limitBadge: {
    marginHorizontal: 24,
    marginTop: 14,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
  },
  limitText: { flex: 1, fontSize: 13, fontWeight: '500' },
  listSection: { marginTop: 28, paddingHorizontal: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  completedDivider: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 8,
  },
});
