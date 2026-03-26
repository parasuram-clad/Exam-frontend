import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Firebase configuration for Exam Copilot
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Your VAPID Public Key (from Project Settings > Cloud Messaging)
export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    console.log("🔐 Notification Permission Status:", permission);
    
    if (permission === "granted") {
      // Register service worker explicitly for more reliability
      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      
      const currentToken = await getToken(messaging, { 
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration
      });

      if (currentToken) {
        console.log("💎 [Firebase] Token generated successfully:", currentToken);
        return currentToken;
      } else {
        console.warn("⚠️ [Firebase] No registration token available.");
      }
    } else {
      console.error("❌ [Firebase] Permission NOT granted. Status:", permission);
    }
  } catch (err) {
    console.error("🔥 [Firebase] Error while retrieving token:", err);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("Foreground Message received:", payload);
      resolve(payload);
    });
  });
