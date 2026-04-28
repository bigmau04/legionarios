import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GearSix, Buildings, Tag, CurrencyDollar, Trash, Plus, FloppyDisk,
  ArrowCounterClockwise, Warning,
} from '@phosphor-icons/react';
import { useClub } from '../context/ClubContext';

const ACCENT_COLORS = [
  { label: 'Dorado',   value: '#FDC010' },
  { label: 'Esmeralda',value: '#10b981' },
  { label: 'Índigo',   value: '#6366f1' },
  { label: 'Rojo',     value: '#ef4444' },
  { label: 'Celeste',  value: '#0ea5e9' },
  { label: 'Naranja',  value: '#f97316' },
];

const Settings = () => {
  const { config, updateConfig, resetConfig } = useClub();
  const [localConfig, setLocalConfig] = useState({ ...config });
  const [saved,       setSaved]       = useState(false);
  const [newCat,      setNewCat]      = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const set = (key, value) => setLocalConfig(prev => ({ ...prev, [key]: value }));

  const setFee = (cat, value) =>
    setLocalConfig(prev => ({ ...prev, defaultFees: { ...prev.defaultFees, [cat]: parseInt(value) || 0 } }));

  const addCategory = () => {
    const cat = newCat.trim().toUpperCase();
    if (!cat || localConfig.categories.includes(cat)) return;
    setLocalConfig(prev => ({
      ...prev,
      categories:  [...prev.categories, cat],
      defaultFees: { ...prev.defaultFees, [cat]: 50000 },
    }));
    setNewCat('');
  };

  const removeCategory = (cat) => {
    setLocalConfig(prev => ({
      ...prev,
      categories:  prev.categories.filter(c => c !== cat),
      defaultFees: Object.fromEntries(Object.entries(prev.defaultFees).filter(([k]) => k !== cat)),
    }));
  };

  const handleSave = () => {
    updateConfig(localConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    resetConfig();
    setLocalConfig({ ...config });
    setConfirmReset(false);
  };

  return (
    <div className="p-8 space-y-8 max-w-3xl mx-auto">

      <header>
        <h2 className="text-4xl font-bold tracking-tight">Configuración</h2>
        <p className="text-gray-400 mt-1">Personaliza la información y parámetros del club.</p>
      </header>

      {/* ── Identidad del Club ── */}
      <Section icon={<Buildings size={20}/>} title="Identidad del Club">
        <Field label="Nombre del Club">
          <input type="text" value={localConfig.clubName}
            onChange={e => set('clubName', e.target.value)}
            className="input-base" placeholder="Ej: Legionarios" />
        </Field>
        <Field label="Eslogan / Subtítulo">
          <input type="text" value={localConfig.tagline}
            onChange={e => set('tagline', e.target.value)}
            className="input-base" placeholder="Ej: Rugby Club" />
        </Field>

        {/* Preview */}
        <div className="mt-4 p-5 bg-navy-900/60 rounded-2xl border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-navy-800 shrink-0">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="font-bold text-sm tracking-tight">{localConfig.clubName || 'Nombre del Club'}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: localConfig.primaryColor }}>
              {localConfig.tagline || 'Eslogan'}
            </p>
          </div>
        </div>
      </Section>

      {/* ── Color de acento ── */}
      <Section icon={<Tag size={20}/>} title="Color Principal">
        <div className="flex flex-wrap gap-3">
          {ACCENT_COLORS.map(({ label, value }) => (
            <button key={value} onClick={() => set('primaryColor', value)}
              title={label}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div style={{ background: value, width: 40, height: 40, borderRadius: 12,
                outline: localConfig.primaryColor === value ? `3px solid ${value}` : 'none',
                outlineOffset: 3, transition: 'all 0.2s', transform: localConfig.primaryColor===value?'scale(1.15)':'scale(1)' }}/>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{label}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-2">Afecta el sidebar, botones y acentos de la interfaz (requiere recargar para aplicar al 100%).</p>
      </Section>

      {/* ── Categorías y Cuotas ── */}
      <Section icon={<CurrencyDollar size={20}/>} title="Categorías y Cuotas Mensuales">
        <div className="space-y-3">
          {localConfig.categories.map(cat => (
            <div key={cat} className="flex items-center gap-3">
              <span className="w-24 text-sm font-bold text-gray-300 shrink-0">{cat}</span>
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input type="number" value={localConfig.defaultFees[cat] ?? 50000}
                  onChange={e => setFee(cat, e.target.value)}
                  className="input-base pl-7 font-mono !py-3" />
              </div>
              <button onClick={() => removeCategory(cat)}
                className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all shrink-0"
                title={`Eliminar categoría ${cat}`}>
                <Trash size={16}/>
              </button>
            </div>
          ))}

          {/* Agregar categoría */}
          <div className="flex items-center gap-3 pt-2 border-t border-white/5">
            <input type="text" value={newCat}
              onChange={e => setNewCat(e.target.value.toUpperCase())}
              onKeyDown={e => e.key==='Enter' && addCategory()}
              placeholder="Nueva categoría (ej: M14)" maxLength={8}
              className="input-base !py-3 flex-1" />
            <button onClick={addCategory}
              disabled={!newCat.trim()}
              className="p-3 bg-gold-500/10 text-gold-500 rounded-xl hover:bg-gold-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              <Plus size={18} weight="bold"/>
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-3">Las cuotas por defecto se pre-rellenan al inscribir un jugador según su categoría.</p>
      </Section>

      {/* ── Acciones ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button onClick={() => setConfirmReset(true)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-400 transition-colors font-bold">
          <ArrowCounterClockwise size={16}/> Restaurar valores por defecto
        </button>

        <motion.button
          onClick={handleSave}
          whileTap={{ scale: 0.97 }}
          className={`btn-primary transition-all ${saved ? 'bg-green-500 hover:bg-green-400' : ''}`}
        >
          <FloppyDisk weight="bold"/>
          {saved ? '¡Guardado!' : 'Guardar Configuración'}
        </motion.button>
      </div>

      {/* Confirm reset */}
      {confirmReset && (
        <div className="bento-card border-red-500/20 bg-red-500/5">
          <div className="flex items-start gap-3">
            <Warning size={20} className="text-red-400 shrink-0 mt-0.5"/>
            <div className="flex-1">
              <p className="font-bold text-sm mb-1">¿Restaurar configuración?</p>
              <p className="text-xs text-gray-400 mb-4">Esto reestablecerá el nombre, colores, categorías y cuotas a los valores originales.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmReset(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-sm font-bold text-gray-400 hover:bg-white/5 transition-colors">
                  Cancelar
                </button>
                <button onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-400 transition-colors">
                  Sí, restaurar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Helpers ── */
const Section = ({ icon, title, children }) => (
  <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
    className="bento-card space-y-5">
    <div className="flex items-center gap-3 pb-4 border-b border-white/5">
      <span className="text-gold-500">{icon}</span>
      <h3 className="font-bold text-lg">{title}</h3>
    </div>
    {children}
  </motion.div>
);

const Field = ({ label, children }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</label>
    {children}
  </div>
);

export default Settings;
