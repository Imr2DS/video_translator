// app/_layout.tsx
import 'react-native-reanimated';
import React from 'react';
import { Stack } from 'expo-router';
import { TamaguiProvider } from 'tamagui';
import config from '../tamagui.config';

export default function Layout() {
  return (
    <TamaguiProvider config={config}>
      <Stack initialRouteName="LoginScreen">
        <Stack.Screen
          name="LoginScreen"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUpScreen"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HomeScreen"
          options={{ headerShown: false }}
        />
      </Stack>
    </TamaguiProvider>
  );
}
