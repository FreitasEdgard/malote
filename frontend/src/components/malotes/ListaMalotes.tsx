// src/components/malotes/ListaMalotes.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface Malote {
  id: number;
  localidade_origem: string;
  remetente: string;
  localidade_destino: string;
  destinatario: string;
  categoria: string;
  codigo_envio: string;
  status_recebimento: string;
  recebido_por: string | null;
  data_criacao: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Em trânsito':
      return 'warning';
    case 'Recebido':
      return 'success';
    case 'Cancelado':
      return 'error';
    case 'Extraviado':
      return 'error';
    default:
      return 'default';
  }
};

const ListaMalotes: React.FC = () => {
  const [malotes, setMalotes] = useState<Malote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMalotes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = await currentUser?.getIdToken();
        
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/malotes`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        setMalotes(response.data);
      } catch (error: any) {
        console.error('Erro ao buscar malotes:', error);
        setError(error.response?.data?.error || 'Erro ao buscar malotes. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMalotes();
  }, [currentUser]);

  const handleCadastrarClick = () => {
    navigate('/malotes/cadastro');
  };

  const handleConfirmarEntregaClick = (codigoEnvio: string) => {
    navigate(`/malotes/confirmar/${codigoEnvio}`);
  };

  const handleImprimirClick = (malote: Malote) => {
    navigate(`/malotes/imprimir/${malote.codigo_envio}`);
  };

  return (
    <Container component="main" maxWidth="lg">
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
            width: '100%'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography component="h1" variant="h5">
              Malotes
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleCadastrarClick}
            >
              Cadastrar Novo Malote
            </Button>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : malotes.length === 0 ? (
            <Alert severity="info" sx={{ width: '100%', mb: 2 }}>
              Nenhum malote encontrado para sua filial.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Código</TableCell>
                    <TableCell>Origem</TableCell>
                    <TableCell>Destino</TableCell>
                    <TableCell>Remetente</TableCell>
                    <TableCell>Destinatário</TableCell>
                    <TableCell>Categoria</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {malotes.map((malote) => (
                    <TableRow key={malote.id}>
                      <TableCell>{malote.codigo_envio}</TableCell>
                      <TableCell>{malote.localidade_origem}</TableCell>
                      <TableCell>{malote.localidade_destino}</TableCell>
                      <TableCell>{malote.remetente}</TableCell>
                      <TableCell>{malote.destinatario}</TableCell>
                      <TableCell>{malote.categoria}</TableCell>
                      <TableCell>
                        <Chip 
                          label={malote.status_recebimento} 
                          color={getStatusColor(malote.status_recebimento) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => handleImprimirClick(malote)}
                          >
                            Imprimir
                          </Button>
                          {malote.status_recebimento === 'Em trânsito' && (
                            <Button 
                              variant="outlined" 
                              size="small"
                              color="success"
                              onClick={() => handleConfirmarEntregaClick(malote.codigo_envio)}
                            >
                              Confirmar
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ListaMalotes;
