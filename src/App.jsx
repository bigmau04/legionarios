import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard  from './pages/Dashboard';
import Players    from './pages/Players';
import Payments   from './pages/Payments';
import AddPlayer  from './pages/AddPlayer';
import Attendance from './pages/Attendance';
import Events     from './pages/Events';
import Settings   from './pages/Settings';
import Login      from './pages/Login';
import PlayerPortal from './pages/PlayerPortal';
import Sidebar    from './components/Sidebar';
import BottomNav  from './components/BottomNav';
import { useClub, ClubProvider } from './context/ClubContext';
import { useAuth, AuthProvider } from './context/AuthContext';

function AppInner() {
  const { loading: clubLoading } = useClub();
  const { user, profile, isAdmin, loading: authLoading } = useAuth();

  const loading = clubLoading || authLoading;

  // 1. Pantalla de carga
  if (loading) {
    return (
      <div className="fixed inset-0 bg-navy-900 flex flex-col items-center justify-center gap-6">
        <motion.img 
          src="/logo.png" 
          animate={{ scale: [0.9, 1.1, 0.9] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-24 h-24 object-contain"
        />
        <p className="text-gold-500 font-bold animate-pulse uppercase tracking-widest text-xs">Cargando Legionarios...</p>
      </div>
    );
  }

  // 2. Si no hay usuario, Login
  if (!user) return <Login />;

  // 3. Si es Admin, mostrar el Dashboard de Gestión completo
  if (isAdmin) {
    return (
      <div className="flex min-h-screen bg-navy-950 text-white font-sans selection:bg-gold-500/30 pb-20 md:pb-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/players" element={<Players />} />
            <Route path="/add-player" element={<AddPlayer />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/events" element={<Events />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    );
  }

  // 4. Si no es admin (es jugador o perfil nuevo), Portal Jugador
  return <PlayerPortal />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ClubProvider>
          <AppInner />
        </ClubProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
