-- Criação da tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nome TEXT,
    filial TEXT -- chave para localização
);

-- Criação da tabela de malotes
CREATE TABLE IF NOT EXISTS malotes (
    id SERIAL PRIMARY KEY,
    localidade_origem TEXT,
    remetente TEXT,
    localidade_destino TEXT,
    destinatario TEXT,
    categoria TEXT,
    codigo_envio TEXT UNIQUE,
    status_recebimento TEXT CHECK (status_recebimento IN ('Sim', 'Em trânsito', 'Recebido', 'Cancelado', 'Extraviado')),
    recebido_por TEXT, -- email do usuário
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhorar a performance de consultas
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_malotes_codigo_envio ON malotes(codigo_envio);
CREATE INDEX IF NOT EXISTS idx_malotes_localidade_origem ON malotes(localidade_origem);
CREATE INDEX IF NOT EXISTS idx_malotes_localidade_destino ON malotes(localidade_destino);
