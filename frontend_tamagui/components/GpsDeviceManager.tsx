import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import type { Database } from "../lib/supabase";
import GpsDeviceService, { GpsDeviceData } from "../services/GpsDeviceService";

type GpsDevice = Database["public"]["Tables"]["gps_devices"]["Row"];

interface GpsDeviceManagerProps {
  onDeviceAdded?: (device: GpsDevice) => void;
  onDeviceUpdated?: (device: GpsDevice) => void;
  onDeviceDeleted?: (deviceId: string) => void;
}

export default function GpsDeviceManager({
  onDeviceAdded,
  onDeviceUpdated,
  onDeviceDeleted,
}: GpsDeviceManagerProps) {
  const { user } = useAuth();
  const [devices, setDevices] = useState<GpsDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<GpsDeviceData>({
    device_id: "",
    name: "",
    device_type: "collar",
  });

  const gpsService = GpsDeviceService.getInstance();

  useEffect(() => {
    if (user?.id) {
      loadDevices();
    }
  }, [user?.id]);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const userDevices = await gpsService.getUserDevices(user!.id);
      setDevices(userDevices);
    } catch (error) {
      console.error("Error loading GPS devices:", error);
      Alert.alert("Error", "Failed to load GPS devices");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = async () => {
    if (!formData.device_id || !formData.name) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      const newDevice = await gpsService.addDevice(formData, user!.id);
      if (newDevice) {
        setDevices([newDevice, ...devices]);
        setFormData({ device_id: "", name: "", device_type: "collar" });
        setShowAddForm(false);
        onDeviceAdded?.(newDevice);
        Alert.alert("Success", "GPS device added successfully");
      }
    } catch (error) {
      console.error("Error adding GPS device:", error);
      Alert.alert("Error", "Failed to add GPS device");
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    Alert.alert(
      "Delete Device",
      "Are you sure you want to delete this GPS device? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await gpsService.deleteDevice(deviceId);
              setDevices(devices.filter((d) => d.id !== deviceId));
              onDeviceDeleted?.(deviceId);
              Alert.alert("Success", "GPS device deleted successfully");
            } catch (error) {
              console.error("Error deleting GPS device:", error);
              Alert.alert("Error", "Failed to delete GPS device");
            }
          },
        },
      ]
    );
  };

  const handleToggleDevice = async (deviceId: string, isActive: boolean) => {
    try {
      const updatedDevice = await gpsService.setDeviceActive(
        deviceId,
        !isActive
      );
      if (updatedDevice) {
        setDevices(devices.map((d) => (d.id === deviceId ? updatedDevice : d)));
        onDeviceUpdated?.(updatedDevice);
      }
    } catch (error) {
      console.error("Error toggling device:", error);
      Alert.alert("Error", "Failed to update device status");
    }
  };

  const getDeviceStatusColor = (device: GpsDevice) => {
    if (!device.is_active) return "#999";
    if (!device.last_seen) return "#f39c12";

    const lastSeen = new Date(device.last_seen);
    const hoursSinceLastSeen =
      (Date.now() - lastSeen.getTime()) / (1000 * 60 * 60);

    if (hoursSinceLastSeen > 24) return "#e74c3c";
    if (hoursSinceLastSeen > 1) return "#f39c12";
    return "#27ae60";
  };

  const getDeviceStatusText = (device: GpsDevice) => {
    if (!device.is_active) return "Inactive";
    if (!device.last_seen) return "Never seen";

    const lastSeen = new Date(device.last_seen);
    const hoursSinceLastSeen =
      (Date.now() - lastSeen.getTime()) / (1000 * 60 * 60);

    if (hoursSinceLastSeen > 24) return "Offline";
    if (hoursSinceLastSeen > 1) return "Warning";
    return "Online";
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading GPS devices...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>GPS Devices</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <MaterialCommunityIcons
            name={showAddForm ? "close" : "plus"}
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>

      {showAddForm && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Add New GPS Device</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Device ID (Serial Number)</Text>
            <TextInput
              style={styles.input}
              value={formData.device_id}
              onChangeText={(text) =>
                setFormData({ ...formData, device_id: text })
              }
              placeholder="Enter device serial number"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Device Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter device name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Device Type</Text>
            <View style={styles.deviceTypeContainer}>
              {["collar", "tag", "chip", "harness"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.deviceTypeOption,
                    formData.device_type === type &&
                      styles.deviceTypeOptionSelected,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, device_type: type })
                  }
                >
                  <Text
                    style={[
                      styles.deviceTypeText,
                      formData.device_type === type &&
                        styles.deviceTypeTextSelected,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleAddDevice}>
            <Text style={styles.saveButtonText}>Add Device</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.devicesList}>
        {devices.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="satellite-variant"
              size={64}
              color="#ccc"
            />
            <Text style={styles.emptyText}>No GPS devices found</Text>
            <Text style={styles.emptySubtext}>
              Add a GPS device to start tracking your pets
            </Text>
          </View>
        ) : (
          devices.map((device) => (
            <View key={device.id} style={styles.deviceCard}>
              <View style={styles.deviceHeader}>
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceName}>{device.name}</Text>
                  <Text style={styles.deviceId}>ID: {device.device_id}</Text>
                  <Text style={styles.deviceType}>{device.device_type}</Text>
                </View>

                <View style={styles.deviceStatus}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: getDeviceStatusColor(device) },
                    ]}
                  />
                  <Text style={styles.statusText}>
                    {getDeviceStatusText(device)}
                  </Text>
                </View>
              </View>

              {device.battery_level !== null && (
                <View style={styles.batteryInfo}>
                  <MaterialCommunityIcons
                    name="battery"
                    size={16}
                    color="#666"
                  />
                  <Text style={styles.batteryText}>
                    {device.battery_level}%
                  </Text>
                </View>
              )}

              {device.last_seen && (
                <Text style={styles.lastSeenText}>
                  Last seen: {new Date(device.last_seen).toLocaleString()}
                </Text>
              )}

              <View style={styles.deviceActions}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: device.is_active ? "#e74c3c" : "#27ae60",
                    },
                  ]}
                  onPress={() =>
                    handleToggleDevice(device.id, device.is_active)
                  }
                >
                  <MaterialCommunityIcons
                    name={device.is_active ? "power-off" : "power"}
                    size={16}
                    color="white"
                  />
                  <Text style={styles.actionButtonText}>
                    {device.is_active ? "Deactivate" : "Activate"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: "#e74c3c" }]}
                  onPress={() => handleDeleteDevice(device.id)}
                >
                  <MaterialCommunityIcons
                    name="delete"
                    size={16}
                    color="white"
                  />
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#3498db",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    backgroundColor: "white",
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
  },
  deviceTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  deviceTypeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f8f9fa",
  },
  deviceTypeOptionSelected: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
  },
  deviceTypeText: {
    fontSize: 14,
    color: "#666",
  },
  deviceTypeTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#27ae60",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  devicesList: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  deviceCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  deviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  deviceId: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  deviceType: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
    textTransform: "capitalize",
  },
  deviceStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  batteryInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  batteryText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  lastSeenText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 12,
  },
  deviceActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: "center",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
    marginLeft: 4,
  },
  loadingText: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
  },
});
