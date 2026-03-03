import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Modules from './pages/Modules';
import CMS from './pages/CMS';
import AddModule from './pages/AddModule';
import ModuleAllotment from './pages/ModuleAllotment';
import ModuleFields from './pages/ModuleFields';
import AppSettings from './pages/AppSettings';
import Users from './pages/Users';
import TicketConfig from './pages/TicketConfig';
import Layout from './components/Layout';
import Notifications from './pages/Notifications';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const admin = localStorage.getItem('admin');
  if (!admin) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/modules" element={
            <ProtectedRoute>
              <Modules />
            </ProtectedRoute>
          } />
          <Route path="/modules/add" element={
            <ProtectedRoute>
              <AddModule />
            </ProtectedRoute>
          } />
          <Route path="/allotment" element={
            <ProtectedRoute>
              <ModuleAllotment />
            </ProtectedRoute>
          } />
          <Route path="/modules/fields/:function_id" element={
            <ProtectedRoute>
              <ModuleFields />
            </ProtectedRoute>
          } />
          <Route path="/cms/:function_id" element={
            <ProtectedRoute>
              <CMS />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <AppSettings />
            </ProtectedRoute>
          } />
          <Route path="/tickets/:event_id" element={
            <ProtectedRoute>
              <TicketConfig />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
