import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { useHabitStore } from '@/store';
import type { Habit } from '@/types';

interface HabitCardProps {
  habit: Habit;
  todayKey: string;
}

export function HabitCard({ habit, todayKey }: HabitCardProps) {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? Colors.dark : Colors.light;
  const toggleCompletion = useHabitStore((s) => s.toggleCompletion);
  const isComplete = Boolean(habit.completions[todayKey]);

  function handleToggle() {
    toggleCompletion(habit.id, todayKey);
  }

  return (
    <TouchableOpacity
      onPress={handleToggle}
      activeOpacity={0.75}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isComplete ? `${habit.color}15` : colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: isComplete ? `${habit.color}40` : colors.border,
      }}
    >
      {/* Icon bubble */}
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: isComplete ? habit.color : `${habit.color}25`,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
        }}
      >
        <Text style={{ fontSize: 24 }}>{habit.icon}</Text>
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: isComplete ? colors.textSecondary : colors.textPrimary,
            textDecorationLine: isComplete ? 'line-through' : 'none',
          }}
        >
          {habit.name}
        </Text>
        {habit.streak > 0 && (
          <Text
            style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}
          >
            🔥 {habit.streak} day streak
          </Text>
        )}
      </View>

      {/* Checkmark */}
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          borderWidth: 2,
          borderColor: isComplete ? habit.color : colors.border,
          backgroundColor: isComplete ? habit.color : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isComplete && (
          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
        )}
      </View>
    </TouchableOpacity>
  );
}
