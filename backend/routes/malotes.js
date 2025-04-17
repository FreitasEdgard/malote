const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { 
  createMalote, 
  getMaloteByCodigoEnvio, 
  updateMaloteStatus, 
  getMalotesByFilial 
} = require('../database/db-operations');
const { getUserByEmail } = require('../database/db-operations');
const crypto = require('crypto');

// Middleware para verificar acesso à filial
const verificarAcessoFilial = async (req, res, next) => {
  try {
    const email = req.user.email;
    const usuario = await getUserByEmail(email);
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Armazena a filial do usuário para uso nas rotas
    req.filialUsuario = usuario.filial;
    next();
  } catch (error) {
    console.error('Erro ao verificar acesso à filial:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Gerar código de envio único
const gerarCodigoEnvio = () => {
  // Formato: ML-XXXXX-XXXXX (onde X são caracteres alfanuméricos)
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = 'ML-';
  
  // Gera 5 caracteres aleatórios
  for (let i = 0; i < 5; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  
  codigo += '-';
  
  // Gera mais 5 caracteres aleatórios
  for (let i = 0; i < 5; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  
  return codigo;
};

// Rota para criar um novo malote
router.post('/', verifyToken, verificarAcessoFilial, async (req, res) => {
  try {
    const { 
      localidade_origem, 
      remetente, 
      localidade_destino, 
      destinatario, 
      categoria 
    } = req.body;
    
    // Verifica se a localidade de origem corresponde à filial do usuário
    if (localidade_origem !== req.filialUsuario) {
      return res.status(403).json({ 
        error: 'Você só pode criar malotes com origem na sua filial' 
      });
    }
    
    // Gera um código de envio único
    const codigo_envio = gerarCodigoEnvio();
    
    // Cria o malote no banco de dados
    const novoMalote = await createMalote({
      localidade_origem,
      remetente,
      localidade_destino,
      destinatario,
      categoria,
      codigo_envio,
      status_recebimento: 'Em trânsito'
    });
    
    res.status(201).json(novoMalote);
  } catch (error) {
    console.error('Erro ao criar malote:', error);
    res.status(500).json({ error: 'Erro ao criar malote' });
  }
});

// Rota para obter malotes da filial do usuário
router.get('/', verifyToken, verificarAcessoFilial, async (req, res) => {
  try {
    const malotes = await getMalotesByFilial(req.filialUsuario);
    res.json(malotes);
  } catch (error) {
    console.error('Erro ao buscar malotes:', error);
    res.status(500).json({ error: 'Erro ao buscar malotes' });
  }
});

// Rota para obter um malote específico pelo código de envio
router.get('/:codigo', verifyToken, verificarAcessoFilial, async (req, res) => {
  try {
    const { codigo } = req.params;
    const malote = await getMaloteByCodigoEnvio(codigo);
    
    if (!malote) {
      return res.status(404).json({ error: 'Malote não encontrado' });
    }
    
    // Verifica se o usuário tem acesso a este malote
    if (malote.localidade_origem !== req.filialUsuario && 
        malote.localidade_destino !== req.filialUsuario) {
      return res.status(403).json({ 
        error: 'Você não tem permissão para acessar este malote' 
      });
    }
    
    res.json(malote);
  } catch (error) {
    console.error('Erro ao buscar malote:', error);
    res.status(500).json({ error: 'Erro ao buscar malote' });
  }
});

// Rota para atualizar o status de um malote
router.put('/:codigo/status', verifyToken, verificarAcessoFilial, async (req, res) => {
  try {
    const { codigo } = req.params;
    const { status_recebimento } = req.body;
    
    // Verifica se o status é válido
    const statusValidos = ['Sim', 'Em trânsito', 'Recebido', 'Cancelado', 'Extraviado'];
    if (!statusValidos.includes(status_recebimento)) {
      return res.status(400).json({ error: 'Status de recebimento inválido' });
    }
    
    // Busca o malote atual
    const malote = await getMaloteByCodigoEnvio(codigo);
    
    if (!malote) {
      return res.status(404).json({ error: 'Malote não encontrado' });
    }
    
    // Verifica se o usuário tem acesso a este malote
    if (malote.localidade_origem !== req.filialUsuario && 
        malote.localidade_destino !== req.filialUsuario) {
      return res.status(403).json({ 
        error: 'Você não tem permissão para atualizar este malote' 
      });
    }
    
    // Atualiza o status do malote
    const maloteAtualizado = await updateMaloteStatus(
      codigo,
      status_recebimento,
      req.user.email // Email do usuário que confirmou o recebimento
    );
    
    res.json(maloteAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar status do malote:', error);
    res.status(500).json({ error: 'Erro ao atualizar status do malote' });
  }
});

module.exports = router;
