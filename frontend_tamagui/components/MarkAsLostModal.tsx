import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useThemeColor } from "../hooks/useThemeColor";
import { markAnimalAsLost } from "../lib/supabase";

interface MarkAsLostModalProps {
  visible: boolean;
  onClose: () => void;
  animalId: string;
  animalName: string;
  onStatusChange: () => void;
}

export default function MarkAsLostModal({
  visible,
  onClose,
  animalId,
  animalName,
  onStatusChange,
}: MarkAsLostModalProps) {
  const [lostNotes, setLostNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");

  const handleMarkAsLost = async () => {
    if (!lostNotes.trim()) {
      Alert.alert(
        "Erreur",
        "Veuillez ajouter une note pour expliquer les circonstances"
      );
      return;
    }

    setIsLoading(true);
    try {
      await markAnimalAsLost(animalId, lostNotes.trim());
      onStatusChange();
      onClose();
      setLostNotes("");
      Alert.alert("Succès", `${animalName} a été marqué comme perdu`);
    } catch (error) {
      console.error("Error marking animal as lost:", error);
      Alert.alert("Erreur", "Impossible de marquer l'animal comme perdu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (lostNotes.trim()) {
      Alert.alert(
        "Annuler",
        "Voulez-vous vraiment annuler ? Les notes seront perdues.",
        [
          { text: "Continuer", style: "cancel" },
          {
            text: "Annuler",
            style: "destructive",
            onPress: () => {
              setLostNotes("");
              onClose();
            },
          },
        ]
      );
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#fff" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#fff",
            }}
          >
            <TouchableOpacity onPress={handleCancel}>
              <Text style={{ color: tintColor, fontSize: 16 }}>Annuler</Text>
            </TouchableOpacity>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", color: textColor }}
            >
              Marquer comme perdu
            </Text>
            <TouchableOpacity
              onPress={handleMarkAsLost}
              disabled={isLoading || !lostNotes.trim()}
            >
              <Text
                style={{
                  color: isLoading || !lostNotes.trim() ? "#ccc" : tintColor,
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                {isLoading ? "..." : "Confirmer"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1, padding: 16 }}>
            {/* Warning Icon */}
            <View style={{ alignItems: "center", marginVertical: 20 }}>
              <View
                style={{
                  backgroundColor: "#ff6b6b",
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Ionicons name="warning" size={40} color="white" />
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: textColor,
                  textAlign: "center",
                }}
              >
                Marquer {animalName} comme perdu ?
              </Text>
            </View>

            {/* Description */}
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 16,
                  color: textColor,
                  lineHeight: 24,
                  textAlign: "center",
                }}
              >
                Cette action marquera {animalName} comme perdu et affichera une
                alerte visible à tous les utilisateurs de l&apos;application.
              </Text>
            </View>

            {/* Notes Input */}
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: textColor,
                  marginBottom: 8,
                }}
              >
                Notes (obligatoire)
              </Text>
              <Text style={{ fontSize: 14, color: "#666", marginBottom: 12 }}>
                Décrivez les circonstances de la disparition, le dernier endroit
                vu, etc.
              </Text>
              <TextInput
                value={lostNotes}
                onChangeText={setLostNotes}
                placeholder="Ex: Disparu du jardin hier soir, dernière fois vu vers 18h..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                style={{
                  borderWidth: 1,
                  borderColor: "#e0e0e0",
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: textColor,
                  backgroundColor: "#f9f9f9",
                  minHeight: 100,
                  textAlignVertical: "top",
                }}
              />
            </View>

            {/* Information */}
            <View
              style={{
                backgroundColor: "#fff3cd",
                padding: 16,
                borderRadius: 8,
                borderLeftWidth: 4,
                borderLeftColor: "#ffc107",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <Ionicons
                  name="information-circle"
                  size={20}
                  color="#856404"
                  style={{ marginRight: 8, marginTop: 2 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "#856404",
                      marginBottom: 4,
                    }}
                  >
                    Information importante
                  </Text>
                  <Text
                    style={{ fontSize: 14, color: "#856404", lineHeight: 20 }}
                  >
                    • L&apos;animal restera visible dans votre liste d&apos;animaux{"\n"}•
                    Vous pourrez le marquer comme trouvé à tout moment{"\n"}•
                    Les autres utilisateurs pourront voir l&apos;alerte et vous
                    contacter{"\n"}• Les informations de contact seront visibles
                    pour faciliter le retour
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
