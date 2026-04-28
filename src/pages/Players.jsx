import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, MagnifyingGlass, Funnel, X, PencilSimple, Trash, FloppyDisk, CaretDown } from '@phosphor-icons/react';
import { useClub } from '../context/ClubContext';

const STATUS_STYLES = {
  'Activo':         'bg-green-500/10 text-green-500',
  'Lesionado':      'bg-red-500/10 text-red-500',
  'Pendiente Pago': 'bg-gold-500/10 text-gold-500',
};

const Players = () => {
  const { players, updatePlayer, deletePlayer, config } = useClub();
  const categories = config?.categories ?? ['M16', 'M18', 'Primera', 'Veteranos'];
  const statuses   = ['Activo', 'Lesionado', 'Pendiente Pago'];

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterCat,  setFilterCat]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editPlayer, setEditPlayer]  = useState(null);
  const [deleteId,   setDeleteId]    = useState(null);
  const [editForm,   setEditForm]    = useState({});

  const filtered = players.filter(p => {
    const matchSearch = !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat    = !filterCat    || p.category === filterCat;
    const matchStatus = !filterStatus || p.status   === filterStatus;
    return matchSearch && matchCat && matchStatus;
  });

  const activeFilters = [filterCat, filterStatus].filter(Boolean).length;
  const clearFilters  = () => { setFilterCat(''); setFilterStatus(''); };

  const openEdit = (player) => { setEditPlayer(player); setEditForm({ ...player }); };
  const handleEditSave = () => { updatePlayer(editForm); setEditPlayer(null); };
  const handleDelete   = () => { deletePlayer(deleteId); setDeleteId(null); };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">

      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">Plantel Legionario</h2>
          <p className="text-gray-400 mt-1">Gestión de jugadores y categorías.</p>
        </div>
        <Link to="/add-player" className="btn-primary">
          <UserPlus weight="bold" /> Inscribir Jugador
        </Link>
      </header>

      {/* ── Buscador + Filtros ── */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input type="text" placeholder="Buscar por nombre o categoría..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-navy-800 border border-white/5 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 ring-gold-500 outline-none transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`relative flex items-center gap-2 px-4 rounded-2xl border transition-all font-bold text-sm ${
              showFilters || activeFilters > 0
                ? 'bg-gold-500/10 border-gold-500/30 text-gold-500'
                : 'bg-navy-800 border-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <Funnel size={20} />
            <span className="hidden sm:inline">Filtros</span>
            {activeFilters > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gold-500 text-navy-900 rounded-full text-[10px] font-black flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {/* Panel de filtros desplegable */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-navy-800/50 border border-white/5 rounded-2xl p-4 flex flex-wrap gap-3 items-center">
                <div className="relative">
                  <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                    className="appearance-none bg-navy-900 border border-white/10 rounded-xl pl-3 pr-8 py-2 text-sm font-medium outline-none focus:ring-2 ring-gold-500 transition-all cursor-pointer">
                    <option value="">Todas las categorías</option>
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <CaretDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                    className="appearance-none bg-navy-900 border border-white/10 rounded-xl pl-3 pr-8 py-2 text-sm font-medium outline-none focus:ring-2 ring-gold-500 transition-all cursor-pointer">
                    <option value="">Todos los estados</option>
                    {statuses.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <CaretDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {activeFilters > 0 && (
                  <button onClick={clearFilters}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors font-bold ml-auto">
                    <X size={14} /> Limpiar filtros
                  </button>
                )}

                <span className="text-xs text-gray-600 ml-auto">
                  {filtered.length} de {players.length} jugadores
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Tabla ── */}
      <div className="bento-card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[620px]">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Jugador</th>
                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Categoría</th>
                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Estado</th>
                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Cuota</th>
                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {filtered.map(player => (
                  <motion.tr key={player.id} layout
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="hover:bg-white/[0.01] transition-colors group"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-navy-700 rounded-xl flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-transform uppercase">
                          {player.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold">{player.name}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider">{player.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-gray-400 font-medium text-sm">{player.category}</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[player.status] ?? 'bg-white/5 text-white'}`}>
                        {player.status}
                      </span>
                    </td>
                    <td className="p-6 font-mono text-sm text-gray-300">${player.monthlyFee?.toLocaleString('es-CO')}</td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(player)}
                          className="p-2 text-gray-500 hover:text-gold-500 hover:bg-gold-500/10 rounded-xl transition-all" title="Editar">
                          <PencilSimple size={18} weight="bold" />
                        </button>
                        <button onClick={() => setDeleteId(player.id)}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all" title="Eliminar">
                          <Trash size={18} weight="bold" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="p-12 text-center text-gray-500">
                  {activeFilters > 0 || searchTerm
                    ? <span>Sin resultados — <button onClick={() => { setSearchTerm(''); clearFilters(); }} className="text-gold-500 font-bold hover:underline">limpiar búsqueda</button></span>
                    : 'No hay jugadores registrados.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Edición ── */}
      <AnimatePresence>
        {editPlayer && (
          <Modal title="Editar Jugador" onClose={() => setEditPlayer(null)}>
            <div className="space-y-4">
              <Field label="Nombre Completo">
                <input type="text" value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="input-base" />
              </Field>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <Field label="Categoría">
                  <select value={editForm.category}
                    onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                    className="input-base">
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Estado">
                  <select value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                    className="input-base">
                    {statuses.map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Teléfono">
                <input type="tel" value={editForm.phone}
                  onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  className="input-base" />
              </Field>
              <Field label="Cuota Mensual ($)">
                <input type="number" value={editForm.monthlyFee}
                  onChange={e => setEditForm({ ...editForm, monthlyFee: parseInt(e.target.value) })}
                  className="input-base font-mono" />
              </Field>
              <button onClick={handleEditSave} className="btn-primary w-full justify-center mt-2">
                <FloppyDisk weight="bold" /> Guardar Cambios
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Modal Eliminar ── */}
      <AnimatePresence>
        {deleteId && (
          <Modal title="Confirmar Eliminación" onClose={() => setDeleteId(null)}>
            <p className="text-gray-400 mb-6">
              ¿Eliminar a <span className="font-bold text-white">{players.find(p => p.id === deleteId)?.name}</span> del plantel? Esta acción no se puede deshacer.
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <button onClick={() => setDeleteId(null)}
                className="py-3 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 font-bold transition-colors">
                Cancelar
              </button>
              <button onClick={handleDelete}
                className="py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-400 transition-colors">
                Eliminar
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Helpers ── */
const Modal = ({ title, children, onClose }) => (
  <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm"
    onClick={e => e.target===e.currentTarget && onClose()}>
    <motion.div initial={{ scale:0.95, opacity:0, y:10 }} animate={{ scale:1, opacity:1, y:0 }} exit={{ scale:0.95, opacity:0 }}
      className="bento-card max-w-md w-full relative">
      <button onClick={onClose} className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors">
        <X size={22} />
      </button>
      <h3 className="text-xl font-bold mb-6">{title}</h3>
      {children}
    </motion.div>
  </motion.div>
);

const Field = ({ label, children }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</label>
    {children}
  </div>
);

export default Players;
