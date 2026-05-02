import { View, Text } from 'react-native';
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
}

export function WeeklyGrid({ days, colors }: WeeklyGridProps) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 6 }}>
      {days.map((day) => {
        const intensity = day.rate;
        const baseColor = colors.primary;

        return (
          <View key={day.key} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: '500' }}>
              {format(day.date, 'EEE')[0]}
            </Text>
            <View
              style={{
                width: '100%',
                aspectRatio: 1,
                borderRadius: 8,
                backgroundColor:
                  intensity === 0
                    ? colors.elevated
                    : intensity < 0.5
                    ? `${baseColor}50`
                    : intensity < 1
                    ? `${baseColor}99`
                    : baseColor,
              }}
            />
            <Text style={{ fontSize: 10, color: colors.textMuted }}>
              {day.done}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
