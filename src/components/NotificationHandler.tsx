import { useEffect } from "react";
import { requestForToken, onMessageListener } from "@/lib/firebase";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import deviceService, { Platform, PushProvider } from "@/services/device.service";

const NotificationHandler = () => {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Only request token if user is authenticated
    if (!isAuthenticated || !user) return;
    
    // Function to handle the actual permission request and registration
    const handleEnableNotifications = async () => {
      console.log("🔔 [NotificationHandler] User triggered permission request...");
      try {
        const token = await requestForToken();
        if (token) {
          console.log("✅ [NotificationHandler] FCM Token generated:", token);
          
          await deviceService.registerDevice({
            user_id: user.id,
            provider: PushProvider.FCM,
            platform: Platform.WEB,
            device_install_id: `WEB_${user.id}_${window.navigator.userAgent.substring(0, 32)}`,
            push_token: token,
          });
          
          console.log("💎 [NotificationHandler] Backend registration successful!");
          toast.success("Notifications Enabled", {
            description: "You'll stay updated on your study progress."
          });
        }
      } catch (err) {
        console.error("❌ [NotificationHandler] Failed to enable notifications:", err);
        toast.error("Setup Failed", {
          description: "Could not activate notifications. Please try again later."
        });
      }
    };

    // Check if notifications are supported
    if (!("Notification" in window)) {
      console.warn("Notifications are not supported in this browser.");
      return;
    }

    // Proactively check permission and act
    if (Notification.permission === 'default') {
      setTimeout(() => {
        toast("Enable Notifications 🔔", {
          description: "Don't miss out on important test results and study reminders.",
          action: {
            label: "Enable",
            onClick: () => handleEnableNotifications()
          },
          duration: 10000,
        });
      }, 2000); // 2 second delay to let page load
    } else if (Notification.permission === 'granted') {
      // Auto-register/refresh token if already granted
      handleEnableNotifications();
    } else {
      console.log("ℹ️ [NotificationHandler] Notifications are blocked by the user.");
    }

    // 📩 Listen for Foreground messages
    onMessageListener()
      .then((payload: any) => {
        console.log("Foreground Payload:", payload);
        toast.success(payload.notification?.title || "New Update", {
          description: payload.notification?.body || "Check your notification dashboard.",
        });
      })
      .catch((err) => console.log("Failed to receive foreground message: ", err));
  }, [isAuthenticated, user]);

  return null;
};

export default NotificationHandler;
