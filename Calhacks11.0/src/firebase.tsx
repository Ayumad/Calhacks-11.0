// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAS5cJFS9QcGwWxeloYldf1AoIwJcoTu_M",
  authDomain: "articulateai-9600e.firebaseapp.com",
  projectId: "articulateai-9600e",
  storageBucket: "articulateai-9600e.appspot.com",
  messagingSenderId: "915954243080",
  appId: "1:915954243080:web:29a60b1c5a5bf6e9d263bd",
  measurementId: "G-MMV40GYST0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
const storage = getStorage(app);

// Export storage for use in other parts of your app
export { storage };
