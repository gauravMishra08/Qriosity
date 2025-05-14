import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAnalytics, isSupported } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyAtZVY6PEaf9flKkZUYcmAKUL4FGO7nXh0",
  authDomain: "qriosity-e9f28.firebaseapp.com",
  projectId: "qriosity-e9f28",
  storageBucket: "qriosity-e9f28.firebasestorage.app",
  messagingSenderId: "50404801090",
  appId: "1:50404801090:web:21535c42e020ee56168bdb",
  measurementId: "G-LBS67RJG9T",
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const db = getFirestore(app)

// Initialize Analytics conditionally (only in browser)
let analytics = null
if (typeof window !== "undefined") {
  isSupported().then((yes) => yes && (analytics = getAnalytics(app)))
}

export { app, db, analytics }
