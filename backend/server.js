const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initializeDatabase } = require('./database/db-operations');

// Carrega as variáveis de ambiente
dotenv.config();

// Inicializa o aplicativo Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
const malotesRoutes = require('./routes/malotes');
const usuariosRoutes = require('./routes/usuarios');

app.use('/api/malotes', malotesRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Rota de teste para verificar se o servidor está funcionando
app.get('/', (req, res) => {
  res.json({ message: 'API do Sistema de Monitoramento de Malotes está funcionando!' });
});

// Inicializa o banco de dados e inicia o servidor
const iniciarServidor = async () => {
  try {
    // Inicializa o banco de dados
    const dbInitializado = await initializeDatabase();
    
    if (!dbInitializado) {
      console.error('Falha ao inicializar o banco de dados. Encerrando aplicação.');
      process.exit(1);
    }
    
    // Inicia o servidor
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
};

iniciarServidor();
