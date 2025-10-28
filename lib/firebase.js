// lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

let analytics = null;

// 🔹 Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDu0zTlfhQ6swsRxzsaYCZX-iu_Kb1vqZ4",
  authDomain: "quanlychitieu-17fff.firebaseapp.com",
  projectId: "quanlychitieu-17fff",
  storageBucket: "quanlychitieu-17fff.appspot.com",
  messagingSenderId: "98380812271",
  appId: "1:98380812271:web:8fb497f631c1bd1729f01a",
  measurementId: "G-QCC030XPH9",
};

// ✅ Khởi tạo app (chỉ 1 lần)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Khởi tạo Auth & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

// ✅ Khởi tạo Analytics trên client nếu được hỗ trợ
if (typeof window !== "undefined") {
  import("firebase/analytics").then(async ({ getAnalytics, isSupported }) => {
    if (await isSupported()) {
      analytics = getAnalytics(app);
      console.log("✅ Firebase Analytics enabled");
    } else {
      console.log("⚠️ Firebase Analytics not supported in this browser");
    }
  });
}

export { app, analytics };
