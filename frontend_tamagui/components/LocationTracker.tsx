import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { locationUtils } from "../lib/locationUtils";

interface LocationTrackerProps {
  animalId: string;
  onLocationSaved?: (location: {
    latitude: number;
    longitude: number;
    address?: string;
  }) => void;
  onError?: (error: string) => void;
}

export default function LocationTracker({
  animalId,
  onLocationSaved,
  onError,
}: LocationTrackerProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    checkLocationPermission();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionGranted(status === "granted");

      if (status !== "granted") {
        Alert.alert(
          "Location Permission Required",
          "This app needs location permission to track your pet's location.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error checking location permission:", error);
      onError?.("Failed to check location permission");
    }
  };

  const getCurrentLocation = async () => {
    if (!permissionGranted) {
      Alert.alert(
        "Permission Required",
        "Please grant location permission to use this feature.",
        [{ text: "OK" }]
      );
      return;
    }

    setLoading(true);
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(currentLocation);

      // Get address from coordinates
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const addressParts = reverseGeocode[0];
        const formattedAddress = [
          addressParts.street,
          addressParts.city,
          addressParts.region,
          addressParts.country,
        ]
          .filter(Boolean)
          .join(", ");
        setAddress(formattedAddress);
      }
    } catch (error) {
      console.error("Error getting location:", error);
      onError?.("Failed to get current location");
    } finally {
      setLoading(false);
    }
  };

  const saveLocation = async () => {
    if (!location) {
      Alert.alert("No Location", "Please get your current location first.");
      return;
    }

    setLoading(true);
    try {
      const locationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: address || undefined,
      };

      const savedLocation = await locationUtils.setAnimalLocation(
        animalId,
        locationData
      );

      if (savedLocation) {
        Alert.alert(
          "Location Saved",
          "Your pet's location has been successfully saved.",
          [{ text: "OK" }]
        );
        onLocationSaved?.(locationData);
      }
    } catch (error) {
      console.error("Error saving location:", error);
      onError?.("Failed to save location");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location Tracker</Text>

      {!permissionGranted && (
        <Text style={styles.warning}>
          Location permission is required to use this feature.
        </Text>
      )}

      <TouchableOpacity
        style={[styles.button, styles.getLocationButton]}
        onPress={getCurrentLocation}
        disabled={loading || !permissionGranted}
      >
        <Text style={styles.buttonText}>
          {loading ? "Getting Location..." : "Get Current Location"}
        </Text>
      </TouchableOpacity>

      {location && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            Latitude: {location.coords.latitude.toFixed(6)}
          </Text>
          <Text style={styles.locationText}>
            Longitude: {location.coords.longitude.toFixed(6)}
          </Text>
          {address && (
            <Text style={styles.addressText}>Address: {address}</Text>
          )}

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={saveLocation}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Saving..." : "Save Location"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  warning: {
    color: "#e74c3c",
    marginBottom: 12,
    fontSize: 14,
  },
  button: {
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginVertical: 4,
  },
  getLocationButton: {
    backgroundColor: "#3498db",
  },
  saveButton: {
    backgroundColor: "#27ae60",
    marginTop: 12,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  locationInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "white",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  locationText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontStyle: "italic",
  },
});
