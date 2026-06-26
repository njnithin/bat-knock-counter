// firebase-config.js
// ⚠️ IMPORTANT: REPLACE THESE PLACEHOLDERS WITH YOUR ACTUAL FIREBASE CONFIG ⚠️
// 1. Go to console.firebase.google.com
// 2. Create a Project
// 3. Add a Web App to get these config values
// 4. Enable "Google" as a Sign-in Provider in Authentication
// 5. Create a Firestore Database in Test Mode (or set proper security rules)

const firebaseConfig = {
  apiKey: "AIzaSy_YOUR_API_KEY_HERE",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.firebasestorage.app",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

window.firebaseAuth = auth;
window.firebaseDb = db;
window.firebaseProvider = provider;
