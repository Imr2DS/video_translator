// Importations
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
  StatusBar,
} from "react-native";
import { Stack, Text } from "tamagui";
import { theme } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";
import type { Database } from "../lib/supabase";
import { fetchUserVideos, supabase } from "../lib/supabase";
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
  voice: "Voix",
  subtitle: "Sous-titres",
};


export default function MyVideos() {
  const router = useRouter();
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace("/login");
          return;
        }
        if (!user) await new Promise((resolve) => setTimeout(resolve, 500));
        setIsCheckingAuth(false);
        if (user) await loadVideos();
      } catch (err) {
        console.error(err);
        Alert.alert("Erreur", "Erreur de vérification d'authentification");
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, [user]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      if (!user) return;
      const data = await fetchUserVideos(user.id);
      setVideos(data || []);
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "Impossible de charger les vidéos");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVideos();
    setRefreshing(false);
  };

  if (isCheckingAuth) {
    return (
      <Stack flex={1} justifyContent="center" alignItems="center">
        <Text style={{ color: theme.colors.text.light }}>Vérification...</Text>
      </Stack>
    );
  }

  if (loading) {
    return (
      <Stack flex={1} justifyContent="center" alignItems="center">
        <Text style={{ color: theme.colors.text.light }}>Chargement...</Text>
      </Stack>
    );
  }

  return (
    <Stack flex={1} backgroundColor="$background">
      {/* Bande supérieure */}
      <View style={styles.headerContainer}>
        <StatusBar translucent backgroundColor={theme.colors.primary.DEFAULT} barStyle="light-content" />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Mes Vidéos</Text>
        </View>
      </View>

      {/* Contenu principal */}
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background.DEFAULT }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Stack flex={1} padding="$4">
          {videos.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="video-off" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Aucune vidéo trouvée</Text>
              <Text style={styles.emptySubtext}>Ajoutez votre première vidéo pour commencer</Text>
            </View>
          ) : (
            <View style={styles.videosGrid}>
              {videos.map((video) => (
                <TouchableOpacity
                  key={video.id}
                  style={styles.videoCard}
                  onPress={() => router.push(`/videoDetail?id=${video.id}`)} // <-- Navigation vers VideoDetail
                >
                  <View style={styles.videoThumbnailContainer}>
                    {video.thumbnail_url ? (
                      <Image
                        source={{ uri: video.thumbnail_url }}
                        style={styles.videoThumbnail}
                      />
                    ) : (
                      <View style={styles.noThumbnailPlaceholder}>
                        <MaterialCommunityIcons name="video" size={48} color="#bbb" />
                      </View>
                    )}
                    <View style={styles.playOverlay}>
                      <MaterialCommunityIcons name="play-circle" size={48} color="rgba(255,255,255,0.8)" />
                    </View>
                    {video.translated_url && (
                      <View style={styles.translatedBadge}>
                        <Text style={styles.translatedBadgeText}>Traduit</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
                  {video.target_lang && (
                    <Text style={styles.videoLang}>
                      Langue : {LANGUAGE_NAMES[video.target_lang] || video.target_lang}
                    </Text>
                  )}
                  {video.translation_mode && (
                    <Text style={styles.videoLang}>
                      Mode : {TRANSLATION_MODE_LABELS[video.translation_mode] || video.translation_mode}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Stack>
      </ScrollView>

      {/* Bouton + au dessus de la barre inférieure */}
      <TouchableOpacity
        style={styles.addFloatingButton}
        onPress={() => router.push("/traduire")}
      >
        <MaterialCommunityIcons name="plus" size={28} color="white" />
      </TouchableOpacity>

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

// Styles inchangés (ou légèrement adaptés)
const styles = StyleSheet.create({
  headerContainer: { backgroundColor: theme.colors.primary.DEFAULT, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : Constants.statusBarHeight },
  headerContent: { width: "100%", paddingVertical: 18, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", color: "white" },
  videosGrid: { flexDirection: "column", justifyContent: "space-between" },
  videoCard: { width: "100%", marginBottom: 20, backgroundColor: "white", borderRadius: 16, overflow: "hidden", alignItems: "center", borderWidth: 1, borderColor: "#e9ecef", paddingBottom: 12 },
  videoThumbnailContainer: { width: "100%", height: 200, backgroundColor: "#f0f0f0", justifyContent: "center", alignItems: "center", position: "relative" },
  videoThumbnail: { width: "100%", height: "100%", resizeMode: "cover" },
  noThumbnailPlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  playOverlay: { position: "absolute", justifyContent: "center", alignItems: "center", top: 0, left: 0, right: 0, bottom: 0 },
  translatedBadge: { position: "absolute", top: 8, right: 8, backgroundColor: "#10b981", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  translatedBadgeText: { fontSize: 10, color: "white", fontWeight: "600" },
  videoTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginTop: 8, textAlign: "center", paddingHorizontal: 8 },
  videoLang: { fontSize: 13, color: "#666", marginTop: 4 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 40, backgroundColor: "white", margin: 16, borderRadius: 8 },
  emptyText: { fontSize: 18, fontWeight: "bold", color: "#666", marginTop: 16 },
  emptySubtext: { fontSize: 14, color: "#999", marginTop: 8, textAlign: "center", marginBottom: 16 },
  addFloatingButton: { position: "absolute", bottom: 70, right: 20, backgroundColor: theme.colors.primary.DEFAULT, width: 56, height: 56, borderRadius: 28, justifyContent: "center", alignItems: "center", elevation: 5 },
  bottomBar: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", height: 60, borderTopWidth: 1, borderTopColor: "#e9ecef", backgroundColor: "white" },
  bottomButton: { justifyContent: "center", alignItems: "center" },
  bottomButtonText: { fontSize: 10, color: "#666", marginTop: 2 },
});
