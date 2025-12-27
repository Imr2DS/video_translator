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
import { LANGUAGES } from "../constants/languages";

type Video = Database["public"]["Tables"]["videos"]["Row"];



/* ✅ AJOUT IMPORTANT : labels des modes de traduction */
const TRANSLATION_MODE_LABELS: { [key: string]: string } = {
  subtitle: "Sous-titres",
  voice: "Voix",
  both: "Voix + Sous-titres",
};

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.replace("/login");
          return;
        }
        if (!user) await new Promise((resolve) => setTimeout(resolve, 500));
        setIsCheckingAuth(false);
        if (user) await loadData();
      } catch (err) {
        console.error(err);
        Alert.alert("Erreur", "Erreur de vérification d'authentification");
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const videosData = await fetchUserVideos(user!.id);
      setVideos(videosData);
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible de charger les vidéos");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
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
        <StatusBar
          translucent
          backgroundColor={theme.colors.primary.DEFAULT}
          barStyle="light-content"
        />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Accueil</Text>
        </View>
      </View>

      {/* Contenu principal */}
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background.DEFAULT }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Stack flex={1} backgroundColor="$background" padding="$4">
          {/* Actions rapides */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions Rapides</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push("/traduire")}
              >
                <MaterialCommunityIcons
                  name="translate"
                  size={24}
                  color="#3498db"
                />
                <Text style={styles.actionText}>Traduire</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push("/videos")}
              >
                <MaterialCommunityIcons
                  name="video"
                  size={24}
                  color="#f39c12"
                />
                <Text style={styles.actionText}>Mes Vidéos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push("/search")}
              >
                <MaterialCommunityIcons
                  name="magnify"
                  size={24}
                  color="#9b59b6"
                />
                <Text style={styles.actionText}>Rechercher</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Mes vidéos */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="video" size={24} color="#e74c3c" />
              <Text style={styles.sectionTitle}>Mes Vidéos</Text>
              <TouchableOpacity
                style={styles.manageButton}
                onPress={() => router.push("/videos")}
              >
                <Text style={styles.manageButtonText}>Voir tout</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.videosGrid}>
              {videos.map((video) => {
                const thumbnailUrl = video.thumbnail_url;
                const translatedUrl = video.translated_url;

                return (
                  <TouchableOpacity
                    key={video.id}
                    style={styles.videoCard}
                    onPress={() =>
                      router.push(`/videoDetail?id=${video.id}`)
                    }
                  >
                    <View style={styles.videoThumbnailContainer}>
                      {thumbnailUrl ? (
                        <Image
                          source={{ uri: thumbnailUrl }}
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

                      {translatedUrl && (
                        <View style={styles.translatedBadge}>
                          <Text style={styles.translatedBadgeText}>
                            Traduit
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.videoTitle} numberOfLines={2}>
                      {video.title}
                    </Text>

                    {video.target_lang && (
                      <Text style={styles.videoLang}>
                        Langue :{" "}
                        {LANGUAGES[video.target_lang] ||
                          video.target_lang}
                      </Text>
                    )}

                    {/* ✅ MODE DE TRADUCTION AFFICHÉ */}
                    {video.translation_mode && (
                      <Text style={styles.videoLang}>
                        Mode :{" "}
                        {TRANSLATION_MODE_LABELS[
                          video.translation_mode
                        ] || video.translation_mode}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Stack>
      </ScrollView>

      {/* Barre inférieure */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => router.push("/home")}
        >
          <MaterialCommunityIcons name="home" size={24} color="#ff9900ff" />
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
          <MaterialCommunityIcons name="magnify" size={24} color="#888" />
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

/* 🔹 Styles INCHANGÉS */
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
  section: { marginVertical: 8 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
    flex: 1,
  },
  manageButton: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  manageButtonText: { fontSize: 12, color: "#666", fontWeight: "600" },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
  },
  actionButton: { alignItems: "center", padding: 12 },
  actionText: { fontSize: 12, color: "#666", marginTop: 4 },
  videosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  noThumbnailPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
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
  translatedBadgeText: {
    fontSize: 10,
    color: "white",
    fontWeight: "600",
  },
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
