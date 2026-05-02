import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  useColorScheme,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, HabitColors, HabitIcons, FREE_HABIT_LIMIT } from '@/constants';
import { useHabitStore } from '@/store';
import type { HabitFrequency, TimeOfDay, HabitCategory } from '@/types';

const FREQUENCIES: Array<{ value: HabitFrequency; label: string; sublabel: string }> = [
  { value: 'daily', label: 'Every Day', sublabel: 'Mon – Sun' },
  { value: 'weekdays', label: 'Weekdays', sublabel: 'Mon – Fri' },
  { value: 'weekends', label: 'Weekends', sublabel: 'Sat – Sun' },
  { value: 'weekly', label: 'Weekly', sublabel: 'Once a week' },
  { value: 'custom', label: 'Custom', sublabel: 'Pick days' },
];

const TIMES_OF_DAY: Array<{ value: TimeOfDay; label: string; icon: string }> = [
  { value: 'anytime', label: 'Anytime', icon: '🕐' },
  { value: 'morning', label: 'Morning', icon: '🌅' },
  { value: 'afternoon', label: 'Afternoon', icon: '☀️' },
  { value: 'evening', label: 'Evening', icon: '🌙' },
];

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function AddHabitModal() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? Colors.dark : Colors.light;
  const { habits, isPremium, addHabit } = useHabitStore();

  const atLimit = !isPremium && habits.length >= FREE_HABIT_LIMIT;

  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(HabitIcons[0].icon);
  const [selectedColor, setSelectedColor] = useState(HabitColors[0]);
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [customDays, setCustomDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('anytime');
  const [showIconPicker, setShowIconPicker] = useState(false);

  function toggleCustomDay(day: number) {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
    Haptics.selectionAsync();
  }

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Name required', 'Please give your habit a name.');
      return;
    }
    if (atLimit) {
      router.replace('/(modals)/paywall');
      return;
    }

    addHabit({
      name: trimmed,
      icon: selectedIcon,
      color: selectedColor,
      category: 'other' as HabitCategory,
      frequency,
      customDays: frequency === 'custom' ? customDays : undefined,
      timeOfDay,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  const canSave = name.trim().length > 0 && !atLimit;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <Text style={{ fontSize: 16, color: colors.textSecondary, fontWeight: '500' }}>
              Cancel
            </Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 17, fontWeight: '700', color: colors.textPrimary }}>
            New Habit
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!canSave}
            style={{
              backgroundColor: canSave ? colors.primary : colors.elevated,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: '700',
                color: canSave ? '#FFFFFF' : colors.textMuted,
              }}
            >
              Save
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Free-tier warning → taps into Paywall */}
          {atLimit && (
            <TouchableOpacity
              onPress={() => router.replace('/(modals)/paywall')}
              activeOpacity={0.85}
              style={{
                backgroundColor: `${colors.primary}15`,
                borderRadius: 14,
                padding: 14,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: `${colors.primary}40`,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Text style={{ fontSize: 18 }}>✨</Text>
              <Text style={{ flex: 1, fontSize: 13, color: colors.primary, fontWeight: '600' }}>
                You've used all {FREE_HABIT_LIMIT} free habits. Upgrade to Guru Pro for unlimited.
              </Text>
              <Ionicons name="arrow-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          )}

          {/* Icon + Name row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <TouchableOpacity
              onPress={() => {
                setShowIconPicker(true);
                Haptics.selectionAsync();
              }}
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                backgroundColor: `${selectedColor}25`,
                borderWidth: 2,
                borderColor: selectedColor,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 32 }}>{selectedIcon}</Text>
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                Habit Name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Drink water"
                placeholderTextColor={colors.textMuted}
                maxLength={40}
                style={{
                  fontSize: 17,
                  fontWeight: '600',
                  color: colors.textPrimary,
                  backgroundColor: colors.card,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: name.length > 0 ? selectedColor : colors.border,
                }}
              />
            </View>
          </View>

          {/* Color Picker */}
          <SectionLabel label="Color" colors={colors} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
            {HabitColors.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => {
                  setSelectedColor(color);
                  Haptics.selectionAsync();
                }}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: color,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: selectedColor === color ? 3 : 0,
                  borderColor: '#FFFFFF',
                  shadowColor: color,
                  shadowOpacity: selectedColor === color ? 0.6 : 0,
                  shadowRadius: 6,
                  elevation: selectedColor === color ? 4 : 0,
                }}
                activeOpacity={0.8}
              >
                {selectedColor === color && (
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Frequency */}
          <SectionLabel label="Frequency" colors={colors} />
          <View style={{ gap: 8, marginBottom: 28 }}>
            {FREQUENCIES.map((f) => {
              const active = frequency === f.value;
              return (
                <TouchableOpacity
                  key={f.value}
                  onPress={() => {
                    setFrequency(f.value);
                    Haptics.selectionAsync();
                  }}
                  activeOpacity={0.75}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: active ? `${selectedColor}15` : colors.card,
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: active ? selectedColor : colors.border,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: active ? selectedColor : colors.textPrimary }}>
                      {f.label}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 1 }}>
                      {f.sublabel}
                    </Text>
                  </View>
                  {active && (
                    <Ionicons name="checkmark-circle" size={22} color={selectedColor} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Day Picker */}
          {frequency === 'custom' && (
            <>
              <SectionLabel label="Which Days?" colors={colors} />
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 28 }}>
                {DAY_LABELS.map((label, idx) => {
                  const active = customDays.includes(idx);
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => toggleCustomDay(idx)}
                      style={{
                        flex: 1,
                        aspectRatio: 1,
                        borderRadius: 12,
                        backgroundColor: active ? selectedColor : colors.card,
                        borderWidth: 1,
                        borderColor: active ? selectedColor : colors.border,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '700',
                          color: active ? '#FFFFFF' : colors.textSecondary,
                        }}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {/* Time of Day */}
          <SectionLabel label="Time of Day" colors={colors} />
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            {TIMES_OF_DAY.map((t) => {
              const active = timeOfDay === t.value;
              return (
                <TouchableOpacity
                  key={t.value}
                  onPress={() => {
                    setTimeOfDay(t.value);
                    Haptics.selectionAsync();
                  }}
                  activeOpacity={0.75}
                  style={{
                    flex: 1,
                    backgroundColor: active ? `${selectedColor}20` : colors.card,
                    borderRadius: 14,
                    padding: 12,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: active ? selectedColor : colors.border,
                  }}
                >
                  <Text style={{ fontSize: 22, marginBottom: 4 }}>{t.icon}</Text>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '600',
                      color: active ? selectedColor : colors.textSecondary,
                    }}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Icon Picker Modal */}
      <Modal
        visible={showIconPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowIconPicker(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>
              Choose Icon
            </Text>
            <TouchableOpacity onPress={() => setShowIconPicker(false)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
              {HabitIcons.map((item) => {
                const active = selectedIcon === item.icon;
                return (
                  <TouchableOpacity
                    key={item.icon}
                    onPress={() => {
                      setSelectedIcon(item.icon);
                      Haptics.selectionAsync();
                      setShowIconPicker(false);
                    }}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 18,
                      backgroundColor: active ? `${selectedColor}25` : colors.card,
                      borderWidth: active ? 2 : 1,
                      borderColor: active ? selectedColor : colors.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={{ fontSize: 30 }}>{item.icon}</Text>
                    <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function SectionLabel({ label, colors }: { label: string; colors: typeof Colors.dark }) {
  return (
    <Text
      style={{
        fontSize: 12,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginBottom: 10,
      }}
    >
      {label}
    </Text>
  );
}
