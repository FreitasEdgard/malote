const { Pool } = require('pg');
require('dotenv').config();

// Configuração da conexão com o PostgreSQL no Tembo
const pool = new Pool({
  host: 'impossibly-elevated-bluebill.data-1.use1.tembo.io',
  port: 5432,
  user: 'postgres',
  password: 'pirelli',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false // Necessário para conexões SSL sem certificado verificado
  }
});

// Teste de conexão
pool.connect((err, client, release) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.stack);
  } else {
    console.log('Conexão com o banco de dados PostgreSQL estabelecida com sucesso!');
    release();
  }
});

// Função para executar consultas SQL
const query = (text, params) => pool.query(text, params);

module.exports = {
  query,
  pool
};
