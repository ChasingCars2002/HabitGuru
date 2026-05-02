import { useEffect, useRef, useCallback } from 'react';
import { ADS_AVAILABLE, AD_UNIT_INTERSTITIAL, InterstitialAd, AdEventType } from '@/lib/ads';

// Minimum gap between interstitial shows (ms) — avoids showing too often
const MIN_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Loads an interstitial ad and exposes a `showIfReady` function.
 * Silently no-ops when the native module is unavailable (Expo Go).
 */
export function useInterstitialAd() {
  const adRef = useRef<any>(null);
  const lastShownAt = useRef<number>(0);
  const isLoaded = useRef(false);

  function loadAd() {
    if (!ADS_AVAILABLE || !AD_UNIT_INTERSTITIAL) return;
    try {
      const ad = InterstitialAd.createForAdRequest(AD_UNIT_INTERSTITIAL, {
        requestNonPersonalizedAdsOnly: false,
      });

      const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
        isLoaded.current = true;
      });

      const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
        isLoaded.current = false;
        loadAd(); // Pre-load the next one immediately after dismissal
      });

      ad.load();
      adRef.current = ad;

      return () => {
        unsubLoaded();
        unsubClosed();
      };
    } catch {
      // Non-fatal
    }
  }

  useEffect(() => {
    const cleanup = loadAd();
    return cleanup;
  }, []);

  const showIfReady = useCallback(() => {
    if (!isLoaded.current || !adRef.current) return;

    const now = Date.now();
    if (now - lastShownAt.current < MIN_INTERVAL_MS) return;

    try {
      adRef.current.show();
      lastShownAt.current = now;
      isLoaded.current = false;
    } catch {
      // Non-fatal
    }
  }, []);

  return { showIfReady };
}
