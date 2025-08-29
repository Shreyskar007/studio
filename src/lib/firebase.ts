import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBfuYQBIB-5wnrsq_XCwa6tn1Uz__uIwHM',
  authDomain: 'meetflow-44a5b.firebaseapp.com',
  projectId: 'meetflow-44a5b',
  storageBucket: 'meetflow-44a5b.appspot.com',
  messagingSenderId: '277490696934',
  appId: '1:277490696934:web:866333924792694155b4e8',
  measurementId: 'G-3ES24MFR0Y',
};

// Initialize Firebase
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
