// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "rhythmflow-yw6j2",
  "appId": "1:1001817271229:web:b58a23f7e2e4f1ab5500d4",
  "storageBucket": "rhythmflow-yw6j2.firebasestorage.app",
  "apiKey": "AIzaSyDiC3r3Pp2XpZgZEaG21trzMjp_wAKY_U0",
  "authDomain": "rhythmflow-yw6j2.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1001817271229"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
