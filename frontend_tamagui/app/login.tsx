// app/login.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text } from "react-native";
import { Stack, XStack } from "tamagui";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { theme } from "../constants/theme";
import { supabase } from "../lib/supabase";

export default function LoginScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // Connexion réussie → redirige vers home
      router.replace("/home");
    } catch (err: any) {
      console.error("Sign in error:", err.message);
      setError(err.message || "Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack flex={1} backgroundColor="$background" padding="$4">
      <Stack flex={1} justifyContent="center" alignItems="center" space="$4">
        <Stack width="100%" space="$4">
          {/* Email */}
          <Input
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Mot de passe */}
          <Input
            label="Mot de passe"
            value={formData.password}
            onChangeText={(text) =>
              setFormData({ ...formData, password: text })
            }
            secureTextEntry
          />

          {/* Affichage erreur */}
          {error && <Text style={{ color: theme.colors.error }}>{error}</Text>}

          {/* Bouton Se connecter */}
          <Button
            onPress={handleSignIn}
            loading={loading}
            style={{ marginTop: 16 }}
          >
            Se connecter
          </Button>

          {/* Lien vers l'inscription */}
          <XStack justifyContent="center" alignItems="center" space="$2">
            <Text style={{ color: theme.colors.text.DEFAULT }}>
              Pas encore de compte ?
            </Text>
            <Button variant="ghost" onPress={() => router.push("/signup")}>
              S'inscrire
            </Button>
          </XStack>
        </Stack>
      </Stack>
    </Stack>
  );
}
