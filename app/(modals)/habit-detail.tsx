import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants';

export default function HabitDetailModal() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 8,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.textPrimary }}>
          Habit Detail
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ fontSize: 48 }}>📋</Text>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '700',
            color: colors.textPrimary,
            marginTop: 16,
            textAlign: 'center',
          }}
        >
          Habit Details
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.textSecondary,
            marginTop: 8,
            textAlign: 'center',
          }}
        >
          Edit, view statistics, and manage individual habits. Full implementation in Phase 2.
        </Text>
      </View>
    </SafeAreaView>
  );
}
