import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Dimensions, Modal, Text, TouchableOpacity, View } from "react-native";
import { Stack, XStack } from "tamagui";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

type PhotoViewerProps = {
  visible: boolean;
  photoUrl: string;
  photoName?: string;
  description?: string;
  onClose: () => void;
};

export default function PhotoViewer({
  visible,
  photoUrl,
  photoName,
  description,
  onClose,
}: PhotoViewerProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Header */}
        <Stack
          position="absolute"
          top={0}
          left={0}
          right={0}
          zIndex={10}
          padding="$4"
          paddingTop={60}
        >
          <XStack alignItems="center" justifyContent="space-between">
            <Stack flex={1}>
              {photoName && (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "white",
                  }}
                >
                  {photoName}
                </Text>
              )}
              {description && (
                <Text
                  style={{
                    fontSize: 14,
                    color: "rgba(255, 255, 255, 0.8)",
                    marginTop: 4,
                  }}
                >
                  {description}
                </Text>
              )}
            </Stack>

            <TouchableOpacity
              onPress={onClose}
              style={{
                padding: 12,
                borderRadius: 24,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              }}
            >
              <MaterialCommunityIcons name="close" size={24} color="white" />
            </TouchableOpacity>
          </XStack>
        </Stack>

        {/* Image */}
        <Stack
          flex={1}
          justifyContent="center"
          alignItems="center"
          padding="$4"
        >
          <Image
            source={{ uri: photoUrl }}
            style={{
              width: screenWidth - 32,
              height: screenHeight * 0.7,
              borderRadius: 12,
            }}
            contentFit="contain"
            onLoad={() => setImageLoaded(true)}
            placeholder={!imageLoaded ? "Loading..." : undefined}
          />
        </Stack>

        {/* Loading indicator */}
        {!imageLoaded && (
          <Stack
            position="absolute"
            top="50%"
            left="50%"
            transform={[{ translateX: -20 }, { translateY: -20 }]}
          >
            <Text style={{ color: "white", fontSize: 16 }}>Chargement...</Text>
          </Stack>
        )}
      </View>
    </Modal>
  );
}
