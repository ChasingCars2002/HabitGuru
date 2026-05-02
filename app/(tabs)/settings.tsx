import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  useColorScheme,
  Alert,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, FREE_HABIT_LIMIT } from '@/constants';
import { useHabitStore } from '@/store/habitStore';
import { useAuthStore } from '@/store/authStore';
import { signOut } from '@/lib/auth';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

// ─── Shared primitives ────────────────────────────────────────────────────

function SectionLabel({
  title,
  colors,
}: {
  title: string;
  colors: typeof Colors.dark;
}) {
  return (
    <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{title}</Text>
  );
}

interface RowProps {
  icon: IoniconName;
  iconColor: string;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
  colors: typeof Colors.dark;
}

function Row({
  icon,
  iconColor,
  label,
  sublabel,
  onPress,
  rightElement,
  destructive,
  colors,
}: RowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={styles.row}
    >
      <View
        style={[
          styles.rowIcon,
          { backgroundColor: destructive ? `${colors.accent}20` : `${iconColor}20` },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={destructive ? colors.accent : iconColor}
        />
      </View>
      <View style={styles.rowInfo}>
        <Text
          style={[
            styles.rowLabel,
            { color: destructive ? colors.accent : colors.textPrimary },
          ]}
        >
          {label}
        </Text>
        {sublabel ? (
          <Text style={[styles.rowSublabel, { color: colors.textSecondary }]}>
            {sublabel}
          </Text>
        ) : null}
      </View>
      {rightElement ??
        (onPress ? (
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        ) : null)}
    </TouchableOpacity>
  );
}

function Card({
  children,
  colors,
}: {
  children: React.ReactNode;
  colors: typeof Colors.dark;
}) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      {children}
    </View>
  );
}

function Divider({ colors }: { colors: typeof Colors.dark }) {
  return (
    <View style={[styles.divider, { backgroundColor: colors.border }]} />
  );
}

// ─── Sync status badge ────────────────────────────────────────────────────

const SYNC_LABELS: Record<string, string> = {
  idle: 'Not synced',
  syncing: 'Syncing…',
  synced: 'Up to date',
  error: 'Sync failed',
  offline: 'Offline only',
};

const SYNC_ICONS: Record<string, IoniconName> = {
  idle: 'cloud-outline',
  syncing: 'cloud-upload-outline',
  synced: 'cloud-done-outline',
  error: 'cloud-offline-outline',
  offline: 'cloud-offline-outline',
};

