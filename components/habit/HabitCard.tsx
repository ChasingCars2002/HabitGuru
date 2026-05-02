import { useEffect } from 'react';
import { Text, useColorScheme, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { useHabitStore } from '@/store';
import type { Habit } from '@/types';

interface HabitCardProps {
  habit: Habit;
  todayKey: string;
}

const SPRING_CONFIG = { damping: 14, stiffness: 300, mass: 0.8 };

function triggerComplete() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
function triggerUndo() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}
function triggerLongPress() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}
function navigateToDetail(id: string) {
  router.push({ pathname: '/(modals)/habit-detail', params: { id } });
}

export function HabitCard({ habit, todayKey }: HabitCardProps) {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? Colors.dark : Colors.light;
  const toggleCompletion = useHabitStore((s) => s.toggleCompletion);
  const isComplete = Boolean(habit.completions[todayKey]);

  // Animated values
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(isComplete ? 1 : 0);
  const completionProgress = useSharedValue(isComplete ? 1 : 0);
  const cardOpacity = useSharedValue(1);

  // Sync animated state when external changes happen (e.g. store hydration)
  useEffect(() => {
    checkScale.value = withSpring(isComplete ? 1 : 0, SPRING_CONFIG);
    completionProgress.value = withTiming(isComplete ? 1 : 0, { duration: 300 });
  }, [isComplete]);

  const tapGesture = Gesture.Tap().onBegin(() => {
    scale.value = withSpring(0.96, SPRING_CONFIG);
  }).onFinalize((_, success) => {
    scale.value = withSpring(1, SPRING_CONFIG);
    if (!success) return;

    if (!isComplete) {
      // Completion: pop the check in
      checkScale.value = withSequence(
        withSpring(1.35, { damping: 10, stiffness: 400 }),
        withSpring(1, SPRING_CONFIG)
      );
      completionProgress.value = withTiming(1, { duration: 280 });
      runOnJS(triggerComplete)();
    } else {
      // Undo completion
      checkScale.value = withSpring(0, SPRING_CONFIG);
      completionProgress.value = withTiming(0, { duration: 200 });
      runOnJS(triggerUndo)();
    }
    runOnJS(toggleCompletion)(habit.id, todayKey);
  });

  const longPressGesture = Gesture.LongPress()
    .minDuration(450)
    .onStart(() => {
      scale.value = withSpring(0.94, SPRING_CONFIG);
      runOnJS(triggerLongPress)();
    })
    .onEnd(() => {
      scale.value = withSpring(1, SPRING_CONFIG);
      runOnJS(navigateToDetail)(habit.id);
    });

  const composedGesture = Gesture.Exclusive(longPressGesture, tapGesture);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: cardOpacity.value,
    backgroundColor: isComplete
      ? `${habit.color}12`
      : colors.card,
    borderColor: isComplete
      ? `${habit.color}50`
      : colors.border,
  }));

  const iconBubbleStyle = useAnimatedStyle(() => ({
    backgroundColor: isComplete
      ? habit.color
      : `${habit.color}25`,
  }));

  const nameStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isComplete ? 0.55 : 1, { duration: 250 }),
  }));

  const checkCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    backgroundColor: isComplete ? habit.color : 'transparent',
    borderColor: isComplete ? habit.color : colors.border,
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.card, cardStyle]}>
        {/* Icon bubble */}
        <Animated.View style={[styles.iconBubble, iconBubbleStyle]}>
          <Text style={styles.icon}>{habit.icon}</Text>
        </Animated.View>

        {/* Info */}
        <Animated.View style={styles.info}>
          <Animated.Text
            style={[
              styles.name,
              { color: colors.textPrimary, textDecorationLine: isComplete ? 'line-through' : 'none' },
              nameStyle,
            ]}
          >
            {habit.name}
          </Animated.Text>
          <Text style={[styles.streak, { color: colors.textMuted }]}>
            {habit.streak > 0
              ? `🔥 ${habit.streak} day streak`
              : habit.completions[todayKey]
              ? '✓ Done today'
              : 'Tap to complete'}
          </Text>
        </Animated.View>

        {/* Check circle */}
        <Animated.View style={[styles.checkCircle, checkCircleStyle]}>
          {isComplete && <Ionicons name="checkmark" size={15} color="#FFFFFF" />}
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  iconBubble: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  icon: {
    fontSize: 26,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },
  streak: {
    fontSize: 12,
    fontWeight: '500',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
