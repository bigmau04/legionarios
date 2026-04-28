import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, UserCheck, Calendar } from '@phosphor-icons/react';
import { useClub } from '../context/ClubContext';

const STATUS_BADGE = {
  Aprobado:  'bg-green-500/10 text-green-500',
  Rechazado: 'bg-red-500/10 text-red-500',
};

const Attendance = () => {
  const { attendanceRequests, approveAttendance, rejectAttendance } = useClub();

  const pending = attendanceRequests.filter(r => r.status === 'Pendiente');
  const history = attendanceRequests.filter(r => r.status !== 'Pendiente');

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
                      <h4 className="font-bold text-lg">{req.playerName}</h4>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar size={14} /> {req.eventTitle} • {req.date}
                      </p>
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
                      onClick={() => approveAttendance(req.id)}
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
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${STATUS_BADGE[req.status] ?? 'bg-white/5 text-gray-400'}`}>
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Attendance;
