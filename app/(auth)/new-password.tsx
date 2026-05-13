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

export default function NewPasswordScreen() {
  const router = useRouter();
  const theme = useResolvedTheme();
  const colors = palette[theme];

  const [form, setForm] = useState({
    phone: '',
    password: '',
    password_confirmation: '',
    token: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await authApi.resetPassword(form);
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
            Password Baru
          </Text>
          <Text tone="muted" style={styles.centered}>
            Masukkan nomor handphone dan token, kemudian buat password baru.
          </Text>
        </View>

        <Card>
          <View style={styles.form}>
            {success ? (
              <>
                <Text tone="success">
                  Password berhasil diubah. Silakan masuk dengan password baru
                  Anda.
                </Text>
                <Button
                  label="Ke Halaman Login"
                  onPress={() => router.replace('/(auth)/login')}
                />
              </>
            ) : (
              <>
                <Input
                  label="No. Handphone"
                  placeholder="628xxx"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  value={form.phone}
                  onChangeText={(phone) => setForm((f) => ({ ...f, phone }))}
                />
                <Input
                  label="Sandi"
                  placeholder="••••••••"
                  secureTextEntry
                  value={form.password}
                  onChangeText={(password) =>
                    setForm((f) => ({ ...f, password }))
                  }
                />
                <Input
                  label="Konfirmasi Sandi"
                  placeholder="••••••••"
                  secureTextEntry
                  value={form.password_confirmation}
                  onChangeText={(password_confirmation) =>
                    setForm((f) => ({ ...f, password_confirmation }))
                  }
                />
                <Input
                  label="Token"
                  placeholder="Token dari WhatsApp"
                  autoCapitalize="none"
                  value={form.token}
                  onChangeText={(token) => setForm((f) => ({ ...f, token }))}
                />
                {error ? <Text tone="danger">{error}</Text> : null}
                <Button
                  label={loading ? 'Menyimpan...' : 'Simpan Password Baru'}
                  onPress={handleSubmit}
                  disabled={loading}
                />
              </>
            )}
          </View>
        </Card>

        {!success && (
          <View style={styles.footer}>
            <Pressable
              onPress={() =>
                router.canGoBack()
                  ? router.back()
                  : router.replace('/(auth)/forgot-password')
              }
            >
              <Text style={{ color: colors.primary, fontWeight: '700' }}>
                ← Kembali
              </Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: spacing.lg },
  content: { flexGrow: 1, justifyContent: 'center', paddingVertical: spacing.xl },
  header: { alignItems: 'center', gap: spacing.sm },
  logo: { width: 80, height: 80, marginBottom: spacing.sm },
  centered: { textAlign: 'center' },
  form: { gap: spacing.md },
  footer: { alignItems: 'center' },
});
