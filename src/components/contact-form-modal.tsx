import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, spacing } from '@/src/theme/tokens';
import type { CreateContactPayload } from '@/src/types/contact';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateContactPayload) => void | Promise<void>;
  initialData?: {
    id: number;
    name: string;
    phone?: string;
    notes?: string;
  } | null;
  isSubmitting?: boolean;
};

export function ContactFormModal({
  visible,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}: Props) {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  const isEdit = !!initialData;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPhone(initialData.phone ?? '');
      setNotes(initialData.notes ?? '');
    } else {
      setName('');
      setPhone('');
      setNotes('');
    }
  }, [initialData, visible]);

  const handleSubmit = () => {
    if (!name.trim()) return;

    const payload: CreateContactPayload = {
      name: name.trim(),
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    void onSubmit(payload);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { borderColor: colors.border }]}>
          <Text variant="subtitle">{isEdit ? 'Edit Kontak' : 'Tambah Kontak'}</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <Input
            label="Nama"
            value={name}
            onChangeText={setName}
            placeholder="Nama kontak"
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
        </ScrollView>

        <View style={[styles.footer, { borderColor: colors.border }]}>
          <Button variant="secondary" label="Batal" onPress={onClose} />
          <Button
            label={isEdit ? 'Ubah' : 'Simpan'}
            onPress={handleSubmit}
            disabled={!name.trim() || isSubmitting}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    paddingTop: spacing.xl * 2,
    borderBottomWidth: 1,
  },
  form: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl * 2,
    borderTopWidth: 1,
  },
});
