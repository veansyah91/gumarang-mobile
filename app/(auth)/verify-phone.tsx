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
import { useAuth } from '@/src/hooks/use-auth';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { authApi } from '@/src/services/api/auth';
import { palette, spacing } from '@/src/theme/tokens';
import { toAppError } from '@/src/utils/errors';

const logo = require('@/assets/images/logo.png');

export default function VerifyPhoneScreen() {
  const router = useRouter();
  const { verifyPhone, pendingPhone, isLoading, error } = useAuth();
  const theme = useResolvedTheme();
  const colors = palette[theme];

  const [otp, setOtp] = useState('');
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);

  const handleSubmit = async () => {
    if (!pendingPhone) return;
    const success = await verifyPhone({ phone: pendingPhone, otp });
    if (success) {
      router.replace('/(app)/(tabs)');
    }
  };

  const handleResend = async () => {
    if (!pendingPhone) return;
    setResendLoading(true);
    setResendMessage(null);
    try {
      await authApi.resendOtp(pendingPhone);
      setResendMessage('Kode baru telah dikirim via WhatsApp.');
    } catch (err) {
      const appError = toAppError(err);
      setResendMessage(appError.userMessage);
    } finally {
      setResendLoading(false);
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
            Verifikasi Telepon
          </Text>
          <Text tone="muted" style={styles.centered}>
            Masukkan kode OTP 6 digit yang dikirim via WhatsApp
            {pendingPhone ? ` ke ${pendingPhone}` : ''}.
          </Text>
        </View>

        <Card>
          <View style={styles.form}>
            <Input
              label="Kode OTP"
              placeholder="______"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
            />
            {error ? <Text tone="danger">{error}</Text> : null}
            {resendMessage ? (
              <Text
                tone={resendMessage.includes('dikirim') ? 'success' : 'danger'}
              >
                {resendMessage}
              </Text>
            ) : null}
            <Button
              label={isLoading ? 'Memverifikasi...' : 'Verifikasi'}
              onPress={handleSubmit}
              disabled={isLoading || otp.length < 6}
            />
          </View>

          <View style={styles.resend}>
            <Text tone="muted">Tidak menerima kode? </Text>
            <Pressable onPress={handleResend} disabled={resendLoading}>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>
                {resendLoading ? 'Mengirim...' : 'Kirim Ulang'}
              </Text>
            </Pressable>
          </View>
        </Card>
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
  resend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
});
