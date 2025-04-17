const fs = require('fs');
const path = require('path');
const { pool, query } = require('./config/db');

// Função para inicializar o banco de dados
const initializeDatabase = async () => {
  try {
    console.log('Iniciando a configuração do banco de dados...');
    
    // Lê o arquivo de schema SQL
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Executa os comandos SQL para criar as tabelas
    await query(schema);
    
    console.log('Banco de dados inicializado com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
    return false;
  }
};

// Funções para operações com usuários
const createUser = async (email, nome, filial) => {
  try {
    const result = await query(
      'INSERT INTO usuarios (email, nome, filial) VALUES ($1, $2, $3) RETURNING *',
      [email, nome, filial]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
};

const getUserByEmail = async (email) => {
  try {
    const result = await query('SELECT * FROM usuarios WHERE email = $1', [email]);
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao buscar usuário por email:', error);
    throw error;
  }
};

// Funções para operações com malotes
const createMalote = async (maloteData) => {
  const {
    localidade_origem,
    remetente,
    localidade_destino,
    destinatario,
    categoria,
    codigo_envio,
    status_recebimento = 'Em trânsito'
  } = maloteData;

  try {
    const result = await query(
      `INSERT INTO malotes 
       (localidade_origem, remetente, localidade_destino, destinatario, categoria, codigo_envio, status_recebimento)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [localidade_origem, remetente, localidade_destino, destinatario, categoria, codigo_envio, status_recebimento]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao criar malote:', error);
    throw error;
  }
};

const getMaloteByCodigoEnvio = async (codigo_envio) => {
  try {
    const result = await query('SELECT * FROM malotes WHERE codigo_envio = $1', [codigo_envio]);
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao buscar malote por código de envio:', error);
    throw error;
  }
};

const updateMaloteStatus = async (codigo_envio, status_recebimento, recebido_por) => {
  try {
    const result = await query(
      'UPDATE malotes SET status_recebimento = $1, recebido_por = $2 WHERE codigo_envio = $3 RETURNING *',
      [status_recebimento, recebido_por, codigo_envio]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao atualizar status do malote:', error);
    throw error;
  }
};

const getMalotesByFilial = async (filial) => {
  try {
    const result = await query(
      'SELECT * FROM malotes WHERE localidade_origem = $1 OR localidade_destino = $1 ORDER BY data_criacao DESC',
      [filial]
    );
    return result.rows;
  } catch (error) {
    console.error('Erro ao buscar malotes por filial:', error);
    throw error;
  }
};

// Exporta as funções para uso em outros módulos
module.exports = {
  initializeDatabase,
  createUser,
  getUserByEmail,
  createMalote,
  getMaloteByCodigoEnvio,
  updateMaloteStatus,
  getMalotesByFilial
};
