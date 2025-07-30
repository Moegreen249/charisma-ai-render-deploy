"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "./NotificationProvider";
import { Bell, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

export function TestNotificationButton() {
  const { toast } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);

  const testNotifications = [
    {
      type: "success" as const,
      title: "Analysis Complete!",
      message: "Your conversation analysis is ready to view.",
      action: {
        label: "View Results",
        onClick: () => console.log("Navigate to results"),
      },
    },
    {
      type: "error" as const,
      title: "Analysis Failed",
      message: "There was an error processing your conversation.",
      persistent: true,
    },
    {
      type: "warning" as const,
      title: "System Maintenance",
      message: "Scheduled maintenance will begin in 30 minutes.",
      persistent: true,
    },
    {
      type: "info" as const,
      title: "Processing Update",
      message: "Your file is being analyzed... 75% complete.",
    },
  ];

  const sendTestNotification = () => {
    const randomNotification = testNotifications[Math.floor(Math.random() * testNotifications.length)];
    toast[randomNotification.type](
      randomNotification.title,
      randomNotification.message,
      {
        action: randomNotification.action,
        persistent: randomNotification.persistent,
      }
    );
  };

  const sendServerNotification = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/test-notification", {
        method: "GET",
      });

      if (response.ok) {
        toast.success("Server Notification", "Test notification sent from server!");
      } else {
        toast.error("Failed", "Could not send server notification");
      }
    } catch (error) {
      toast.error("Error", "Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const sendAllTypes = () => {
    // Send all notification types with a delay
    testNotifications.forEach((notification, index) => {
      setTimeout(() => {
        toast[notification.type](
          notification.title,
          notification.message,
          {
            action: notification.action,
            persistent: notification.persistent,
          }
        );
      }, index * 500);
    });
  };

  return (
    <div className="flex flex-col gap-2 p-4 border rounded-lg bg-card">
      <h3 className="font-semibold text-sm text-muted-foreground mb-2">
        🔔 Notification Testing
      </h3>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={sendTestNotification}
          size="sm"
          variant="outline"
          className="gap-2"
        >
          <Bell className="h-3 w-3" />
          Random Toast
        </Button>

        <Button
          onClick={() => toast.success("Success!", "Operation completed successfully")}
          size="sm"
          variant="outline"
          className="gap-2 text-green-600"
        >
          <CheckCircle className="h-3 w-3" />
          Success
        </Button>

        <Button
          onClick={() => toast.error("Error!", "Something went wrong")}
          size="sm"
          variant="outline"
          className="gap-2 text-red-600"
        >
          <AlertCircle className="h-3 w-3" />
          Error
        </Button>

        <Button
          onClick={() => toast.warning("Warning!", "Please review this action")}
          size="sm"
          variant="outline"
          className="gap-2 text-yellow-600"
        >
          <AlertTriangle className="h-3 w-3" />
          Warning
        </Button>

        <Button
          onClick={() => toast.info("Info", "Here's some useful information")}
          size="sm"
          variant="outline"
          className="gap-2 text-blue-600"
        >
          <Info className="h-3 w-3" />
          Info
        </Button>
      </div>

      <div className="flex gap-2 mt-2">
        <Button
          onClick={sendAllTypes}
          size="sm"
          variant="secondary"
          className="gap-2"
        >
          Send All Types
        </Button>

        <Button
          onClick={sendServerNotification}
          size="sm"
          variant="secondary"
          className="gap-2"
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Server Test"}
        </Button>
      </div>

      <div className="text-xs text-muted-foreground mt-2">
        Test the notification system with different types and sources
      </div>
    </div>
  );
}

export default TestNotificationButton;
