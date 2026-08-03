import { useRouter } from 'expo-router';
import { useEffect } from 'react';

// Temporary redirect so legacy route /personal-finance continues to work.
// New implementation lives under app/(app)/personal-finance/ (group layout
// + index/coa pages). Redirecting to COA as the entry point for the grouped
// Personal Finance section.
export default function PersonalFinanceRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/personal-finance/account' as any);
  }, [router]);
  return null;
}
