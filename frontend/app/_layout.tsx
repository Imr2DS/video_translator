// app/_layout.tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack initialRouteName="screens/LoginScreen">
      <Stack.Screen
        name="screens/LoginScreen"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="screens/SignUpScreen"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="screens/HomeScreen"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
