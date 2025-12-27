import React, { useRef } from "react";
import { StyleSheet, View, Platform } from "react-native";
import { Video } from "expo-av";

type VideoPlayerProps = {
  uri: string;
};

export default function VideoPlayer({ uri }: VideoPlayerProps) {
  const videoRef = useRef<Video>(null);

  return (
    <View style={styles.videoWrapper}>
      <Video
        ref={videoRef}
        source={{ uri }}
        style={styles.video}
        useNativeControls
        resizeMode="contain"
        shouldPlay={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  videoWrapper: {
    width: "100%",
    height: 260,
    borderRadius: 12,
    backgroundColor: "#000",
    overflow: "hidden",
    marginBottom: 12,
  },
  video: {
    width: "100%",
    height: "100%",
  },
});
