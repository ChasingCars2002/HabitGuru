import { Platform } from 'react-native';

// Dynamic require for Expo Go safety
let Purchases: any = null;
let LOG_LEVEL: any = null;

try {
  const mod = require('react-native-purchases');
  Purchases = mod.default ?? mod.Purchases;
  LOG_LEVEL = mod.LOG_LEVEL;
} catch {
  // Expo Go / web — native module unavailable
}

export const PURCHASES_AVAILABLE = Purchases !== null;

export const ENTITLEMENT_ID =
  process.env.EXPO_PUBLIC_RC_ENTITLEMENT_ID ?? 'pro';

// ─── Initialization ───────────────────────────────────────────────────────

export async function initializePurchases(): Promise<void> {
  if (!PURCHASES_AVAILABLE) return;

  const apiKey =
    Platform.OS === 'ios'
      ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
      : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

  if (!apiKey) return; // Not configured yet

  try {
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }
    await Purchases.configure({ apiKey });
  } catch {
    // Non-fatal
  }
}

// ─── Entitlement check ────────────────────────────────────────────────────

export async function checkEntitlement(): Promise<boolean> {
  if (!PURCHASES_AVAILABLE) return false;
  try {
    const info = await Purchases.getCustomerInfo();
    return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}

// ─── Offerings ───────────────────────────────────────────────────────────

export interface OfferingPackage {
  identifier: string;
  packageType: string;
  product: {
    identifier: string;
    title: string;
    description: string;
    priceString: string;
    price: number;
    currencyCode: string;
    introPrice: { priceString: string; period: string } | null;
  };
}

export interface Offering {
  identifier: string;
  availablePackages: OfferingPackage[];
}

export async function fetchCurrentOffering(): Promise<Offering | null> {
  if (!PURCHASES_AVAILABLE) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch {
    return null;
  }
}

// ─── Purchase ────────────────────────────────────────────────────────────

export async function purchasePackage(pkg: OfferingPackage): Promise<boolean> {
  if (!PURCHASES_AVAILABLE) return false;
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch (err: any) {
    if (err.userCancelled) return false;
    throw err;
  }
}

// ─── Restore ────────────────────────────────────────────────────────────

export async function restorePurchases(): Promise<boolean> {
  if (!PURCHASES_AVAILABLE) return false;
  try {
    const info = await Purchases.restorePurchases();
    return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}

// ─── Identify user (call after Firebase sign-in) ─────────────────────────

export async function identifyUser(uid: string): Promise<void> {
  if (!PURCHASES_AVAILABLE) return;
  try {
    await Purchases.logIn(uid);
  } catch {
    // Non-fatal
  }
}

export { Purchases };
