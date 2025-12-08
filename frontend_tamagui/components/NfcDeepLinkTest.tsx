import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React, { useState } from "react";
import { Alert, Platform, Text, TouchableOpacity, View } from "react-native";
import { Stack } from "tamagui";
import { theme } from "../constants/theme";

export default function NfcDeepLinkTest() {
  const [testing, setTesting] = useState(false);

  const testNfcTools = async () => {
    setTesting(true);

    const nfcToolsUrls =
      Platform.select({
        ios: ["nfctools://", "nfctools://launch"],
        android: [
          "com.wakdev.wdnfc://",
          "nfctools://",
          "intent://com.wakdev.wdnfc#Intent;scheme=https;package=com.wakdev.wdnfc;end",
        ],
      }) || [];

    const fallbackUrl = Platform.select({
      ios: "https://apps.apple.com/app/nfc-tools/id1252962749",
      android: "https://play.google.com/store/apps/details?id=com.wakdev.wdnfc",
    });

    console.log("Testing NFC Tools deep links:", nfcToolsUrls);

    const tryOpenApp = async (
      urls: string[],
      index: number = 0
    ): Promise<void> => {
      if (index >= urls.length) {
        Alert.alert(
          "Test Résultat",
          "NFC Tools n'est pas installé. Redirection vers le store."
        );
        if (fallbackUrl) {
          Linking.openURL(fallbackUrl);
        }
        setTesting(false);
        return;
      }

      try {
        console.log(`Trying to open: ${urls[index]}`);
        await Linking.openURL(urls[index]);
        Alert.alert(
          "Test Réussi!",
          `NFC Tools ouvert avec succès via: ${urls[index]}`
        );
        setTesting(false);
      } catch (error) {
        console.log(`Failed to open ${urls[index]}, trying next...`);
        // Try next URL
        tryOpenApp(urls, index + 1);
      }
    };

    if (nfcToolsUrls.length > 0) {
      tryOpenApp(nfcToolsUrls);
    }
  };

  const testTagWriter = async () => {
    setTesting(true);

    const tagWriterUrls =
      Platform.select({
        ios: ["tagwriter://", "tagwriter://launch"],
        android: [
          "com.nxp.nfc.tagwriter://",
          "tagwriter://",
          "intent://com.nxp.nfc.tagwriter#Intent;scheme=https;package=com.nxp.nfc.tagwriter;end",
        ],
      }) || [];

    const fallbackUrl = Platform.select({
      ios: "https://apps.apple.com/app/nfc-tagwriter-by-nxp/id1246143596",
      android:
        "https://play.google.com/store/apps/details?id=com.nxp.nfc.tagwriter",
    });

    console.log("Testing TagWriter deep links:", tagWriterUrls);

    const tryOpenApp = async (
      urls: string[],
      index: number = 0
    ): Promise<void> => {
      if (index >= urls.length) {
        Alert.alert(
          "Test Résultat",
          "TagWriter NXP n'est pas installé. Redirection vers le store."
        );
        if (fallbackUrl) {
          Linking.openURL(fallbackUrl);
        }
        setTesting(false);
        return;
      }

      try {
        console.log(`Trying to open: ${urls[index]}`);
        await Linking.openURL(urls[index]);
        Alert.alert(
          "Test Réussi!",
          `TagWriter NXP ouvert avec succès via: ${urls[index]}`
        );
        setTesting(false);
      } catch (error) {
        console.log(`Failed to open ${urls[index]}, trying next...`);
        // Try next URL
        tryOpenApp(urls, index + 1);
      }
    };

    if (tagWriterUrls.length > 0) {
      tryOpenApp(tagWriterUrls);
    }
  };

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
        🧪 Test Deep Links NFC
      </Text>

      <Stack space="$3">
        <TouchableOpacity
          onPress={testNfcTools}
          disabled={testing}
          style={{
            backgroundColor: "#ff6b35",
            padding: 14,
            borderRadius: 8,
            alignItems: "center",
            opacity: testing ? 0.6 : 1,
          }}
        >
          <Stack space="$2" alignItems="center">
            <MaterialCommunityIcons
              name="cellphone-nfc"
              size={20}
              color="white"
            />
            <Text
              style={{
                color: "white",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              {testing ? "Test en cours..." : "Tester NFC Tools"}
            </Text>
          </Stack>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={testTagWriter}
          disabled={testing}
          style={{
            backgroundColor: "#0066cc",
            padding: 14,
            borderRadius: 8,
            alignItems: "center",
            opacity: testing ? 0.6 : 1,
          }}
        >
          <Stack space="$2" alignItems="center">
            <MaterialCommunityIcons name="tag" size={20} color="white" />
            <Text
              style={{
                color: "white",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              {testing ? "Test en cours..." : "Tester TagWriter NXP"}
            </Text>
          </Stack>
        </TouchableOpacity>
      </Stack>

      <View
        style={{
          marginTop: 16,
          padding: 12,
          backgroundColor: "#f8f9fa",
          borderRadius: 8,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            color: theme.colors.text.light,
            lineHeight: 16,
          }}
        >
          💡 <Text style={{ fontWeight: "600" }}>Instructions:</Text>
          {"\n"}• Appuyez sur un bouton pour tester l'ouverture directe{"\n"}•
          Si l'app est installée, elle s'ouvrira directement{"\n"}• Si l'app
          n'est pas installée, vous serez redirigé vers le store
        </Text>
      </View>
    </View>
  );
}
