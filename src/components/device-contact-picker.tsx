import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';

import * as Contacts from 'expo-contacts';

import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, spacing } from '@/src/theme/tokens';

type DeviceContact = {
  id: string;
  name: string;
  phone?: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (name: string, phone?: string) => void;
};

export function DeviceContactPicker({ visible, onClose, onSelect }: Props) {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  const [contacts, setContacts] = useState<DeviceContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<DeviceContact[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadContacts();
    } else {
      setContacts([]);
      setFilteredContacts([]);
      setSearch('');
      setError(null);
    }
  }, [visible]);

  useEffect(() => {
    if (search.trim()) {
      const query = search.toLowerCase();
      setFilteredContacts(
        contacts.filter(
          (c) =>
            c.name.toLowerCase().includes(query) ||
            c.phone?.toLowerCase().includes(query),
        ),
      );
    } else {
      setFilteredContacts(contacts);
    }
  }, [search, contacts]);

  const loadContacts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        setError('Izin akses kontak ditolak');
        setIsLoading(false);
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        sort: Contacts.SortTypes.FirstName,
      });

      const mapped: DeviceContact[] = data
        .filter((c) => c.name && c.phoneNumbers && c.phoneNumbers.length > 0)
        .map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phoneNumbers?.[0]?.number,
        }));

      setContacts(mapped);
      setFilteredContacts(mapped);
    } catch (err) {
      setError('Gagal memuat kontak');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (contact: DeviceContact) => {
    onSelect(contact.name, contact.phone);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderColor: colors.border }]}>
          <Text variant="subtitle">Pilih Kontak</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={{ color: colors.primary }}>Batal</Text>
          </Pressable>
        </View>

        <View style={styles.searchContainer}>
          <Input
            value={search}
            onChangeText={setSearch}
            placeholder="Cari kontak..."
          />
        </View>

        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.centerState}>
            <Text tone="danger">{error}</Text>
            <Pressable onPress={loadContacts}>
              <Text style={{ color: colors.primary }}>Coba Lagi</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSelect(item)}
                style={({ pressed }) => [
                  styles.contactItem,
                  { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{item.name}</Text>
                  {item.phone ? (
                    <Text tone="muted" style={styles.contactPhone}>
                      {item.phone}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            )}
            ListEmptyComponent={
              <View style={styles.centerState}>
                <Text tone="muted">Tidak ada kontak ditemukan</Text>
              </View>
            }
            contentContainerStyle={styles.list}
          />
        )}
      </View>
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
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  list: {
    flexGrow: 1,
  },
  contactItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  contactInfo: {
    gap: 2,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
  },
  contactPhone: {
    fontSize: 13,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    gap: spacing.sm,
  },
});
