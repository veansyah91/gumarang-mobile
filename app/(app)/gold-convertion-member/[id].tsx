import { Redirect } from 'expo-router';

import { MemberGoldConvertionDetail } from '@/src/components/member-gold-convertion-detail';
import { useAuth } from '@/src/hooks/use-auth';

export default function GoldConvertionMemberDetailScreen() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <MemberGoldConvertionDetail />;
}
