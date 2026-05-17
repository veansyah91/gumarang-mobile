import { Redirect } from 'expo-router';

import { MemberPurchaseTransactionDetail } from '@/src/components/member-purchase-transaction-detail';
import { useAuth } from '@/src/hooks/use-auth';

export default function PurchaseMemberDetailScreen() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <MemberPurchaseTransactionDetail />;
}
