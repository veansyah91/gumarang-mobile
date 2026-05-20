const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'app', '(app)', 'gold-list');
fs.mkdirSync(dir, { recursive: true });

const filePath = path.join(dir, '[id].tsx');
const content = `import { useLocalSearchParams, Redirect } from 'expo-router';

import { MemberGoldDetail } from '@/src/components/member-gold-detail';
import { useAuth } from '@/src/hooks/use-auth';

export default function GoldListDetailScreen() {
  const { isAuthenticated } = useAuth();
  const params = useLocalSearchParams<{ id?: string | string[] }>();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  if (!id) {
    return <Redirect href="/(app)/gold-list" />;
  }

  return <MemberGoldDetail productId={id} />;
}
`;

fs.writeFileSync(filePath, content, 'utf-8');
console.log('File created at:', filePath);
