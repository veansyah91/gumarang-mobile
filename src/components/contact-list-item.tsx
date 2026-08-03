import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import type { Contact } from '@/src/types/contact';

type Props = {
  contact: Contact;
  onPress: (id: number) => void;
  onLongPress?: (id: number) => void;
};

export function ContactListItem({ contact, onPress, onLongPress }: Props) {
  return (
    <Pressable
      onPress={() => onPress(contact.id)}
      onLongPress={() => onLongPress?.(contact.id)}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <Card>
        <View style={styles.row}>
          <View style={styles.info}>
            <Text style={styles.name}>{contact.name}</Text>
            {contact.phone ? (
              <Text tone="muted" style={styles.phone}>
                {contact.phone}
              </Text>
            ) : null}
            {contact.notes ? (
              <Text tone="muted" style={styles.notes} numberOfLines={1}>
                {contact.notes}
              </Text>
            ) : null}
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
  },
  phone: {
    fontSize: 13,
  },
  notes: {
    fontSize: 12,
    marginTop: 2,
  },
});
