import React from 'react';
import { motion } from 'framer-motion';
import { TrendUp, Clock, Plus, ArrowRight } from '@phosphor-icons/react';
import { useClub } from '../context/ClubContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { players, payments, events, getFinancialSummary } = useClub();
  const { total, pending, pendingAmount } = getFinancialSummary();

  // Próximo evento (el más cercano a hoy)
  const today = new Date().toISOString().split('T')[0];
  const upcomingEvents = [...events]
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const nextEvent = upcomingEvents[0] ?? events[0];

  const totalExpected = total + pendingAmount;
  const collectedPct  = totalExpected > 0 ? (total / totalExpected) * 100 : 100;
  const pendingPct    = totalExpected > 0 ? (pendingAmount / totalExpected) * 100 : 0;

  return (
    <div className="space-y-0">

      {/* ── Hero Banner con foto de partido ── */}
      <div className="relative h-56 md:h-72 overflow-hidden">
        <img
          src="/scrum.jpeg"
          alt="Legionarios RC en partido"
          className="w-full h-full object-cover object-center"
        />
        {/* Overlay degradado */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/95 via-navy-900/60 to-navy-900/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-transparent" />

        {/* Contenido sobre el hero */}
        <div className="absolute inset-0 flex items-center px-8 md:px-12">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full p-2 shadow-2xl flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-gold-500 text-[10px] font-black uppercase tracking-[4px] mb-1">Bienvenido</p>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none">
                Legionarios <span className="text-gold-500">R.C.</span>
              </h2>
              <p className="text-gray-300 mt-2 text-sm">Panel de gestión del club • Temporada 2026</p>
            </div>
          </div>
        </div>

        {/* Botón flotante */}
        <div className="absolute bottom-6 right-6 md:right-8">
          <Link to="/add-player" className="btn-primary shadow-xl shadow-gold-500/30 text-sm">
            <Plus weight="bold" />
            <span>Nuevo Registro</span>
          </Link>
        </div>
      </div>

      {/* ── Contenido ── */}
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Stats principales */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            className="md:col-span-2 bento-card relative overflow-hidden group min-h-[260px]">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <span className="bg-gold-500/10 text-gold-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Recaudación Total
                </span>
                <h3 className="text-5xl font-black mt-4 text-gradient">
                  ${total.toLocaleString('es-CO')}
                </h3>
                <p className="text-gray-400 mt-2 flex items-center gap-2">
                  <TrendUp className="text-green-400" />
                  <span className="text-green-400 font-bold">+12%</span> respecto al mes anterior
                </p>
              </div>
              <div className="flex gap-6 mt-8">
                <Stat label="Jugadores"  value={players.length.toString()} />
                <Stat label="Eventos"    value={events.length.toString()} />
                <Stat label="En Mora"    value={pending.toString()} />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-gold-500/10 transition-colors duration-700" />
          </motion.div>

          {/* Próximo Evento */}
          {nextEvent && (
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:0.1 }}
              className="bento-card bg-gold-500 text-navy-900 border-none flex flex-col justify-between group">
              <div className="space-y-4">
                <h3 className="text-2xl font-black leading-tight uppercase">Próximo {nextEvent.type}</h3>
                <div className="flex items-center gap-4 bg-navy-900/10 p-4 rounded-2xl">
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase opacity-60">
                      {new Date(nextEvent.date+'T12:00:00').toLocaleDateString('es-CO',{weekday:'short'})}
                    </p>
                    <p className="text-xl font-black">{new Date(nextEvent.date+'T12:00:00').getDate()}</p>
                  </div>
                  <div className="h-8 w-px bg-navy-900/10" />
                  <div>
                    <p className="font-bold text-sm">{nextEvent.title}</p>
                    <p className="text-xs opacity-70">{nextEvent.location} • {nextEvent.time}</p>
                  </div>
                </div>
              </div>
              <Link to="/events" className="flex items-center justify-between w-full mt-8 font-bold group">
                <span>Ver Detalles</span>
                <ArrowRight weight="bold" className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </motion.div>
          )}

          {/* Foto equipo + estado plantel */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.2 }}
            className="bento-card md:col-span-1 overflow-hidden !p-0">
            {/* Foto */}
            <div className="relative h-36 overflow-hidden group">
              <img src="/masculino.jpeg" alt="Plantel Legionarios"
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-800/90 to-transparent" />
              <p className="absolute bottom-3 left-4 text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Clock size={12} /> Estado del Plantel
              </p>
            </div>
            {/* Lista */}
            <div className="p-5 space-y-3">
              {players.slice(0,3).map(player => (
                <PlayerUpdate key={player.id} name={player.name} type={player.category} status={player.status} />
              ))}
              {players.length > 3 && (
                <Link to="/players" className="block text-center text-[10px] font-bold text-gold-500 hover:underline pt-1">
                  Ver los {players.length} jugadores →
                </Link>
              )}
            </div>
          </motion.div>

          {/* Control de Mensualidades */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.3 }}
            className="bento-card md:col-span-2 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-4">
              <h3 className="font-bold text-lg">Control de Mensualidades</h3>
              <p className="text-gray-400 text-sm">
                {pending > 0
                  ? <>Hay <span className="text-gold-500 font-bold">{pending} jugadores</span> con pagos pendientes (
                      <span className="text-gold-500 font-bold">${pendingAmount.toLocaleString('es-CO')}</span>
                      {' '}por cobrar).</>
                  : 'Todos los jugadores están al día. ✓'}
              </p>
              <div className="flex gap-2">
                <Link to="/payments" className="px-4 py-2 bg-white/5 rounded-xl text-xs font-bold hover:bg-white/10 transition-colors">
                  Ver Pagos
                </Link>
                <Link to="/players" className="px-4 py-2 bg-white/5 rounded-xl text-xs font-bold hover:bg-white/10 transition-colors">
                  Ver Plantel
                </Link>
              </div>
            </div>
            <div className="flex gap-4">
              <BarChart label="AL DÍA"   pct={collectedPct} color="#FDC010" />
              <BarChart label="MORA"      pct={pendingPct}   color="rgba(239,68,68,0.6)" />
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

/* ── Helpers ── */
const Stat = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">{label}</span>
    <span className="text-2xl font-black">{value}</span>
  </div>
);

const PlayerUpdate = ({ name, type, status }) => (
  <div className="flex items-center gap-3 p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
    <div className="w-8 h-8 bg-navy-700 rounded-lg flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
      {name.split(' ').map(n => n[0]).join('')}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-bold text-sm truncate">{name}</p>
      <p className="text-[10px] text-gray-500 font-medium uppercase">{type}</p>
    </div>
    <span className={`text-[9px] font-black uppercase shrink-0 ${
      status === 'Activo' ? 'text-green-500' : status === 'Lesionado' ? 'text-red-400' : 'text-gold-500'
    }`}>{status}</span>
  </div>
);

const BarChart = ({ label, pct, color }) => (
  <div className="flex flex-col items-center">
    <div className="w-16 h-24 bg-white/5 rounded-t-xl relative overflow-hidden flex flex-col justify-end">
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: `${Math.max(pct, 2)}%` }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        style={{ background: color }}
        className="w-full"
      />
    </div>
    <span className="text-[10px] mt-2 text-gray-500 font-bold tracking-tighter">{label}</span>
    <span className="text-[10px] font-bold" style={{ color }}>{Math.round(pct)}%</span>
  </div>
);

export default Dashboard;
