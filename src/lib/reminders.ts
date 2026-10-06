import * as Notifications from 'expo-notifications';

const ID = 'daily-review';

export async function enableDailyReminder(hour = 19, minute = 0): Promise<boolean> {
  const perm = await Notifications.requestPermissionsAsync();
  if (!perm.granted) return false;
  await Notifications.cancelScheduledNotificationAsync(ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: ID,
    content: { title: 'Time to recall', body: 'Your flashcards are waiting. 5 minutes keeps it in your head.' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
  });
  return true;
}

export async function disableDailyReminder() {
  await Notifications.cancelScheduledNotificationAsync(ID).catch(() => {});
}

export async function reminderEnabled(): Promise<boolean> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  return all.some((n) => n.identifier === ID);
}
