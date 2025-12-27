import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
  Platform,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { Stack, Text } from "tamagui";
import { theme } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";
import { supabase, Database } from "../lib/supabase";
import Constants from "expo-constants";
import { Picker } from "@react-native-picker/picker";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { LANGUAGES } from "../constants/languages";

type VideoRow = Database["public"]["Tables"]["videos"]["Row"];

const BACKEND_URL = "http://192.168.1.51:5000/retranslate";

export default function ModifierVideo() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();

  const [video, setVideo] = useState<VideoRow | null>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [targetLang, setTargetLang] = useState("");
  const [translationMode, setTranslationMode] =
    useState<"voice" | "subtitle">("voice");

  // Valeurs initiales
  const [initialTitle, setInitialTitle] = useState("");
  const [initialLang, setInitialLang] = useState("");
  const [initialMode, setInitialMode] =
    useState<"voice" | "subtitle">("voice");

  const [isSaving, setIsSaving] = useState(false);
  const [isRetranslating, setIsRetranslating] = useState(false);

  const LANGUAGE_OPTIONS = [
    { label: "Français", value: "fr" },
    { label: "Anglais", value: "en" },
    { label: "Espagnol", value: "es" },
    { label: "Allemand", value: "de" },
    { label: "Italien", value: "it" },
    { label: "Arabe", value: "ar" },
  ];

  const TRANSLATION_MODES = [
    { label: "Voix", value: "voice" },
    { label: "Sous-titres", value: "subtitle" },
  ];

  useEffect(() => {
    loadVideo();
  }, []);

  const loadVideo = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      setVideo(data);

      setTitle(data.title);
      setTargetLang(data.target_lang);
      setTranslationMode(data.translation_mode || "voice");

      setInitialTitle(data.title);
      setInitialLang(data.target_lang);
      setInitialMode(data.translation_mode || "voice");
    } catch {
      Alert.alert("Erreur", "Impossible de charger la vidéo");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     SAUVEGARDER
  ========================= */
  const handleSave = async () => {
    if (!video) return;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from("videos")
        .update({
          title,
          target_lang: targetLang,
          translation_mode: translationMode,
        })
        .eq("id", video.id)
        .eq("user_id", user!.id);

      if (error) throw error;

      Alert.alert("Succès", "Vidéo mise à jour");
      router.back();
    } catch {
      Alert.alert("Erreur", "Impossible de sauvegarder");
    } finally {
      setIsSaving(false);
    }
  };

  /* =========================
     RETRADUIRE
  ========================= */
  const retranslateVideo = async () => {
    if (!video?.original_url) {
      Alert.alert("Erreur", "URL originale introuvable");
      return;
    }

    try {
      setIsRetranslating(true);

      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_id: video.id,
          video_url: video.original_url,
          target_lang: targetLang,
          translation_mode: translationMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      Alert.alert("Succès", "Vidéo retraduite avec succès");
      router.back();
    } catch (e: any) {
      Alert.alert("Erreur", e.message || "Retraduction échouée");
    } finally {
      setIsRetranslating(false);
    }
  };

  if (loading) {
    return (
      <Stack flex={1} justifyContent="center" alignItems="center">
        <Text>Chargement...</Text>
      </Stack>
    );
  }

  /* =========================
     LOGIQUE DES CHANGEMENTS
  ========================= */
  const titleChanged = title !== initialTitle;
  const translationChanged =
    targetLang !== initialLang || translationMode !== initialMode;

  return (
    <Stack flex={1} backgroundColor="$background">
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <StatusBar translucent backgroundColor={theme.colors.primary.DEFAULT} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Modifier Vidéo</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.label}>Titre</Text>
        <Input value={title} onChangeText={setTitle} />

        {/* ✅ Bouton SAUVEGARDER juste après l'input du titre */}
        {titleChanged && (
            <Stack marginTop="$3">
                <Button
                    onPress={handleSave}
                    loading={isSaving}
                    
                >
                    Sauvegarder
                </Button>
          </Stack>
        )}

        <Text style={styles.label}>Langue cible</Text>
        <View style={styles.pickerContainer}>
          - <Picker selectedValue={targetLang} onValueChange={setTargetLang}>
                {LANGUAGES.map((lang) => (
                  <Picker.Item
                    key={lang.code}
                    label={lang.label}
                    value={lang.code}
                  />
                ))}
            </Picker>
        </View>

        <Text style={styles.label}>Mode de traduction</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={translationMode}
            onValueChange={setTranslationMode}
          >
            {TRANSLATION_MODES.map((m) => (
              <Picker.Item key={m.value} label={m.label} value={m.value} />
            ))}
          </Picker>
        </View>

        {/* 🔁 Bouton RETRADUIRE avec icône */}
        {translationChanged && (
          <Button
            onPress={retranslateVideo}
            loading={isRetranslating}
            style={{ marginTop: 16 }}
            icon={
              <MaterialCommunityIcons
                name="restart"
                size={20}
                color="white"
              />
            }
          >
            Retraduire
          </Button>
        )}
      </ScrollView>
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

/* =========================
   STYLES
========================= */
const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: theme.colors.primary.DEFAULT,
    paddingTop:
      Platform.OS === "android"
        ? StatusBar.currentHeight
        : Constants.statusBarHeight,
  },
  headerContent: { alignItems: "center", padding: 18 },
  title: { color: "white", fontSize: 22, fontWeight: "bold" },
  label: { marginTop: 12, fontWeight: "600" },
  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 6,
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
