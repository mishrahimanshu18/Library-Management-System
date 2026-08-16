import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCBNIE2FAF_pe8eHaq6n9Mr1NVeB35vnbU",
  authDomain: "library-management-syste-69977.firebaseapp.com",
  projectId: "library-management-syste-69977",
  storageBucket: "library-management-syste-69977.firebasestorage.app",
  messagingSenderId: "753672430587",
  appId: "1:753672430587:web:700c984e704c9e1e01615e",
  measurementId: "G-PVYS07TK37"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const analytics = getAnalytics(app);

export default app;