// src/firebaseConfig.ts

// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
// Import Firebase Auth and Firestore functions
import { getAuth } from "firebase/auth";
// *** Import getFirestore for Firebase Firestore ***
import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
// This should be your actual Firebase Web App config from the console
const firebaseConfig = {
  apiKey: "AIzaSyCXRcL1PsuIzEKcdPuK3ihlxbsW2vhklT4", // Your actual API Key
  authDomain: "careforme-comp302.firebaseapp.com", // Your actual Auth Domain
  projectId: "careforme-comp302", // Your actual Project ID
  storageBucket: "careforme-comp302.firebasestorage.app", // Your actual Storage Bucket
  messagingSenderId: "39382321072", // Your actual Messaging Sender ID
  appId: "1:39382321072:web:1cfe84a7cd3a725c5f7875" // Your actual App ID
  // measurementId: "YOUR_MEASUREMENT_ID" // Optional Measurement ID
};

// Initialize Firebase App
// Check if a Firebase app instance already exists to avoid re-initializing
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication and export the auth instance
const auth = getAuth(app);

// *** Initialize Firebase Firestore and export the db instance ***
const db = getFirestore(app);


// Export the initialized Auth and Firestore instances
export { auth, db }; // *** Export both auth and db ***
