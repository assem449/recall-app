import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, colors } from '../../components/ui';
import { allCards } from '../../lib/db';
import { Question, buildQuiz } from '../../lib/quiz';

const LENGTH = 10;

export default function Quiz() {
  const [qs, setQs] = useState<Question[] | null>(null);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const start = useCallback(async () => {
    const cards = await allCards();
    setQs(buildQuiz(cards, LENGTH));
    setI(0); setPicked(null); setScore(0);
  }, []);
  useFocusEffect(useCallback(() => { start(); }, [start]));

  if (!qs) return null;
  if (qs.length === 0) {
    return (
      <SafeAreaView style={styles.root}>
        <Text style={styles.h1}>Test</Text>
        <Text style={styles.sub}>Create at least 2 flashcards to take a test.</Text>
      </SafeAreaView>
    );
  }
  if (i >= qs.length) {
    return (
      <SafeAreaView style={styles.root}>
        <Text style={styles.h1}>{score} / {qs.length}</Text>
        <Text style={styles.sub}>{score === qs.length ? 'Perfect!' : 'Keep reviewing the ones you missed.'}</Text>
        <Button onPress={start}>New test</Button>
      </SafeAreaView>
    );
  }

  const q = qs[i];
  function pick(idx: number) {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === q.answerIndex) setScore((s) => s + 1);
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <Text style={styles.sub}>Question {i + 1} of {qs.length}</Text>
      <Text style={styles.q}>{q.prompt}</Text>
      {q.options.map((o, idx) => {
        const right = picked !== null && idx === q.answerIndex;
        const wrong = picked === idx && idx !== q.answerIndex;
        return (
          <Pressable key={idx} onPress={() => pick(idx)} style={[styles.opt, right && { borderColor: colors.good, backgroundColor: '#E8F7EC' }, wrong && { borderColor: colors.bad, backgroundColor: '#FDECEC' }]}>
            <Text style={styles.optText}>{o}</Text>
          </Pressable>
        );
      })}
      {picked !== null && <Button onPress={() => { setI(i + 1); setPicked(null); }}>{i + 1 === qs.length ? 'Finish' : 'Next'}</Button>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 20, gap: 12 },
  h1: { fontSize: 32, fontWeight: '800', color: colors.ink },
  sub: { color: colors.sub, fontSize: 15 },
  q: { fontSize: 22, fontWeight: '700', color: colors.ink, marginVertical: 8 },
  opt: { backgroundColor: colors.card, borderRadius: 12, padding: 16, borderWidth: 2, borderColor: colors.line },
  optText: { fontSize: 16, color: colors.ink },
});
