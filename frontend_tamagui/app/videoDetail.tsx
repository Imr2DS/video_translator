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
import { Video } from "expo-av";
import { Button } from "../components/Button";

type VideoRow = Database["public"]["Tables"]["videos"]["Row"];

export default function VideoDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();

  const [video, setVideo] = useState<VideoRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadVideo();
  }, [id]);

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
    } catch {
      Alert.alert("Erreur", "Impossible de charger la vidéo");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Confirmation",
      "Voulez-vous vraiment supprimer cette vidéo ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("videos")
                .delete()
                .eq("id", video!.id)
                .eq("user_id", user!.id);
              if (error) throw error;
              Alert.alert("Succès", "Vidéo supprimée");
              router.push("/home");
            } catch {
              Alert.alert("Erreur", "Impossible de supprimer la vidéo");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <Stack flex={1} justifyContent="center" alignItems="center">
        <Text>Chargement...</Text>
      </Stack>
    );
  }

  if (!video) return null;

  return (
    <Stack flex={1} backgroundColor="$background">
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <StatusBar translucent backgroundColor={theme.colors.primary.DEFAULT} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Détails Vidéo</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {video.translated_url ? (
          <View style={styles.videoWrapper}>
            <Video
              source={{ uri: video.translated_url }}
              style={styles.video}
              useNativeControls
              resizeMode="contain"
              shouldPlay={false}
            />
          </View>
        ) : (
          <View style={styles.noThumbnail}>
            <MaterialCommunityIcons name="video-off" size={64} color="#bbb" />
          </View>
        )}

        {/* Bouton Modifier */}
        <Button
          onPress={() => router.push(`/modifierVideo?id=${video.id}`)}
          style={{ marginTop: 12 }}
        >
          Modifier la vidéo
        </Button>

        {/* Bouton Supprimer */}
        <Button
          variant="outline"
          style={{ marginTop: 12 }}
          onPress={handleDelete}
        >
          Supprimer la vidéo
        </Button>
      </ScrollView>

      {/* BARRE INFÉRIEURE */}
      <View style={styles.bottomBar}>
        {[
          ["home", "Accueil", "/home"],
          ["video", "Vidéos", "/videos"],
          ["magnify", "Recherche", "/search"],
          ["account", "Profil", "/profile"],
        ].map(([icon, label, path]) => (
          <TouchableOpacity
            key={path}
            style={styles.bottomButton}
            onPress={() => router.push(path)}
          >
            <MaterialCommunityIcons
              name={icon as any}
              size={24}
              color={path === "/videos" ? "#ff9900ff" : "#888"}
            />
            <Text style={styles.bottomButtonText}>{label}</Text>
          </TouchableOpacity>
        ))}
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
  headerContent: { paddingVertical: 18, alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", color: "white" },

  videoWrapper: {
    width: "100%",
    height: 260,
    borderRadius: 12,
    backgroundColor: "#000",
    overflow: "hidden",
    marginBottom: 12,
  },
  video: {
    width: "100%",
    height: "100%",
  },

  noThumbnail: {
    height: 260,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
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
