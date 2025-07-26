// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth,GithubAuthProvider,GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBljjvONSXoQC4Pp-ORU6Y1-iTkJkqnBcU",
  authDomain: "coalliance-7371e.firebaseapp.com",
  projectId: "coalliance-7371e",
  storageBucket: "coalliance-7371e.firebasestorage.app",
  messagingSenderId: "715249334600",
  appId: "1:715249334600:web:e078ada4090548454edb7d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const githubProvider = new GithubAuthProvider()