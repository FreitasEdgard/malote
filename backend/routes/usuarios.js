const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { createUser, getUserByEmail } = require('../database/db-operations');

// Rota para registrar um novo usuário
router.post('/register', verifyToken, async (req, res) => {
  try {
    const { email, nome, filial } = req.body;
    
    // Verifica se o usuário já existe
    const usuarioExistente = await getUserByEmail(email);
    if (usuarioExistente) {
      return res.status(400).json({ error: 'Usuário já cadastrado' });
    }
    
    // Cria o usuário no banco de dados
    const novoUsuario = await createUser(email, nome, filial);
    
    res.status(201).json(novoUsuario);
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

// Rota para obter informações do usuário atual
router.get('/me', verifyToken, async (req, res) => {
  try {
    const email = req.user.email;
    const usuario = await getUserByEmail(email);
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json(usuario);
  } catch (error) {
    console.error('Erro ao buscar informações do usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar informações do usuário' });
  }
});

module.exports = router;
