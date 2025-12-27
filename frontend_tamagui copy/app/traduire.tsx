// app/traduire.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Platform,
  StatusBar,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Stack, Text } from "tamagui";
import Constants from "expo-constants";
import * as DocumentPicker from "expo-document-picker";
import { Video } from "expo-av";
import { Picker } from "@react-native-picker/picker";

import { supabase } from "../lib/supabase";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { theme } from "../constants/theme";
import { LANGUAGES } from "../constants/languages";

const BACKEND_URL = "http://192.168.1.51:5000/translate";

export default function Traduire() {
  const router = useRouter();

  const [videoFile, setVideoFile] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);

  const [title, setTitle] = useState("");
  const [targetLang, setTargetLang] = useState("fr");
  const [translationMode, setTranslationMode] =
    useState<"voice" | "subtitle">("voice");

  const [translatedVideoUrl, setTranslatedVideoUrl] = useState<string | null>(null);
  const [subtitleUrl, setSubtitleUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* =======================
     Import vidéo
  ======================= */
  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "video/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) return;

      setVideoFile({
        uri: asset.uri,
        name: asset.name ?? `video_${Date.now()}.mp4`,
        type: asset.mimeType ?? "video/mp4",
      });

      setTranslatedVideoUrl(null);
      setSubtitleUrl(null);
    } catch {
      Alert.alert("Erreur", "Impossible d'importer la vidéo");
    }
  };

  /* =======================
     Upload Supabase
  ======================= */
  const uploadToSupabase = async () => {
    if (!videoFile) throw new Error("Aucune vidéo");

    const response = await fetch(videoFile.uri);
    const arrayBuffer = await response.arrayBuffer();

    const filePath = `user_${Date.now()}_${videoFile.name}`;

    const { error } = await supabase.storage
      .from("original_videos")
      .upload(filePath, new Uint8Array(arrayBuffer), {
        contentType: videoFile.type,
        upsert: true,
      });

    if (error) {
      throw new Error("Erreur upload Supabase : " + error.message);
    }

    const { data } = supabase.storage
      .from("original_videos")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  /* =======================
     Traduction
  ======================= */
  const translateVideo = async () => {
    if (!videoFile) return Alert.alert("Erreur", "Importer une vidéo");
    if (!title.trim()) return Alert.alert("Erreur", "Saisir un titre");

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Utilisateur non authentifié");

      const originalUrl = await uploadToSupabase();

      const formData = new FormData();
      formData.append("original_url", originalUrl);
      formData.append("title", title);
      formData.append("target_lang", targetLang);
      formData.append("translation_mode", translationMode);
      formData.append("user_id", user.id);

      const res = await fetch(BACKEND_URL, {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text);

      const data = JSON.parse(text);

      setTranslatedVideoUrl(data.translated_url || null);
      setSubtitleUrl(data.subtitle_url || null);

      Alert.alert("Succès", "Traduction terminée 🎉");
    } catch (e: any) {
      Alert.alert("Erreur", e.message || "Erreur de traduction");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setVideoFile(null);
    setTitle("");
    setTargetLang("fr");
    setTranslationMode("voice");
    setTranslatedVideoUrl(null);
    setSubtitleUrl(null);
  };

  return (
    <Stack flex={1} backgroundColor="$background">
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <StatusBar translucent backgroundColor={theme.colors.primary.DEFAULT} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Traduire une vidéo</Text>
        </View>
      </View>

      <Stack flex={1} padding="$4">
        {!videoFile && (
          <Button
            onPress={pickVideo}
            icon={<MaterialCommunityIcons name="video-plus" size={20} color="white" />}
          >
            Importer une vidéo
          </Button>
        )}

        {videoFile && !translatedVideoUrl && (
          <Stack space="$3" marginTop="$4">
            <Text style={styles.label}>Vidéo sélectionnée</Text>
            <Input value={videoFile.name} editable={false} />

            <Text style={styles.label}>Titre</Text>
            <Input value={title} onChangeText={setTitle} />

            {/* ✅ Langue cible — même style que ModifierVideo */}
            <Text style={styles.label}>Langue cible</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={targetLang} onValueChange={setTargetLang}>
                {LANGUAGES.map((lang) => (
                  <Picker.Item
                    key={lang.code}
                    label={lang.label}
                    value={lang.code}
                  />
                ))}
              </Picker>
            </View>

            {/* ✅ Mode de traduction — même style */}
            <Text style={styles.label}>Mode de traduction</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={translationMode}
                onValueChange={setTranslationMode}
              >
                <Picker.Item label="Voix traduite" value="voice" />
                <Picker.Item label="Sous-titres" value="subtitle" />
              </Picker>
            </View>

            <Button
              onPress={translateVideo}
              loading={loading}
              icon={<MaterialCommunityIcons name="translate" size={20} color="white" />}
            >
              Traduire
            </Button>
          </Stack>
        )}

        {translatedVideoUrl && (
          <Stack space="$3" marginTop="$5">
            <Video
              source={{ uri: translatedVideoUrl }}
              style={{ width: "100%", height: 250, borderRadius: 12 }}
              useNativeControls
            />

            {subtitleUrl && (
              <Text style={{ color: "#10b981" }}>
                Sous-titres générés ✔
              </Text>
            )}
            
            
            <Stack marginTop="$3">
              <Button
                onPress={reset}
                variant="outline"
                icon={
                  <MaterialCommunityIcons
                    name="restart"
                    size={20}
                    color="#ff9900ff"
                  />
                }
              >
                Traduire une autre vidéo
              </Button>
            </Stack>
          </Stack>
        )}
      </Stack>

      {/* Barre inférieure */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomButton} onPress={() => router.push("/home")}>
          <MaterialCommunityIcons name="home" size={24} color="#888" />
          <Text style={styles.bottomButtonText}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} onPress={() => router.push("/videos")}>
          <MaterialCommunityIcons name="video" size={24} color="#ff9900ff" />
          <Text style={styles.bottomButtonText}>Vidéos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} onPress={() => router.push("/search")}>
          <MaterialCommunityIcons name="magnify" size={24} color="#888" />
          <Text style={styles.bottomButtonText}>Recherche</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} onPress={() => router.push("/profile")}>
          <MaterialCommunityIcons name="account" size={24} color="#888" />
          <Text style={styles.bottomButtonText}>Profil</Text>
        </TouchableOpacity>
      </View>
    </Stack>
  );
}

/* =======================
   STYLES (identiques à ModifierVideo)
======================= */
const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: theme.colors.primary.DEFAULT,
    paddingTop:
      Platform.OS === "android"
        ? StatusBar.currentHeight
        : Constants.statusBarHeight,
  },
  headerContent: { padding: 18, alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", color: "white" },

  label: {
    marginTop: 12,
    fontWeight: "600",
  },

  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 6,
    borderColor: "#6B7280",
  },

  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 60,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    backgroundColor: "white",
  },
  bottomButton: { justifyContent: "center", alignItems: "center" },
  bottomButtonText: { fontSize: 10, color: "#666", marginTop: 2 },
});
