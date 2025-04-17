// src/components/dashboard/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import {
  Box, 
  Typography, 
  Container, 
  Grid, 
  Paper, 
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalMalotes: number;
  malotesEmTransito: number;
  malotesRecebidos: number;
  malotesCancelados: number;
  malotesExtraviados: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser, userFilial } = useAuth();
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
        
        const malotes = response.data;
        
        // Calcular estatísticas
        const dashboardStats: DashboardStats = {
          totalMalotes: malotes.length,
          malotesEmTransito: malotes.filter(m => m.status_recebimento === 'Em trânsito').length,
          malotesRecebidos: malotes.filter(m => m.status_recebimento === 'Recebido').length,
          malotesCancelados: malotes.filter(m => m.status_recebimento === 'Cancelado').length,
          malotesExtraviados: malotes.filter(m => m.status_recebimento === 'Extraviado').length
        };
        
        setStats(dashboardStats);
      } catch (error: any) {
        console.error('Erro ao buscar malotes:', error);
        setError(error.response?.data?.error || 'Erro ao buscar dados. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMalotes();
  }, [currentUser]);

  const handleCadastrarClick = () => {
    navigate('/malotes/cadastro');
  };

  const handleListarClick = () => {
    navigate('/malotes');
  };

  const handleConfirmarClick = () => {
    navigate('/malotes/confirmar');
  };

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" gutterBottom>
          Bem-vindo ao Sistema de Monitoramento de Malotes.
          {userFilial && ` Filial atual: ${userFilial}`}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : stats ? (
          <>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Paper elevation={3} sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                  <Typography variant="h6">Total de Malotes</Typography>
                  <Typography variant="h3">{stats.totalMalotes}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Paper elevation={3} sx={{ p: 2, textAlign: 'center', bgcolor: '#fff9c4' }}>
                  <Typography variant="h6">Em Trânsito</Typography>
                  <Typography variant="h3">{stats.malotesEmTransito}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Paper elevation={3} sx={{ p: 2, textAlign: 'center', bgcolor: '#c8e6c9' }}>
                  <Typography variant="h6">Recebidos</Typography>
                  <Typography variant="h3">{stats.malotesRecebidos}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <Paper elevation={3} sx={{ p: 2, textAlign: 'center', bgcolor: '#ffccbc' }}>
                  <Typography variant="h6">Cancelados</Typography>
                  <Typography variant="h3">{stats.malotesCancelados}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <Paper elevation={3} sx={{ p: 2, textAlign: 'center', bgcolor: '#ffcdd2' }}>
                  <Typography variant="h6">Extraviados</Typography>
                  <Typography variant="h3">{stats.malotesExtraviados}</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mt: 4 }}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Cadastrar Novo Malote
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Registre um novo malote para envio a outra filial.
                    </Typography>
                    <Button 
                      variant="contained" 
                      fullWidth 
                      onClick={handleCadastrarClick}
                    >
                      Cadastrar Malote
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Listar Malotes
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Visualize todos os malotes relacionados à sua filial.
                    </Typography>
                    <Button 
                      variant="contained" 
                      fullWidth 
                      onClick={handleListarClick}
                    >
                      Ver Malotes
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Confirmar Entrega
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Confirme o recebimento de um malote usando o código de envio.
                    </Typography>
                    <Button 
                      variant="contained" 
                      fullWidth 
                      onClick={handleConfirmarClick}
                    >
                      Confirmar Entrega
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        ) : (
          <Alert severity="info" sx={{ mt: 2 }}>
            Nenhum dado disponível.
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard;
