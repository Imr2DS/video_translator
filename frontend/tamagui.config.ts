import { createTamagui } from 'tamagui'
import { createTokens } from '@tamagui/core'

const tokens = createTokens({
  color: {
    background: '#FFFFFF',
    primary: '#007AFF',
    secondary: '#FF9500',
    text: '#000000',
  },
  space: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 24 },
  size: { 0: 0, 1: 20, 2: 30, 3: 40, 4: 50 },
  radius: { 0: 0, 1: 4, 2: 8, 3: 12 },
})

export const config = createTamagui({
  tokens,
  themes: {
    light: {
      background: tokens.color.background.val, // utilisation correcte du token
      color: tokens.color.text.val,
    },
    dark: {
      background: '#000000',
      color: '#FFFFFF',
    },
  },
  defaultTheme: 'light',
})

export default config
