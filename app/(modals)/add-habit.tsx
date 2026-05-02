import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  useColorScheme,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants';

export default function AddHabitModal() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
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
          New Habit
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.elevated,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="close" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Placeholder — full form implemented in Phase 2 */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ fontSize: 48 }}>🌱</Text>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '700',
            color: colors.textPrimary,
            marginTop: 16,
            textAlign: 'center',
          }}
        >
          Habit Form
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.textSecondary,
            marginTop: 8,
            textAlign: 'center',
          }}
        >
          Full habit creation form with icon picker, color picker, frequency selector, and time of day will be built in Phase 2.
        </Text>
      </View>
    </SafeAreaView>
  );
}
