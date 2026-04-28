import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, UserCheck, Calendar, ChartBar, WarningCircle } from '@phosphor-icons/react';
import { useClub } from '../context/ClubContext';

const STATUS_BADGE = {
  Aprobado:  'bg-green-500/10 text-green-500',
  Rechazado: 'bg-red-500/10 text-red-500',
};

const Attendance = () => {
  const { attendanceRequests, approveAttendance, rejectAttendance, players, addPayment } = useClub();

  const pending = attendanceRequests.filter(r => r.status === 'Pendiente');
  const history = attendanceRequests.filter(r => r.status !== 'Pendiente');

  // --- Rendimiento Mensual ---
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  
  const playerPerformance = players.map(player => {
    const playerHistory = history.filter(r => 
      r.playerId === player.id && 
      r.status === 'Aprobado' && 
      r.date.startsWith(currentMonth)
    );
    const totalHours = playerHistory.reduce((sum, r) => sum + (r.hoursEarned || 0), 0);
    return { ...player, totalHours };
  }).sort((a, b) => b.totalHours - a.totalHours);

  const handleFine = async (player) => {
    if (confirm(`¿Aplicar multa por inasistencia a ${player.name}?`)) {
      await addPayment({
        playerId: player.id,
        name: player.name,
        amount: 20000,
        date: new Date().toISOString().split('T')[0],
        method: 'Multa Inasistencia'
      });
      alert('Multa aplicada. El jugador ahora tiene un pago pendiente.');
    }
  };

  const calculateCanchaHours = (timeString) => {
    if (!timeString) return 2;
    const [h, m] = timeString.split(':').map(Number);
    const arrival = h + (m || 0) / 60;
    if (arrival <= 19) return 2;
    if (arrival >= 21) return 0;
    return Number((21 - arrival).toFixed(1));
  };

  const getCalculatedHours = (req) => {
    if (req.type === 'gym') return req.hoursEarned || 0;
    return calculateCanchaHours(req.arrivalTime);
  };

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-10 pb-32">
      <header>
        <h2 className="text-3xl font-black tracking-tight">Control de Asistencia</h2>
        <p className="text-gray-400 mt-2">Gestiona las solicitudes de asistencia de los jugadores.</p>
      </header>

      {/* Pendientes */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 text-gold-500">
          <Clock size={24} weight="bold" />
          <h3 className="font-bold text-lg uppercase tracking-wider">
            Solicitudes Pendientes ({pending.length})
          </h3>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {pending.length > 0 ? (
              pending.map(req => (
                <motion.div
                  key={req.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bento-card flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-navy-700 rounded-2xl flex items-center justify-center font-bold text-navy-200">
                      {req.playerName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg flex items-center gap-2">
                        {req.playerName}
                        <span className={`text-[10px] uppercase px-2 py-0.5 rounded-md ${req.type === 'gym' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {req.type === 'gym' ? 'Gym' : 'Cancha'}
                        </span>
                      </h4>
                      <div className="text-sm text-gray-500 flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1"><Calendar size={14} /> {req.date}</span>
                        {req.type === 'cancha' && req.arrivalTime && (
                          <span className="flex items-center gap-1 text-gold-500">
                            <Clock size={14} /> {req.arrivalTime.slice(0, 5)}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-green-400 font-bold">
                          +{getCalculatedHours(req)}h
                        </span>
                      </div>
                      {req.type === 'gym' && req.evidenceUrl && (
                        <a href={req.evidenceUrl} target="_blank" rel="noreferrer"
                           className="text-xs text-blue-400 hover:underline mt-2 inline-block font-bold">
                           📷 Ver Evidencia
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => rejectAttendance(req.id)}
                      className="flex-1 md:flex-none px-6 py-3 bg-red-500/10 text-red-500 rounded-xl font-bold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle size={20} weight="bold" />
                      Rechazar
                    </button>
                    <button
                      onClick={() => approveAttendance(req.id, getCalculatedHours(req))}
                      className="flex-1 md:flex-none px-6 py-3 bg-green-500 text-navy-900 rounded-xl font-bold hover:bg-green-400 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={20} weight="bold" />
                      Aprobar
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                <UserCheck size={48} className="mx-auto text-gray-700 mb-4" />
                <p className="text-gray-500 font-medium">No hay solicitudes pendientes.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Historial */}
      {history.length > 0 && (
        <section className="space-y-6">
          <h3 className="font-bold text-lg text-gray-500 uppercase tracking-wider">Historial Reciente</h3>
          <div className="bento-card !p-0 overflow-hidden">
            <div className="divide-y divide-white/5">
              {history.map(req => (
                <div key={req.id} className="p-4 flex items-center justify-between bg-white/[0.01]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-navy-900 rounded-lg flex items-center justify-center text-[10px] font-bold">
                      {req.playerName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{req.playerName}</p>
                      <p className="text-[10px] text-gray-500">{req.eventTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-green-400 w-8">+{req.hoursEarned || 0}h</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${STATUS_BADGE[req.status] ?? 'bg-white/5 text-gray-400'}`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Rendimiento Mensual y Multas */}
      <section className="space-y-6 pt-8 border-t border-white/5">
        <div className="flex items-center gap-3 text-gold-500">
          <ChartBar size={24} weight="bold" />
          <h3 className="font-bold text-lg uppercase tracking-wider">Rendimiento Mensual y Multas</h3>
        </div>
        
        <div className="bento-card overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy-900/50 text-gray-400 text-xs uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Jugador</th>
                  <th className="px-6 py-4">Horas Mes</th>
                  <th className="px-6 py-4 w-1/3">Progreso (Meta: 24h)</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {playerPerformance.map(p => {
                  const percentage = Math.min((p.totalHours / 24) * 100, 100);
                  const isUnderperforming = p.totalHours < 12; // Alerta si va muy bajo
                  return (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-bold">{p.name}</td>
                      <td className="px-6 py-4 font-mono text-gold-500">{p.totalHours.toFixed(1)}h</td>
                      <td className="px-6 py-4">
                        <div className="h-2 w-full bg-navy-900 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${percentage >= 80 ? 'bg-green-500' : percentage >= 50 ? 'bg-gold-500' : 'bg-red-500'}`} 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleFine(p)}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ml-auto">
                          <WarningCircle size={14} weight="bold" /> Multar ($20k)
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Attendance;
