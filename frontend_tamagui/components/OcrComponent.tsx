import { MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styled } from "tamagui";

const BACKEND_URL = "http://172.20.10.2:5001" + "/mrz-scan"; // Change this if needed
// const BACKEND_URL = "http:/172.20.10.2:5001/mrz-scan"; // Change this if needed

const Container = styled(View, {
  flex: 1,
  minHeight: "100%",
  justifyContent: "center",
  alignItems: "center",
  padding: 20,
  backgroundColor: "#ffffff",
});

const Title = styled(Text, {});

interface OcrComponentProps {
  onSuccess: (data: {
    lastname: string;
    firstname: string;
    cin: string;
  }) => void;
}

const OcrComponent = ({ onSuccess }: OcrComponentProps) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    setError(null);
    setOcrResult(null);

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library to upload a photo."
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      sendToBackend(result.assets[0].uri);
    }
  };

  const sendToBackend = async (uri: string) => {
    try {
      setLoading(true);
      setError(null);
      setOcrResult(null);
      console.log("Sending image to backend:", { uri, BACKEND_URL });
      const formData = new FormData();
      // @ts-ignore
      formData.append("image", {
        uri,
        name: "photo.jpg",
        type: "image/jpeg",
      });
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Erreur lors de l'analyse OCR");
      } else {
        setOcrResult(data);
        if (data.lastname && data.firstname && data.cin) {
          onSuccess({
            lastname: data.lastname,
            firstname: data.firstname,
            cin: data.cin,
          });
        }
      }
    } catch (e: any) {
      console.log("Error sending to backend:", e);
      setError(e.message || "Erreur lors de l'envoi de l'image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title
        style={{
          fontSize: 24,
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: 30,
        }}
      >
        Scanner votre CIN pour continuer
      </Title>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={pickImage}
        accessibilityLabel="Choisir une image"
        disabled={loading}
      >
        <MaterialCommunityIcons name="camera" size={40} color="#3498db" />
      </TouchableOpacity>
      <Text style={styles.instructionText}>
        Appuyez sur l&apos;icône pour scanner votre CIN
      </Text>
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={{ width: 200, height: 200, marginVertical: 16 }}
        />
      )}
      {loading && (
        <ActivityIndicator
          size="large"
          color="#007AFF"
          style={{ marginVertical: 16 }}
        />
      )}
      {error && (
        <Text style={{ color: "red", marginVertical: 8 }}>{error}</Text>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    backgroundColor: "#eaf6fb",
    borderRadius: 50,
    padding: 18,
    marginVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3498db",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  instructionText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
  },
});

export default OcrComponent;
