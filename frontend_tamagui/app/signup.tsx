// app/signup.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, Alert } from "react-native";
import { Stack, XStack } from "tamagui";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { theme } from "../constants/theme";
import { supabase } from "../lib/supabase";

export default function SignupScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // Redirige vers home après inscription
      router.replace("/home");
      Alert.alert("Succès", "Compte créé avec succès !");
    } catch (err: any) {
      console.error("Sign up error:", err.message);
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack flex={1} backgroundColor="$background" padding="$4">
      <Stack flex={1} justifyContent="center" alignItems="center" space="$4">
        <Stack width="100%" space="$4">
          <Input
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Mot de passe"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            secureTextEntry
          />

          <Input
            label="Confirmer le mot de passe"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            secureTextEntry
          />

          {error && <Text style={{ color: theme.colors.error }}>{error}</Text>}

          <Button onPress={handleSignUp} loading={loading} style={{ marginTop: 16 }}>
            S'inscrire
          </Button>

          <XStack justifyContent="center" alignItems="center" space="$2">
            <Text style={{ color: theme.colors.text.DEFAULT }}>
              Déjà un compte ?
            </Text>
            <Button variant="ghost" onPress={() => router.push("/login")}>
              Se connecter
            </Button>
          </XStack>
        </Stack>
      </Stack>
    </Stack>
  );
}
