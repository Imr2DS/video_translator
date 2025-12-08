import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BackgroundLocationService from "../services/BackgroundLocationService";

interface AutoLocationTrackerProps {
  onStatusChange?: (isActive: boolean) => void;
}

export default function AutoLocationTracker({
  onStatusChange,
}: AutoLocationTrackerProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const locationService = BackgroundLocationService.getInstance();

  useEffect(() => {
    checkTrackingStatus();
  }, []);

  const checkTrackingStatus = async () => {
    try {
      const isActive = await locationService.isTrackingActive();
      setIsTracking(isActive);
      onStatusChange?.(isActive);
    } catch (error) {
      console.error("Error checking tracking status:", error);
    }
  };

  const handleToggleTracking = async () => {
    try {
      setLoading(true);

      if (isTracking) {
        // Stop tracking
        await locationService.stopTracking();
        setIsTracking(false);
        onStatusChange?.(false);
        Alert.alert(
          "Tracking Stopped",
          "Automatic location tracking has been disabled.",
          [{ text: "OK" }]
        );
      } else {
        // Start tracking
        const success = await locationService.startTracking();
        if (success) {
          setIsTracking(true);
          onStatusChange?.(true);
          Alert.alert(
            "Tracking Started",
            "Automatic location tracking is now active. Your pets' locations will be updated every 5 minutes.",
            [{ text: "OK" }]
          );
        } else {
          Alert.alert(
            "Permission Required",
            "Location permission is required for automatic tracking. Please enable it in your device settings.",
            [{ text: "OK" }]
          );
        }
      }
    } catch (error) {
      console.error("Error toggling tracking:", error);
      Alert.alert(
        "Error",
        "Failed to update tracking status. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const requestPermissions = async () => {
    try {
      setLoading(true);
      const granted = await locationService.requestPermissions();
      setPermissionGranted(granted);

      if (granted) {
        Alert.alert(
          "Permissions Granted",
          "Location permissions have been granted. You can now enable automatic tracking.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Permissions Required",
          "Location permissions are required for automatic tracking. Please enable them in your device settings.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error requesting permissions:", error);
      Alert.alert("Error", "Failed to request permissions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="map-marker-path"
          size={24}
          color={isTracking ? "#27ae60" : "#666"}
        />
        <Text style={styles.title}>Automatic Location Tracking</Text>
        <Switch
          value={isTracking}
          onValueChange={handleToggleTracking}
          disabled={loading}
          trackColor={{ false: "#ddd", true: "#27ae60" }}
          thumbColor={isTracking ? "#fff" : "#f4f3f4"}
        />
      </View>

      <Text style={styles.description}>
        {isTracking
          ? "Your pets' locations are being tracked automatically every 5 minutes."
          : "Enable automatic tracking to keep your pets' locations updated without manual intervention."}
      </Text>

      {!isTracking && (
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermissions}
          disabled={loading}
        >
          <MaterialCommunityIcons
            name="shield-check"
            size={20}
            color="#3498db"
          />
          <Text style={styles.permissionButtonText}>Request Permissions</Text>
        </TouchableOpacity>
      )}

      {isTracking && (
        <View style={styles.statusContainer}>
          <MaterialCommunityIcons
            name="check-circle"
            size={16}
            color="#27ae60"
          />
          <Text style={styles.statusText}>Tracking Active</Text>
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>How it works:</Text>
        <Text style={styles.infoText}>• Updates location every 5 minutes</Text>
        <Text style={styles.infoText}>• Works in background</Text>
        <Text style={styles.infoText}>• Updates all your pets at once</Text>
        <Text style={styles.infoText}>
          • Saves battery with optimized intervals
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginLeft: 12,
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 16,
  },
  permissionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e3f2fd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: "#3498db",
    fontWeight: "600",
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e8",
    padding: 8,
    borderRadius: 6,
    marginBottom: 16,
  },
  statusText: {
    color: "#27ae60",
    fontWeight: "600",
    marginLeft: 8,
  },
  infoContainer: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
});
