import { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface CelebrationBannerProps {
  visible: boolean;
  colors: { card: string; success: string; border: string; textPrimary: string };
}

export function CelebrationBanner({ visible, colors }: CelebrationBannerProps) {
  const translateY = useSharedValue(-80);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 14, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 300 });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // auto-dismiss
      const timer = setTimeout(() => {
        translateY.value = withDelay(
          2000,
          withTiming(-80, { duration: 400, easing: Easing.in(Easing.cubic) })
        );
        opacity.value = withDelay(2000, withTiming(0, { duration: 400 }));
      }, 0);
      return () => clearTimeout(timer);
    } else {
      translateY.value = withTiming(-80, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);

  const bannerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.banner, bannerStyle, { backgroundColor: colors.success }]}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.text}>Perfect day! All habits complete!</Text>
      <Text style={styles.emoji}>🎉</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    zIndex: 100,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  emoji: {
    fontSize: 20,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
