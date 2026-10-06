import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, colors } from '../../components/ui';
import { Card, dueCards, gradeCard } from '../../lib/db';
import { disableDailyReminder, enableDailyReminder, reminderEnabled } from '../../lib/reminders';
import { Grade } from '../../lib/scheduler';

export default function Today() {
  const [queue, setQueue] = useState<Card[]>([]);
  const [done, setDone] = useState(0);
  const [shown, setShown] = useState(false);
  const [remind, setRemind] = useState(false);

  useFocusEffect(
    useCallback(() => {
      dueCards().then((c) => { setQueue(c); setDone(0); setShown(false); });
    }, []),
  );
  useEffect(() => { reminderEnabled().then(setRemind).catch(() => {}); }, []);

  async function toggleRemind(on: boolean) {
    if (on) {
      const ok = await enableDailyReminder();
      if (!ok) return Alert.alert('Notifications are off', 'Enable them in Settings to get a daily reminder.');
    } else await disableDailyReminder();
    setRemind(on);
  }

  async function grade(g: Grade) {
    const [card, ...rest] = queue;
    await gradeCard(card, g);
    // A forgotten card comes back at the end of this session.
    setQueue(g === 0 ? [...rest, card] : rest);
    if (g !== 0) setDone((d) => d + 1);
    setShown(false);
  }

  const card = queue[0];
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <Text style={styles.h1}>Today</Text>
      <Text style={styles.sub}>{done} reviewed · {queue.length} left</Text>

      {card ? (
        <>
          <View style={styles.card}>
            <Text style={styles.label}>{shown ? 'ANSWER' : 'QUESTION'}</Text>
            <Text style={styles.cardText}>{shown ? card.back : card.front}</Text>
          </View>
          {shown ? (
            <View style={styles.row}>
              <Button kind="danger" style={styles.flex} onPress={() => grade(0)}>Forgot</Button>
              <Button kind="ghost" style={styles.flex} onPress={() => grade(1)}>Hard</Button>
              <Button style={styles.flex} onPress={() => grade(2)}>Good</Button>
              <Button kind="ghost" style={styles.flex} onPress={() => grade(3)}>Easy</Button>
            </View>
          ) : (
            <Button onPress={() => setShown(true)}>Show answer</Button>
          )}
        </>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.cardText}>{done > 0 ? '🎉 All done for today' : 'Nothing due'}</Text>
          <Text style={styles.sub}>Add notes and generate cards, or come back tomorrow.</Text>
        </View>
      )}

      <View style={styles.remind}>
        <Text style={styles.sub}>Daily reminder (7 pm)</Text>
        <Switch value={remind} onValueChange={toggleRemind} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 20, gap: 16 },
  h1: { fontSize: 32, fontWeight: '800', color: colors.ink },
  sub: { color: colors.sub, fontSize: 15 },
  card: { backgroundColor: colors.card, borderRadius: 20, padding: 28, minHeight: 240, justifyContent: 'center', borderWidth: 1, borderColor: colors.line },
  label: { color: colors.sub, fontSize: 12, letterSpacing: 1, marginBottom: 12 },
  cardText: { fontSize: 24, fontWeight: '600', color: colors.ink },
  row: { flexDirection: 'row', gap: 8 },
  flex: { flex: 1, paddingHorizontal: 4 },
  empty: { flex: 1, justifyContent: 'center', gap: 8 },
  remind: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
});
