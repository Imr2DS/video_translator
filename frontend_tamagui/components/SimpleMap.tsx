import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";

const { width, height } = Dimensions.get("window");

type Animal = {
  id: string;
  name: string;
  race: string;
  gender: "male" | "female";
  is_lost?: boolean;
  locations?: {
    id: string;
    latitude: number;
    longitude: number;
    address?: string;
    created_at: string;
    updated_at: string;
  } | null;
};

type SimpleMapProps = {
  animals: Animal[];
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  onMarkerPress?: (animal: Animal) => void;
  showsUserLocation?: boolean;
};

export default function SimpleMap({
  animals,
  region,
  onMarkerPress,
  showsUserLocation = true,
}: SimpleMapProps) {
  const getMarkerColor = (animal: Animal) => {
    if (animal.is_lost) return "#e74c3c"; // Red for lost animals
    if (animal.gender === "male") return "#3498db"; // Blue for male
    return "#e91e63"; // Pink for female
  };

  const getMarkerIcon = (animal: Animal) => {
    if (animal.is_lost) return "alert-circle";
    return "paw";
  };

  const animalsWithLocation = animals.filter((animal) => animal.locations);

  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      style={{ flex: 1 }}
      region={region}
      showsUserLocation={showsUserLocation}
      showsMyLocationButton={true}
      showsCompass={true}
      showsScale={true}
    >
      {animalsWithLocation.map((animal) => (
        <Marker
          key={animal.id}
          coordinate={{
            latitude: animal.locations!.latitude,
            longitude: animal.locations!.longitude,
          }}
          title={animal.name}
          description={animal.race}
          onPress={() => onMarkerPress?.(animal)}
        >
          <View
            style={{
              backgroundColor: getMarkerColor(animal),
              borderRadius: 20,
              padding: 8,
              borderWidth: 2,
              borderColor: "white",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <MaterialCommunityIcons
              name={getMarkerIcon(animal) as any}
              size={20}
              color="white"
            />
          </View>
        </Marker>
      ))}
    </MapView>
  );
}
 