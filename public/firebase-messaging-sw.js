importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js");

// Detailed Firebase configuration (hardcoded for the service worker)
const firebaseConfig = {
  apiKey: "AIzaSyC4Ei8ck5iqp-0RzeHzySyCj9OgmA3q-AI",
  authDomain: "exam-copilot-2f279.firebaseapp.com",
  projectId: "exam-copilot-2f279",
  storageBucket: "exam-copilot-2f279.firebasestorage.app",
  messagingSenderId: "1080023083209",
  appId: "1:1080023083209:web:57ff9d9041dffc8ad18518"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Background Message:", payload);
  const notificationTitle = payload.notification?.title || "Exam Copilot";
  const notificationOptions = {
    body: payload.notification?.body || "New notification received.",
    icon: "/favicon.ico",
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
