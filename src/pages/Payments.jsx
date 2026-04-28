import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Receipt, ChartLineUp, ArrowUpRight, ArrowDownRight, X } from '@phosphor-icons/react';
import { useClub } from '../context/ClubContext';

const METHODS = ['Efectivo', 'Transferencia', 'Nequi', 'Daviplata', 'Tarjeta'];

const Payments = () => {
  const { payments, players, getFinancialSummary, addPayment } = useClub();
  const { total, pending, pendingAmount } = getFinancialSummary();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">Finanzas y Pagos</h2>
          <p className="text-gray-400 mt-1">Control de mensualidades y recaudación del club.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Receipt weight="bold" />
          <span>Registrar Pago</span>
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<Wallet size={24} />}
          label="Recaudado Total"
          value={`$${total.toLocaleString('es-CO')}`}
          trend="+8%"
          color="gold"
        />
        <StatCard
          icon={<Receipt size={24} />}
          label="Jugadores en Mora"
          value={pending.toString()}
          trend={pending > 0 ? 'Requiere atención' : 'Al día'}
          color={pending > 0 ? 'red' : 'green'}
        />
        <StatCard
          icon={<ChartLineUp size={24} />}
          label="Por Cobrar (Mora)"
          value={`$${pendingAmount.toLocaleString('es-CO')}`}
          trend={pending > 0 ? `${pending} jugadores` : 'Sin pendientes'}
          color={pending > 0 ? 'red' : 'green'}
        />
      </div>

      {/* Historial */}
      <div className="bento-card">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-bold text-lg">Historial de Transacciones</h3>
          <span className="text-xs text-gray-500 font-bold">{payments.length} registros</span>
        </div>
        <div className="space-y-4">
          {payments.length > 0 ? payments.map(payment => (
            <PaymentItem
              key={payment.id}
              name={payment.name}
              date={new Date(payment.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
              amount={`$${payment.amount.toLocaleString('es-CO')}`}
              method={payment.method}
              status={payment.status}
            />
          )) : (
            <p className="text-center text-gray-600 py-8">No hay pagos registrados aún.</p>
          )}
        </div>
      </div>

      {/* Modal Registrar Pago */}
      <AnimatePresence>
        {isModalOpen && (
          <RegisterPaymentModal
            players={players}
            onClose={() => setIsModalOpen(false)}
            onSave={(payment) => {
              addPayment(payment);
              setIsModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Modal de registro de pago ── */
const RegisterPaymentModal = ({ players, onClose, onSave }) => {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    playerId: players[0]?.id ?? '',
    amount:   players[0]?.monthlyFee ?? 0,
    date:     today,
    method:   'Efectivo',
  });

  const selectedPlayer = players.find(p => p.id === Number(form.playerId));

  const handlePlayerChange = (e) => {
    const player = players.find(p => p.id === Number(e.target.value));
    setForm({ ...form, playerId: Number(e.target.value), amount: player?.monthlyFee ?? 0 });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, playerId: Number(form.playerId), name: selectedPlayer?.name ?? '' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bento-card max-w-md w-full relative"
      >
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors">
          <X size={22} />
        </button>
        <h3 className="text-xl font-bold mb-6">Registrar Pago</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Jugador */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Jugador</label>
            <select
              value={form.playerId}
              onChange={handlePlayerChange}
              className="input-base"
            >
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.name} — {p.category}</option>
              ))}
            </select>
          </div>

          {/* Monto */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Monto ($) <span className="text-gray-600 normal-case font-normal">— cuota: ${selectedPlayer?.monthlyFee?.toLocaleString('es-CO')}</span>
            </label>
            <input
              type="number"
              required
              value={form.amount}
              onChange={e => setForm({ ...form, amount: parseInt(e.target.value) })}
              className="input-base font-mono"
            />
          </div>

          {/* Fecha y Método en grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Fecha</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="input-base"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Método</label>
              <select
                value={form.method}
                onChange={e => setForm({ ...form, method: e.target.value })}
                className="input-base"
              >
                {METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full justify-center mt-2">
            <Receipt weight="bold" />
            Confirmar Pago
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

/* ── Subcomponentes ── */
const StatCard = ({ icon, label, value, trend, color }) => (
  <div className="bento-card group hover:scale-[1.02] transition-transform cursor-default">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
      color === 'gold'  ? 'bg-gold-500/10 text-gold-500 shadow-[0_0_20px_rgba(253,192,16,0.1)]' :
      color === 'red'   ? 'bg-red-500/10 text-red-400' :
                          'bg-green-500/10 text-green-400'
    }`}>
      {icon}
    </div>
    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{label}</p>
    <div className="flex items-baseline gap-3 mt-1">
      <span className="text-3xl font-black tracking-tight">{value}</span>
      <span className={`text-[10px] font-black uppercase flex items-center gap-1 ${
        color === 'red' ? 'text-red-400' : 'text-green-400'
      }`}>
        {color === 'red' ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
        {trend}
      </span>
    </div>
  </div>
);

const PaymentItem = ({ name, date, amount, method, status }) => (
  <div className="flex items-center justify-between p-5 bg-white/[0.02] rounded-3xl border border-white/5 group hover:bg-white/[0.04] transition-all hover:translate-x-1">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-navy-800 rounded-2xl flex items-center justify-center font-bold text-xs shadow-inner uppercase">
        {name.split(' ').map(n => n[0]).join('')}
      </div>
      <div>
        <p className="font-bold text-base">{name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{date}</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span className="text-[10px] text-gold-500 font-bold uppercase tracking-wider">{method}</span>
        </div>
      </div>
    </div>
    <div className="text-right">
      <p className="font-black text-lg tracking-tight">{amount}</p>
      <div className="flex items-center justify-end gap-1.5 mt-0.5">
        <div className={`w-1.5 h-1.5 rounded-full ${status === 'Completado' ? 'bg-green-500' : 'bg-gold-500 animate-pulse'}`} />
        <p className={`text-[10px] font-bold uppercase tracking-wider ${status === 'Completado' ? 'text-green-500' : 'text-gold-500'}`}>
          {status}
        </p>
      </div>
    </div>
  </div>
);

export default Payments;
