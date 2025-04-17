const admin = require('firebase-admin');
const serviceAccount = require('../config/firebase-service-account.json');

// Inicializa o Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Middleware para verificar o token de autenticação
const verifyToken = async (req, res, next) => {
  try {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    
    if (!idToken) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }
    
    // Verifica o token com o Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    
    next();
  } catch (error) {
    console.error('Erro na verificação do token:', error);
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

module.exports = {
  verifyToken
};
