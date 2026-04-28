import React from 'react';
import { NavLink } from 'react-router-dom';
import { SquaresFour, Users, CreditCard, UserCheck, UserPlus } from '@phosphor-icons/react';
import { cn } from '../lib/utils';

const BottomNav = () => (
  <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-navy-800/90 backdrop-blur-xl border-t border-white/5 px-6 py-3 flex justify-between items-center z-50">
    <NavIcon to="/"           icon={<SquaresFour size={24} />} label="Inicio"    />
    <NavIcon to="/players"    icon={<Users size={24} />}       label="Plantel"   />
    <div className="relative -top-8">
      <NavLink
        to="/add-player"
        className="w-14 h-14 bg-gold-500 rounded-full flex items-center justify-center shadow-lg shadow-gold-500/40 text-navy-900 ring-4 ring-navy-900"
      >
        <UserPlus size={28} weight="bold" />
      </NavLink>
    </div>
    <NavIcon to="/attendance" icon={<UserCheck size={24} />}   label="Asistencia" />
    <NavIcon to="/payments"   icon={<CreditCard size={24} />}  label="Pagos"      />
  </nav>
);

const NavIcon = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) => cn(
      'flex flex-col items-center gap-1 transition-all duration-300',
      isActive ? 'text-gold-500' : 'text-gray-500'
    )}
  >
    {icon}
    <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
  </NavLink>
);

export default BottomNav;
