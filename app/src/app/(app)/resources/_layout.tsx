import { Stack } from 'expo-router';
import React from 'react';

export default function ResourcesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#ffffff' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="online-resources" />
      <Stack.Screen name="questions" />
      <Stack.Screen name="interview-experiences" />
      <Stack.Screen name="ai-coach" />
      <Stack.Screen name="compensation" />
      <Stack.Screen name="mock-interviews" />
    </Stack>
  );
}
