import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Root() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="note/[id]" options={{ title: 'Note' }} />
      </Stack>
    </>
  );
}
