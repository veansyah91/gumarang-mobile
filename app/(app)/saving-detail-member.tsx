import { Redirect } from 'expo-router';

import { MemberSavingDetailList } from '@/src/components/member-saving-detail-list';
import { useAuth } from '@/src/hooks/use-auth';

export default function SavingDetailMemberScreen() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <MemberSavingDetailList />;
}
