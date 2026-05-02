import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  useColorScheme,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FREE_HABIT_LIMIT } from '@/constants';
import { useHabitStore } from '@/store';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface SettingsRowProps {
  icon: IoniconName;
  iconColor: string;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  colors: typeof Colors.dark;
}

function SettingsRow({
  icon,
  iconColor,
  label,
  sublabel,
  onPress,
  rightElement,
  colors,
}: SettingsRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: `${iconColor}20`,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
        }}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '500', color: colors.textPrimary }}>
          {label}
        </Text>
        {sublabel && (
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 1 }}>
            {sublabel}
          </Text>
        )}
      </View>
      {rightElement ?? (
        onPress ? (
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        ) : null
      )}
    </TouchableOpacity>
  );
}

function SectionHeader({ title, colors }: { title: string; colors: typeof Colors.dark }) {
  return (
    <Text
      style={{
        fontSize: 12,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginHorizontal: 24,
        marginTop: 28,
        marginBottom: 8,
      }}
    >
      {title}
    </Text>
  );
}

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? Colors.dark : Colors.light;
  const { habits, isPremium } = useHabitStore();

  function handleUpgrade() {
    Alert.alert('Guru Pro', 'Paywall coming in Phase 4!');
  }

  function handleResetData() {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all your habits and progress. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            // Phase 3: clear Firebase + local store
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8 }}>
          <Text style={{ fontSize: 14, color: colors.textSecondary, fontWeight: '500' }}>
            Preferences
          </Text>
          <Text style={{ fontSize: 26, fontWeight: '700', color: colors.textPrimary, marginTop: 2 }}>
            Settings
          </Text>
        </View>

        {/* Premium Card */}
        {!isPremium && (
          <TouchableOpacity
            onPress={handleUpgrade}
            activeOpacity={0.85}
            style={{
              marginHorizontal: 24,
              marginTop: 20,
              borderRadius: 20,
              padding: 20,
              overflow: 'hidden',
              backgroundColor: colors.primary,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#FFFFFF' }}>
                  Upgrade to Guru Pro ✨
                </Text>
                <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
                  Unlimited habits · No ads · Advanced analytics
                </Text>
              </View>
              <Ionicons name="arrow-forward-circle" size={32} color="rgba(255,255,255,0.9)" />
            </View>
            <View
              style={{
                marginTop: 14,
                paddingTop: 14,
                borderTopWidth: 1,
                borderTopColor: 'rgba(255,255,255,0.2)',
                flexDirection: 'row',
                gap: 20,
              }}
            >
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                {habits.length}/{FREE_HABIT_LIMIT} habits used
              </Text>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                Ads enabled
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Account Section */}
        <SectionHeader title="Account" colors={colors} />
        <View
          style={{
            marginHorizontal: 24,
            backgroundColor: colors.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
          }}
        >
          <SettingsRow
            icon="person-circle-outline"
            iconColor={colors.primary}
            label="Sign In / Sign Up"
            sublabel="Back up your habits to the cloud"
            onPress={() => Alert.alert('Auth', 'Coming in Phase 3!')}
            colors={colors}
          />
          <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: 16 }} />
          <SettingsRow
            icon="cloud-outline"
            iconColor={colors.success}
            label="Sync Status"
            sublabel="Local only — sign in to enable sync"
            colors={colors}
          />
        </View>

        {/* App Section */}
        <SectionHeader title="App" colors={colors} />
        <View
          style={{
            marginHorizontal: 24,
            backgroundColor: colors.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
          }}
        >
          <SettingsRow
            icon="notifications-outline"
            iconColor={colors.warning}
            label="Reminders"
            sublabel="Set daily nudges for your habits"
            onPress={() => Alert.alert('Reminders', 'Coming soon!')}
            colors={colors}
          />
          <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: 16 }} />
          <SettingsRow
            icon="moon-outline"
            iconColor={colors.primaryLight}
            label="Appearance"
            sublabel={`${scheme === 'dark' ? 'Dark' : 'Light'} mode (follows system)`}
            colors={colors}
          />
        </View>

        {/* Data Section */}
        <SectionHeader title="Data" colors={colors} />
        <View
          style={{
            marginHorizontal: 24,
            backgroundColor: colors.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
          }}
        >
          <SettingsRow
            icon="download-outline"
            iconColor={colors.success}
            label="Export Data"
            sublabel="Coming soon"
            colors={colors}
          />
          <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: 16 }} />
          <SettingsRow
            icon="trash-outline"
            iconColor={colors.accent}
            label="Reset All Data"
            onPress={handleResetData}
            colors={colors}
          />
        </View>

        {/* About Section */}
        <SectionHeader title="About" colors={colors} />
        <View
          style={{
            marginHorizontal: 24,
            backgroundColor: colors.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
          }}
        >
          <SettingsRow
            icon="star-outline"
            iconColor={colors.warning}
            label="Rate Habit Guru"
            onPress={() => Alert.alert('Rate', 'Thanks for your support!')}
            colors={colors}
          />
          <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: 16 }} />
          <SettingsRow
            icon="document-text-outline"
            iconColor={colors.textSecondary}
            label="Privacy Policy"
            onPress={() => {}}
            colors={colors}
          />
          <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: 16 }} />
          <SettingsRow
            icon="information-circle-outline"
            iconColor={colors.textSecondary}
            label="Version"
            sublabel="1.0.0 (MVP)"
            colors={colors}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
