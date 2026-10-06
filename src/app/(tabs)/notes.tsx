import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, colors } from '../../components/ui';
import { createNote, listNotes } from '../../lib/db';

export default function Notes() {
  const [notes, setNotes] = useState<Awaited<ReturnType<typeof listNotes>>>([]);
  useFocusEffect(useCallback(() => { listNotes().then(setNotes); }, []));

  async function add() {
    router.push(`/note/${await createNote()}`);
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <Text style={styles.h1}>Notes</Text>
      <Button onPress={add}>+ New note</Button>
      <FlatList
        data={notes}
        keyExtractor={(n) => String(n.id)}
        contentContainerStyle={{ gap: 10, paddingVertical: 16 }}
        ListEmptyComponent={<Text style={styles.sub}>No notes yet. Type one or scan a photo.</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.item} onPress={() => router.push(`/note/${item.id}`)}>
            <Text style={styles.title}>{item.title || 'Untitled'}</Text>
            <Text style={styles.sub} numberOfLines={2}>{item.body || 'Empty'}</Text>
            <View><Text style={styles.badge}>{item.card_count} cards</Text></View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 20, gap: 12 },
  h1: { fontSize: 32, fontWeight: '800', color: colors.ink },
  sub: { color: colors.sub, fontSize: 14 },
  item: { backgroundColor: colors.card, borderRadius: 14, padding: 16, gap: 6, borderWidth: 1, borderColor: colors.line },
  title: { fontSize: 18, fontWeight: '700', color: colors.ink },
  badge: { color: colors.brand, fontWeight: '600', fontSize: 13 },
});
