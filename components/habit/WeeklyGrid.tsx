import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { format } from 'date-fns';
import { Colors } from '@/constants';

interface DayData {
  date: Date;
  key: string;
  done: number;
  total: number;
  rate: number;
}

interface WeeklyGridProps {
  days: DayData[];
  colors: typeof Colors.dark;
  accentColor?: string;
}

function AnimatedBar({
  rate,
  color,
  backgroundColor,
  delay,
}: {
  rate: number;
  color: string;
  backgroundColor: string;
  delay: number;
}) {
  const height = useSharedValue(0);

  useEffect(() => {
    height.value = withDelay(
      delay,
      withTiming(rate, { duration: 500, easing: Easing.out(Easing.cubic) })
    );
  }, [rate]);

  const barStyle = useAnimatedStyle(() => ({
    height: `${height.value * 100}%`,
    backgroundColor:
      rate === 0 ? backgroundColor : rate < 0.5 ? `${color}70` : rate < 1 ? `${color}AA` : color,
  }));

  return (
    <View
      style={[styles.barTrack, { backgroundColor }]}
    >
      <Animated.View style={[styles.barFill, barStyle]} />
    </View>
  );
}

export function WeeklyGrid({ days, colors, accentColor }: WeeklyGridProps) {
  const color = accentColor ?? colors.primary;

  return (
    <View style={styles.container}>
      {days.map((day, i) => (
        <View key={day.key} style={styles.column}>
          <Text style={[styles.rateLabel, { color: colors.textMuted }]}>
            {day.done > 0 ? day.done : ''}
          </Text>
          <AnimatedBar
            rate={day.rate}
            color={color}
            backgroundColor={colors.elevated}
            delay={i * 60}
          />
          <Text style={[styles.dayLabel, { color: colors.textSecondary }]}>
            {format(day.date, 'EEE')[0]}
          </Text>
          <Text style={[styles.dateNum, { color: colors.textMuted }]}>
            {format(day.date, 'd')}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    gap: 6,
  },
  column: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  rateLabel: { fontSize: 10, fontWeight: '600', height: 14 },
  barTrack: {
    flex: 1,
    width: '100%',
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  dayLabel: { fontSize: 11, fontWeight: '600' },
  dateNum: { fontSize: 10 },
});
