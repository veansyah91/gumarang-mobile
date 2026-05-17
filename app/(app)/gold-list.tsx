import { Redirect } from 'expo-router';

import { MemberGoldList } from '@/src/components/member-gold-list';
import { useAuth } from '@/src/hooks/use-auth';

export default function GoldListScreen() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <MemberGoldList />;
}
