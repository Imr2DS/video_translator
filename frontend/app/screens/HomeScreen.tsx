import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Picker } from "@react-native-picker/picker";
import { Video } from "expo-av";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

const BACKEND_URL = "http://192.168.1.197:5000/translate";

export default function HomeScreen() {
  const [video, setVideo] = useState<any>(null);
  const [translatedVideoUrl, setTranslatedVideoUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState("fr");
  const [loading, setLoading] = useState(false);

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "video/*", copyToCacheDirectory: true });
      const uri = result.assets?.[0]?.uri || result.uri;
      const name = result.assets?.[0]?.name || result.name;

      if (uri) {
        setVideo({ uri, name });
        setTranslatedVideoUrl(null);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible de sélectionner la vidéo");
    }
  };

  const translateVideoFile = async () => {
    if (!video) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("video", { uri: video.uri, name: video.name, type: "video/mp4" } as any);
      formData.append("target_lang", language);

      const response = await fetch(BACKEND_URL, { method: "POST", body: formData });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erreur serveur");
      }

      const data = await response.json();
      if (!data.translated_url) throw new Error("Aucune URL reçue du backend");

      setTranslatedVideoUrl(data.translated_url);
    } catch (error: any) {
      console.error(error);
      Alert.alert("Erreur", error.message || "Impossible de traduire la vidéo");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setVideo(null);
    setTranslatedVideoUrl(null);
    setLanguage("fr");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎬 Video Translator</Text>

      {/* Import Video */}
      {!video && !translatedVideoUrl && (
        <TouchableOpacity style={styles.importButton} onPress={pickVideo}>
          <MaterialIcons name="video-library" size={24} color="white" />
          <Text style={styles.importText}>Importer une vidéo</Text>
        </TouchableOpacity>
      )}

      {/* Original Video Section */}
      {video && !translatedVideoUrl && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            <Ionicons name="videocam-outline" size={18} /> Vidéo originale
          </Text>
          <Video source={{ uri: video.uri }} style={styles.videoPlayer} useNativeControls resizeMode="cover" />

          <Text style={styles.sectionLabel}>
            <FontAwesome5 name="language" size={16} /> Langue de traduction
          </Text>
          <Picker selectedValue={language} onValueChange={(v) => setLanguage(v)} style={styles.picker}>
            <Picker.Item label="Français" value="fr" />
            <Picker.Item label="Anglais" value="en" />
            <Picker.Item label="Espagnol" value="es" />
            <Picker.Item label="Arabe" value="ar" />
            <Picker.Item label="Japonais" value="ja" />
            <Picker.Item label="Allemand" value="de" />
          </Picker>

          <TouchableOpacity style={styles.translateButton} onPress={translateVideoFile}>
            {loading ? <ActivityIndicator color="white" /> : <Ionicons name="play-circle-outline" size={22} color="white" />}
            <Text style={styles.translateText}>Traduire</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Translated Video Section */}
      {translatedVideoUrl && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            <Ionicons name="videocam-outline" size={18} /> Vidéo traduite
          </Text>
          <Video source={{ uri: translatedVideoUrl }} style={styles.videoPlayer} useNativeControls resizeMode="cover" />

          <TouchableOpacity style={styles.resetButton} onPress={reset}>
            <Ionicons name="refresh-circle-outline" size={20} color="white" />
            <Text style={styles.translateText}>Traduire une autre vidéo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f3f7",
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
    color: "#222",
  },
  importButton: {
    backgroundColor: "#007bff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    marginBottom: 20,
  },
  importText: { color: "white", fontSize: 17, fontWeight: "600" },
  section: {
    marginVertical: 15,
  },
  sectionLabel: { fontSize: 16, fontWeight: "600", marginBottom: 10, color: "#333" },
  videoPlayer: { width: "100%", height: 250, borderRadius: 12, backgroundColor: "#ccc", marginBottom: 15 },
  picker: {
    backgroundColor: "#eaeaea",
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  translateButton: {
    backgroundColor: "#28a745",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  resetButton: {
    backgroundColor: "#ff6b6b",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
  },
  translateText: { color: "white", fontSize: 16, fontWeight: "600" },
});
