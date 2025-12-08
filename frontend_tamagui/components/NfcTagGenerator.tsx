import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, XStack } from "tamagui";
import { theme } from "../constants/theme";

type NfcTagGeneratorProps = {
  visible: boolean;
  onClose: () => void;
  onTagGenerated: (nfcId: string) => void;
  animalName: string;
};

export default function NfcTagGenerator({
  visible,
  onClose,
  onTagGenerated,
  animalName,
}: NfcTagGeneratorProps) {
  const [generatedTag, setGeneratedTag] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateNfcTag = () => {
    setIsGenerating(true);

    // Generate a unique NFC tag ID
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const nfcId = `PET-${timestamp}-${randomStr}`.toUpperCase();

    setGeneratedTag(nfcId);
    setIsGenerating(false);
  };

  const copyToClipboard = async () => {
    if (generatedTag) {
      await Clipboard.setStringAsync(generatedTag);
      Alert.alert("Copié", "L'ID NFC a été copié dans le presse-papiers");
    }
  };

  const shareNfcId = async () => {
    if (generatedTag) {
      try {
        await Share.share({
          message: `ID NFC pour ${animalName}: ${generatedTag}`,
          title: "ID NFC Animal",
        });
      } catch (error) {
        console.error("Error sharing NFC ID:", error);
      }
    }
  };

  const openNfcToolsApp = () => {
    // Try multiple deep link formats for better compatibility
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

    if (Linking) {
      try {
        // Try multiple deep link formats
        const tryOpenApp = async (
          urls: string[],
          index: number = 0
        ): Promise<void> => {
          if (index >= urls.length) {
            // All URLs failed, open store
            if (fallbackUrl) {
              Linking.openURL(fallbackUrl);
            }
            return;
          }

          try {
            await Linking.openURL(urls[index]);
          } catch (error) {
            console.log(`Failed to open ${urls[index]}, trying next...`);
            // Try next URL
            tryOpenApp(urls, index + 1);
          }
        };

        if (nfcToolsUrls.length > 0) {
          tryOpenApp(nfcToolsUrls);
        } else if (fallbackUrl) {
          // Direct fallback to store
          Linking.openURL(fallbackUrl);
        }
      } catch (error) {
        console.error("Error opening NFC Tools:", error);
        // Final fallback
        if (fallbackUrl) {
          Linking.openURL(fallbackUrl);
        }
      }
    } else {
      Alert.alert(
        "Erreur",
        "Impossible d'ouvrir l'application NFC. Veuillez installer NFC Tools manuellement."
      );
    }
  };

  const openTagWriterApp = () => {
    // Try multiple deep link formats for better compatibility
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

    if (Linking) {
      try {
        // Try multiple deep link formats
        const tryOpenApp = async (
          urls: string[],
          index: number = 0
        ): Promise<void> => {
          if (index >= urls.length) {
            // All URLs failed, open store
            if (fallbackUrl) {
              Linking.openURL(fallbackUrl);
            }
            return;
          }

          try {
            await Linking.openURL(urls[index]);
          } catch (error) {
            console.log(`Failed to open ${urls[index]}, trying next...`);
            // Try next URL
            tryOpenApp(urls, index + 1);
          }
        };

        if (tagWriterUrls.length > 0) {
          tryOpenApp(tagWriterUrls);
        } else if (fallbackUrl) {
          // Direct fallback to store
          Linking.openURL(fallbackUrl);
        }
      } catch (error) {
        console.error("Error opening TagWriter:", error);
        // Final fallback
        if (fallbackUrl) {
          Linking.openURL(fallbackUrl);
        }
      }
    } else {
      Alert.alert(
        "Erreur",
        "Impossible d'ouvrir l'application NFC. Veuillez installer TagWriter NXP manuellement."
      );
    }
  };

  const handleUseTag = () => {
    if (generatedTag) {
      onTagGenerated(generatedTag);
      onClose();
    }
  };

  const handleClose = () => {
    setGeneratedTag("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <ScrollView
          style={{
            backgroundColor: "white",
            borderRadius: 20,
            padding: 24,
            width: "100%",
            maxWidth: 400,
            maxHeight: "80%",
          }}
        >
          {/* Header */}
          <XStack
            alignItems="center"
            justifyContent="space-between"
            marginBottom="$4"
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: theme.colors.text.DEFAULT,
              }}
            >
              Générer Tag NFC
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={theme.colors.text.DEFAULT}
              />
            </TouchableOpacity>
          </XStack>

          {/* Content */}
          <Stack space="$4">
            <Text
              style={{
                fontSize: 16,
                color: theme.colors.text.light,
                textAlign: "center",
                lineHeight: 24,
              }}
            >
              Générez un ID NFC unique pour {animalName}, puis utilisez une app
              externe pour l&apos;écrire sur votre tag NFC.
            </Text>

            {/* Generate Button */}
            {!generatedTag && (
              <TouchableOpacity
                onPress={generateNfcTag}
                disabled={isGenerating}
                style={{
                  backgroundColor: theme.colors.primary.DEFAULT,
                  padding: 16,
                  borderRadius: 12,
                  alignItems: "center",
                  opacity: isGenerating ? 0.6 : 1,
                }}
              >
                <XStack space="$2" alignItems="center">
                  <MaterialCommunityIcons
                    name="tag-plus"
                    size={24}
                    color="white"
                  />
                  <Text
                    style={{
                      color: "white",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    {isGenerating ? "Génération..." : "Générer ID NFC"}
                  </Text>
                </XStack>
              </TouchableOpacity>
            )}

            {/* Generated Tag Display */}
            {generatedTag && (
              <View
                style={{
                  backgroundColor: "#f8f9fa",
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: theme.colors.primary.DEFAULT,
                  borderStyle: "dashed",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.colors.text.light,
                    marginBottom: 8,
                    textAlign: "center",
                  }}
                >
                  ID NFC généré pour {animalName}:
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: theme.colors.primary.DEFAULT,
                    textAlign: "center",
                    fontFamily: "monospace",
                  }}
                >
                  {generatedTag}
                </Text>
              </View>
            )}

            {/* Actions */}
            {generatedTag && (
              <Stack space="$3">
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.colors.text.light,
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  Copiez cet ID et utilisez une app NFC pour l&apos;écrire sur votre
                  tag:
                </Text>

                {/* Copy and Share buttons */}
                <XStack space="$2" justifyContent="center">
                  <TouchableOpacity
                    onPress={copyToClipboard}
                    style={{
                      backgroundColor: "#28a745",
                      padding: 12,
                      borderRadius: 8,
                      flex: 1,
                      alignItems: "center",
                    }}
                  >
                    <XStack space="$1" alignItems="center">
                      <MaterialCommunityIcons
                        name="content-copy"
                        size={16}
                        color="white"
                      />
                      <Text
                        style={{
                          color: "white",
                          fontSize: 14,
                          fontWeight: "600",
                        }}
                      >
                        Copier
                      </Text>
                    </XStack>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={shareNfcId}
                    style={{
                      backgroundColor: "#007bff",
                      padding: 12,
                      borderRadius: 8,
                      flex: 1,
                      alignItems: "center",
                    }}
                  >
                    <XStack space="$1" alignItems="center">
                      <MaterialCommunityIcons
                        name="share"
                        size={16}
                        color="white"
                      />
                      <Text
                        style={{
                          color: "white",
                          fontSize: 14,
                          fontWeight: "600",
                        }}
                      >
                        Partager
                      </Text>
                    </XStack>
                  </TouchableOpacity>
                </XStack>

                {/* NFC App buttons */}
                <Stack space="$2">
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: theme.colors.text.DEFAULT,
                      textAlign: "center",
                    }}
                  >
                    Apps recommandées pour écrire le tag:
                  </Text>

                  <TouchableOpacity
                    onPress={openNfcToolsApp}
                    style={{
                      backgroundColor: "#ff6b35",
                      padding: 14,
                      borderRadius: 8,
                      alignItems: "center",
                    }}
                  >
                    <XStack space="$2" alignItems="center">
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
                        Ouvrir NFC Tools
                      </Text>
                    </XStack>
                  </TouchableOpacity>

                  {/* <TouchableOpacity
                    onPress={openTagWriterApp}
                    style={{
                      backgroundColor: "#0066cc",
                      padding: 14,
                      borderRadius: 8,
                      alignItems: "center",
                    }}
                  >
                    <XStack space="$2" alignItems="center">
                      <MaterialCommunityIcons
                        name="tag"
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
                        Ouvrir TagWriter NXP
                      </Text>
                    </XStack>
                  </TouchableOpacity> */}
                </Stack>

                {/* Instructions */}
                <View
                  style={{
                    backgroundColor: "#e3f2fd",
                    padding: 12,
                    borderRadius: 8,
                    marginTop: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#1565c0",
                      lineHeight: 18,
                    }}
                  >
                    📱 Instructions:{"\n"}
                    1. Copiez l&apos;ID NFC ci-dessus{"\n"}
                    2. Ouvrez une app NFC (NFC Tools ou TagWriter){"\n"}
                    3. Sélectionnez &quot;Écrire&quot; → &quot;Enregistrement de données&quot; →
                    &quot;Texte&quot;{"\n"}
                    4. Collez l&apos;ID NFC et écrivez sur votre tag{"\n"}
                    5. Revenez ici et cliquez &quot;Utiliser ce tag&quot;
                  </Text>
                </View>

                {/* Use Tag Button */}
                <TouchableOpacity
                  onPress={handleUseTag}
                  style={{
                    backgroundColor: "#28a745",
                    padding: 16,
                    borderRadius: 12,
                    alignItems: "center",
                    marginTop: 8,
                    marginBottom: 20,
                  }}
                >
                  <XStack space="$2" alignItems="center">
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={24}
                      color="white"
                    />
                    <Text
                      style={{
                        color: "white",
                        fontSize: 16,
                        fontWeight: "600",
                      }}
                    >
                      Utiliser ce tag
                    </Text>
                  </XStack>
                </TouchableOpacity>
              </Stack>
            )}
          </Stack>
        </ScrollView>
      </View>
    </Modal>
  );
}
