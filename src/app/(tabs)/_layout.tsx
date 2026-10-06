import { Tabs } from 'expo-router';
import { colors } from '../../components/ui';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: colors.brand }}>
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="notes" options={{ title: 'Notes' }} />
      <Tabs.Screen name="quiz" options={{ title: 'Test' }} />
    </Tabs>
  );
}
