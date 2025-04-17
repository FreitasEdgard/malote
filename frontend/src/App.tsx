// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/auth/Login';
import PrivateRoute from './components/auth/PrivateRoute';
import RegisterUser from './components/auth/RegisterUser';
import Dashboard from './components/dashboard/Dashboard';
import Navbar from './components/layout/Navbar';
import CadastroMalote from './components/malotes/CadastroMalote';
import ListaMalotes from './components/malotes/ListaMalotes';
import ConfirmarEntrega from './components/malotes/ConfirmarEntrega';
import ImprimirMalote from './components/malotes/ImprimirMalote';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterUser />} />
          
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={
              <>
                <Navbar />
                <Dashboard />
              </>
            } />
            <Route path="/malotes" element={
              <>
                <Navbar />
                <ListaMalotes />
              </>
            } />
            <Route path="/malotes/cadastro" element={
              <>
                <Navbar />
                <CadastroMalote />
              </>
            } />
            <Route path="/malotes/confirmar/:codigo" element={
              <>
                <Navbar />
                <ConfirmarEntrega />
              </>
            } />
            <Route path="/malotes/confirmar" element={
              <>
                <Navbar />
                <ConfirmarEntrega />
              </>
            } />
            <Route path="/malotes/imprimir/:codigo" element={
              <>
                <Navbar />
                <ImprimirMalote />
              </>
            } />
          </Route>
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
