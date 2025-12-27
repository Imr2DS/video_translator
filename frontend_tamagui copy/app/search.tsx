import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
  StatusBar,
  TextInput,
} from "react-native";
import { Stack, Text } from "tamagui";
import { theme } from "../constants/theme";
import { supabase, Database } from "../lib/supabase";
import Constants from "expo-constants";

type Video = Database["public"]["Tables"]["videos"]["Row"];

const LANGUAGE_NAMES: { [key: string]: string } = {
  en: "Anglais",
  fr: "Français",
  de: "Allemand",
  es: "Espagnol",
  it: "Italien",
};

const TRANSLATION_MODE_LABELS: { [key: string]: string } = {
  subtitle: "Sous-titres",
  voice: "Voix",
  both: "Voix + Sous-titres",
};

export default function Search() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);

  const searchVideos = async (text: string) => {
    if (!text.trim()) {
      setVideos([]); // aucun résultat si input vide
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .or(
          `title.ilike.%${text}%,target_lang.ilike.%${text}%,translation_mode.ilike.%${text}%`
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (e: any) {
      Alert.alert("Erreur", e.message || "Recherche échouée");
    } finally {
      setLoading(false);
    }
  };

  // Recherche en temps réel avec debounce
  useEffect(() => {
    const delay = setTimeout(() => {
      searchVideos(query);
    }, 300);
    return () => clearTimeout(delay);
  }, [query]);

  return (
    <Stack flex={1} backgroundColor="$background">
      {/* Bande supérieure */}
      <View style={styles.headerContainer}>
        <StatusBar translucent backgroundColor={theme.colors.primary.DEFAULT} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Rechercher une vidéo</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Stack flex={1} padding="$4">
          {/* Input avec icône recherche */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Titre, langue ou mode..."
              value={query}
              onChangeText={setQuery}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => searchVideos(query)}
            >
              <MaterialCommunityIcons name="magnify" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Résultats */}
          <View style={styles.videosGrid}>
            {videos.map((video) => (
              <TouchableOpacity
                key={video.id}
                style={styles.videoCard}
                onPress={() => router.push(`/videoDetail?id=${video.id}`)}
              >
                <View style={styles.videoThumbnailContainer}>
                  {video.thumbnail_url ? (
                    <Image
                      source={{ uri: video.thumbnail_url }}
                      style={styles.videoThumbnail}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.noThumbnailPlaceholder}>
                      <MaterialCommunityIcons
                        name="video"
                        size={48}
                        color="#bbb"
                      />
                    </View>
                  )}

                  <View style={styles.playOverlay}>
                    <MaterialCommunityIcons
                      name="play-circle"
                      size={48}
                      color="rgba(255,255,255,0.8)"
                    />
                  </View>

                  {video.translated_url && (
                    <View style={styles.translatedBadge}>
                      <Text style={styles.translatedBadgeText}>Traduit</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.videoTitle} numberOfLines={2}>
                  {video.title}
                </Text>

                {video.target_lang && (
                  <Text style={styles.videoLang}>
                    Langue :{" "}
                    {LANGUAGE_NAMES[video.target_lang] || video.target_lang}
                  </Text>
                )}

                {video.translation_mode && (
                  <Text style={styles.videoLang}>
                    Mode :{" "}
                    {TRANSLATION_MODE_LABELS[video.translation_mode] ||
                      video.translation_mode}
                  </Text>
                )}
              </TouchableOpacity>
            ))}

            {!loading && videos.length === 0 && query.trim() !== "" && (
              <Text style={{ textAlign: "center", marginTop: 20 }}>
                Aucun résultat
              </Text>
            )}
          </View>
        </Stack>
      </ScrollView>

      {/* Barre inférieure */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => router.push("/home")}
        >
          <MaterialCommunityIcons name="home" size={24} color="#888" />
          <Text style={styles.bottomButtonText}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => router.push("/videos")}
        >
          <MaterialCommunityIcons name="video" size={24} color="#888" />
          <Text style={styles.bottomButtonText}>Vidéos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => router.push("/search")}
        >
          <MaterialCommunityIcons name="magnify" size={24} color="#ff9900ff" />
          <Text style={styles.bottomButtonText}>Recherche</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => router.push("/profile")}
        >
          <MaterialCommunityIcons name="account" size={24} color="#888" />
          <Text style={styles.bottomButtonText}>Profil</Text>
        </TouchableOpacity>
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
  headerContent: {
    width: "100%",
    paddingVertical: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: "bold", color: "white" },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#6B7280",
    paddingLeft: 8,
    height: 48,
  },
  searchInput: { flex: 1, height: "100%" },
  searchButton: {
    backgroundColor: theme.colors.primary.DEFAULT,
    padding:11,
    borderRadius: 6,
    marginLeft: 8,
  },

  videosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical: 16,
    justifyContent: "space-between",
  },
  videoCard: {
    width: "48%",
    marginBottom: 16,
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e9ecef",
    paddingBottom: 8,
  },
  videoThumbnailContainer: {
    width: "100%",
    height: 120,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  videoThumbnail: { width: "100%", height: "100%" },
  noThumbnailPlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  playOverlay: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  translatedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#10b981",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  translatedBadgeText: { fontSize: 10, color: "white", fontWeight: "600" },
  videoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 4,
  },
  videoLang: { fontSize: 12, color: "#666", marginTop: 2 },

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
