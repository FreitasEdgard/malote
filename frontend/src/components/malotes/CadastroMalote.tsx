// src/components/malotes/CadastroMalote.tsx
import React, { useState, useEffect } from 'react';
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
  Grid,
  SelectChangeEvent
} from '@mui/material';

const categorias = [
  'Documentos',
  'Material de Escritório',
  'Equipamentos Eletrônicos',
  'Peças',
  'Amostras',
  'Outros'
];

const filiais = [
  'São Paulo',
  'Rio de Janeiro',
  'Belo Horizonte',
  'Brasília',
  'Salvador',
  'Recife',
  'Porto Alegre',
  'Curitiba'
];

const CadastroMalote: React.FC = () => {
  const [localidadeDestino, setLocalidadeDestino] = useState('');
  const [destinatario, setDestinatario] = useState('');
  const [categoria, setCategoria] = useState('');
  const [remetente, setRemetente] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { currentUser, userFilial } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userFilial) {
      setError('Não foi possível determinar sua filial. Por favor, contate o administrador.');
    }
  }, [userFilial]);

  const handleCategoriaChange = (event: SelectChangeEvent) => {
    setCategoria(event.target.value as string);
  };

  const handleLocalidadeDestinoChange = (event: SelectChangeEvent) => {
    setLocalidadeDestino(event.target.value as string);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!localidadeDestino || !destinatario || !categoria || !remetente) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);
      
      const token = await currentUser?.getIdToken();
      
      await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/malotes`,
        {
          localidade_origem: userFilial,
          remetente,
          localidade_destino: localidadeDestino,
          destinatario,
          categoria
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setSuccess('Malote cadastrado com sucesso!');
      
      // Limpa o formulário
      setLocalidadeDestino('');
      setDestinatario('');
      setCategoria('');
      setRemetente('');
      
      // Redireciona para a lista de malotes após 2 segundos
      setTimeout(() => {
        navigate('/malotes');
      }, 2000);
      
    } catch (error: any) {
      console.error('Erro ao cadastrar malote:', error);
      setError(error.response?.data?.error || 'Erro ao cadastrar malote. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
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
            Cadastro de Malote
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              {success}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="localidade-origem"
                  label="Localidade de Origem"
                  name="localidade-origem"
                  value={userFilial || ''}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="localidade-destino-label">Localidade de Destino</InputLabel>
                  <Select
                    labelId="localidade-destino-label"
                    id="localidade-destino"
                    value={localidadeDestino}
                    label="Localidade de Destino"
                    onChange={handleLocalidadeDestinoChange}
                    disabled={loading}
                  >
                    {filiais.map((filial) => (
                      <MenuItem 
                        key={filial} 
                        value={filial}
                        disabled={filial === userFilial} // Desabilita a própria filial como destino
                      >
                        {filial}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="remetente"
                  label="Nome do Remetente"
                  name="remetente"
                  value={remetente}
                  onChange={(e) => setRemetente(e.target.value)}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="destinatario"
                  label="Nome do Destinatário"
                  name="destinatario"
                  value={destinatario}
                  onChange={(e) => setDestinatario(e.target.value)}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="categoria-label">Categoria do Item</InputLabel>
                  <Select
                    labelId="categoria-label"
                    id="categoria"
                    value={categoria}
                    label="Categoria do Item"
                    onChange={handleCategoriaChange}
                    disabled={loading}
                  >
                    {categorias.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Cadastrar Malote'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default CadastroMalote;
