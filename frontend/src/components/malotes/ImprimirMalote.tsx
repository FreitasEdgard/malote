// src/components/malotes/ImprimirMalote.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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

const ImprimirMalote: React.FC = () => {
  const { codigo } = useParams<{ codigo: string }>();
  const [malote, setMalote] = useState<Malote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imprimindo, setImprimindo] = useState(false);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMalote = async () => {
      if (!codigo) {
        setError('Código de malote não fornecido');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const token = await currentUser?.getIdToken();
        
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/malotes/${codigo}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        setMalote(response.data);
      } catch (error: any) {
        console.error('Erro ao buscar malote:', error);
        setError(error.response?.data?.error || 'Erro ao buscar malote. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMalote();
  }, [codigo, currentUser]);

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR');
  };

  const gerarPDF = () => {
    if (!malote) return;
    
    setImprimindo(true);
    
    try {
      // Cria um novo documento PDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [100, 150] // Formato tipo microdanfe (tamanho reduzido)
      });
      
      // Adiciona título
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('COMPROVANTE DE MALOTE', 50, 10, { align: 'center' });
      
      // Adiciona código de barras (simulado com texto)
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`CÓDIGO: ${malote.codigo_envio}`, 50, 20, { align: 'center' });
      
      // Adiciona linha divisória
      doc.setLineWidth(0.5);
      doc.line(10, 25, 90, 25);
      
      // Adiciona informações do malote
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      let y = 30;
      const lineHeight = 6;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Origem:', 10, y);
      doc.setFont('helvetica', 'normal');
      doc.text(malote.localidade_origem, 40, y);
      y += lineHeight;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Remetente:', 10, y);
      doc.setFont('helvetica', 'normal');
      doc.text(malote.remetente, 40, y);
      y += lineHeight;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Destino:', 10, y);
      doc.setFont('helvetica', 'normal');
      doc.text(malote.localidade_destino, 40, y);
      y += lineHeight;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Destinatário:', 10, y);
      doc.setFont('helvetica', 'normal');
      doc.text(malote.destinatario, 40, y);
      y += lineHeight;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Categoria:', 10, y);
      doc.setFont('helvetica', 'normal');
      doc.text(malote.categoria, 40, y);
      y += lineHeight;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Status:', 10, y);
      doc.setFont('helvetica', 'normal');
      doc.text(malote.status_recebimento, 40, y);
      y += lineHeight;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Data:', 10, y);
      doc.setFont('helvetica', 'normal');
      doc.text(formatarData(malote.data_criacao), 40, y);
      y += lineHeight * 2;
      
      // Adiciona linha para assinatura
      doc.setLineWidth(0.5);
      doc.line(10, y, 90, y);
      y += lineHeight;
      
      doc.setFontSize(8);
      doc.text('Assinatura do Recebedor', 50, y, { align: 'center' });
      
      // Salva o PDF e abre para impressão
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      setError('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setImprimindo(false);
    }
  };

  const handleVoltar = () => {
    navigate('/malotes');
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
            width: '100%'
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Imprimir Malote
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : malote ? (
            <>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Detalhes do Malote
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">
                      <strong>Código:</strong> {malote.codigo_envio}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">
                      <strong>Status:</strong> {malote.status_recebimento}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">
                      <strong>Origem:</strong> {malote.localidade_origem}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">
                      <strong>Destino:</strong> {malote.localidade_destino}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">
                      <strong>Remetente:</strong> {malote.remetente}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">
                      <strong>Destinatário:</strong> {malote.destinatario}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">
                      <strong>Categoria:</strong> {malote.categoria}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">
                      <strong>Data de Criação:</strong> {formatarData(malote.data_criacao)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={handleVoltar}
                  disabled={imprimindo}
                >
                  Voltar
                </Button>
                <Button
                  variant="contained"
                  onClick={gerarPDF}
                  disabled={imprimindo}
                >
                  {imprimindo ? <CircularProgress size={24} /> : 'Imprimir Microdanfe'}
                </Button>
              </Box>
            </>
          ) : (
            <Alert severity="info" sx={{ width: '100%', mb: 2 }}>
              Malote não encontrado.
            </Alert>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ImprimirMalote;
