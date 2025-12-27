import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Input, Stack, Text } from "tamagui";
import Constants from "expo-constants";
import { theme } from "../constants/theme";
import { supabase } from "../lib/supabase";
import { Button } from "../components/Button";

export default function Profile() {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /* 🔐 Changer le mot de passe */
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        "Erreur",
        "Le mot de passe doit contenir au moins 6 caractères"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      Alert.alert("Succès", "Mot de passe modifié avec succès");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
    } finally {
      setLoading(false);
    }
  };

  /* 🚪 Déconnexion */
  const handleLogout = async () => {
    Alert.alert(
      "Déconnexion",
      "Voulez-vous vraiment vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Déconnexion",
          style: "destructive",
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace("/login");
          },
        },
      ]
    );
  };

  return (
    <Stack flex={1} backgroundColor="$background">
      {/* 🔹 Bande supérieure */}
      <View style={styles.headerContainer}>
        <StatusBar
          translucent
          backgroundColor={theme.colors.primary.DEFAULT}
          barStyle="light-content"
        />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Profil</Text>
        </View>
      </View>

      {/* 🔹 Contenu */}
      <Stack flex={1} padding="$4">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Modifier le mot de passe
          </Text>

          <Input
            placeholder="Nouveau mot de passe"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            marginBottom="$3"
          />

          <Input
            placeholder="Confirmer le mot de passe"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            marginBottom="$4"
          />

          <Button
            onPress={handleChangePassword}
            loading={loading}
            fullWidth
            icon={
              <MaterialCommunityIcons
                name="lock-reset"
                size={20}
                color="white"
              />
            }
          >
            Modifier le mot de passe
          </Button>
        </View>

        {/* 🔹 Déconnexion */}
        <View style={{ marginTop: 40 }}>
          <Button
            onPress={handleLogout}
            variant="outline"
            fullWidth
            icon={
              <MaterialCommunityIcons
                name="logout"
                size={20}
                color={theme.colors.primary.DEFAULT}
              />
            }
          >
            Se déconnecter
          </Button>
        </View>
      </Stack>

      {/* 🔹 Barre inférieure */}
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
          <MaterialCommunityIcons name="magnify" size={24} color="#888" />
          <Text style={styles.bottomButtonText}>Recherche</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => router.push("/profile")}
        >
          <MaterialCommunityIcons name="account" size={24} color="#3498db" />
          <Text style={styles.bottomButtonText}>Profil</Text>
        </TouchableOpacity>
      </View>
    </Stack>
  );
}

/* 🎨 Styles identiques à Home */
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

  section: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
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
