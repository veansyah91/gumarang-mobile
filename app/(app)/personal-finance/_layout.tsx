import { PersonalFinanceHeader } from '@/src/components/ui/personal-finance-header';
import { Stack } from 'expo-router';

export default function PersonalFinanceLayout() {
  return (
    <Stack
      screenOptions={{
        header: () => <PersonalFinanceHeader />,
        headerShadowVisible: false,
      }}
    >
      {/* Child screens will be the files inside this folder (index.tsx, coa.tsx, ...). */}
      <Stack.Screen name="index" />
      <Stack.Screen name="coa" />
    </Stack>
  );
}
