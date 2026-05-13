import { useRouter } from 'expo-router';
import { useState } from 'react';
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
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { authApi } from '@/src/services/api/auth';
import { palette, spacing } from '@/src/theme/tokens';
import { toAppError } from '@/src/utils/errors';

const logo = require('@/assets/images/logo.png');

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const theme = useResolvedTheme();
  const colors = palette[theme];

  const [payload, setPayload] = useState({ phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await authApi.forgotPassword(payload);
      setSuccess(true);
    } catch (err) {
      const appError = toAppError(err);
      setError(appError.userMessage);
    } finally {
      setLoading(false);
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
            Lupa sandi
          </Text>
          <Text tone="muted" style={styles.centered}>
            Masukkan nomor handphone
          </Text>
        </View>

        <Card>
          <View style={styles.form}>
            {success ? (
              <>
                <Text tone="success">
                  Link reset password telah dikirim ke nomor handphone Anda via
                  WhatsApp.
                </Text>
                <Text tone="muted">
                  Jika tidak menerima dalam beberapa menit, pastikan nomor yang
                  dimasukkan benar dan cek kembali WhatsApp Anda. Jika masih
                  mengalami masalah, silakan hubungi layanan pelanggan kami.
                </Text>
                <Button
                  label="Masukkan Token Reset"
                  onPress={() => router.push('/(auth)/new-password')}
                  variant="secondary"
                />
              </>
            ) : (
              <>
                <Input
                  label="No. Handphone"
                  placeholder="628xxx"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  value={payload.phone}
                  onChangeText={(phone) => setPayload((p) => ({ ...p, phone }))}
                />
                {error ? <Text tone="danger">{error}</Text> : null}
                <Button
                  label={loading ? 'Mengirim...' : 'Kirim Link Reset'}
                  onPress={handleSubmit}
                  disabled={loading || !payload.phone}
                />
              </>
            )}
          </View>
        </Card>

        <View style={styles.footer}>
          <Pressable
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace('/(auth)/login')
            }
          >
            <Text style={{ color: colors.primary, fontWeight: '700' }}>
              ← Kembali ke Login
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
  },
  header: { alignItems: 'center', gap: spacing.sm },
  logo: { width: 80, height: 80, marginBottom: spacing.sm },
  centered: { textAlign: 'center' },
  form: { gap: spacing.md },
  footer: { alignItems: 'center' },
});
