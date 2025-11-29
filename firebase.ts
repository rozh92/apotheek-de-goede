import firebase from 'firebase/compat/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBCCaDtCIVjTyBqvwP6IGX1N1VCQ5pYw_A",
  authDomain: "copharma-dashboard.firebaseapp.com",
  projectId: "copharma-dashboard",
  storageBucket: "copharma-dashboard.firebasestorage.app",
  messagingSenderId: "694576743442",
  appId: "1:694576743442:web:289664f09bb41babc384cb"
};

// Initialiseer Firebase
const app = firebase.initializeApp(firebaseConfig);

// Exporteer de database connectie
export const db = getFirestore();
