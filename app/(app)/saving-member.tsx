import { Redirect } from 'expo-router';

import { MemberSavingList } from '@/src/components/member-saving-list';
import { useAuth } from '@/src/hooks/use-auth';

export default function SavingMemberScreen() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <MemberSavingList />;
}
