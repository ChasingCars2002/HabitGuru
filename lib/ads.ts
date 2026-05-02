import { Platform } from 'react-native';

// Dynamic require so the JS bundle never hard-crashes in Expo Go
// where the native module doesn't exist.
let mobileAds: any = null;
let BannerAdSize: any = null;
let BannerAd: any = null;
let InterstitialAd: any = null;
let AdEventType: any = null;
let TestIds: any = null;

try {
  const mod = require('react-native-google-mobile-ads');
  mobileAds = mod.default ?? mod.mobileAds?.();
  BannerAdSize = mod.BannerAdSize;
  BannerAd = mod.BannerAd;
  InterstitialAd = mod.InterstitialAd;
  AdEventType = mod.AdEventType;
  TestIds = mod.TestIds;
} catch {
  // Expo Go or web — native module unavailable, ads silently disabled
}

export { BannerAdSize, BannerAd, InterstitialAd, AdEventType, TestIds };

export const ADS_AVAILABLE = mobileAds !== null;

// ─── Ad unit IDs ──────────────────────────────────────────────────────────

function adId(iosKey: string, androidKey: string): string {
  return Platform.OS === 'ios'
    ? (process.env[iosKey] ?? '')
    : (process.env[androidKey] ?? '');
}

export const AD_UNIT_BANNER = adId(
  'EXPO_PUBLIC_ADMOB_IOS_BANNER_ID',
  'EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID'
);

export const AD_UNIT_INTERSTITIAL = adId(
  'EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID',
  'EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID'
);

// ─── Initialization ───────────────────────────────────────────────────────

export async function initializeAds(): Promise<void> {
  if (!ADS_AVAILABLE) return;
  try {
    await mobileAds().initialize();
  } catch {
    // Non-fatal — app continues without ads
  }
}
