import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

// Define the different haptic options we want to test
const hapticOptions = [
  {
    label: 'Impact - Light',
    action: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  },
  {
    label: 'Impact - Medium',
    action: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  },
  {
    label: 'Impact - Heavy',
    action: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  },
  {
    label: 'Notification - Success',
    action: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  },
  {
    label: 'Notification - Warning',
    action: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  },
  {
    label: 'Notification - Error',
    action: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  },
  {
    label: 'Selection',
    action: () => Haptics.selectionAsync(),
  },
];

export default function HapticsTestScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Haptics Test</Text>
      <Text style={styles.subtitle}>Tap a button to feel the vibration.</Text>

      {hapticOptions.map((option, index) => (
        <Pressable
          key={index}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={option.action}
        >
          <Text style={styles.buttonText}>{option.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  buttonPressed: {
    backgroundColor: '#f1f3f5',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
});
