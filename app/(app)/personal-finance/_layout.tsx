import { PersonalFinanceHeader } from '@/src/components/ui/personal-finance-header';
import { Stack } from 'expo-router';

export default function PersonalFinanceLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          header: () => <PersonalFinanceHeader />,
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen name="dashboard/index" />
      <Stack.Screen name="account/index" />
      <Stack.Screen name="account/[id]/history" />
      <Stack.Screen name="fixed-asset/index" />
      <Stack.Screen name="fixed-asset/[id]" />
      <Stack.Screen name="cash-in/index" />
      <Stack.Screen name="cash-in/create" />
      <Stack.Screen name="cash-in/[id]/edit" />
      <Stack.Screen name="cash-out/index" />
      <Stack.Screen name="cash-out/create" />
      <Stack.Screen name="cash-out/[id]/edit" />
      <Stack.Screen name="contact/index" />
      <Stack.Screen name="contact/create" />
      <Stack.Screen name="contact/[id]/index" />
      <Stack.Screen name="contact/[id]/edit" />
      <Stack.Screen name="debt/payable/index" />
      <Stack.Screen name="debt/payable/create" />
      <Stack.Screen name="debt/payable/[id]/index" />
      <Stack.Screen name="debt/payable/[id]/edit" />
      <Stack.Screen name="debt/payable-entry/index" />
      <Stack.Screen name="debt/payable-entry/create" />
      <Stack.Screen name="debt/payable-entry/[id]/index" />
      <Stack.Screen name="debt/payable-entry/[id]/edit" />
      <Stack.Screen name="debt/receivable/index" />
      <Stack.Screen name="debt/receivable/create" />
      <Stack.Screen name="debt/receivable/[id]/index" />
      <Stack.Screen name="debt/receivable/[id]/edit" />
      <Stack.Screen name="debt/receivable-entry/index" />
      <Stack.Screen name="debt/receivable-entry/create" />
      <Stack.Screen name="debt/receivable-entry/[id]/index" />
      <Stack.Screen name="debt/receivable-entry/[id]/edit" />
    </Stack>
  );
}
