import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ClubContext = createContext();

// ── Mappers: snake_case DB → camelCase JS ──
const mapPlayer     = p => p ? ({ id: p.id, name: p.name, category: p.category, status: p.status, phone: p.phone, monthlyFee: p.monthly_fee, lastPayment: p.last_payment }) : null;
const mapPayment    = p => p ? ({ id: p.id, playerId: p.player_id, name: p.name, amount: p.amount, date: p.date, method: p.method, status: p.status }) : null;
const mapEvent      = e => e ? ({ id: e.id, title: e.title, type: e.type, date: e.date, time: e.time, location: e.location, description: e.description }) : null;
const mapAttendance = a => a ? ({ 
  id: a.id, playerId: a.player_id, playerName: a.player_name, eventId: a.event_id, 
  eventTitle: a.event_title, date: a.date, status: a.status,
  arrivalTime: a.arrival_time, hoursEarned: a.hours_earned,
  evidenceUrl: a.evidence_url, type: a.type
}) : null;
const mapConfig     = c => c ? ({ clubName: c.club_name, tagline: c.tagline, primaryColor: c.primary_color, defaultFees: c.default_fees, categories: c.categories }) : null;

const DEFAULT_CONFIG = {
  clubName: 'Legionarios', tagline: 'Rugby Club', primaryColor: '#FDC010',
  defaultFees: { M16: 45000, M18: 50000, Primera: 60000, Veteranos: 55000 },
  categories: ['M16', 'M18', 'Primera', 'Veteranos'],
};

export const ClubProvider = ({ children }) => {
  const [loading,             setLoading]             = useState(true);
  const [players,             setPlayers]             = useState([]);
  const [payments,            setPayments]            = useState([]);
  const [events,              setEvents]              = useState([]);
  const [attendanceRequests,  setAttendanceRequests]  = useState([]);
  const [config,              setConfig]              = useState(DEFAULT_CONFIG);

  // ── Carga inicial desde Supabase ──
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [
        { data: pd }, { data: py }, { data: ev }, { data: ar }, { data: cf }
      ] = await Promise.all([
        supabase.from('players').select('*').order('id'),
        supabase.from('payments').select('*').order('created_at', { ascending: false }),
        supabase.from('events').select('*').order('date'),
        supabase.from('attendance_requests').select('*').order('id'),
        supabase.from('club_config').select('*').eq('id', 1).maybeSingle(),
      ]);
      if (pd) setPlayers(pd.map(mapPlayer));
      if (py) setPayments(py.map(mapPayment));
      if (ev) setEvents(ev.map(mapEvent));
      if (ar) setAttendanceRequests(ar.map(mapAttendance));
      if (cf) setConfig(mapConfig(cf));
      setLoading(false);
    };
    load();
  }, []);

  // ── Configuración ──
  const updateConfig = async (patch) => {
    const next = { ...config, ...patch };
    setConfig(next);
    await supabase.from('club_config').upsert({
      id: 1, club_name: next.clubName, tagline: next.tagline,
      primary_color: next.primaryColor, default_fees: next.defaultFees, categories: next.categories,
    });
  };
  const resetConfig = () => updateConfig(DEFAULT_CONFIG);

  // ── Jugadores ──
  const addPlayer = async (player) => {
    const { data, error } = await supabase.from('players').insert({
      name: player.name, category: player.category, status: player.status,
      phone: player.phone, monthly_fee: player.monthlyFee, last_payment: null,
    }).select().single();
    if (error) throw error;
    if (data) setPlayers(prev => [...prev, mapPlayer(data)]);
  };

  const updatePlayer = async (updated) => {
    setPlayers(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
    await supabase.from('players').update({
      name: updated.name, category: updated.category, status: updated.status,
      phone: updated.phone, monthly_fee: updated.monthlyFee,
    }).eq('id', updated.id);
  };

  const deletePlayer = async (id) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
    await supabase.from('players').delete().eq('id', id);
  };

  // ── Pagos ──
  const addPayment = async (payment) => {
    const { data, error } = await supabase.from('payments').insert({
      player_id: payment.playerId, name: payment.name, amount: payment.amount,
      date: payment.date, method: payment.method, status: 'Completado',
    }).select().single();
    if (!error && data) {
      setPayments(prev => [mapPayment(data), ...prev]);
      setPlayers(prev => prev.map(p =>
        p.id === payment.playerId ? { ...p, lastPayment: payment.date, status: 'Activo' } : p
      ));
      await supabase.from('players').update({ last_payment: payment.date, status: 'Activo' }).eq('id', payment.playerId);
    }
  };

  // ── Eventos ──
  const addEvent = async (event) => {
    const { data, error } = await supabase.from('events').insert({
      title: event.title, type: event.type, date: event.date,
      time: event.time || null, location: event.location || null, description: event.description || null,
    }).select().single();
    if (!error && data) setEvents(prev => [...prev, mapEvent(data)].sort((a, b) => a.date.localeCompare(b.date)));
  };

  const updateEvent = async (updated) => {
    setEvents(prev => prev.map(e => e.id === updated.id ? { ...e, ...updated } : e));
    await supabase.from('events').update({
      title: updated.title, type: updated.type, date: updated.date,
      time: updated.time || null, location: updated.location || null, description: updated.description || null,
    }).eq('id', updated.id);
  };

  const deleteEvent = async (id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    await supabase.from('events').delete().eq('id', id);
  };

  // ── Asistencia ──
  const approveAttendance = async (id, hoursEarned = 2) => {
    setAttendanceRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Aprobado', hoursEarned } : r));
    await supabase.from('attendance_requests').update({ status: 'Aprobado', hours_earned: hoursEarned }).eq('id', id);
  };

  const rejectAttendance = async (id) => {
    setAttendanceRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Rechazado', hoursEarned: 0 } : r));
    await supabase.from('attendance_requests').update({ status: 'Rechazado', hours_earned: 0 }).eq('id', id);
  };

  const requestAttendance = async ({ playerId, playerName, eventId, eventTitle, date, type = 'cancha', arrivalTime = null, hoursEarned = 0, evidenceUrl = null }) => {
    // Evitar duplicados de cancha para el mismo evento
    if (type === 'cancha' && attendanceRequests.some(r => r.playerId === playerId && r.eventId === eventId)) return false;
    
    const { data, error } = await supabase.from('attendance_requests').insert({
      player_id: playerId, player_name: playerName, event_id: eventId,
      event_title: eventTitle, date, status: 'Pendiente',
      type, arrival_time: arrivalTime, hours_earned: hoursEarned, evidence_url: evidenceUrl
    }).select().single();
    if (!error && data) setAttendanceRequests(prev => [...prev, mapAttendance(data)]);
    return !error;
  };

  // ── Finanzas ──
  const getFinancialSummary = () => {
    const collected     = payments.reduce((acc, p) => acc + p.amount, 0);
    const pendingPlayers = players.filter(p => p.status === 'Pendiente Pago');
    const pendingAmount  = pendingPlayers.reduce((acc, p) => acc + (p.monthlyFee || 0), 0);
    return { total: collected, pending: pendingPlayers.length, pendingAmount };
  };

  return (
    <ClubContext.Provider value={{
      loading,
      config, updateConfig, resetConfig,
      players, payments, events, attendanceRequests,
      addPlayer, updatePlayer, deletePlayer,
      addPayment,
      addEvent, updateEvent, deleteEvent,
      approveAttendance, rejectAttendance, requestAttendance,
      getFinancialSummary,
    }}>
      {children}
    </ClubContext.Provider>
  );
};

export const useClub = () => useContext(ClubContext);
