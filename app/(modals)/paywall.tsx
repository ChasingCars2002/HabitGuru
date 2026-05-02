import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  FadeInUp,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants';
import { usePurchases, type PurchaseState } from '@/hooks/usePurchases';
import { useHabitStore } from '@/store/habitStore';
import { PURCHASES_AVAILABLE, type OfferingPackage } from '@/lib/purchases';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Feature list ─────────────────────────────────────────────────────────

const FEATURES = [
  { icon: '♾️', label: 'Unlimited habits', sublabel: 'Track as many as you want' },
  { icon: '🚫', label: 'Zero ads, forever', sublabel: 'Clean, distraction-free experience' },
  { icon: '📊', label: 'Advanced analytics', sublabel: 'Deep insights into your patterns' },
  { icon: '☁️', label: 'Cloud sync', sublabel: 'Access your habits on any device' },
  { icon: '🎨', label: 'Custom themes', sublabel: 'Personalize your experience' },
];

// Fallback pricing shown when RevenueCat is unavailable (Expo Go / no config)
const MOCK_MONTHLY = { identifier: 'mock_monthly', packageType: 'MONTHLY', product: { identifier: 'guru_pro_monthly', title: 'Monthly', description: '', priceString: '$4.99/mo', price: 4.99, currencyCode: 'USD', introPrice: null } } as OfferingPackage;
const MOCK_ANNUAL  = { identifier: 'mock_annual',  packageType: 'ANNUAL',  product: { identifier: 'guru_pro_annual',  title: 'Annual',  description: '', priceString: '$34.99/yr', price: 34.99, currencyCode: 'USD', introPrice: { priceString: 'Free for 7 days', period: 'P7D' } } } as OfferingPackage;

// ─── Screen ───────────────────────────────────────────────────────────────

export default function PaywallScreen() {
  const isPremium = useHabitStore((s) => s.isPremium);
  const { state, monthlyPkg, annualPkg, errorMessage, purchase, restore, isLoading } =
    usePurchases();

  const monthly = monthlyPkg ?? MOCK_MONTHLY;
  const annual   = annualPkg  ?? MOCK_ANNUAL;

  const [selected, setSelected] = useState<'annual' | 'monthly'>('annual');

  // If the user somehow already has premium, close immediately
  useEffect(() => {
    if (isPremium) router.back();
  }, [isPremium]);

  async function handlePurchase() {
    const pkg = selected === 'annual' ? annual : monthly;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!PURCHASES_AVAILABLE) {
      Alert.alert(
        'Purchases unavailable',
        'In-app purchases require a custom development build. Add your RevenueCat API key and build with EAS to enable purchases.',
        [{ text: 'OK' }]
      );
      return;
    }

    const success = await purchase(pkg);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Welcome to Guru Pro! ✨', 'Enjoy unlimited habits and zero ads.', [
        { text: 'Let's go!', onPress: () => router.back() },
      ]);
    }
  }

  async function handleRestore() {
    Haptics.selectionAsync();
    const success = await restore();
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Restored!', 'Your Guru Pro subscription has been restored.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else if (state === 'error' && errorMessage) {
      Alert.alert('Restore failed', errorMessage);
    }
  }

  // Savings calc
  const annualMonthlyEquiv = annual.product.price / 12;
  const savingsPct = monthly.product.price > 0
    ? Math.round((1 - annualMonthlyEquiv / monthly.product.price) * 100)
    : 42;

  return (
    <View style={styles.root}>
      {/* ─── Dark gradient hero ─── */}
      <View style={styles.hero}>
        <SafeAreaView>
          <View style={styles.heroContent}>
            {/* Close */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.closeBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>

            {/* Icon + title */}
            <Animated.View entering={FadeInUp.delay(80).springify()} style={styles.heroIcon}>
              <Text style={styles.heroEmoji}>🎯</Text>
            </Animated.View>

            <Animated.Text entering={FadeInUp.delay(150).springify()} style={styles.heroTitle}>
              Guru Pro
            </Animated.Text>
            <Animated.Text entering={FadeInUp.delay(200).springify()} style={styles.heroSub}>
              Unlock your full potential
            </Animated.Text>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Feature list ─── */}
        <View style={styles.featureList}>
          {FEATURES.map((f, i) => (
            <Animated.View
              key={f.label}
              entering={FadeInUp.delay(80 + i * 60).springify()}
              style={styles.featureRow}
            >
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <View style={styles.featureInfo}>
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Text style={styles.featureSub}>{f.sublabel}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color="#7C6FCD" />
            </Animated.View>
          ))}
        </View>

        {/* ─── Price selector ─── */}
        <Animated.View entering={FadeInUp.delay(440).springify()} style={styles.priceSection}>
          {/* Annual */}
          <PricePill
            label="Annual"
            price={annual.product.priceString}
            badge={`Save ${savingsPct}%`}
            note={annual.product.introPrice?.priceString ?? `$${(annual.product.price / 12).toFixed(2)}/mo`}
            selected={selected === 'annual'}
            onPress={() => {
              setSelected('annual');
              Haptics.selectionAsync();
            }}
          />

          {/* Monthly */}
          <PricePill
            label="Monthly"
            price={monthly.product.priceString}
            selected={selected === 'monthly'}
            onPress={() => {
              setSelected('monthly');
              Haptics.selectionAsync();
            }}
          />
        </Animated.View>

        {/* ─── Error ─── */}
        {state === 'error' && errorMessage && (
          <Animated.View entering={FadeInUp.springify()} style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color="#FF6B6B" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </Animated.View>
        )}

        {/* ─── CTA ─── */}
        <Animated.View entering={FadeInUp.delay(500).springify()}>
          <TouchableOpacity
            onPress={handlePurchase}
            disabled={isLoading}
            activeOpacity={0.88}
            style={[styles.ctaBtn, isLoading && styles.ctaBtnDisabled]}
          >
            {isLoading && state === 'purchasing' ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.ctaText}>
                  {annual.product.introPrice && selected === 'annual'
                    ? `Start Free Trial ✨`
                    : `Get Guru Pro`}
                </Text>
                {annual.product.introPrice && selected === 'annual' && (
                  <Text style={styles.ctaSub}>
                    {annual.product.introPrice.priceString} · then {annual.product.priceString}
                  </Text>
                )}
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* ─── Restore ─── */}
        <TouchableOpacity onPress={handleRestore} disabled={isLoading} style={styles.restoreBtn}>
          {isLoading && state === 'restoring' ? (
            <ActivityIndicator size="small" color="#9A9A9A" />
          ) : (
            <Text style={styles.restoreText}>Restore Purchases</Text>
          )}
        </TouchableOpacity>

        {/* ─── Fine print ─── */}
        <Text style={styles.finePrint}>
          Payment will be charged to your App Store account at confirmation.
          Subscription automatically renews unless auto-renew is turned off at
          least 24 hours before the end of the current period. You can manage
          and cancel subscriptions in your Account Settings.
        </Text>

        <View style={styles.legalRow}>
          <TouchableOpacity>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.legalSep}>·</Text>
          <TouchableOpacity>
            <Text style={styles.legalLink}>Terms of Use</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Price Pill ───────────────────────────────────────────────────────────

