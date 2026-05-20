import Ionicons from '@expo/vector-icons/Ionicons';
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
import { palette, spacing } from '@/src/theme/tokens';

const logo = require('@/assets/images/logo.png');

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error } = useAuth();
  const theme = useResolvedTheme();
  const colors = palette[theme];

  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    password_confirmation: '',
    agree: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  const handleSubmit = async () => {
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      password: form.password,
      password_confirmation: form.password_confirmation,
      agree: Boolean(form.agree),
    };

    console.log('[register] submit payload', payload);

    const success = await register(payload);
    if (success) {
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
            Daftar
          </Text>
          <Text tone="muted" style={styles.centered}>
            Buat akun pelanggan
          </Text>
        </View>

        <Card>
          <View style={styles.form}>
            <Input
              label="Nama Lengkap"
              placeholder="Ferdi Yansyah"
              autoCapitalize="words"
              value={form.name}
              onChangeText={(name) => setForm((f) => ({ ...f, name }))}
            />
            <Input
              label="Nomor Telepon"
              placeholder="08xxxxxxxxxx"
              keyboardType="phone-pad"
              autoCapitalize="none"
              value={form.phone}
              onChangeText={(phone) => setForm((f) => ({ ...f, phone }))}
            />
            <Input
              label="Password"
              placeholder="••••••••"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!showPassword}
              value={form.password}
              onChangeText={(password) => setForm((f) => ({ ...f, password }))}
              rightElement={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword ? 'Sembunyikan password' : 'Tampilkan password'
                  }
                  hitSlop={8}
                  onPress={() => setShowPassword((value) => !value)}
                  style={styles.visibilityButton}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={colors.muted}
                  />
                </Pressable>
              }
            />
            <Input
              label="Konfirmasi Password"
              placeholder="••••••••"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!showPasswordConfirmation}
              value={form.password_confirmation}
              onChangeText={(password_confirmation) =>
                setForm((f) => ({ ...f, password_confirmation }))
              }
              rightElement={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPasswordConfirmation
                      ? 'Sembunyikan konfirmasi password'
                      : 'Tampilkan konfirmasi password'
                  }
                  hitSlop={8}
                  onPress={() => setShowPasswordConfirmation((value) => !value)}
                  style={styles.visibilityButton}
                >
                  <Ionicons
                    name={showPasswordConfirmation ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={colors.muted}
                  />
                </Pressable>
              }
            />

            <View style={styles.checkboxRow}>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: form.agree }}
                onPress={() => setForm((f) => ({ ...f, agree: !f.agree }))}
                style={[
                  styles.checkbox,
                  {
                    borderColor: colors.border,
                    backgroundColor: form.agree ? colors.primary : 'transparent',
                  },
                ]}
              >
                {form.agree && (
                  <Text style={{ color: '#fff', fontSize: 12, lineHeight: 16 }}>
                    ✓
                  </Text>
                )}
              </Pressable>

              <View style={styles.agreementCopy}>
                <Text tone="muted">Saya setuju dengan </Text>
                <Pressable onPress={() => router.push('/(auth)/terms')}>
                  <Text style={{ color: colors.primary, fontWeight: '700' }}>
                    Syarat & Ketentuan
                  </Text>
                </Pressable>
                <Text tone="muted"> dan </Text>
                <Pressable onPress={() => router.push('/(auth)/privacy')}>
                  <Text style={{ color: colors.primary, fontWeight: '700' }}>
                    Kebijakan Privasi
                  </Text>
                </Pressable>
              </View>
            </View>

            {error ? <Text tone="danger">{error}</Text> : null}

            <Button
              label={isLoading ? 'Memuat...' : 'Daftar'}
              onPress={handleSubmit}
              disabled={isLoading || !form.agree}
            />
          </View>
        </Card>

        <View style={styles.footer}>
          <Text tone="muted">Sudah punya akun? </Text>
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>Masuk</Text>
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
  },
  header: { alignItems: 'center', gap: spacing.sm },
  logo: { width: 80, height: 80, marginBottom: spacing.sm },
  centered: { textAlign: 'center' },
  form: { gap: spacing.md },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  agreementCopy: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  visibilityButton: {
    paddingVertical: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
