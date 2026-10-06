import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, colors } from '../../components/ui';
import { Card, addCards, deleteCard, deleteNote, getNote, listCards, saveNote } from '../../lib/db';
import { CardDraft, extractCards } from '../../lib/extract';
import { imageToText } from '../../lib/ocr';

export default function NoteScreen() {
  const id = Number(useLocalSearchParams<{ id: string }>().id);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [cards, setCards] = useState<Card[]>([]);
  const [drafts, setDrafts] = useState<CardDraft[]>([]);
  const [busy, setBusy] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    (async () => {
      const n = await getNote(id);
      if (n) { setTitle(n.title); setBody(n.body); }
      setCards(await listCards(id));
      loaded.current = true;
    })();
  }, [id]);

  // Autosave, debounced.
  useEffect(() => {
    if (!loaded.current) return;
    const t = setTimeout(() => saveNote(id, title, body), 400);
    return () => clearTimeout(t);
  }, [id, title, body]);

  async function scan(source: 'camera' | 'library') {
    try {
      const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], base64: true, quality: 0.7 };
      if (source === 'camera') {
        const p = await ImagePicker.requestCameraPermissionsAsync();
        if (!p.granted) return Alert.alert('Camera access is off', 'Enable it in Settings to scan notes.');
      }
      const r = source === 'camera' ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
      const b64 = r.assets?.[0]?.base64;
      if (r.canceled || !b64) return;
      setBusy(true);
      const text = await imageToText(b64, r.assets![0].mimeType ?? 'image/jpeg');
      setBody((prev) => (prev ? prev + '\n\n' : '') + text);
    } catch (e) {
      Alert.alert('Could not scan', (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function generate() {
    const found = extractCards(body);
    if (!found.length) {
      Alert.alert('No definitions found', 'Write lines like "Term: definition" or "A cell is the basic unit of life".');
      return;
    }
    setDrafts(found);
  }

  async function accept() {
    const n = await addCards(id, drafts);
    setDrafts([]);
    setCards(await listCards(id));
    Alert.alert('Done', `${n} new card${n === 1 ? '' : 's'} added.`);
  }

  function remove() {
    Alert.alert('Delete note?', 'Its flashcards will be deleted too.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteNote(id); router.back(); } },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.root} keyboardShouldPersistTaps="handled">
      <TextInput style={styles.title} placeholder="Title" value={title} onChangeText={setTitle} />
      <TextInput style={styles.body} placeholder="Type or paste notes. Use 'Term: definition' lines for best cards." multiline value={body} onChangeText={setBody} textAlignVertical="top" />

      <View style={styles.row}>
        <Button kind="ghost" style={styles.flex} disabled={busy} onPress={() => scan('camera')}>📷 Scan</Button>
        <Button kind="ghost" style={styles.flex} disabled={busy} onPress={() => scan('library')}>🖼 Photo</Button>
      </View>
      <Button onPress={generate}>✨ Generate flashcards</Button>

      {drafts.length > 0 && (
        <View style={styles.panel}>
          <Text style={styles.h2}>Review {drafts.length} suggested cards</Text>
          {drafts.map((d, i) => (
            <View key={i} style={styles.draft}>
              <Text style={styles.q}>{d.front}</Text>
              <Text style={styles.a}>{d.back}</Text>
              <Button kind="ghost" style={styles.small} onPress={() => setDrafts(drafts.filter((_, j) => j !== i))}>Remove</Button>
            </View>
          ))}
          <Button onPress={accept}>Add {drafts.length} cards</Button>
        </View>
      )}

      {cards.length > 0 && <Text style={styles.h2}>Cards in this note ({cards.length})</Text>}
      {cards.map((c) => (
        <View key={c.id} style={styles.draft}>
          <Text style={styles.q}>{c.front}</Text>
          <Text style={styles.a}>{c.back}</Text>
          <Button kind="ghost" style={styles.small} onPress={async () => { await deleteCard(c.id); setCards(await listCards(id)); }}>Delete</Button>
        </View>
      ))}

      <Button kind="danger" onPress={remove}>Delete note</Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: 20, gap: 14, backgroundColor: colors.bg },
  title: { fontSize: 24, fontWeight: '800', color: colors.ink },
  body: { minHeight: 220, backgroundColor: colors.card, borderRadius: 14, padding: 14, fontSize: 16, borderWidth: 1, borderColor: colors.line },
  row: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
  panel: { gap: 10 },
  h2: { fontSize: 18, fontWeight: '700', color: colors.ink },
  draft: { backgroundColor: colors.card, borderRadius: 12, padding: 14, gap: 4, borderWidth: 1, borderColor: colors.line },
  q: { fontWeight: '700', color: colors.ink },
  a: { color: colors.sub },
  small: { paddingVertical: 6, marginTop: 6 },
});
