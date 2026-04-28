import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnvelopeSimple, Lock, Eye, EyeSlash, Warning, User, CheckCircle } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { signIn, signUp } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isLogin) {
      const err = await signIn(email, password);
      if (err) {
        if (err.message === 'Email not confirmed') {
          setError('Debes confirmar tu correo electrónico. Revisa tu bandeja de entrada (y spam).');
        } else {
          setError('Correo o contraseña incorrectos. Verifica tus credenciales.');
        }
      }
    } else {
      const err = await signUp(email, password, fullName);
      if (err) {
        console.error("SignUp Error:", err);
        setError(err.message || 'Hubo un error al registrarse.');
      } else {
        setSuccess('¡Registro exitoso! Por favor, revisa tu correo electrónico para confirmar tu cuenta antes de entrar.');
        // Removemos el setTimeout que intentaba hacer login porque si Supabase requiere confirmación fallará
      }
    }
    setLoading(false);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setFullName('');
    setPassword('');
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
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 180 }}
            className="w-28 h-28 bg-white rounded-full p-3 shadow-2xl flex items-center justify-center mb-5 relative"
          >
            <div className="absolute inset-0 bg-white/20 blur-xl rounded-full animate-pulse" />
            <img src="/logo.png" alt="Legionarios RC" className="w-full h-full object-contain relative z-10" />
          </motion.div>
          <h1 className="text-3xl font-black tracking-tight text-center">LEGIONARIOS <span className="text-gold-500">R.C.</span></h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Panel de Gestión del Club</p>
        </div>

        {/* Card */}
        <div className="bento-card space-y-5">
          <div className="flex bg-navy-900/50 p-1 rounded-xl">
            <button
              onClick={() => !isLogin && toggleMode()}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${isLogin ? 'bg-gold-500 text-navy-900' : 'text-gray-400 hover:text-white'}`}
            >
              Entrar
            </button>
            <button
              onClick={() => isLogin && toggleMode()}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${!isLogin ? 'bg-gold-500 text-navy-900' : 'text-gray-400 hover:text-white'}`}
            >
              Registrarse
            </button>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div key="error" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 overflow-hidden">
                <Warning size={20} className="text-red-400 shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div key="success" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl p-4 overflow-hidden">
                <CheckCircle size={20} className="text-green-400 shrink-0" />
                <p className="text-green-400 text-sm">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Nombre (Solo Registro) */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 pt-2 block">Nombre Completo</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text" required={!isLogin}
                      value={fullName} onChange={e => setFullName(e.target.value)}
                      placeholder="Ej. Mateo Salazar"
                      className="input-base pl-11"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                  type={showPwd ? 'text' : 'password'} required autoComplete={isLogin ? "current-password" : "new-password"}
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
                  {isLogin ? 'Verificando...' : 'Registrando...'}
                </span>
              ) : (isLogin ? 'Entrar' : 'Crear cuenta')}
            </motion.button>
          </form>

          {isLogin && (
            <p className="text-center text-[11px] text-gray-600">
              ¿Olvidaste tu contraseña? Contacta al administrador del club.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
