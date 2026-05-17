import { Redirect } from 'expo-router';

import { MemberSaleTransactionDetail } from '@/src/components/member-sale-transaction-detail';
import { useAuth } from '@/src/hooks/use-auth';

export default function SaleMemberDetailScreen() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <MemberSaleTransactionDetail />;
}
