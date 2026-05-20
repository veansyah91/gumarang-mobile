const fs = require('fs');
const path = require('path');

// Create directories
const targetDir = path.join(__dirname, 'app', '(app)', 'gold-list');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log('✓ Created directory:', targetDir);
}

// Write the file
const filePath = path.join(targetDir, '[id].tsx');
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
console.log('✓ Created file:', filePath);

// Verify the file exists and read it back
const fileContent = fs.readFileSync(filePath, 'utf-8');
console.log('✓ File verification - size:', fileContent.length, 'bytes');
console.log('✓ File first 100 chars:', fileContent.substring(0, 100));
