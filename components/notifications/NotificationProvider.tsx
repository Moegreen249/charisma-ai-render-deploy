"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { AnimatePresence } from "framer-motion";
import { Toast } from "./Toast";

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  toast: {
    success: (
      title: string,
      message?: string,
      options?: Partial<Notification>,
    ) => string;
    error: (
      title: string,
      message?: string,
      options?: Partial<Notification>,
    ) => string;
    warning: (
      title: string,
      message?: string,
      options?: Partial<Notification>,
    ) => string;
    info: (
      title: string,
      message?: string,
      options?: Partial<Notification>,
    ) => string;
  };
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
  maxNotifications?: number;
  defaultDuration?: number;
}

export function NotificationProvider({
  children,
  maxNotifications = 5,
  defaultDuration = 5000,
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const generateId = useCallback(() => {
    return Math.random().toString(36).substr(2, 9);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  }, []);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id">) => {
      const id = generateId();
      const newNotification: Notification = {
        ...notification,
        id,
        duration: notification.duration ?? defaultDuration,
      };

      setNotifications((prev) => {
        const updated = [newNotification, ...prev];
        // Limit the number of notifications
        if (updated.length > maxNotifications) {
          return updated.slice(0, maxNotifications);
        }
        return updated;
      });

      // Auto-remove notification after duration (unless persistent)
      if (
        !newNotification.persistent &&
        newNotification.duration &&
        newNotification.duration > 0
      ) {
        setTimeout(() => {
          removeNotification(id);
        }, newNotification.duration);
      }

      return id;
    },
    [generateId, defaultDuration, maxNotifications, removeNotification],
  );

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Toast convenience methods
  const toast = {
    success: (
      title: string,
      message?: string,
      options?: Partial<Notification>,
    ) => addNotification({ type: "success", title, message, ...options }),
    error: (title: string, message?: string, options?: Partial<Notification>) =>
      addNotification({ type: "error", title, message, ...options }),
    warning: (
      title: string,
      message?: string,
      options?: Partial<Notification>,
    ) => addNotification({ type: "warning", title, message, ...options }),
    info: (title: string, message?: string, options?: Partial<Notification>) =>
      addNotification({ type: "info", title, message, ...options }),
  };

  const contextValue: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    toast,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {notifications.map((notification) => (
            <Toast
              key={notification.id}
              notification={notification}
              onClose={() => removeNotification(notification.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

// Hook for real-time notifications (WebSocket/SSE)
export function useRealTimeNotifications() {
  const { toast } = useNotifications();

  useEffect(() => {
    // Connect to real-time notification system
    const connectToNotifications = async () => {
      try {
        // Check if we're authenticated
        const response = await fetch("/api/auth/session");
        if (!response.ok) return;

        const session = await response.json();
        if (!session?.user) return;

        // Connect to SSE for real-time notifications
        const eventSource = new EventSource("/api/notifications/stream");

        eventSource.onmessage = (event) => {
          try {
            const notification = JSON.parse(event.data);

            switch (notification.type) {
              case "analysis_complete":
                toast.success(
                  "Analysis Complete!",
                  `Your conversation analysis is ready to view.`,
                  {
                    action: {
                      label: "View Results",
                      onClick: () => {
                        window.location.href = `/history/${notification.analysisId}`;
                      },
                    },
                  },
                );
                break;

              case "analysis_failed":
                toast.error(
                  "Analysis Failed",
                  notification.message ||
                    "There was an error processing your conversation.",
                  { persistent: true },
                );
                break;

              case "background_job_progress":
                if (notification.progress === 100) {
                  toast.success("Processing Complete", notification.message);
                } else {
                  toast.info("Processing Update", notification.message);
                }
                break;

              case "system_maintenance":
                toast.warning("System Maintenance", notification.message, {
                  persistent: true,
                });
                break;

              default:
                toast.info(
                  notification.title || "Notification",
                  notification.message,
                );
            }
          } catch (error) {
            console.error("Error parsing notification:", error);
          }
        };

        eventSource.onerror = (error) => {
          console.error("SSE connection error:", error);
          eventSource.close();

          // Retry connection after 5 seconds
          setTimeout(connectToNotifications, 5000);
        };

        // Cleanup on unmount
        return () => {
          eventSource.close();
        };
      } catch (error) {
        console.error("Failed to connect to notifications:", error);
      }
    };

    connectToNotifications();
  }, [toast]);
}

export default NotificationProvider;
