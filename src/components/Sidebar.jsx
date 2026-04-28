import React from 'react';
import { NavLink } from 'react-router-dom';
import { SquaresFour, Users, CreditCard, UserCheck, Calendar, GearSix } from '@phosphor-icons/react';
import { cn } from '../lib/utils';
import { useClub } from '../context/ClubContext';

const NAV_ITEMS = [
  { to: '/',           icon: <SquaresFour size={24} />, label: 'Dashboard'  },
  { to: '/players',    icon: <Users size={24} />,       label: 'Jugadores'  },
  { to: '/payments',   icon: <CreditCard size={24} />,  label: 'Pagos'      },
  { to: '/attendance', icon: <UserCheck size={24} />,   label: 'Asistencia' },
  { to: '/events',     icon: <Calendar size={24} />,    label: 'Eventos'    },
];

const Sidebar = () => {
  const { config } = useClub();
  const color = config?.primaryColor ?? '#FDC010';

  return (
    <aside className="hidden md:flex w-64 bg-navy-800 border-r border-white/5 flex-col h-screen sticky top-0">
      {/* Logo del club */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center bg-navy-900/60 shrink-0">
          <img
            src="/logo.png"
            alt="Legionarios RC Logo"
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-tight">{(config?.clubName ?? 'Legionarios').toUpperCase()}</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>
            {config?.tagline ?? 'Rugby Club'}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-2 mt-2">
        {NAV_ITEMS.map(item => <NavItem key={item.to} {...item} color={color} />)}
      </nav>

      {/* Foto del equipo en la parte baja del sidebar */}
      <div className="mx-4 mb-3 rounded-2xl overflow-hidden relative h-28 group">
        <img src="/foto-equipo.jpg" alt="Equipo Legionarios" className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/30 to-transparent" />
        <p className="absolute bottom-2 left-3 text-[9px] font-black text-white uppercase tracking-widest">
          Temporada 2025
        </p>
      </div>

      {/* Configuración */}
      <div className="p-4">
        <div className="bg-navy-900/50 rounded-2xl p-3 border border-white/5">
          <NavItem to="/settings" icon={<GearSix size={24} />} label="Configuración" color={color} />
        </div>
      </div>
    </aside>
  );
};

const NavItem = ({ to, icon, label, color = '#FDC010' }) => (
  <NavLink
    to={to}
    className={({ isActive }) => cn(
      'flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group',
      isActive ? 'text-navy-900 shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'
    )}
    style={({ isActive }) => isActive
      ? { background: color, boxShadow: `0 8px 20px -5px ${color}60` }
      : {}}
  >
    <span className="transition-transform duration-300 group-hover:scale-110">{icon}</span>
    <span className="font-medium text-sm">{label}</span>
  </NavLink>
);

export default Sidebar;
