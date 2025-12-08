import React, { createContext, useContext, useEffect, useState } from "react";
import { ownershipTransferUtils } from "../lib/ownershipTransfer";
import { useAuth } from "./AuthContext";

interface TransferNotificationsContextType {
  hasPendingTransfers: boolean;
  pendingCount: number;
  refreshNotifications: () => Promise<void>;
}

const TransferNotificationsContext = createContext<
  TransferNotificationsContextType | undefined
>(undefined);

export const useTransferNotifications = () => {
  const context = useContext(TransferNotificationsContext);
  if (!context) {
    throw new Error(
      "useTransferNotifications must be used within a TransferNotificationsProvider"
    );
  }
  return context;
};

export const TransferNotificationsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user } = useAuth();
  const [hasPendingTransfers, setHasPendingTransfers] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const checkPendingTransfers = async () => {
    if (!user) return;

    try {
      const hasTransfers = await ownershipTransferUtils.hasPendingTransfers(
        user.id
      );
      setHasPendingTransfers(hasTransfers);

      if (hasTransfers) {
        const transfers =
          await ownershipTransferUtils.getPendingTransfersForUser(user.id);
        setPendingCount(transfers.length);
      } else {
        setPendingCount(0);
      }
    } catch (error) {
      console.error("Error checking pending transfers:", error);
    }
  };

  useEffect(() => {
    if (user) {
      checkPendingTransfers();
    }
  }, [user]);

  return (
    <TransferNotificationsContext.Provider
      value={{
        hasPendingTransfers,
        pendingCount,
        refreshNotifications: checkPendingTransfers,
      }}
    >
      {children}
    </TransferNotificationsContext.Provider>
  );
};
