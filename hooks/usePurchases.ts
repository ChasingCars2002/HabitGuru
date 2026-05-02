import { useState, useEffect, useCallback } from 'react';
import {
  PURCHASES_AVAILABLE,
  checkEntitlement,
  fetchCurrentOffering,
  purchasePackage,
  restorePurchases,
  type Offering,
  type OfferingPackage,
} from '@/lib/purchases';
import { useHabitStore } from '@/store/habitStore';
import { updateProfile } from '@/lib/firestore';
import { useAuthStore } from '@/store/authStore';

export type PurchaseState = 'idle' | 'loading' | 'purchasing' | 'restoring' | 'success' | 'error';

export function usePurchases() {
  const { setIsPremium } = useHabitStore();
  const { user } = useAuthStore();

  const [state, setState] = useState<PurchaseState>('idle');
  const [offering, setOffering] = useState<Offering | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!PURCHASES_AVAILABLE) return;
    setState('loading');
    fetchCurrentOffering()
      .then((o) => {
        setOffering(o);
        setState('idle');
      })
      .catch(() => setState('idle'));
  }, []);

  const grantPremium = useCallback(async () => {
    setIsPremium(true);
    if (user?.uid) {
      await updateProfile(user.uid, true).catch(() => {});
    }
  }, [user?.uid]);

  const purchase = useCallback(
    async (pkg: OfferingPackage) => {
      setErrorMessage(null);
      setState('purchasing');
      try {
        const granted = await purchasePackage(pkg);
        if (granted) {
          await grantPremium();
          setState('success');
          return true;
        }
        setState('idle');
        return false;
      } catch (err: any) {
        setErrorMessage(err?.message ?? 'Purchase failed. Please try again.');
        setState('error');
        return false;
      }
    },
    [grantPremium]
  );

  const restore = useCallback(async () => {
    setErrorMessage(null);
    setState('restoring');
    try {
      const granted = await restorePurchases();
      if (granted) {
        await grantPremium();
        setState('success');
        return true;
      }
      setErrorMessage('No previous purchases found.');
      setState('error');
      return false;
    } catch {
      setErrorMessage('Restore failed. Please try again.');
      setState('error');
      return false;
    }
  }, [grantPremium]);

  // Find monthly and annual packages from the current offering
  const monthlyPkg = offering?.availablePackages.find(
    (p) => p.packageType === 'MONTHLY' || p.identifier.includes('monthly')
  ) ?? null;

  const annualPkg = offering?.availablePackages.find(
    (p) => p.packageType === 'ANNUAL' || p.identifier.includes('annual')
  ) ?? null;

  return {
    state,
    offering,
    monthlyPkg,
    annualPkg,
    errorMessage,
    purchase,
    restore,
    isLoading: state === 'loading' || state === 'purchasing' || state === 'restoring',
  };
}
