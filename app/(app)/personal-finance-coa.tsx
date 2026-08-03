import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function CoaPageRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/personal-finance/account' as any);
  }, [router]);
  return null;
}
