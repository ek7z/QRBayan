import { useEffect } from "react";
import api from "../api/axios";
import useAuthStore from "../store/useAuthStore";
import { useToast } from "./ToastProvider";

const POLL_INTERVAL_MS = 15000;

const NotificationWatcher = () => {
  const { showToast } = useToast();
  const { isAuthenticated, updateUser } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    let intervalId = null;
    let active = true;
    let inFlight = false;

    const pollNotifications = async () => {
      if (!active || inFlight || document.visibilityState === "hidden") {
        return;
      }

      inFlight = true;

      try {
        const response = await api.get("/notifications/poll");
        const { notifications = [], user } = response.data.data || {};

        if (user) {
          updateUser(user);
        }

        notifications.forEach((notification) => {
          showToast({
            type: notification.type || "info",
            title: notification.title,
            message: notification.message,
            duration: 7000,
          });
        });
      } catch (error) {
        // Global auth interceptor already handles 401.
      } finally {
        inFlight = false;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        pollNotifications();
      }
    };

    pollNotifications();
    intervalId = window.setInterval(pollNotifications, POLL_INTERVAL_MS);
    window.addEventListener("focus", pollNotifications);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
      window.removeEventListener("focus", pollNotifications);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, showToast, updateUser]);

  return null;
};

export default NotificationWatcher;
