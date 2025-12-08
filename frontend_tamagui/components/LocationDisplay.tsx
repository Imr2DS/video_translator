import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { locationUtils } from "../lib/locationUtils";
import type { Database } from "../lib/supabase";

type Location = Database["public"]["Tables"]["locations"]["Row"];

interface LocationDisplayProps {
  animalId?: string;
  location?: Location | null;
  onLocationRemoved?: () => void;
  onLocationUpdated?: () => void;
}

export default function LocationDisplay({
  animalId,
  location: propLocation,
  onLocationRemoved,
  onLocationUpdated,
}: LocationDisplayProps) {
  const [location, setLocation] = useState<Location | null>(
    propLocation || null
  );
  const [loading, setLoading] = useState(!propLocation);
  const [updatingLocation, setUpdatingLocation] = useState(false);

  useEffect(() => {
    if (propLocation) {
      setLocation(propLocation);
      setLoading(false);
    } else if (animalId) {
      loadLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animalId, propLocation]);

  const loadLocation = async () => {
    if (!animalId) return;

    try {
      setLoading(true);
      const animalLocation = await locationUtils.getAnimalLocation(animalId);
      setLocation(animalLocation);
    } catch (error) {
      console.error("Error loading location:", error);
    } finally {
      setLoading(false);
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  };

  const getCurrentLocation =
    async (): Promise<Location.LocationObject | null> => {
      try {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
          Alert.alert(
            "Permission refusée",
            "L'accès à la localisation est nécessaire pour mettre à jour la position de l'animal."
          );
          return null;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        return currentLocation;
      } catch (error) {
        console.error("Error getting current location:", error);
        Alert.alert(
          "Erreur de localisation",
          "Impossible d'obtenir votre position actuelle. Veuillez réessayer."
        );
        return null;
      }
    };

  const getAddressFromCoordinates = async (
    latitude: number,
    longitude: number
  ): Promise<string | null> => {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const addressParts = [
          address.street,
          address.city,
          address.region,
          address.country,
        ].filter(Boolean);
        return addressParts.join(", ");
      }
      return null;
    } catch (error) {
      console.error("Error getting address:", error);
      return null;
    }
  };

  const updateLocationWithCurrentPosition = async () => {
    if (!animalId) {
      Alert.alert("Erreur", "ID de l'animal manquant");
      return;
    }

    try {
      setUpdatingLocation(true);

      const currentLocation = await getCurrentLocation();
      if (!currentLocation) {
        return;
      }

      const address = await getAddressFromCoordinates(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );

      const locationData = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        address: address || undefined,
      };

      await locationUtils.setAnimalLocation(animalId, locationData);

      // Reload the location data
      await loadLocation();

      onLocationUpdated?.();

      Alert.alert(
        "Position mise à jour",
        "La position de l'animal a été mise à jour avec votre position actuelle."
      );
    } catch (error) {
      console.error("Error updating location:", error);
      Alert.alert(
        "Erreur",
        "Impossible de mettre à jour la position. Veuillez réessayer."
      );
    } finally {
      setUpdatingLocation(false);
    }
  };

  const removeLocation = async () => {
    if (!animalId) {
      Alert.alert(
        "Erreur",
        "Impossible de supprimer la localisation sans ID d'animal"
      );
      return;
    }

    Alert.alert(
      "Supprimer la localisation",
      "Êtes-vous sûr de vouloir supprimer cette localisation ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await locationUtils.removeAnimalLocation(animalId);
              setLocation(null);
              onLocationRemoved?.();
            } catch (error) {
              console.error("Error removing location:", error);
              Alert.alert("Erreur", "Impossible de supprimer la localisation");
            }
          },
        },
      ]
    );
  };

  const openInMaps = () => {
    if (location) {
      const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
      Linking.openURL(url);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement de la localisation...</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.container}>
        <Text style={styles.noLocationText}>
          Aucune localisation enregistrée pour cet animal
        </Text>
        {animalId && (
          <TouchableOpacity
            onPress={updateLocationWithCurrentPosition}
            style={styles.updateButton}
            disabled={updatingLocation}
          >
            <MaterialCommunityIcons
              name="crosshairs-gps"
              size={20}
              color="white"
            />
            <Text style={styles.updateButtonText}>
              {updatingLocation
                ? "Mise à jour..."
                : "Mettre à jour avec ma position"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Localisation enregistrée</Text>
        <View style={styles.headerButtons}>
          {animalId && (
            <TouchableOpacity
              onPress={updateLocationWithCurrentPosition}
              style={styles.updateButton}
              disabled={updatingLocation}
            >
              <MaterialCommunityIcons
                name="crosshairs-gps"
                size={16}
                color="white"
              />
            </TouchableOpacity>
          )}
          {animalId && (
            <TouchableOpacity
              onPress={removeLocation}
              style={styles.removeButton}
            >
              <MaterialCommunityIcons name="delete" size={20} color="#e74c3c" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.locationInfo}>
        <View style={styles.coordinateRow}>
          <MaterialCommunityIcons name="latitude" size={16} color="#666" />
          <Text style={styles.coordinateText}>
            {location.latitude.toFixed(6)}
          </Text>
        </View>

        <View style={styles.coordinateRow}>
          <MaterialCommunityIcons name="longitude" size={16} color="#666" />
          <Text style={styles.coordinateText}>
            {location.longitude.toFixed(6)}
          </Text>
        </View>

        {location.address && (
          <View style={styles.addressRow}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
            <Text style={styles.addressText}>{location.address}</Text>
          </View>
        )}

        <Text style={styles.timestamp}>
          Enregistrée le:{" "}
          {new Date(location.created_at).toLocaleDateString("fr-FR")}
        </Text>
      </View>

      <TouchableOpacity onPress={openInMaps} style={styles.mapsButton}>
        <MaterialCommunityIcons name="map" size={20} color="white" />
        <Text style={styles.mapsButtonText}>Ouvrir dans Maps</Text>
      </TouchableOpacity>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  updateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#27ae60",
    padding: 8,
    borderRadius: 6,
    gap: 4,
  },
  updateButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  removeButton: {
    padding: 4,
  },
  loadingText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
  },
  noLocationText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    marginBottom: 16,
  },
  locationInfo: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 12,
  },
  coordinateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  coordinateText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
    fontFamily: "monospace",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  addressText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  mapsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3498db",
    padding: 12,
    borderRadius: 6,
  },
  mapsButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 8,
  },
});
