import { useState, useEffect } from "react";

interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string;
}

interface NetworkConnection {
  effectiveType?: string;
  downlink?: number;
  addEventListener?: (event: string, callback: () => void) => void;
  removeEventListener?: (event: string, callback: () => void) => void;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkConnection;
  mozConnection?: NetworkConnection;
  webkitConnection?: NetworkConnection;
}

export const useNetworkStatus = (): NetworkStatus => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isSlowConnection: false,
    connectionType: "unknown",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateOnlineStatus = () => {
      setNetworkStatus((prev) => ({
        ...prev,
        isOnline: navigator.onLine,
      }));
    };

    const updateConnectionType = () => {
      if ("connection" in navigator) {
        const navWithConnection = navigator as NavigatorWithConnection;
        const connection =
          navWithConnection.connection ||
          navWithConnection.mozConnection ||
          navWithConnection.webkitConnection;

        if (connection) {
          const isSlowConnection =
            connection.effectiveType === "2g" ||
            connection.effectiveType === "slow-2g" ||
            (connection.downlink && connection.downlink < 1);

          setNetworkStatus((prev) => ({
            ...prev,
            isSlowConnection,
            connectionType: connection.effectiveType || "unknown",
          }));
        }
      }
    };

    // Initial check
    updateConnectionType();

    // Event listeners
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    if ("connection" in navigator) {
      const connection =
        (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;
      if (connection) {
        connection.addEventListener("change", updateConnectionType);
      }
    }

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);

      if ("connection" in navigator) {
        const connection =
          (navigator as any).connection ||
          (navigator as any).mozConnection ||
          (navigator as any).webkitConnection;
        if (connection) {
          connection.removeEventListener("change", updateConnectionType);
        }
      }
    };
  }, []);

  return networkStatus;
};
