import { Redirect, useLocalSearchParams } from 'expo-router';

import { MemberGoldDetail } from '@/src/components/member-gold-detail';
import { useAuth } from '@/src/hooks/use-auth';

export default function GoldListDetailScreen() {
  const { isAuthenticated } = useAuth();
  const params = useLocalSearchParams<{ id?: string | string[] }>();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  if (!id) {
    return <Redirect href="/(app)/gold-list" />;
  }

  return <MemberGoldDetail productId={id} />;
}
