import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { Stack, XStack } from "tamagui";
import { theme } from "../constants/theme";

export default function NfcFeatureDemo() {
  const steps = [
    {
      icon: "tag-plus",
      title: "1. Générer l'ID NFC",
      description: "Créez un identifiant unique pour votre animal",
      color: "#007bff",
    },
    {
      icon: "content-copy",
      title: "2. Copier l'ID",
      description: "Copiez l'ID généré dans le presse-papiers",
      color: "#28a745",
    },
    {
      icon: "cellphone-nfc",
      title: "3. Ouvrir app NFC",
      description: "Lancez NFC Tools ou TagWriter NXP",
      color: "#ff6b35",
    },
    {
      icon: "tag-text",
      title: "4. Écrire le tag",
      description: "Collez l'ID et écrivez sur votre puce NFC",
      color: "#0066cc",
    },
    {
      icon: "check-circle",
      title: "5. Confirmer",
      description: "Revenez et confirmez l'utilisation du tag",
      color: "#28a745",
    },
  ];

  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        margin: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          color: theme.colors.text.DEFAULT,
          marginBottom: 16,
          textAlign: "center",
        }}
      >
        🏷️ Processus NFC Tag
      </Text>

      <Stack space="$3">
        {steps.map((step, index) => (
          <XStack key={index} space="$3" alignItems="flex-start">
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: step.color,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons
                name={step.icon as any}
                size={20}
                color="white"
              />
            </View>

            <Stack flex={1}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: theme.colors.text.DEFAULT,
                  marginBottom: 4,
                }}
              >
                {step.title}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: theme.colors.text.light,
                  lineHeight: 16,
                }}
              >
                {step.description}
              </Text>
            </Stack>
          </XStack>
        ))}
      </Stack>

      <View
        style={{
          marginTop: 16,
          padding: 12,
          backgroundColor: "#f8f9fa",
          borderRadius: 8,
          borderLeftWidth: 4,
          borderLeftColor: theme.colors.primary.DEFAULT,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            color: theme.colors.text.light,
            lineHeight: 16,
          }}
        >
          💡 <Text style={{ fontWeight: "600" }}>Astuce:</Text> Une fois le tag
          NFC écrit, vous pourrez scanner votre animal depuis n&apos;importe où
          dans l&apos;app pour accéder rapidement à ses informations.
        </Text>
      </View>
    </View>
  );
}
