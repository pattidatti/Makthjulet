import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyDWdekXyAi_Qi71McF4nkzYUoPxFvFF0ok",
    authDomain: "makthjulet.firebaseapp.com",
    databaseURL: "https://makthjulet-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "makthjulet",
    storageBucket: "makthjulet.firebasestorage.app",
    messagingSenderId: "438539008474",
    appId: "1:438539008474:web:adef0b0485284b3d30a8e3"
};

const app = initializeApp(firebaseConfig);

// Export instances
export const db = getDatabase(app, firebaseConfig.databaseURL);
export const auth = getAuth(app);

export default app;
