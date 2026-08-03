import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { DeviceContactPicker } from '@/src/components/device-contact-picker';
import { FixedAssetSubHeader } from '@/src/components/ui/fixed-asset-sub-header';
import { Input } from '@/src/components/ui/input';
import { Screen } from '@/src/components/ui/screen';
import { useContact, useUpdateContact } from '@/src/hooks/use-contact';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { useToastStore } from '@/src/state/toast-store';
import { palette, spacing } from '@/src/theme/tokens';
import { toAppError } from '@/src/utils/errors';
import { normalizePhone } from '@/src/utils/phone';

export default function ContactEditPage() {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);
  const { id } = useLocalSearchParams<{ id: string }>();
  const contactId = Number(id);

  const theme = useResolvedTheme();
  const colors = palette[theme];

  const { data: contact, isLoading: isDetailLoading } = useContact(contactId);
  const { mutateAsync: updateContact, isPending: isSubmitting } =
    useUpdateContact();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setPhone(contact.phone ?? '');
      setNotes(contact.notes ?? '');
    }
  }, [contact]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      showToast('Nama kontak harus diisi', 'danger');
      return;
    }

    try {
      await updateContact({
        id: contactId,
        payload: {
          name: name.trim(),
          phone: normalizePhone(phone),
          notes: notes.trim() || undefined,
        },
      });

      showToast('Kontak berhasil diperbarui', 'success');
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

  if (isDetailLoading) {
    return (
      <>
        <FixedAssetSubHeader title="Edit Kontak" />
        <Screen scrollable safeAreaEdges={['left', 'right', 'bottom']}>
          <View style={localStyles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </Screen>
      </>
    );
  }

  return (
    <>
      <FixedAssetSubHeader title="Edit Kontak" />
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
              label="Perbarui"
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

const localStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
});
