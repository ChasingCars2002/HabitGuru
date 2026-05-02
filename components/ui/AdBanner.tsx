import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import {
  ADS_AVAILABLE,
  AD_UNIT_BANNER,
  BannerAd,
  BannerAdSize,
  AdEventType,
} from '@/lib/ads';
import { Colors } from '@/constants';

interface AdBannerProps {
  /** When true the banner is hidden (Premium users) */
  hidden?: boolean;
}

export function AdBanner({ hidden }: AdBannerProps) {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? Colors.dark : Colors.light;

  if (hidden) return null;

  // Real native banner — only available in a custom dev client / production build
  if (ADS_AVAILABLE && AD_UNIT_BANNER) {
    return (
      <View style={styles.wrapper}>
        <BannerAd
          unitId={AD_UNIT_BANNER}
          size={BannerAdSize.BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        />
      </View>
    );
  }

  // Fallback: visible placeholder for Expo Go / simulator
  return (
    <View
      style={[
        styles.placeholder,
        { backgroundColor: colors.elevated, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.placeholderText, { color: colors.textMuted }]}>
        📣 Ad — upgrade to Guru Pro to remove
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 16,
  },
  placeholder: {
    marginHorizontal: 24,
    marginTop: 16,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  placeholderText: { fontSize: 12 },
});
