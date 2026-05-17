import { Redirect } from 'expo-router';

import { MemberSectionScreen } from '@/src/components/member-section-screen';
import { useAuth } from '@/src/hooks/use-auth';

export default function CertificateScreen() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <MemberSectionScreen
      title="Data Sertifikatku"
      description="Halaman ini sedang dalam pengembangan."
    />
  );
}
