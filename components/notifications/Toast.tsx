"use client";

import React from "react";
import { motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Notification } from "./NotificationProvider";

interface ToastProps {
  notification: Notification;
  onClose: () => void;
}

const toastVariants = {
  initial: {
    opacity: 0,
    y: -50,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: {
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
    icon: "text-green-600 dark:text-green-400",
    title: "text-green-900 dark:text-green-100",
    message: "text-green-700 dark:text-green-200",
  },
  error: {
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
    icon: "text-red-600 dark:text-red-400",
    title: "text-red-900 dark:text-red-100",
    message: "text-red-700 dark:text-red-200",
  },
  warning: {
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-yellow-200 dark:border-yellow-800",
    icon: "text-yellow-600 dark:text-yellow-400",
    title: "text-yellow-900 dark:text-yellow-100",
    message: "text-yellow-700 dark:text-yellow-200",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    icon: "text-blue-600 dark:text-blue-400",
    title: "text-blue-900 dark:text-blue-100",
    message: "text-blue-700 dark:text-blue-200",
  },
};

export function Toast({ notification, onClose }: ToastProps) {
  const Icon = iconMap[notification.type];
  const colors = colorMap[notification.type];

  return (
    <motion.div
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        "pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-lg border shadow-lg",
        colors.bg,
        colors.border
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={cn("h-5 w-5", colors.icon)} />
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className={cn("text-sm font-medium", colors.title)}>
              {notification.title}
            </p>
            {notification.message && (
              <p className={cn("mt-1 text-sm", colors.message)}>
                {notification.message}
              </p>
            )}
            {notification.action && (
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={notification.action.onClick}
                  className="h-8 text-xs"
                >
                  {notification.action.label}
                </Button>
              </div>
            )}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className={cn(
                "inline-flex rounded-md p-1.5 transition-colors",
                "hover:bg-black/5 dark:hover:bg-white/5",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent"
              )}
              onClick={onClose}
            >
              <span className="sr-only">Dismiss</span>
              <X className={cn("h-4 w-4", colors.icon)} />
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar for timed notifications */}
      {!notification.persistent && notification.duration && notification.duration > 0 && (
        <motion.div
          className={cn("h-1 w-full", colors.bg)}
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: notification.duration / 1000, ease: "linear" }}
          style={{ transformOrigin: "left" }}
        >
          <div className={cn("h-full", colors.icon.replace("text-", "bg-"))} />
        </motion.div>
      )}
    </motion.div>
  );
}

export default Toast;