interface PricePillProps {
  label: string;
  price: string;
  badge?: string;
  note?: string;
  selected: boolean;
  onPress: () => void;
}

function PricePill({ label, price, badge, note, selected, onPress }: PricePillProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.pricePill,
        selected && styles.pricePillSelected,
      ]}
    >
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <View style={styles.pricePillLeft}>
        <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
          {selected && <View style={styles.radioInner} />}
        </View>
        <View>
          <Text style={[styles.pillLabel, selected && styles.pillLabelSelected]}>
            {label}
          </Text>
          {note && (
            <Text style={styles.pillNote}>{note}</Text>
          )}
        </View>
      </View>
      <Text style={[styles.pillPrice, selected && styles.pillPriceSelected]}>
        {price}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },

  // Hero section (always dark, regardless of system scheme)
  hero: {
    backgroundColor: '#141420',
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroContent: {
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 24,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroIcon: {
    width: 84,
    height: 84,
    borderRadius: 26,
    backgroundColor: 'rgba(124,111,205,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(124,111,205,0.4)',
  },
  heroEmoji: { fontSize: 44 },
  heroTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#F5F5F5',
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 6,
    marginBottom: 4,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 48 },

  // Features
  featureList: {
    marginBottom: 28,
    gap: 0,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2A2A2A',
  },
  featureIcon: { fontSize: 22, width: 36 },
  featureInfo: { flex: 1, marginLeft: 4 },
  featureLabel: { fontSize: 15, fontWeight: '600', color: '#F5F5F5' },
  featureSub: { fontSize: 12, color: '#9A9A9A', marginTop: 1 },

  // Price section
  priceSection: {
    gap: 10,
    marginBottom: 20,
  },
  pricePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#2E2E2E',
    position: 'relative',
    overflow: 'hidden',
  },
  pricePillSelected: {
    borderColor: '#7C6FCD',
    backgroundColor: '#1A1730',
  },
  pricePillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#5A5A5A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: { borderColor: '#7C6FCD' },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#7C6FCD',
  },
  pillLabel: { fontSize: 16, fontWeight: '700', color: '#9A9A9A' },
  pillLabelSelected: { color: '#F5F5F5' },
  pillNote: { fontSize: 12, color: '#5A5A5A', marginTop: 2 },
  pillPrice: { fontSize: 16, fontWeight: '700', color: '#9A9A9A' },
  pillPriceSelected: { color: '#F5F5F5' },
  badge: {
    position: 'absolute',
    top: -1,
    right: 14,
    backgroundColor: '#7C6FCD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  badgeText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3 },

  // Error
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,107,107,0.12)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
  },
  errorText: { flex: 1, fontSize: 13, color: '#FF6B6B', fontWeight: '500' },

  // CTA
  ctaBtn: {
    backgroundColor: '#7C6FCD',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#7C6FCD',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  ctaBtnDisabled: { opacity: 0.6 },
  ctaText: { fontSize: 17, fontWeight: '800', color: '#FFFFFF' },
  ctaSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 3 },

  // Restore
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: 16,
    minHeight: 48,
    justifyContent: 'center',
  },
  restoreText: { fontSize: 14, color: '#9A9A9A', fontWeight: '500' },

  // Fine print
  finePrint: {
    fontSize: 10,
    color: '#5A5A5A',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 12,
  },
  legalRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  legalLink: { fontSize: 11, color: '#9A9A9A', textDecorationLine: 'underline' },
  legalSep: { fontSize: 11, color: '#5A5A5A' },
});
