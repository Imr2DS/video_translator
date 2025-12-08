import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useThemeColor } from "../hooks/useThemeColor";
import { markAnimalAsFound } from "../lib/supabase";

interface LostAnimalBannerProps {
  animalId: string;
  lostSince: string;
  lostNotes?: string;
  isOwner: boolean;
  onStatusChange: () => void;
}

export default function LostAnimalBanner({
  animalId,
  lostSince,
  lostNotes,
  isOwner,
  onStatusChange,
}: LostAnimalBannerProps) {
  const backgroundColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");
  const { user } = useAuth();

  const formatLostSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 24) {
      return `${diffInHours} heure${diffInHours > 1 ? "s" : ""}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} jour${diffInDays > 1 ? "s" : ""}`;
    }
  };

  const handleMarkAsFound = async () => {
    Alert.alert(
      "Marquer comme trouvé",
      "Êtes-vous sûr de vouloir marquer cet animal comme trouvé ?",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Confirmer",
          style: "destructive",
          onPress: async () => {
            try {
              await markAnimalAsFound(animalId);
              onStatusChange();
              Alert.alert("Succès", "Animal marqué comme trouvé !");
            } catch (error) {
              console.error("Error marking animal as found:", error);
              Alert.alert(
                "Erreur",
                "Impossible de marquer l'animal comme trouvé"
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View
      style={{
        backgroundColor: "#ff6b6b",
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: "#ff4757",
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
      >
        <Ionicons name="warning" size={24} color="white" />
        <Text
          style={{
            color: "white",
            fontSize: 18,
            fontWeight: "bold",
            marginLeft: 8,
          }}
        >
          ANIMAL PERDU
        </Text>
      </View>

      <Text
        style={{
          color: "white",
          fontSize: 14,
          marginBottom: 4,
        }}
      >
        Perdu depuis {formatLostSince(lostSince)}
      </Text>

      {lostNotes && (
        <Text
          style={{
            color: "white",
            fontSize: 14,
            marginBottom: 12,
            fontStyle: "italic",
          }}
        >
          Note: {lostNotes}
        </Text>
      )}

      {isOwner && (
        <TouchableOpacity
          onPress={handleMarkAsFound}
          style={{
            backgroundColor: "white",
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            alignSelf: "flex-start",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons name="checkmark-circle" size={16} color="#ff6b6b" />
          <Text
            style={{
              color: "#ff6b6b",
              fontSize: 14,
              fontWeight: "bold",
              marginLeft: 4,
            }}
          >
            Marquer comme trouvé
          </Text>
        </TouchableOpacity>
      )}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 8,
        }}
      >
        <Ionicons name="information-circle" size={16} color="white" />
        <Text
          style={{
            color: "white",
            fontSize: 12,
            marginLeft: 4,
          }}
        >
          Si vous trouvez cet animal, contactez le propriétaire
        </Text>
      </View>
    </View>
  );
}
