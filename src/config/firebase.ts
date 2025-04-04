import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAwhrQrXFZgrZd45mvIw2IDA1rShAuljC0",
  authDomain: "aura-plus-3df90.firebaseapp.com",
  projectId: "aura-plus-3df90",
  storageBucket: "aura-plus-3df90.firebasestorage.app",
  messagingSenderId: "8586804039",
  appId: "1:8586804039:web:6235d7b737c5d50048ea62",
  measurementId: "G-JM9VRD7Z9C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth }; 