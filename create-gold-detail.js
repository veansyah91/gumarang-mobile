#!/usr/bin/env node
// This script creates the gold-list directory and [id].tsx file

const fs = require('fs');
const path = require('path');

// Set the working directory
process.chdir(__dirname);

try {
  const dir = path.join(process.cwd(), 'app', '(app)', 'gold-list');
  
  // Create directory recursively
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // File content
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
  
  // Write file
  const filePath = path.join(dir, '[id].tsx');
  fs.writeFileSync(filePath, content, 'utf-8');
  
  // Output results
  console.log(JSON.stringify({
    success: true,
    directory: dir,
    file: filePath,
    fileSize: content.length,
    exists: fs.existsSync(filePath)
  }, null, 2));
  
} catch (error) {
  console.error(JSON.stringify({
    success: false,
    error: error.message
  }, null, 2));
  process.exit(1);
}
