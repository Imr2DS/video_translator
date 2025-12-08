import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTransferNotifications } from "../contexts/TransferNotificationsContext";

interface TabIconWithBadgeProps {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  size: number;
  showBadge?: boolean;
}

export default function TabIconWithBadge({
  name,
  color,
  size,
  showBadge = false,
}: TabIconWithBadgeProps) {
  const { hasPendingTransfers, pendingCount } = useTransferNotifications();

  return (
    <View style={styles.container}>
      <Ionicons name={name} size={size} color={color} />
      {showBadge && hasPendingTransfers && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {pendingCount > 9 ? "9+" : pendingCount.toString()}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -8,
    backgroundColor: "#e74c3c",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});
