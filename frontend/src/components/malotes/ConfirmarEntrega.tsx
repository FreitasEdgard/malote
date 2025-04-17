// src/components/malotes/ConfirmarEntrega.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const statusOptions = [
  'Recebido',
  'Cancelado',
  'Extraviado'
];

const ConfirmarEntrega: React.FC = () => {
  const { codigo } = useParams<{ codigo: string }>();
  const [codigoEnvio, setCodigoEnvio] = useState(codigo || '');
  const [status, setStatus] = useState('Recebido');
  const [malote, setMalote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (codigo) {
      verificarMalote();
    }
  }, [codigo]);

  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatus(event.target.value as string);
  };

  const verificarMalote = async () => {
    if (!codigoEnvio) {
      setError('Por favor, informe o código de envio');
      return;
    }
    
    try {
      setVerificando(true);
      setError(null);
      
      const token = await currentUser?.getIdToken();
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/malotes/${codigoEnvio}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setMalote(response.data);
      
      if (response.data.status_recebimento !== 'Em trânsito') {
        setError(`Este malote já foi ${response.data.status_recebimento.toLowerCase()}`);
      }
    } catch (error: any) {
      console.error('Erro ao verificar malote:', error);
      setError(error.response?.data?.error || 'Malote não encontrado ou você não tem permissão para acessá-lo');
      setMalote(null);
    } finally {
      setVerificando(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!malote) {
      setError('Por favor, verifique o código de envio primeiro');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const token = await currentUser?.getIdToken();
      
      await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/malotes/${codigoEnvio}/status`,
        { status_recebimento: status },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setSuccess(`Malote ${status.toLowerCase()} com sucesso!`);
      
      // Redireciona para a lista de malotes após 2 segundos
      setTimeout(() => {
        navigate('/malotes');
      }, 2000);
      
    } catch (error: any) {
      console.error('Erro ao confirmar entrega:', error);
      setError(error.response?.data?.error || 'Erro ao confirmar entrega. Tente novamente.');
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
            Confirmar Entrega de Malote
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
              <Grid item xs={12} sm={8}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="codigo-envio"
                  label="Código de Envio"
                  name="codigo-envio"
                  value={codigoEnvio}
                  onChange={(e) => setCodigoEnvio(e.target.value)}
                  disabled={verificando || loading || !!malote}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 3 }}
                  onClick={verificarMalote}
                  disabled={verificando || loading || !codigoEnvio || !!malote}
                >
                  {verificando ? <CircularProgress size={24} /> : 'Verificar'}
                </Button>
              </Grid>
              
              {malote && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      margin="normal"
                      fullWidth
                      label="Origem"
                      value={malote.localidade_origem}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      margin="normal"
                      fullWidth
                      label="Destino"
                      value={malote.localidade_destino}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      margin="normal"
                      fullWidth
                      label="Remetente"
                      value={malote.remetente}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      margin="normal"
                      fullWidth
                      label="Destinatário"
                      value={malote.destinatario}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      margin="normal"
                      fullWidth
                      label="Categoria"
                      value={malote.categoria}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal" required>
                      <InputLabel id="status-label">Status de Recebimento</InputLabel>
                      <Select
                        labelId="status-label"
                        id="status"
                        value={status}
                        label="Status de Recebimento"
                        onChange={handleStatusChange}
                        disabled={loading || malote.status_recebimento !== 'Em trânsito'}
                      >
                        {statusOptions.map((opt) => (
                          <MenuItem key={opt} value={opt}>
                            {opt}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}
            </Grid>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || !malote || malote.status_recebimento !== 'Em trânsito'}
            >
              {loading ? <CircularProgress size={24} /> : 'Confirmar Recebimento'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ConfirmarEntrega;
