import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  useColorScheme,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { Colors, HabitColors } from '@/constants';
import { useHabitStore } from '@/store';

export default function HabitDetailModal() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? Colors.dark : Colors.light;
  const { id } = useLocalSearchParams<{ id: string }>();

  const { habits, updateHabit, deleteHabit } = useHabitStore();
  const habit = habits.find((h) => h.id === id);

  const [name, setName] = useState(habit?.name ?? '');
  const [selectedColor, setSelectedColor] = useState(habit?.color ?? HabitColors[0]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setSelectedColor(habit.color);
    }
  }, [habit]);

  if (!habit) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>
            Habit not found.
          </Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  function handleSave() {
    if (!name.trim()) return;
    updateHabit(id!, { name: name.trim(), color: selectedColor });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsEditing(false);
  }

  function handleDelete() {
    Alert.alert(
      `Delete "${habit!.name}"?`,
      'All completion history will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            deleteHabit(id!);
            router.back();
          },
        },
      ]
    );
  }

  // Build last 28-day heatmap
  const today = new Date();
  const last28 = eachDayOfInterval({ start: subDays(today, 27), end: today });
  const totalDone = Object.keys(habit.completions).length;
  const completionKeys = new Set(Object.keys(habit.completions));

  // Compute 7-day completion rate
  const last7Keys = Array.from({ length: 7 }, (_, i) =>
    format(subDays(today, i), 'yyyy-MM-dd')
  );
  const last7Done = last7Keys.filter((k) => completionKeys.has(k)).length;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ─── Header ─── */}
        <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="chevron-down" size={22} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.headerIconWrap}>
            <View
              style={[
                styles.headerIconBubble,
                { backgroundColor: `${habit.color}25` },
              ]}
            >
              <Text style={styles.headerIcon}>{habit.icon}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
                Haptics.selectionAsync();
              }
            }}
            style={styles.headerBtn}
          >
            <Text
              style={{ fontSize: 15, fontWeight: '600', color: colors.primary }}
            >
              {isEditing ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ─── Name / Color editor ─── */}
          {isEditing ? (
            <View style={{ marginBottom: 28 }}>
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                Name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={[
                  styles.nameInput,
                  {
                    color: colors.textPrimary,
                    backgroundColor: colors.card,
                    borderColor: selectedColor,
                  },
                ]}
                autoFocus
                maxLength={40}
              />

              <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: 18 }]}>
                Color
              </Text>
              <View style={styles.colorRow}>
                {HabitColors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => {
                      setSelectedColor(color);
                      Haptics.selectionAsync();
                    }}
                    style={[
                      styles.colorDot,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorDotActive,
                    ]}
                    activeOpacity={0.8}
                  >
                    {selectedColor === color && (
                      <Ionicons name="checkmark" size={14} color="#FFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.titleBlock}>
              <Text style={[styles.habitName, { color: colors.textPrimary }]}>
                {habit.name}
              </Text>
              <Text style={[styles.habitMeta, { color: colors.textSecondary }]}>
                {capitalize(habit.frequency)} · {capitalize(habit.timeOfDay)}
              </Text>
            </View>
          )}

          {/* ─── Stat pills ─── */}
          <View style={styles.statRow}>
            <StatPill
              label="Current Streak"
              value={`${habit.streak}🔥`}
              colors={colors}
              accent={habit.color}
            />
            <StatPill
              label="Best Streak"
              value={`${habit.longestStreak}d`}
              colors={colors}
              accent={colors.primary}
            />
            <StatPill
              label="Total Done"
              value={String(totalDone)}
              colors={colors}
              accent={colors.success}
            />
            <StatPill
              label="Last 7 Days"
              value={`${last7Done}/7`}
              colors={colors}
              accent={colors.warning}
            />
          </View>

          {/* ─── 28-day heatmap ─── */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Last 28 Days
          </Text>
          <View
            style={[
              styles.heatmapCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.heatmapGrid}>
              {last28.map((day) => {
                const key = format(day, 'yyyy-MM-dd');
                const done = completionKeys.has(key);
                return (
                  <View
                    key={key}
                    style={[
                      styles.heatmapCell,
                      {
                        backgroundColor: done
                          ? habit.color
                          : colors.elevated,
                        borderRadius: 4,
                      },
                    ]}
                  />
                );
              })}
            </View>
            <View style={styles.heatmapLegend}>
              <View
                style={[styles.heatmapLegendDot, { backgroundColor: colors.elevated }]}
              />
              <Text style={[styles.heatmapLegendLabel, { color: colors.textMuted }]}>
                Missed
              </Text>
              <View
                style={[styles.heatmapLegendDot, { backgroundColor: habit.color, marginLeft: 12 }]}
              />
              <Text style={[styles.heatmapLegendLabel, { color: colors.textMuted }]}>
                Completed
              </Text>
            </View>
          </View>

          {/* ─── Created date ─── */}
          <Text style={[styles.createdAt, { color: colors.textMuted }]}>
            Created {format(new Date(habit.createdAt), 'MMMM d, yyyy')}
          </Text>

          {/* ─── Delete ─── */}
          <TouchableOpacity
            onPress={handleDelete}
            activeOpacity={0.8}
            style={[
              styles.deleteBtn,
              { backgroundColor: `${colors.accent}15`, borderColor: `${colors.accent}30` },
            ]}
          >
            <Ionicons name="trash-outline" size={18} color={colors.accent} />
            <Text style={[styles.deleteBtnText, { color: colors.accent }]}>
              Delete Habit
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function StatPill({
  label,
  value,
  colors,
  accent,
}: {
  label: string;
  value: string;
  colors: typeof Colors.dark;
  accent: string;
}) {
  return (
    <View
      style={[
        statPillStyles.pill,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[statPillStyles.value, { color: accent }]}>{value}</Text>
      <Text style={[statPillStyles.label, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const statPillStyles = StyleSheet.create({
  pill: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  value: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
  label: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
});

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerBtn: { minWidth: 60, alignItems: 'center' },
  headerIconWrap: { flex: 1, alignItems: 'center' },
  headerIconBubble: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: { fontSize: 28 },
  scroll: { padding: 24, paddingBottom: 48 },
  titleBlock: { marginBottom: 24 },
  habitName: { fontSize: 26, fontWeight: '800' },
  habitMeta: { fontSize: 14, marginTop: 6 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  nameInput: {
    fontSize: 20,
    fontWeight: '700',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
  },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDotActive: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  statRow: { flexDirection: 'row', gap: 8, marginBottom: 28 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  heatmapCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  heatmapCell: {
    width: '11%',
    aspectRatio: 1,
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  heatmapLegendDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 4,
  },
  heatmapLegendLabel: { fontSize: 11 },
  createdAt: { fontSize: 12, textAlign: 'center', marginBottom: 28 },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
  },
  deleteBtnText: { fontSize: 15, fontWeight: '700' },
});
