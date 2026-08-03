import { Stack } from 'expo-router';

export default function InvestmentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create" />
      <Stack.Screen name="[id]/buy" />
      <Stack.Screen name="[id]/sell" />
      <Stack.Screen name="[id]/revalue" />
      <Stack.Screen name="[id]/edit" />
    </Stack>
  );
}
