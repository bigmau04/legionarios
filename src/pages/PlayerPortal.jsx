import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CalendarCheck, CurrencyDollar, UserCircle,
  CheckCircle, Clock, XCircle, ArrowRight, SignOut,
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { useClub } from '../context/ClubContext';

const PlayerPortal = () => {
  const { profile, signOut } = useAuth();
  const { events, attendanceRequests, payments, requestAttendance } = useClub();

  const player        = profile?.players;
  const today         = new Date().toISOString().split('T')[0];
  const myPayments    = payments.filter(p => p.playerId === player?.id).slice(0, 5);
  const myAttendance  = attendanceRequests.filter(r => r.playerId === player?.id);
  const upcomingEvents = [...events]
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  const getAttendanceStatus = (eventId) =>
    myAttendance.find(r => r.eventId === eventId)?.status ?? null;

  const handleRequest = async (event) => {
    if (!player) return;
    await requestAttendance({
      playerId:   player.id,
      playerName: player.name,
      eventId:    event.id,
      eventTitle: event.title,
      date:       event.date,
    });
  };

  const STATUS_COLORS = {
    'Activo':         'text-green-400',
    'Lesionado':      'text-red-400',
    'Pendiente Pago': 'text-gold-500',
  };

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Header del portal */}
      <header className="sticky top-0 z-50 bg-navy-800/90 backdrop-blur-sm border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full p-1 shadow-lg shadow-white/10 flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-[10px] text-gold-500 font-black uppercase tracking-widest">Portal Jugador</p>
            <p className="font-bold text-sm leading-tight">{player?.name ?? profile?.full_name}</p>
          </div>
        </div>
        <button onClick={signOut}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-3 py-1.5 rounded-xl text-sm font-bold transition-colors">
          <SignOut size={18} /> Salir
        </button>
      </header>

      <div className="max-w-2xl mx-auto p-6 space-y-6">

        {/* Alerta de Mora */}
        {player?.status === 'Pendiente Pago' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gold-500/10 border border-gold-500/30 p-4 rounded-2xl flex items-start gap-4">
            <div className="bg-gold-500 text-navy-900 p-2 rounded-xl shrink-0">
              <CurrencyDollar size={24} weight="bold" />
            </div>
            <div>
              <h3 className="text-gold-500 font-black">Tienes un pago pendiente</h3>
              <p className="text-sm text-gold-500/80 mt-1">
                Tu mensualidad actual está en mora. Por favor, regulariza tu pago con el tesorero del club.
              </p>
            </div>
          </motion.div>
        )}

        {/* Tarjeta de perfil */}
        {player && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
            className="bento-card flex items-center gap-5">
            <div className="w-16 h-16 bg-gold-500/10 rounded-2xl flex items-center justify-center text-2xl font-black text-gold-500 shrink-0">
              {player.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-black">{player.name}</h2>
              <p className="text-gray-400 text-sm">{player.category}</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-black ${STATUS_COLORS[player.status] ?? 'text-white'}`}>
                {player.status}
              </p>
              <p className="text-[10px] text-gray-600 mt-1 font-mono">
                Cuota: ${player.monthlyFee?.toLocaleString('es-CO')}
              </p>
            </div>
          </motion.div>
        )}

        {/* Próximos eventos — confirmar asistencia */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="bento-card space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <CalendarCheck size={20} className="text-gold-500" />
            <h3 className="font-bold text-lg">Próximos Eventos</h3>
          </div>

          {upcomingEvents.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No hay eventos próximos.</p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map(event => {
                const status = getAttendanceStatus(event.id);
                return (
                  <div key={event.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                    <div className="text-center min-w-[50px] bg-navy-900/40 py-2 rounded-xl border border-white/5">
                      <p className="text-[10px] text-gold-500 uppercase font-black tracking-widest">
                        {new Date(event.date+'T12:00:00').toLocaleDateString('es-CO',{month:'short'})}
                      </p>
                      <p className="text-2xl font-black leading-none mt-1">
                        {new Date(event.date+'T12:00:00').getDate()}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                          event.type === 'Partido' ? 'bg-red-500/20 text-red-400' : 
                          event.type === 'Entreno' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {event.type}
                        </span>
                        <span className="text-[11px] text-gray-400 font-bold flex items-center gap-1">
                          <Clock size={12} /> {event.time}
                        </span>
                      </div>
                      <p className="font-bold text-base truncate leading-tight">{event.title}</p>
                      <p className="text-xs text-gray-400 mt-1 truncate">{event.location}</p>
                    </div>
                    {/* Estado / botón */}
                    <div className="shrink-0 flex flex-col items-end justify-center">
                      {status === 'Aprobado' && (
                        <div className="bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-xl text-center">
                          <span className="flex items-center gap-1 text-green-400 text-xs font-black">
                            <CheckCircle size={16} weight="fill" /> Aprobado
                          </span>
                        </div>
                      )}
                      {status === 'Pendiente' && (
                        <div className="bg-gold-500/10 border border-gold-500/20 px-3 py-2 rounded-xl text-center">
                          <span className="flex items-center gap-1 text-gold-500 text-xs font-black">
                            <Clock size={16} weight="fill" /> Pendiente
                          </span>
                        </div>
                      )}
                      {status === 'Rechazado' && (
                        <div className="bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl text-center">
                          <span className="flex items-center gap-1 text-red-400 text-xs font-black">
                            <XCircle size={16} weight="fill" /> Rechazado
                          </span>
                        </div>
                      )}
                      {!status && (
                        <button onClick={() => handleRequest(event)}
                          className="px-4 py-2 bg-gold-500 text-navy-900 text-xs font-black rounded-xl hover:bg-gold-400 transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-gold-500/20 flex items-center gap-1">
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

        {/* Mis pagos */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
          className="bento-card space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <CurrencyDollar size={20} className="text-gold-500" />
            <h3 className="font-bold text-lg">Mis Pagos</h3>
          </div>
          {myPayments.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No hay pagos registrados aún.</p>
          ) : (
            <div className="space-y-2">
              {myPayments.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div>
                    <p className="text-sm font-bold">{p.method}</p>
                    <p className="text-[11px] text-gray-500">{new Date(p.date+'T12:00:00').toLocaleDateString('es-CO')}</p>
                  </div>
                  <span className="font-mono text-green-400 font-bold text-sm">
                    +${p.amount?.toLocaleString('es-CO')}
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
