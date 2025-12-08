// app/_layout.tsx
import { TamaguiProvider } from 'tamagui'
import tamaguiConfig from '../tamagui.config'
import { AuthProvider } from '../contexts/AuthContext'
import { Slot } from 'expo-router'

export default function Layout() {
  return (
    <TamaguiProvider config={tamaguiConfig}>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </TamaguiProvider>
  )
}
