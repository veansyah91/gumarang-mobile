import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Screen } from '@/src/components/ui/screen';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { authApi } from '@/src/services/api/auth';
import { palette, spacing } from '@/src/theme/tokens';
import { AppError } from '@/src/utils/errors';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old_password: false,
    new_password: false,
    new_password_confirmation: false,
  });
  const [form, setForm] = useState({
    old_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const PasswordVisibilityButton = ({
    field,
  }: {
    field: keyof typeof showPasswords;
  }) => (
    <Pressable
      onPress={() => togglePasswordVisibility(field)}
      style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
    >
      <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '500' }}>
        {showPasswords[field] ? 'Sembunyikan' : 'Tampilkan'}
      </Text>
    </Pressable>
  );

  const handleSubmit = async () => {
    if (
      !form.old_password ||
      !form.new_password ||
      !form.new_password_confirmation
    ) {
      Alert.alert('Error', 'Semua field harus diisi.');
      return;
    }

    if (form.new_password !== form.new_password_confirmation) {
      Alert.alert('Error', 'Konfirmasi password baru tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      await authApi.updatePassword(form);
      Alert.alert('Sukses', 'Password berhasil diperbarui.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      const message =
        error instanceof AppError
          ? error.userMessage
          : 'Terjadi kesalahan saat mengubah password.';
      Alert.alert('Gagal', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen
      contentContainerStyle={styles.content}
      scrollable
      safeAreaEdges={['bottom', 'left', 'right']}
    >
      <View style={styles.form}>
        <Input
          label="Password Lama"
          placeholder="Masukkan password saat ini"
          secureTextEntry={!showPasswords.old_password}
          value={form.old_password}
          onChangeText={(val) => handleChange('old_password', val)}
          rightElement={<PasswordVisibilityButton field="old_password" />}
        />
        <Input
          label="Password Baru"
          placeholder="Masukkan password baru"
          secureTextEntry={!showPasswords.new_password}
          value={form.new_password}
          onChangeText={(val) => handleChange('new_password', val)}
          rightElement={<PasswordVisibilityButton field="new_password" />}
        />
        <Input
          label="Konfirmasi Password Baru"
          placeholder="Ulangi password baru"
          secureTextEntry={!showPasswords.new_password_confirmation}
          value={form.new_password_confirmation}
          onChangeText={(val) => handleChange('new_password_confirmation', val)}
          rightElement={
            <PasswordVisibilityButton field="new_password_confirmation" />
          }
        />

        <View style={styles.actions}>
          <Button
            label="Simpan Perubahan"
            onPress={handleSubmit}
            disabled={loading}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  form: {
    gap: spacing.lg,
  },
  actions: {
    marginTop: spacing.md,
  },
});
