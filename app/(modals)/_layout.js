// File: app/(modals)/_layout.js

import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
        animation: 'slide_from_bottom',
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="ticket-detail" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="filter" />
      <Stack.Screen name="bus-layout-info" />
    </Stack>
  );
}