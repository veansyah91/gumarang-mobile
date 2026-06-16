import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';

import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Screen } from '@/src/components/ui/screen';
import { Text } from '@/src/components/ui/text';
import { useAuth } from '@/src/hooks/use-auth';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, spacing } from '@/src/theme/tokens';

const logo = require('@/assets/images/logo.png');

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const [credentials, setCredentials] = useState({ phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [displayError, setDisplayError] = useState<string | null>(null);

  useEffect(() => {
    setDisplayError(error);
  }, [error]);

  const handlePhoneChange = (phone: string) => {
    setCredentials((c) => ({ ...c, phone }));
    setDisplayError(null);
  };

  const handlePasswordChange = (password: string) => {
    setCredentials((c) => ({ ...c, password }));
    setDisplayError(null);
  };

  const handleSubmit = async () => {
    const result = await login(credentials);
    if (result === true) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(app)/(tabs)');
      }
    } else if (result === 'unverified') {
      router.push('/(auth)/verify-phone');
    }
  };

  return (
    <Screen contentContainerStyle={styles.content} scrollable>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', default: undefined })}
        style={styles.flex}
      >
        <View style={styles.header}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text variant="eyebrow" style={styles.centered}>
            Toko Mas Gumarang
          </Text>
          <Text variant="title" style={styles.centered}>
            Masuk
          </Text>
        </View>

        <Card>
          <View style={styles.form}>
            <Input
              label="No. Handphone"
              placeholder="628xxx"
              keyboardType="phone-pad"
              autoCapitalize="none"
              value={credentials.phone}
              onChangeText={handlePhoneChange}
            />

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text variant="eyebrow">Sandi</Text>
                <Pressable
                  onPress={() => router.push('/(auth)/forgot-password')}
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontSize: 11,
                      fontWeight: '600',
                    }}
                  >
                    Lupa Sandi?
                  </Text>
                </Pressable>
              </View>
              <Input
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                value={credentials.password}
                onChangeText={handlePasswordChange}
                rightElement={
                  <Pressable onPress={() => setShowPassword((v) => !v)}>
                    <Text tone="muted" style={{ fontSize: 12 }}>
                      {showPassword ? 'Tutup' : 'Lihat'}
                    </Text>
                  </Pressable>
                }
              />
            </View>

            {displayError ? <Text tone="danger">{displayError}</Text> : null}

            <Button
              label={isLoading ? 'Memuat...' : 'Masuk'}
              onPress={handleSubmit}
              disabled={isLoading}
            />
          </View>
        </Card>

        <View style={styles.footer}>
          <Text tone="muted">Belum punya akun? </Text>
          <Pressable onPress={() => router.push('/(auth)/register')}>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>
              Daftar
            </Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Pressable onPress={() => router.push('/(app)/(tabs)')}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>
              ← Kembali ke Home
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: spacing.lg },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingTop: 48,
  },
  header: { alignItems: 'center', gap: spacing.sm },
  logo: { width: 120, height: 120, marginBottom: spacing.sm },
  centered: { textAlign: 'center' },
  form: { gap: spacing.md },
  fieldGroup: { gap: spacing.xs },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
