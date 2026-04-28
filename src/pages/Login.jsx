import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EnvelopeSimple, Lock, Eye, EyeSlash, Warning } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { signIn } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const err = await signIn(email, password);
    if (err) setError('Correo o contraseña incorrectos. Verifica tus credenciales.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Fondo decorativo */}
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-80 h-80 bg-gold-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo + nombre */}
        <div className="flex flex-col items-center mb-10">
          <motion.img
            src="/logo.png"
            alt="Legionarios RC"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 180 }}
            className="w-28 h-28 object-contain drop-shadow-2xl mb-5"
          />
          <h1 className="text-3xl font-black tracking-tight text-center">LEGIONARIOS <span className="text-gold-500">R.C.</span></h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Panel de Gestión del Club</p>
        </div>

        {/* Card */}
        <div className="bento-card space-y-5">
          <h2 className="text-xl font-bold">Iniciar Sesión</h2>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <Warning size={20} className="text-red-400 shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Correo</label>
              <div className="relative">
                <EnvelopeSimple size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email" required autoComplete="email"
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="input-base pl-11"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Contraseña</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPwd ? 'text' : 'password'} required autoComplete="current-password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-base pl-11 pr-11"
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                  {showPwd ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit" disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full justify-center py-4 text-base mt-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" />
                  Verificando...
                </span>
              ) : 'Entrar'}
            </motion.button>
          </form>

          <p className="text-center text-[11px] text-gray-600">
            ¿Olvidaste tu contraseña? Contacta al administrador del club.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
