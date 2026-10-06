import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

export const colors = { bg: '#F7F7FB', card: '#FFFFFF', ink: '#1B1B2F', sub: '#6B6B80', brand: '#5B5BF0', good: '#2BA84A', bad: '#E5484D', line: '#E4E4EE' };

export function Button({ children, onPress, kind = 'primary', style, disabled }: {
  children: ReactNode; onPress: () => void; kind?: 'primary' | 'ghost' | 'danger'; style?: ViewStyle; disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [s.btn, kind === 'primary' && s.primary, kind === 'ghost' && s.ghost, kind === 'danger' && s.danger, pressed && { opacity: 0.7 }, disabled && { opacity: 0.4 }, style]}
    >
      <Text style={[s.btnText, kind === 'ghost' && { color: colors.brand }]}>{children}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: { paddingVertical: 14, paddingHorizontal: 18, borderRadius: 12, alignItems: 'center' },
  primary: { backgroundColor: colors.brand },
  danger: { backgroundColor: colors.bad },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.brand },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
