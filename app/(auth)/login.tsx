import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Screen } from '@/src/components/ui/screen';
import { Text } from '@/src/components/ui/text';
import { useAuth } from '@/src/hooks/use-auth';
import { useAppStore } from '@/src/state/app-store';
import { spacing } from '@/src/theme/tokens';

const defaultCredentials = {
  email: 'admin@example.com',
  password: 'password',
};

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();
  const apiBaseUrl = useAppStore((state) => state.apiBaseUrl);
  const [credentials, setCredentials] = useState(defaultCredentials);

  const helperText = useMemo(
    () =>
      `API base URL: ${apiBaseUrl}\nUse your Laravel Sanctum credentials. The form will keep working once the backend endpoint is ready.`,
    [apiBaseUrl],
  );

  const handleSubmit = async () => {
    const success = await login(credentials);

    if (success) {
      router.replace('/(app)/(tabs)');
    }
  };

  return (
    <Screen contentContainerStyle={styles.content} scrollable>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', default: undefined })}
        style={styles.flex}
      >
        <View style={styles.header}>
          <Text variant="eyebrow">Laravel + Expo foundation</Text>
          <Text variant="title">Welcome to Gumarang Mobile</Text>
          <Text tone="muted">
            Secure authentication, offline-ready storage, and scalable routing are wired in from the start.
          </Text>
        </View>

        <Card>
          <Text variant="subtitle">Sign in</Text>
          <View style={styles.form}>
            <Input
              autoCapitalize="none"
              keyboardType="email-address"
              label="Email"
              placeholder="you@example.com"
              value={credentials.email}
              onChangeText={(email) => setCredentials((current) => ({ ...current, email }))}
            />
            <Input
              label="Password"
              placeholder="••••••••"
              secureTextEntry
              value={credentials.password}
              onChangeText={(password) => setCredentials((current) => ({ ...current, password }))}
            />
            {error ? <Text tone="danger">{error}</Text> : null}
            <Button label={isLoading ? 'Signing in...' : 'Sign in'} onPress={handleSubmit} disabled={isLoading} />
          </View>
        </Card>

        <Card>
          <Text variant="subtitle">Environment ready</Text>
          <Text tone="muted">{helperText}</Text>
        </Card>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    gap: spacing.lg,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
  form: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
});
