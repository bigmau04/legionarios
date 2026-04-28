import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Phone, Trophy, IdentificationCard, CheckCircle } from '@phosphor-icons/react';
import { useClub } from '../context/ClubContext';

const AddPlayer = () => {
  const navigate = useNavigate();
  const { addPlayer, config } = useClub();
  const categories = config?.categories  ?? ['M16', 'M18', 'Primera', 'Veteranos'];
  const defaultFees = config?.defaultFees ?? {};

  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name:       '',
    category:   categories[0] ?? 'M18',
    phone:      '',
    status:     'Activo',
    monthlyFee: defaultFees[categories[0]] ?? 50000,
  });

  const handleCategoryChange = (category) => {
    setFormData(prev => ({
      ...prev,
      category,
      monthlyFee: defaultFees[category] ?? prev.monthlyFee,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addPlayer(formData);
    setIsSuccess(true);
    setTimeout(() => navigate('/players'), 2000);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[80dvh] p-8 text-center space-y-6">
        <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type:'spring', stiffness:200 }}
          className="w-32 h-32">
          <img src="/logo.png" alt="Logo Legionarios" className="w-full h-full object-contain drop-shadow-2xl" />
        </motion.div>
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
          <h2 className="text-3xl font-black">¡LEGIONARIO INSCRITO!</h2>
          <p className="text-gray-400 mt-2">Bienvenido al club. Redirigiendo al plantel...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-2xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold">Inscribir Jugador</h2>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bento-card space-y-6">

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <User size={14} /> Nombre Completo
            </label>
            <input required type="text" placeholder="Ej: Juan Pérez"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="input-base" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <Trophy size={14} /> Categoría
            </label>
            <select value={formData.category}
              onChange={e => handleCategoryChange(e.target.value)}
              className="input-base">
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <Phone size={14} /> Teléfono de Contacto
            </label>
            <input required type="tel" placeholder="Ej: 300 123 4567"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="input-base" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <IdentificationCard size={14} /> Cuota Mensual ($)
            </label>
            <input required type="number"
              value={formData.monthlyFee}
              onChange={e => setFormData({ ...formData, monthlyFee: parseInt(e.target.value) })}
              className="input-base font-mono" />
            <p className="text-[10px] text-gray-600">
              Pre-rellenado con la cuota por defecto de la categoría. Puedes ajustarlo.
            </p>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full justify-center py-5 text-lg shadow-xl shadow-gold-500/20">
          Confirmar Inscripción
        </button>
      </form>
    </div>
  );
};

export default AddPlayer;
