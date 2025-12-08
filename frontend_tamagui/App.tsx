// App.tsx
import React from 'react'
import { TamaguiProvider, Theme } from 'tamagui'
import tamaguiConfig from './tamagui.config'
import { ExpoRoot } from 'expo-router'

export default function App() {
  return (
    <TamaguiProvider config={tamaguiConfig}>
      <Theme name="light">
        <ExpoRoot context={undefined} />
      </Theme>
    </TamaguiProvider>
  )
}
