// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDiC3r3Pp2XpZgZEaG21trzMjp_wAKY_U0",
  authDomain: "rhythmflow-yw6j2.firebaseapp.com",
  projectId: "rhythmflow-yw6j2",
  storageBucket: "rhythmflow-yw6j2.appspot.com",
  messagingSenderId: "1001817271229",
  appId: "1:1001817271229:web:b58a23f7e2e4f1ab5500d4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
