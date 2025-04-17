// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Configuração do Firebase fornecida nos requisitos
const firebaseConfig = {
  apiKey: "AIzaSyC9b7BXNm8HijR-k-GZUJeCJn5gT0rKBbk",
  authDomain: "campneus-dashboard.firebaseapp.com",
  projectId: "campneus-dashboard",
  storageBucket: "campneus-dashboard.firebasestorage.app",
  messagingSenderId: "172203992376",
  appId: "1:172203992376:web:91d4ddf048071f110d8dcd",
  measurementId: "G-E6MZYD2YXG"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta o serviço de autenticação
export const auth = getAuth(app);
export default app;
