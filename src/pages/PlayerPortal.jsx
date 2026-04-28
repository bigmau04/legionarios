import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarCheck, CurrencyDollar, CheckCircle, Clock,
  XCircle, SignOut, UploadSimple, Barbell, UserCircle, Warning
} from '@phosphor-icons/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useClub } from '../context/ClubContext';

const PlayerPortal = () => {
  const { profile, signOut } = useAuth();
  const { events, attendanceRequests, payments, requestAttendance } = useClub();

  const [gymHours, setGymHours]         = useState(1);
  const [gymFile, setGymFile]           = useState(null);
  const [isUploadingGym, setUploading]  = useState(false);
  const [gymError, setGymError]         = useState('');
  const [gymSuccess, setGymSuccess]     = useState('');

  // El jugador puede venir del trigger (profile.players) o del perfil directamente
  const player = profile?.players;
  // ID para filtrar: usamos el player_id del perfil o el id del jugador
  const playerId   = player?.id ?? profile?.player_id;
  const playerName = player?.name ?? profile?.full_name ?? profile?.email ?? 'Jugador';

  const today = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  })();

  const myPayments   = payments.filter(p => p.playerId === playerId).slice(0, 10);
  const myAttendance = attendanceRequests.filter(r => r.playerId === playerId);

  const upcomingEvents = [...events]
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 20);

  const getAttendanceForDate = (date) =>
    myAttendance.find(r => r.date === date && r.type === 'cancha')?.status ?? null;

  const handleRequest = async (event) => {
    if (!playerId) return;
    const now = new Date();
    const hh  = String(now.getHours()).padStart(2, '0');
    const mm  = String(now.getMinutes()).padStart(2, '0');
    const ss  = String(now.getSeconds()).padStart(2, '0');
    await requestAttendance({
      playerId,
      playerName,
      eventId:    event.id,
      eventTitle: event.title,
      date:       event.date,
      type:       'cancha',
      arrivalTime: `${hh}:${mm}:${ss}`,
      hoursEarned: 0,
    });
  };

  const handleGymSubmit = async (e) => {
    e.preventDefault();
    if (!playerId || !gymFile) return;
    setUploading(true);
    setGymError('');
    setGymSuccess('');
    try {
      const fileExt  = gymFile.name.split('.').pop();
      const fileName = `${playerId}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('gym_evidence')
        .upload(fileName, gymFile);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage
        .from('gym_evidence')
        .getPublicUrl(fileName);
      await requestAttendance({
        playerId,
        playerName,
        eventId:    null,
        eventTitle: 'Entrenamiento Externo (Gym)',
        date:       today,
        type:       'gym',
        arrivalTime: null,
        hoursEarned: gymHours,
        evidenceUrl: publicUrl,
      });
      setGymSuccess('¡Entrenamiento de Gym registrado con éxito!');
      setGymFile(null);
      setGymHours(1);
    } catch (err) {
      console.error(err);
      setGymError('Error al subir. Intenta de nuevo o verifica la conexión.');
    } finally {
      setUploading(false);
    }
  };

  const initials = playerName.split(' ').map(n => (n[0] ?? '').toUpperCase()).join('').slice(0, 2);

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-navy-800/90 backdrop-blur-md border-b border-white/5 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full p-1 shadow-lg shadow-white/10 flex items-center justify-center shrink-0">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-[10px] text-gold-500 font-black uppercase tracking-widest">Portal Jugador</p>
            <p className="font-bold text-sm leading-tight">{playerName}</p>
          </div>
        </div>
        <button onClick={signOut}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-3 py-1.5 rounded-xl text-sm font-bold transition-colors">
          <SignOut size={18} /> Salir
        </button>
      </header>

      <div className="max-w-2xl mx-auto p-5 space-y-5">

        {/* Alerta si no tiene datos de jugador vinculado */}
        {!player && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gold-500/10 border border-gold-500/30 p-4 rounded-2xl flex items-start gap-3">
            <Warning size={22} className="text-gold-500 shrink-0 mt-0.5" weight="bold" />
            <div>
              <p className="text-gold-400 font-black text-sm">Perfil incompleto</p>
              <p className="text-gold-400/80 text-xs mt-1">
                Tu cuenta aún no tiene un perfil de jugador completo. Comunícate con el entrenador para que active tu cuenta o inscríbete manualmente.
              </p>
            </div>
          </motion.div>
        )}

        {/* Alerta de mora */}
        {player?.status === 'Pendiente Pago' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-start gap-3">
            <CurrencyDollar size={22} className="text-red-400 shrink-0 mt-0.5" weight="bold" />
            <div>
              <p className="text-red-400 font-black text-sm">Tienes un pago pendiente</p>
              <p className="text-red-400/70 text-xs mt-1">Regulariza tu cuota con el tesorero del club.</p>
            </div>
          </motion.div>
        )}

        {/* Tarjeta perfil */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bento-card flex items-center gap-4">
          <div className="w-16 h-16 bg-gold-500/10 rounded-2xl flex items-center justify-center text-2xl font-black text-gold-500 shrink-0">
            {initials || <UserCircle size={32} />}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black truncate">{playerName}</h2>
            <p className="text-gray-400 text-sm">{player?.category ?? 'Jugador'}</p>
          </div>
          {player && (
            <div className="text-right shrink-0">
              <p className={`text-sm font-black ${
                player.status === 'Activo' ? 'text-green-400' :
                player.status === 'Lesionado' ? 'text-red-400' : 'text-gold-500'
              }`}>{player.status}</p>
              {player.monthlyFee && (
                <p className="text-[10px] text-gray-500 mt-1 font-mono">
                  Cuota: ${player.monthlyFee.toLocaleString('es-CO')}
                </p>
              )}
            </div>
          )}
        </motion.div>

        {/* Próximos Eventos */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bento-card space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/5">
            <CalendarCheck size={20} className="text-gold-500" />
            <h3 className="font-bold text-lg">Próximos Entrenamientos</h3>
          </div>

          {upcomingEvents.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">No hay eventos próximos.</p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {upcomingEvents.map(event => {
                const status = getAttendanceForDate(event.date);
                const d = new Date(event.date + 'T12:00:00');
                return (
                  <div key={event.id}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl hover:bg-white/8 transition-colors">
                    {/* Fecha */}
                    <div className="text-center min-w-[44px] bg-navy-900/60 py-2 rounded-xl border border-white/5 shrink-0">
                      <p className="text-[9px] text-gold-500 uppercase font-black tracking-widest">
                        {d.toLocaleDateString('es-CO', { month: 'short' })}
                      </p>
                      <p className="text-xl font-black leading-tight">{d.getDate()}</p>
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                          event.type === 'Partido' ? 'bg-red-500/20 text-red-400' :
                          event.type === 'Entreno' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>{event.type}</span>
                        {event.time && (
                          <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                            <Clock size={11} /> {event.time}
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-sm truncate">{event.title}</p>
                      {event.location && (
                        <p className="text-[11px] text-gray-500 truncate">{event.location}</p>
                      )}
                    </div>
                    {/* Estado / botón */}
                    <div className="shrink-0">
                      {status === 'Aprobado' && (
                        <span className="flex items-center gap-1 text-green-400 text-[11px] font-black bg-green-500/10 px-2 py-1.5 rounded-xl">
                          <CheckCircle size={14} weight="fill" /> OK
                        </span>
                      )}
                      {status === 'Pendiente' && (
                        <span className="flex items-center gap-1 text-gold-500 text-[11px] font-black bg-gold-500/10 px-2 py-1.5 rounded-xl">
                          <Clock size={14} weight="fill" /> Pendiente
                        </span>
                      )}
                      {status === 'Rechazado' && (
                        <span className="flex items-center gap-1 text-red-400 text-[11px] font-black bg-red-500/10 px-2 py-1.5 rounded-xl">
                          <XCircle size={14} weight="fill" /> Rechazado
                        </span>
                      )}
                      {!status && (
                        <button onClick={() => handleRequest(event)} disabled={!playerId}
                          className="px-3 py-2 bg-gold-500 text-navy-900 text-[11px] font-black rounded-xl hover:bg-gold-400 disabled:opacity-40 transition-all hover:scale-105 active:scale-95 shadow-md shadow-gold-500/20">
                          ✅ Confirmar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Gym */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bento-card space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/5">
            <Barbell size={20} className="text-gold-500" />
            <h3 className="font-bold text-lg">Entrenamiento Extra (Gym)</h3>
          </div>

          <form onSubmit={handleGymSubmit} className="space-y-4">
            <AnimatePresence>
              {gymError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-red-400 text-xs font-bold bg-red-500/10 p-3 rounded-xl">{gymError}</motion.p>
              )}
              {gymSuccess && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-green-400 text-xs font-bold bg-green-500/10 p-3 rounded-xl">{gymSuccess}</motion.p>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Horas entrenadas</label>
                <input type="number" min="0.5" max="4" step="0.5" required
                  value={gymHours} onChange={e => setGymHours(parseFloat(e.target.value))}
                  className="input-base !py-2.5 !px-3 text-sm w-full" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Foto evidencia</label>
                <label className="input-base !py-2.5 !px-3 text-sm flex items-center gap-2 cursor-pointer hover:bg-white/5 transition-colors w-full">
                  <UploadSimple size={15} className="shrink-0 text-gold-500" />
                  <span className="truncate text-xs text-gray-400">{gymFile ? gymFile.name : 'Subir foto...'}</span>
                  <input type="file" accept="image/*" className="hidden" required
                    onChange={e => setGymFile(e.target.files[0])} />
                </label>
              </div>
            </div>

            <button type="submit" disabled={!gymFile || isUploadingGym || !playerId}
              className="w-full bg-gold-500 text-navy-900 py-3 rounded-xl font-black disabled:opacity-40 flex items-center justify-center gap-2 transition-transform hover:scale-[0.99] active:scale-[0.97] shadow-lg shadow-gold-500/20">
              <Barbell size={18} weight="bold" />
              {isUploadingGym ? 'Subiendo...' : `Registrar ${gymHours}h de Gym`}
            </button>
          </form>
        </motion.div>

        {/* Mis Pagos */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bento-card space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/5">
            <CurrencyDollar size={20} className="text-gold-500" />
            <h3 className="font-bold text-lg">Mis Pagos y Multas</h3>
          </div>
          {myPayments.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No hay pagos registrados aún.</p>
          ) : (
            <div className="space-y-2">
              {myPayments.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div>
                    <p className="text-sm font-bold">{p.method}</p>
                    <p className="text-[11px] text-gray-500">
                      {new Date(p.date + 'T12:00:00').toLocaleDateString('es-CO')}
                    </p>
                  </div>
                  <span className={`font-mono font-bold text-sm ${
                    p.method?.toLowerCase().includes('multa') ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {p.method?.toLowerCase().includes('multa') ? '-' : '+'}${p.amount?.toLocaleString('es-CO')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
};

export default PlayerPortal;
