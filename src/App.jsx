import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import { useClub } from './context/ClubContext';
import { useAuth } from './context/AuthContext';

function AppInner() {
  const { loading: clubLoading } = useClub();
  const { user, profile, isAdmin, isPlayer, loading: authLoading } = useAuth();

  const loading = clubLoading || authLoading;

  if (!loading && !user) return <Login />;

  // Usuario logueado pero sin rol definido aún
  if (!loading && user && profile !== null && !isAdmin && !isPlayer) {
    return (
      <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center gap-6 p-8">
        <img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain" />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-gold-500">Cuenta Pendiente de Activación</h2>
          <p className="text-gray-400 max-w-sm">
            Tu cuenta fue creada correctamente. Contacta al entrenador para que active tu perfil de jugador.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="text-red-400 hover:text-red-300 text-sm font-bold underline"
        >
          Recargar página
        </button>
      </div>
    );
  }

  if (!loading && isPlayer) return <PlayerPortal />;

  return (
    <>
      {/* Pantalla de carga */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[100] bg-navy-900 flex flex-col items-center justify-center gap-6"
          >
            <motion.img
              src="/logo.png"
              alt="Legionarios RC"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.9, 1.05, 1], opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="w-28 h-28 object-contain drop-shadow-2xl"
            />
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <motion.div key={i}
                  className="w-2 h-2 rounded-full bg-gold-500"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                />
              ))}
            </div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Cargando datos...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-h-[100dvh] bg-navy-900 overflow-hidden pb-20 md:pb-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto relative">
          <Routes>
            <Route path="/"           element={<Dashboard  />} />
            <Route path="/players"    element={<Players    />} />
            <Route path="/payments"   element={<Payments   />} />
            <Route path="/add-player" element={<AddPlayer  />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/events"     element={<Events     />} />
            <Route path="/settings"   element={<Settings   />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppInner />
    </Router>
  );
}

export default App;
