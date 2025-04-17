// src/components/auth/RegisterUser.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';

const RegisterUser: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nome, setNome] = useState('');
  const [filial, setFilial] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleFilialChange = (event: SelectChangeEvent) => {
    setFilial(event.target.value as string);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword || !nome || !filial) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    
    try {
      setError(null);
      setLoading(true);
      
      // Registra o usuário no Firebase
      await register(email, password);
      
      // Obtém o token do usuário recém-registrado
      const token = await currentUser?.getIdToken();
      
      // Registra o usuário no backend
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/usuarios/register`, 
        { email, nome, filial },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      navigate('/dashboard');
    } catch (error: any) {
      let errorMessage = 'Falha ao registrar usuário';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está em uso';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'A senha é muito fraca';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            padding: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Registrar Novo Usuário
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="nome"
              label="Nome Completo"
              name="nome"
              autoFocus
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="filial-label">Filial</InputLabel>
              <Select
                labelId="filial-label"
                id="filial"
                value={filial}
                label="Filial"
                onChange={handleFilialChange}
                disabled={loading}
              >
                <MenuItem value="São Paulo">São Paulo</MenuItem>
                <MenuItem value="Rio de Janeiro">Rio de Janeiro</MenuItem>
                <MenuItem value="Belo Horizonte">Belo Horizonte</MenuItem>
                <MenuItem value="Brasília">Brasília</MenuItem>
                <MenuItem value="Salvador">Salvador</MenuItem>
                <MenuItem value="Recife">Recife</MenuItem>
                <MenuItem value="Porto Alegre">Porto Alegre</MenuItem>
                <MenuItem value="Curitiba">Curitiba</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Senha"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirmar Senha"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Registrar'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterUser;
