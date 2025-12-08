import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import type { Database } from "../lib/supabase";
import GpsDeviceService from "../services/GpsDeviceService";

type GpsLocation = Database["public"]["Tables"]["gps_locations"]["Row"];
type GpsDevice = Database["public"]["Tables"]["gps_devices"]["Row"];

interface GpsLocationDisplayProps {
  deviceId?: string;
  device?: GpsDevice;
  showHistory?: boolean;
  onLocationSelect?: (location: GpsLocation) => void;
}

export default function GpsLocationDisplay({
  deviceId,
  device,
  showHistory = false,
  onLocationSelect,
}: GpsLocationDisplayProps) {
  const [latestLocation, setLatestLocation] = useState<GpsLocation | null>(
    null
  );
  const [locationHistory, setLocationHistory] = useState<GpsLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  const gpsService = GpsDeviceService.getInstance();

  useEffect(() => {
    if (deviceId) {
      loadLocationData();
    }
  }, [deviceId]);

  const loadLocationData = async () => {
    if (!deviceId) return;

    try {
      setLoading(true);

      // Get latest location
      const latest = await gpsService.getLatestLocation(deviceId);
      setLatestLocation(latest);

      // Get location history if requested
      if (showHistory) {
        const history = await gpsService.getLocationHistory(deviceId, 24);
        setLocationHistory(history);
      }
    } catch (error) {
      console.error("Error loading GPS location data:", error);
      Alert.alert("Error", "Failed to load location data");
    } finally {
      setLoading(false);
    }
  };

  const getLocationStatusColor = (location: GpsLocation) => {
    if (!location.signal_strength) return "#999";
    if (location.signal_strength < 30) return "#e74c3c";
    if (location.signal_strength < 70) return "#f39c12";
    return "#27ae60";
  };

  const getLocationStatusText = (location: GpsLocation) => {
    if (!location.signal_strength) return "Unknown";
    if (location.signal_strength < 30) return "Poor";
    if (location.signal_strength < 70) return "Fair";
    return "Good";
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const generateMapHtml = (location: GpsLocation) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 0; }
            #map { width: 100%; height: 100vh; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            function initMap() {
              const location = { lat: ${location.latitude}, lng: ${
      location.longitude
    } };
              const map = new google.maps.Map(document.getElementById('map'), {
                zoom: 15,
                center: location,
                mapTypeId: google.maps.MapTypeId.ROADMAP
              });
              
              new google.maps.Marker({
                position: location,
                map: map,
                title: '${device?.name || "GPS Device"}',
                icon: {
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
                    '<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">' +
                    '<circle cx="16" cy="16" r="12" fill="#3498db" stroke="#fff" stroke-width="2"/>' +
                    '<circle cx="16" cy="16" r="4" fill="#fff"/>' +
                    '</svg>'
                  ),
                  scaledSize: new google.maps.Size(32, 32)
                }
              });
            }
          </script>
          <script async defer
            src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&callback=initMap">
          </script>
        </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading location data...</Text>
      </View>
    );
  }

  if (!latestLocation) {
    return (
      <View style={styles.container}>
        <View style={styles.noLocationContainer}>
          <MaterialCommunityIcons
            name="map-marker-off"
            size={64}
            color="#ccc"
          />
          <Text style={styles.noLocationText}>No location data available</Text>
          <Text style={styles.noLocationSubtext}>
            This GPS device hasn't reported its location yet
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Latest Location Card */}
      <View style={styles.locationCard}>
        <View style={styles.locationHeader}>
          <MaterialCommunityIcons name="map-marker" size={24} color="#3498db" />
          <Text style={styles.locationTitle}>Current Location</Text>
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => setShowMap(!showMap)}
          >
            <MaterialCommunityIcons
              name={showMap ? "map" : "map-outline"}
              size={20}
              color="#3498db"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.locationInfo}>
          <View style={styles.coordinatesContainer}>
            <Text style={styles.coordinateLabel}>Latitude:</Text>
            <Text style={styles.coordinateValue}>
              {latestLocation.latitude.toFixed(6)}
            </Text>
          </View>
          <View style={styles.coordinatesContainer}>
            <Text style={styles.coordinateLabel}>Longitude:</Text>
            <Text style={styles.coordinateValue}>
              {latestLocation.longitude.toFixed(6)}
            </Text>
          </View>

          {latestLocation.address && (
            <View style={styles.addressContainer}>
              <Text style={styles.addressLabel}>Address:</Text>
              <Text style={styles.addressValue}>{latestLocation.address}</Text>
            </View>
          )}

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="clock" size={16} color="#666" />
              <Text style={styles.detailText}>
                {formatTimestamp(latestLocation.timestamp)}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="signal" size={16} color="#666" />
              <Text style={styles.detailText}>
                Signal: {getLocationStatusText(latestLocation)}
              </Text>
            </View>
          </View>

          {latestLocation.battery_level !== null && (
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="battery" size={16} color="#666" />
              <Text style={styles.detailText}>
                Battery: {latestLocation.battery_level}%
              </Text>
            </View>
          )}

          {latestLocation.accuracy && (
            <View style={styles.detailItem}>
              <MaterialCommunityIcons
                name="crosshairs-gps"
                size={16}
                color="#666"
              />
              <Text style={styles.detailText}>
                Accuracy: {latestLocation.accuracy.toFixed(1)}m
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Map View */}
      {showMap && (
        <View style={styles.mapContainer}>
          <WebView
            source={{ html: generateMapHtml(latestLocation) }}
            style={styles.map}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </View>
      )}

      {/* Location History */}
      {showHistory && locationHistory.length > 1 && (
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Location History (Last 24h)</Text>
          <ScrollView style={styles.historyList}>
            {locationHistory.slice(1).map((location, index) => (
              <TouchableOpacity
                key={location.id}
                style={styles.historyItem}
                onPress={() => onLocationSelect?.(location)}
              >
                <View style={styles.historyHeader}>
                  <Text style={styles.historyTime}>
                    {formatTimestamp(location.timestamp)}
                  </Text>
                  <View style={styles.historyStatus}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: getLocationStatusColor(location) },
                      ]}
                    />
                    <Text style={styles.historyStatusText}>
                      {getLocationStatusText(location)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.historyCoordinates}>
                  {location.latitude.toFixed(6)},{" "}
                  {location.longitude.toFixed(6)}
                </Text>

                {location.address && (
                  <Text style={styles.historyAddress}>{location.address}</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
  },
  noLocationContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  noLocationText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
  },
  noLocationSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  locationCard: {
    backgroundColor: "white",
    margin: 16,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
    flex: 1,
  },
  mapButton: {
    padding: 4,
  },
  locationInfo: {
    gap: 12,
  },
  coordinatesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  coordinateLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  coordinateValue: {
    fontSize: 14,
    color: "#666",
    fontFamily: "monospace",
  },
  addressContainer: {
    marginTop: 8,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  addressValue: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  detailText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  mapContainer: {
    margin: 16,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  map: {
    height: 300,
  },
  historyContainer: {
    backgroundColor: "white",
    margin: 16,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  historyList: {
    maxHeight: 300,
  },
  historyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  historyTime: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  historyStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  historyStatusText: {
    fontSize: 10,
    color: "#666",
  },
  historyCoordinates: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
    marginBottom: 2,
  },
  historyAddress: {
    fontSize: 11,
    color: "#999",
    lineHeight: 16,
  },
});
