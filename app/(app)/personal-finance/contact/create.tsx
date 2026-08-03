import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { DeviceContactPicker } from '@/src/components/device-contact-picker';
import { FixedAssetSubHeader } from '@/src/components/ui/fixed-asset-sub-header';
import { Input } from '@/src/components/ui/input';
import { Screen } from '@/src/components/ui/screen';
import { useCreateContact } from '@/src/hooks/use-contact';
import { useRouter } from 'expo-router';
import { useToastStore } from '@/src/state/toast-store';
import { spacing } from '@/src/theme/tokens';
import { toAppError } from '@/src/utils/errors';
import { normalizePhone } from '@/src/utils/phone';

export default function ContactCreatePage() {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const { mutateAsync: createContact, isPending: isSubmitting } =
    useCreateContact();

  const handleSubmit = async () => {
    if (!name.trim()) {
      showToast('Nama kontak harus diisi', 'danger');
      return;
    }

    try {
      await createContact({
        name: name.trim(),
        phone: normalizePhone(phone),
        notes: notes.trim() || undefined,
      });

      showToast('Kontak berhasil ditambahkan', 'success');
      router.back();
    } catch (err) {
      const appErr = toAppError(err);
      showToast(appErr.userMessage, 'danger');
    }
  };

  const handleContactSelected = (contactName: string, contactPhone?: string) => {
    setName(contactName);
    if (contactPhone) {
      setPhone(normalizePhone(contactPhone));
    }
  };

  return (
    <>
      <FixedAssetSubHeader title="Tambah Kontak" />
      <Screen scrollable safeAreaEdges={['left', 'right', 'bottom']}>
        <View style={formStyles.formContainer}>
          <Card>
            <Input
              label="Nama"
              value={name}
              onChangeText={setName}
              placeholder="Nama kontak"
              rightElement={
                <Pressable onPress={() => setIsPickerVisible(true)} hitSlop={8}>
                  <Ionicons name="person-add-outline" size={22} color="#7c3aed" />
                </Pressable>
              }
            />

            <Input
              label="Telepon"
              value={phone}
              onChangeText={setPhone}
              placeholder="Nomor telepon"
              keyboardType="phone-pad"
            />

            <Input
              label="Catatan"
              value={notes}
              onChangeText={setNotes}
              placeholder="Catatan (opsional)"
              multiline
            />
          </Card>

          <View style={formStyles.submitContainer}>
            <Button
              label="Simpan"
              onPress={handleSubmit}
              disabled={isSubmitting || !name.trim()}
            />
          </View>
        </View>
      </Screen>

      <DeviceContactPicker
        visible={isPickerVisible}
        onClose={() => setIsPickerVisible(false)}
        onSelect={handleContactSelected}
      />
    </>
  );
}

const formStyles = StyleSheet.create({
  formContainer: {
    padding: spacing.md,
    gap: spacing.md,
  },
  submitContainer: {
    marginTop: spacing.sm,
  },
});
