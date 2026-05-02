import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  colors: typeof Colors.dark;
  suffix?: string;
}

export function StatCard({ label, value, icon, color, colors, suffix }: StatCardProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: `${color}20`,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary }}>
        {value}
        {suffix && <Text style={{ fontSize: 14 }}>{suffix}</Text>}
      </Text>
      <Text
        style={{
          fontSize: 11,
          color: colors.textSecondary,
          marginTop: 2,
          textAlign: 'center',
          fontWeight: '500',
        }}
      >
        {label}
      </Text>
    </View>
  );
}
