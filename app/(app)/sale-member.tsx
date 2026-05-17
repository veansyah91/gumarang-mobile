import { Redirect } from 'expo-router';

import { MemberSaleTransactionList } from '@/src/components/member-sale-transaction-list';
import { useAuth } from '@/src/hooks/use-auth';

export default function SaleMemberScreen() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <MemberSaleTransactionList />;
}
