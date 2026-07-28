import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';
const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
}, firebaseConfig.firestoreDatabaseId);
console.log("Success");
