import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants';
import { signUpWithEmail, signInWithEmail } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';

type Mode = 'signin' | 'signup';

export default function AuthModal() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? Colors.dark : Colors.light;
  const { user } = useAuthStore();

  const [mode, setMode] = useState<Mode>(user?.isAnonymous ? 'signup' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLinking = user?.isAnonymous === true && mode === 'signup';

  async function handleSubmit() {
    setError(null);
    const emailTrimmed = email.trim().toLowerCase();

    if (!emailTrimmed || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      if (mode === 'signup') {
        await signUpWithEmail(emailTrimmed, password, displayName.trim() || undefined);
      } else {
        await signInWithEmail(emailTrimmed, password);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(friendlyError(err.code));
    } finally {
      setIsLoading(false);
    }
  }

  function toggleMode() {
    setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
    setError(null);
    Haptics.selectionAsync();
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            {mode === 'signup'
              ? isLinking
                ? 'Save Your Progress'
                : 'Create Account'
              : 'Sign In'}
          </Text>
          <View style={styles.closeBtn} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={styles.hero}>
            <View
              style={[styles.heroBubble, { backgroundColor: `${colors.primary}20` }]}
            >
              <Ionicons
                name={mode === 'signup' ? 'person-add-outline' : 'log-in-outline'}
                size={40}
                color={colors.primary}
              />
            </View>
            <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>
              {mode === 'signup'
                ? isLinking
                  ? 'Back up your habits'
                  : 'Start your journey'
                : 'Welcome back'}
            </Text>
            <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
              {isLinking
                ? 'Create a free account to sync your habits across all your devices.'
                : mode === 'signup'
                ? 'Free forever. No credit card required.'
                : 'Sign in to access your habits on any device.'}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {mode === 'signup' && (
              <Field
                label="Display Name (optional)"
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="e.g. Alex"
                autoCapitalize="words"
                colors={colors}
              />
            )}

            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              colors={colors}
            />

            <View>
              <Text
                style={[styles.fieldLabel, { color: colors.textSecondary }]}
              >
                Password
              </Text>
              <View
                style={[
                  styles.passwordWrap,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  style={[styles.passwordInput, { color: colors.textPrimary }]}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Error */}
            {error && (
              <View
                style={[
                  styles.errorBox,
                  {
                    backgroundColor: `${colors.accent}15`,
                    borderColor: `${colors.accent}40`,
                  },
                ]}
              >
                <Ionicons name="alert-circle-outline" size={16} color={colors.accent} />
                <Text style={[styles.errorText, { color: colors.accent }]}>
                  {error}
                </Text>
              </View>
            )}

            {/* Submit */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.85}
              style={[
                styles.submitBtn,
                { backgroundColor: isLoading ? colors.elevated : colors.primary },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {mode === 'signup'
                    ? isLinking
                      ? 'Save & Back Up'
                      : 'Create Account'
                    : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Toggle mode */}
            <TouchableOpacity onPress={toggleMode} style={styles.toggleBtn}>
              <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
                {mode === 'signup'
                  ? 'Already have an account? '
                  : "Don't have an account? "}
                <Text style={[styles.toggleLink, { color: colors.primary }]}>
                  {mode === 'signup' ? 'Sign In' : 'Sign Up'}
                </Text>
              </Text>
            </TouchableOpacity>

            {/* Skip / continue anonymously */}
            {!isLinking && (
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.skipBtn}
              >
                <Text style={[styles.skipText, { color: colors.textMuted }]}>
                  Continue without account
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: React.ComponentProps<typeof TextInput>['keyboardType'];
  autoCapitalize?: React.ComponentProps<typeof TextInput>['autoCapitalize'];
  autoComplete?: React.ComponentProps<typeof TextInput>['autoComplete'];
  colors: typeof Colors.dark;
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  autoComplete,
  colors,
}: FieldProps) {
  return (
    <View>
      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        style={[
          styles.textInput,
          {
            color: colors.textPrimary,
            backgroundColor: colors.card,
            borderColor: value.length > 0 ? colors.primary : colors.border,
          },
        ]}
      />
    </View>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function friendlyError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'That email is already registered. Try signing in.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/user-not-found':
      return 'No account found for that email.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/credential-already-in-use':
      return 'This email is linked to another account.';
    case 'auth/network-request-failed':
      return 'No internet connection. Try again later.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  closeBtn: { width: 40, alignItems: 'flex-start' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  scroll: { padding: 24, paddingBottom: 48 },
  hero: { alignItems: 'center', marginBottom: 36 },
  heroBubble: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heroTitle: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
  heroSub: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    maxWidth: 280,
  },
  form: { gap: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  textInput: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    borderWidth: 1.5,
  },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 16,
  },
  passwordInput: { flex: 1, fontSize: 16, paddingVertical: 13 },
  eyeBtn: { padding: 4 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  errorText: { flex: 1, fontSize: 13, fontWeight: '500' },
  submitBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  toggleBtn: { alignItems: 'center', paddingVertical: 4 },
  toggleText: { fontSize: 14 },
  toggleLink: { fontWeight: '700' },
  skipBtn: { alignItems: 'center', paddingVertical: 8 },
  skipText: { fontSize: 13 },
});
