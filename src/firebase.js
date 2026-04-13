import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBv1eamtBox-Xb-ZiXM6xEnVzFSoCKXEzE",
  authDomain: "aretusa-league.firebaseapp.com",
  projectId: "aretusa-league",
  storageBucket: "aretusa-league.firebasestorage.app",
  messagingSenderId: "1093417534466",
  appId: "1:1093417534466:web:78ea68fe2f1d190397931b"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