// ─── Screen ───────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? Colors.dark : Colors.light;
  const { habits, isPremium } = useHabitStore();
  const { user, isFirebaseReady, syncStatus } = useAuthStore();

  const isAnon = !user || user.isAnonymous;
  const displayEmail = user?.email ?? null;
  const displayName = user?.displayName ?? null;

  function handleUpgrade() {
    router.push('/(modals)/paywall');
  }

  async function handleSignOut() {
    Alert.alert(
      'Sign Out',
      'Your habits will remain saved on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await signOut();
          },
        },
      ]
    );
  }

  function handleResetData() {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all your habits and progress. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => {} },
      ]
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header ─── */}
        <View style={styles.header}>
          <Text style={[styles.overline, { color: colors.textSecondary }]}>
            Preferences
          </Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Settings
          </Text>
        </View>

        {/* ─── Premium card ─── */}
        {!isPremium && (
          <TouchableOpacity
            onPress={handleUpgrade}
            activeOpacity={0.85}
            style={[styles.premiumCard, { backgroundColor: colors.primary }]}
          >
            <View style={styles.premiumLeft}>
              <Text style={styles.premiumTitle}>Upgrade to Guru Pro ✨</Text>
              <Text style={styles.premiumSub}>
                Unlimited habits · No ads · Advanced analytics
              </Text>
            </View>
            <Ionicons
              name="arrow-forward-circle"
              size={32}
              color="rgba(255,255,255,0.9)"
            />
          </TouchableOpacity>
        )}

        {/* ─── Account section ─── */}
        <SectionLabel title="Account" colors={colors} />
        <Card colors={colors}>
          {isAnon ? (
            <Row
              icon="person-circle-outline"
              iconColor={colors.primary}
              label="Sign In / Create Account"
              sublabel="Back up your habits to the cloud"
              onPress={() => router.push('/(modals)/auth')}
              colors={colors}
            />
          ) : (
            <>
              <Row
                icon="person-circle"
                iconColor={colors.primary}
                label={displayName ?? displayEmail ?? 'Signed in'}
                sublabel={displayEmail ?? undefined}
                colors={colors}
              />
              <Divider colors={colors} />
              <Row
                icon="log-out-outline"
                iconColor={colors.accent}
                label="Sign Out"
                destructive
                onPress={handleSignOut}
                colors={colors}
              />
            </>
          )}

          {isFirebaseReady && (
            <>
              <Divider colors={colors} />
              <Row
                icon={SYNC_ICONS[syncStatus] ?? 'cloud-outline'}
                iconColor={
                  syncStatus === 'synced'
                    ? colors.success
                    : syncStatus === 'error'
                    ? colors.accent
                    : colors.textSecondary
                }
                label="Sync Status"
                sublabel={SYNC_LABELS[syncStatus] ?? syncStatus}
                colors={colors}
              />
            </>
          )}

          {!isFirebaseReady && (
            <>
              <Divider colors={colors} />
              <Row
                icon="cloud-offline-outline"
                iconColor={colors.textMuted}
                label="Cloud Sync"
                sublabel="Add Firebase credentials to enable"
                colors={colors}
              />
            </>
          )}
        </Card>

        {/* ─── Habit usage ─── */}
        <SectionLabel title="Usage" colors={colors} />
        <Card colors={colors}>
          <Row
            icon="list-outline"
            iconColor={colors.primary}
            label="Habits"
            sublabel={
              isPremium
                ? `${habits.length} habits (unlimited)`
                : `${habits.length} / ${FREE_HABIT_LIMIT} (free tier)`
            }
            rightElement={
              !isPremium && habits.length >= FREE_HABIT_LIMIT ? (
                <TouchableOpacity
                  onPress={handleUpgrade}
                  style={[styles.upgradePill, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.upgradePillText}>Upgrade</Text>
                </TouchableOpacity>
              ) : undefined
            }
            colors={colors}
          />
        </Card>

        {/* ─── App section ─── */}
        <SectionLabel title="App" colors={colors} />
        <Card colors={colors}>
          <Row
            icon="notifications-outline"
            iconColor={colors.warning}
            label="Reminders"
            sublabel="Daily nudges for your habits"
            onPress={() => Alert.alert('Reminders', 'Coming soon!')}
            colors={colors}
          />
          <Divider colors={colors} />
          <Row
            icon="moon-outline"
            iconColor={colors.primaryLight}
            label="Appearance"
            sublabel={`${scheme === 'dark' ? 'Dark' : 'Light'} mode (follows system)`}
            colors={colors}
          />
        </Card>

        {/* ─── Data section ─── */}
        <SectionLabel title="Data" colors={colors} />
        <Card colors={colors}>
          <Row
            icon="download-outline"
            iconColor={colors.success}
            label="Export Data"
            sublabel="Coming soon"
            colors={colors}
          />
          <Divider colors={colors} />
          <Row
            icon="trash-outline"
            iconColor={colors.accent}
            label="Reset All Data"
            destructive
            onPress={handleResetData}
            colors={colors}
          />
        </Card>

        {/* ─── About section ─── */}
        <SectionLabel title="About" colors={colors} />
        <Card colors={colors}>
          <Row
            icon="star-outline"
            iconColor={colors.warning}
            label="Rate Habit Guru"
            onPress={() => Alert.alert('Thank you!', 'App Store rating coming soon.')}
            colors={colors}
          />
          <Divider colors={colors} />
          <Row
            icon="document-text-outline"
            iconColor={colors.textSecondary}
            label="Privacy Policy"
            onPress={() => {}}
            colors={colors}
          />
          <Divider colors={colors} />
          <Row
            icon="information-circle-outline"
            iconColor={colors.textSecondary}
            label="Version"
            sublabel="1.0.0 (MVP)"
            colors={colors}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 48 },
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8 },
  overline: { fontSize: 14, fontWeight: '500' },
  title: { fontSize: 26, fontWeight: '700', marginTop: 2 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginHorizontal: 24,
    marginTop: 28,
    marginBottom: 8,
  },
  card: {
    marginHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '500' },
  rowSublabel: { fontSize: 12, marginTop: 1 },
  divider: { height: 1, marginHorizontal: 16 },
  premiumCard: {
    marginHorizontal: 24,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumLeft: { flex: 1 },
  premiumTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  premiumSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  upgradePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  upgradePillText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
});
