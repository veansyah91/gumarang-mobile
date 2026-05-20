import os
import json

# Create the directory structure
dir_path = r'c:\External\Projects\laragon\www\gumarang-mobile\app\(app)\gold-list'
os.makedirs(dir_path, exist_ok=True)

# Create the file
file_path = os.path.join(dir_path, '[id].tsx')
content = """import { useLocalSearchParams, Redirect } from 'expo-router';

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
"""

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(json.dumps({"success": True, "file_path": file_path}))
