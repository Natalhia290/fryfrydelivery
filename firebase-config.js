// Configuração do Firebase para FRY - Sushi Delivery
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC9UzFuG_0wYjsXkNDf776RCY8X3TpcI1Q",
    authDomain: "fryfrydelivery.firebaseapp.com",
    projectId: "fryfrydelivery",
    storageBucket: "fryfrydelivery.firebasestorage.app",
    messagingSenderId: "567260128188",
    appId: "1:567260128188:web:aac55f5a4b8944622641b9",
    measurementId: "G-SE7XWRPSRZ"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Exportar para uso no projeto
export { db, analytics };
