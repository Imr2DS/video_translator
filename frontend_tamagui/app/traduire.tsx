import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Alert, Platform, ActivityIndicator } from "react-native";
import { Text, Stack } from "tamagui";
import * as DocumentPicker from "expo-document-picker";
import { Picker } from "@react-native-picker/picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Video } from "expo-av";
import { theme } from "../constants/theme";
import { useRouter } from "expo-router";

const BACKEND_URL = "http://192.168.1.197:5000/translate";

export default function Traduire() {
  const router = useRouter();
  const [videoFile, setVideoFile] = useState<{ uri: string; name: string } | null>(null);
  const [targetLang, setTargetLang] = useState("fr");
  const [translatedVideoUrl, setTranslatedVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "video/*", copyToCacheDirectory: true });
      const uri = result.assets?.[0]?.uri || result.uri;
      const name = result.assets?.[0]?.name || result.name;

      if (uri) {
        setVideoFile({ uri, name });
        setTranslatedVideoUrl(null);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible de sélectionner la vidéo");
    }
  };

  const translateVideoFile = async () => {
    if (!videoFile) {
      Alert.alert("Erreur", "Veuillez importer une vidéo");
      return;
    }
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("video", { uri: videoFile.uri, name: videoFile.name, type: "video/mp4" } as any);
      formData.append("target_lang", targetLang);

      const response = await fetch(BACKEND_URL, { method: "POST", body: formData });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erreur serveur");
      }

      const data = await response.json();
      if (!data.translated_url) throw new Error("Aucune URL reçue du backend");

      setTranslatedVideoUrl(data.translated_url);
      Alert.alert("Succès", "Vidéo traduite avec succès !");
    } catch (error: any) {
      console.error(error);
      Alert.alert("Erreur", error.message || "Impossible de traduire la vidéo");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setVideoFile(null);
    setTranslatedVideoUrl(null);
    setTargetLang("fr");
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.DEFAULT }}>
      <Stack flex={1} padding="$4">
        <Text style={styles.title}>Traduire une vidéo</Text>

        {!videoFile && !translatedVideoUrl && (
          <TouchableOpacity style={styles.importButton} onPress={pickVideo}>
            <MaterialCommunityIcons name="video-plus" size={24} color="#3498db" />
            <Text style={styles.importButtonText}>Importer une vidéo</Text>
          </TouchableOpacity>
        )}

        {videoFile && !translatedVideoUrl && (
          <Stack space="$3">
            <Text style={styles.label}>Vidéo sélectionnée:</Text>
            <Text style={styles.videoName}>{videoFile.name}</Text>

            <Text style={styles.label}>Choisir la langue de traduction:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={targetLang}
                onValueChange={(v) => setTargetLang(v)}
                style={{ color: "#333" }}
              >
                <Picker.Item label="Français" value="fr" />
                <Picker.Item label="Anglais" value="en" />
                <Picker.Item label="Espagnol" value="es" />
                <Picker.Item label="Allemand" value="de" />
                <Picker.Item label="Italien" value="it" />
                <Picker.Item label="Arabe" value="ar" />
              </Picker>
            </View>

            <TouchableOpacity style={styles.translateButton} onPress={translateVideoFile} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <MaterialCommunityIcons name="translate" size={24} color="#27ae60" />}
              <Text style={styles.translateButtonText}>{loading ? "Traduction en cours..." : "Traduire"}</Text>
            </TouchableOpacity>
          </Stack>
        )}

        {translatedVideoUrl && (
          <Stack space="$3" marginTop="$6">
            <Text style={styles.label}>Vidéo traduite:</Text>
            <Video
              source={{ uri: translatedVideoUrl }}
              style={{ width: "100%", height: 250, borderRadius: 12 }}
              useNativeControls
              resizeMode="cover"
              isLooping
            />

            <TouchableOpacity style={styles.resetButton} onPress={reset}>
              <MaterialCommunityIcons name="refresh" size={24} color="#ff6b6b" />
              <Text style={styles.translateButtonText}>Traduire une autre vidéo</Text>
            </TouchableOpacity>
          </Stack>
        )}
      </Stack>

      {/* Barre du bas (Bottom Tab) */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomButton} onPress={() => router.push("/home")}>
          <MaterialCommunityIcons name="home" size={24} color="#888888" />
          <Text style={styles.bottomButtonText}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} onPress={() => router.push("/my-videos")}>
          <MaterialCommunityIcons name="video" size={24} color="#888888" />
          <Text style={styles.bottomButtonText}>Vidéos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} onPress={() => router.push("/search")}>
          <MaterialCommunityIcons name="magnify" size={24} color="#888888" />
          <Text style={styles.bottomButtonText}>Rechercher</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} onPress={() => router.push("/profile")}>
          <MaterialCommunityIcons name="account" size={24} color="#888888" />
          <Text style={styles.bottomButtonText}>Profil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "bold", color: "#333", marginBottom: 16 },
  importButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#3498db",
    marginBottom: 16,
  },
  importButtonText: { color: "#3498db", fontWeight: "600", marginLeft: 8 },
  translateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#27ae60",
    padding: 14,
    borderRadius: 12,
    justifyContent: "center",
    gap: 8,
  },
  translateButtonText: { color: "white", fontWeight: "600", fontSize: 16 },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff6b6b",
    padding: 14,
    borderRadius: 12,
    justifyContent: "center",
    gap: 8,
  },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 4, color: "#333" },
  videoName: { fontSize: 13, color: "#555", marginBottom: 8 },
  pickerContainer: {
    backgroundColor: "#eaeaea",
    borderRadius: 12,
    marginBottom: 16,
    ...Platform.select({ android: { paddingHorizontal: 8 } }),
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 60,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    backgroundColor: "white",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomButton: { justifyContent: "center", alignItems: "center" },
  bottomButtonText: { fontSize: 10, color: "#888888", marginTop: 2 },
});
