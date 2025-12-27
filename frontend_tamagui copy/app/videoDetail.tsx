import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
  Platform,
  StatusBar,
} from "react-native";
import { Stack, Text } from "tamagui";
import { theme } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";
import { supabase, Database } from "../lib/supabase";
import Constants from "expo-constants";
import { Video, ResizeMode } from "expo-av";
import * as ScreenOrientation from "expo-screen-orientation";
import { Button } from "../components/Button";

type VideoRow = Database["public"]["Tables"]["videos"]["Row"];

export default function VideoDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const videoRef = useRef<Video>(null);

  const [video, setVideo] = useState<VideoRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadVideo();

    // 🔓 Autoriser toutes les orientations
    ScreenOrientation.unlockAsync();

    return () => {
      // 🔒 Retour portrait à la sortie
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    };
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

  const handleFullscreen = async () => {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    );
    await videoRef.current?.presentFullscreenPlayer();
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
          <>
            <Video
              ref={videoRef}
              source={{ uri: video.translated_url }}
              style={styles.videoPlayer}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={false}
            />

            <Button
              onPress={handleFullscreen}
              icon={
                <MaterialCommunityIcons
                  name="fullscreen"
                  size={20}
                  color="white"
                />
              }
            >
              Plein écran
            </Button>
          </>
        ) : (
          <View style={styles.noThumbnail}>
            <MaterialCommunityIcons name="video-off" size={64} color="#bbb" />
          </View>
        )}

        <Button onPress={() => router.push(`/modifierVideo?id=${video.id}`)}>
          Modifier la vidéo
        </Button>

        <Stack marginTop="$3">
          <Button variant="outline">Supprimer la vidéo</Button>
        </Stack>
      </ScrollView>

      {/* BARRE INFÉRIEURE */}
      <View style={styles.bottomBar}>
        {[
          ["home", "Accueil", "/home"],
          ["video", "Vidéos", "/videos"],
          ["magnify", "Recherche", "/search"],
          ["account", "Profil", "/profile"],
        ].map(([icon, label, path]) => (
          <View
            key={path}
            style={styles.bottomButton}
            onTouchEnd={() => router.push(path)}
          >
            <MaterialCommunityIcons name={icon as any} size={24} color="#888" />
            <Text style={styles.bottomButtonText}>{label}</Text>
          </View>
        ))}
      </View>
    </Stack>
  );
}

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

  videoPlayer: {
    width: "100%",
    height: 260,
    borderRadius: 12,
    backgroundColor: "#000",
    marginBottom: 12,
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
