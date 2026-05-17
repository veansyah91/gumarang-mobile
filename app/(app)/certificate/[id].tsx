import { Redirect } from 'expo-router';

import { MemberCertificateDetail } from '@/src/components/member-certificate-detail';
import { useAuth } from '@/src/hooks/use-auth';

export default function CertificateDetailScreen() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <MemberCertificateDetail />;
}
