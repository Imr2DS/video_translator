import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, XStack } from "tamagui";
import { theme } from "../constants/theme";
import { Button } from "./Button";

type PhotoUploadModalProps = {
  visible: boolean;
  onClose: () => void;
  onPhotoSelected: (
    photoUri: string,
    photoName: string,
    description: string,
    base64?: string
  ) => void;
  loading?: boolean;
};

export default function PhotoUploadModal({
  visible,
  onClose,
  onPhotoSelected,
  loading = false,
}: PhotoUploadModalProps) {
  const [photoUri, setPhotoUri] = useState<string>("");
  const [photoBase64, setPhotoBase64] = useState<string>("");
  const [photoName, setPhotoName] = useState("");
  const [description, setDescription] = useState("");

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
        setPhotoBase64(result.assets[0].base64 || "");
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Erreur", "Impossible de sélectionner l'image");
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission refusée",
          "Nous avons besoin de la permission de la caméra pour prendre une photo"
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
        setPhotoBase64(result.assets[0].base64 || "");
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Erreur", "Impossible de prendre la photo");
    }
  };

  const handleUpload = () => {
    if (!photoUri) {
      Alert.alert("Erreur", "Veuillez sélectionner une photo");
      return;
    }

    onPhotoSelected(photoUri, photoName, description, photoBase64);
    resetForm();
  };

  const resetForm = () => {
    setPhotoUri("");
    setPhotoBase64("");
    setPhotoName("");
    setDescription("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            maxHeight: "80%",
          }}
        >
          {/* Header */}
          <XStack
            alignItems="center"
            justifyContent="space-between"
            marginBottom="$4"
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: theme.colors.text.DEFAULT,
              }}
            >
              Ajouter une photo
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={theme.colors.text.DEFAULT}
              />
            </TouchableOpacity>
          </XStack>

          {/* Photo Selection */}
          {!photoUri ? (
            <Stack space="$4" marginBottom="$4">
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: theme.colors.text.DEFAULT,
                }}
              >
                Choisir une photo
              </Text>

              <XStack space="$3">
                <TouchableOpacity
                  onPress={pickImage}
                  style={{
                    flex: 1,
                    backgroundColor: "#007bff",
                    padding: 16,
                    borderRadius: 12,
                    alignItems: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name="image-plus"
                    size={24}
                    color="white"
                  />
                  <Text
                    style={{
                      color: "white",
                      fontWeight: "600",
                      marginTop: 8,
                    }}
                  >
                    Galerie
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={takePhoto}
                  style={{
                    flex: 1,
                    backgroundColor: "#28a745",
                    padding: 16,
                    borderRadius: 12,
                    alignItems: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name="camera"
                    size={24}
                    color="white"
                  />
                  <Text
                    style={{
                      color: "white",
                      fontWeight: "600",
                      marginTop: 8,
                    }}
                  >
                    Caméra
                  </Text>
                </TouchableOpacity>
              </XStack>
            </Stack>
          ) : (
            <Stack space="$4" marginBottom="$4">
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: theme.colors.text.DEFAULT,
                }}
              >
                Photo sélectionnée
              </Text>

              <View
                style={{
                  width: "100%",
                  height: 200,
                  borderRadius: 12,
                  overflow: "hidden",
                  backgroundColor: "#f8f9fa",
                }}
              >
                <Image
                  source={{ uri: photoUri }}
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                  resizeMode="cover"
                />
              </View>

              <TouchableOpacity
                onPress={() => setPhotoUri("")}
                style={{
                  backgroundColor: "#dc3545",
                  padding: 12,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>
                  Changer de photo
                </Text>
              </TouchableOpacity>
            </Stack>
          )}

          {/* Photo Details Form */}
          {photoUri && (
            <Stack space="$4" marginBottom="$4">
              <Stack space="$2">
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: theme.colors.text.DEFAULT,
                  }}
                >
                  Nom de la photo (optionnel)
                </Text>
                <TextInput
                  value={photoName}
                  onChangeText={setPhotoName}
                  placeholder="Ex: Photo de profil, Photo de vacances..."
                  style={{
                    borderWidth: 1,
                    borderColor: "#dee2e6",
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                  }}
                />
              </Stack>

              <Stack space="$2">
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: theme.colors.text.DEFAULT,
                  }}
                >
                  Description (optionnel)
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Décrivez cette photo..."
                  multiline
                  numberOfLines={3}
                  style={{
                    borderWidth: 1,
                    borderColor: "#dee2e6",
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    textAlignVertical: "top",
                  }}
                />
              </Stack>
            </Stack>
          )}

          {/* Upload Button */}
          {photoUri && (
            <Button
              variant="primary"
              onPress={handleUpload}
              disabled={loading}
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>
                {loading ? "Ajout en cours..." : "Ajouter la photo"}
              </Text>
            </Button>
          )}
        </View>
      </View>
    </Modal>
  );
}
