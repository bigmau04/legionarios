import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarBlank, Plus, X, PencilSimple, Trash,
  CaretLeft, CaretRight, MapPin, Clock, AlignLeft, FloppyDisk, List,
  SquaresFour as GridIcon,
} from '@phosphor-icons/react';
import { useClub } from '../context/ClubContext';

// ── Tipos de evento ──
const EVENT_TYPES = {
  Partido: { dot: '#FDC010', badge: 'rgba(253,192,16,0.15)',  badgeText: '#FDC010'  },
  Entreno: { dot: '#22c55e', badge: 'rgba(34,197,94,0.15)',   badgeText: '#22c55e'  },
  Reunión: { dot: '#3b82f6', badge: 'rgba(59,130,246,0.15)', badgeText: '#3b82f6'  },
  Otro:    { dot: '#a855f7', badge: 'rgba(168,85,247,0.15)', badgeText: '#a855f7'  },
};

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS_ES   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const EMPTY     = { title:'', type:'Partido', date:'', time:'', location:'', description:'' };

function pad(n) { return String(n).padStart(2,'0'); }
function toISO(y, m, d) { return `${y}-${pad(m+1)}-${pad(d)}`; }
function daysInMonth(y, m) { return new Date(y, m+1, 0).getDate(); }
function firstDay(y, m)    { return new Date(y, m, 1).getDay(); }

// ══════════════════════════════════════
const Events = () => {
  const { events, addEvent, updateEvent, deleteEvent } = useClub();
  const now = new Date();

  const [view,        setView]     = useState('calendar');
  const [year,        setYear]     = useState(now.getFullYear());
  const [month,       setMonth]    = useState(now.getMonth());
  const [selectedDay, setDay]      = useState(null);
  const [modal,       setModal]    = useState(false);
  const [editEvt,     setEditEvt]  = useState(null);
  const [confirmDel,  setDel]      = useState(null);
  const [form,        setForm]     = useState(EMPTY);

  const todayISO = toISO(now.getFullYear(), now.getMonth(), now.getDate());

  // ── Navegación mensual ──
  const prevMonth = () => month === 0 ? (setYear(y=>y-1), setMonth(11)) : setMonth(m=>m-1);
  const nextMonth = () => month===11  ? (setYear(y=>y+1), setMonth(0))  : setMonth(m=>m+1);
  const goToday   = () => { setYear(now.getFullYear()); setMonth(now.getMonth()); };

  // ── Modales ──
  const openCreate = (date='') => { setEditEvt(null); setForm({...EMPTY, date}); setModal(true); };
  const openEdit   = ev  => { setEditEvt(ev); setForm({...ev}); setModal(true); };
  const closeModal = ()  => { setModal(false); setEditEvt(null); };

  const handleSave = e => {
    e.preventDefault();
    editEvt ? updateEvent({...editEvt,...form}) : addEvent(form);
    closeModal();
  };

  const handleDelete = () => {
    deleteEvent(confirmDel);
    setDel(null);
    if (selectedDay && events.filter(e=>e.date===selectedDay && e.id!==confirmDel).length===0)
      setDay(null);
  };

  // ── Grid ──
  const blanks  = firstDay(year, month);
  const total   = daysInMonth(year, month);
  const cells   = [...Array(blanks).fill(null), ...Array.from({length:total},(_,i)=>i+1)];

  const eventsOn = iso => events.filter(e=>e.date===iso);
  const dayDetail = selectedDay ? eventsOn(selectedDay) : [];
  const sorted    = [...events].sort((a,b)=>a.date.localeCompare(b.date));

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <header className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">Eventos y Calendario</h2>
          <p className="text-gray-400 mt-1">Gestión de partidos, entrenamientos y reuniones.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Toggle */}
          <div className="flex bg-navy-800 border border-white/5 rounded-2xl p-1">
            {[['calendar','Calendario', <GridIcon size={16}/>],['list','Lista',<List size={16}/>]].map(([v,label,icon])=>(
              <button key={v} onClick={()=>setView(v)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${view===v?'bg-gold-500 text-navy-900':'text-gray-400 hover:text-white'}`}>
                {icon} {label}
              </button>
            ))}
          </div>
          <button onClick={()=>openCreate()} className="btn-primary">
            <Plus weight="bold"/> Nuevo Evento
          </button>
        </div>
      </header>

      {/* ── Vista Calendario ── */}
      {view==='calendar' && (
        <div style={{display:'grid', gridTemplateColumns:'1fr', gap:'24px'}}
             className="xl:grid" // override en xl con CSS abajo
        >
          <style>{`@media(min-width:1280px){.cal-outer{grid-template-columns:2fr 1fr!important}}`}</style>
          <div className="cal-outer" style={{display:'grid', gridTemplateColumns:'1fr', gap:'24px'}}>

            {/* Calendario */}
            <div className="bento-card">
              {/* Nav */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black">{MONTHS_ES[month]} {year}</h3>
                <div className="flex items-center gap-2">
                  <button onClick={goToday} className="px-3 py-1.5 text-xs font-bold bg-white/5 hover:bg-white/10 rounded-xl transition-colors">Hoy</button>
                  <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><CaretLeft size={18}/></button>
                  <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><CaretRight size={18}/></button>
                </div>
              </div>

              {/* Cabecera días */}
              <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)'}} className="mb-2">
                {DAYS_ES.map(d=>(
                  <div key={d} className="text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest py-2">{d}</div>
                ))}
              </div>

              {/* Grid días */}
              <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'4px'}}>
                {cells.map((day,i)=>{
                  if (!day) return <div key={`b${i}`}/>;
                  const iso      = toISO(year,month,day);
                  const dayEvts  = eventsOn(iso);
                  const isToday  = iso===todayISO;
                  const isSel    = iso===selectedDay;
                  return (
                    <button key={iso} onClick={()=>setDay(isSel?null:iso)}
                      style={{border: isSel?'2px solid #FDC010':'2px solid transparent',
                              background: isSel?'rgba(253,192,16,0.1)':'transparent'}}
                      className="flex flex-col items-center pt-2 pb-1 rounded-2xl min-h-[72px] hover:bg-white/5 transition-all group"
                    >
                      <span style={{
                        width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center',
                        borderRadius:'50%', fontSize:14, fontWeight:700, marginBottom:4,
                        background: isToday?'#FDC010':'transparent',
                        color: isToday?'#001529':'#d1d5db',
                      }}>
                        {day}
                      </span>
                      {/* Puntos */}
                      <div style={{display:'flex',gap:2,flexWrap:'wrap',justifyContent:'center',padding:'0 2px'}}>
                        {dayEvts.slice(0,3).map(ev=>(
                          <span key={ev.id} style={{
                            width:6, height:6, borderRadius:'50%',
                            background: EVENT_TYPES[ev.type]?.dot ?? '#9ca3af',
                          }}/>
                        ))}
                        {dayEvts.length>3 && <span style={{fontSize:8,color:'#6b7280',fontWeight:700}}>+{dayEvts.length-3}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Leyenda */}
              <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-white/5">
                {Object.entries(EVENT_TYPES).map(([type,s])=>(
                  <span key={type} className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
                    <span style={{width:8,height:8,borderRadius:'50%',background:s.dot,display:'inline-block'}}/>
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {/* Panel lateral: detalle del día */}
            <div className="bento-card flex flex-col min-h-[300px]">
              {selectedDay ? (
                <>
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest capitalize">
                        {new Date(selectedDay+'T12:00:00').toLocaleDateString('es-CO',{weekday:'long'})}
                      </p>
                      <h3 className="text-2xl font-black">
                        {new Date(selectedDay+'T12:00:00').toLocaleDateString('es-CO',{day:'numeric',month:'long'})}
                      </h3>
                    </div>
                    <button onClick={()=>openCreate(selectedDay)}
                      className="w-9 h-9 shrink-0 bg-gold-500/10 text-gold-500 rounded-xl flex items-center justify-center hover:bg-gold-500/20 transition-colors">
                      <Plus size={18} weight="bold"/>
                    </button>
                  </div>

                  {dayDetail.length>0 ? (
                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {dayDetail.map(ev=>(
                        <EventCard key={ev.id} event={ev} onEdit={openEdit} onDelete={setDel} compact/>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                      <CalendarBlank size={36} className="text-gray-700"/>
                      <p className="text-gray-500 text-sm">Sin eventos este día</p>
                      <button onClick={()=>openCreate(selectedDay)} className="text-gold-500 text-sm font-bold hover:underline">
                        + Crear evento
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                  <CalendarBlank size={44} className="text-gray-700"/>
                  <p className="text-gray-400">Selecciona un día<br/>para ver sus eventos</p>
                </div>
              )}
            </div>

          </div>{/* .cal-outer */}
        </div>
      )}

      {/* ── Vista Lista ── */}
      {view==='list' && (
        <div className="space-y-3">
          {sorted.length===0 ? (
            <div className="bento-card flex flex-col items-center justify-center py-20 text-center">
              <CalendarBlank size={48} className="text-gray-700 mb-4"/>
              <p className="text-gray-500 font-medium">No hay eventos registrados.</p>
              <button onClick={()=>openCreate()} className="mt-4 text-gold-500 font-bold hover:underline text-sm">+ Crear primer evento</button>
            </div>
          ) : sorted.map((ev,i)=>{
            const prevM = i>0 ? sorted[i-1].date.slice(0,7) : null;
            const currM = ev.date.slice(0,7);
            const [y,m] = currM.split('-');
            return (
              <React.Fragment key={ev.id}>
                {prevM!==currM && (
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest pt-2 px-1">
                    {MONTHS_ES[parseInt(m)-1]} {y}
                  </p>
                )}
                <EventCard event={ev} onEdit={openEdit} onDelete={setDel}/>
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* ── Modal Crear/Editar ── */}
      <AnimatePresence>
        {modal && (
          <ModalWrap title={editEvt?'Editar Evento':'Nuevo Evento'} onClose={closeModal}>
            <form onSubmit={handleSave} className="space-y-4">
              <Field label="Título">
                <input required type="text" value={form.title}
                  onChange={e=>setForm({...form,title:e.target.value})}
                  placeholder="Ej: vs Barbarians RC" className="input-base"/>
              </Field>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                <Field label="Tipo">
                  <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="input-base">
                    {Object.keys(EVENT_TYPES).map(t=><option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Fecha">
                  <input required type="date" value={form.date}
                    onChange={e=>setForm({...form,date:e.target.value})} className="input-base"/>
                </Field>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                <Field label="Hora">
                  <input type="time" value={form.time}
                    onChange={e=>setForm({...form,time:e.target.value})} className="input-base"/>
                </Field>
                <Field label="Lugar">
                  <input type="text" value={form.location}
                    onChange={e=>setForm({...form,location:e.target.value})}
                    placeholder="Ej: Cancha 4" className="input-base"/>
                </Field>
              </div>
              <Field label="Descripción (opcional)">
                <textarea rows={3} value={form.description}
                  onChange={e=>setForm({...form,description:e.target.value})}
                  placeholder="Detalles del evento..." className="input-base resize-none"/>
              </Field>
              <button type="submit" className="btn-primary w-full justify-center mt-2">
                <FloppyDisk weight="bold"/>
                {editEvt?'Guardar Cambios':'Crear Evento'}
              </button>
            </form>
          </ModalWrap>
        )}
      </AnimatePresence>

      {/* ── Modal Confirmar Eliminación ── */}
      <AnimatePresence>
        {confirmDel && (
          <ModalWrap title="Confirmar Eliminación" onClose={()=>setDel(null)}>
            <p className="text-gray-400 mb-6">
              ¿Eliminar el evento{' '}
              <span className="font-bold text-white">"{events.find(e=>e.id===confirmDel)?.title}"</span>?
              Esta acción no se puede deshacer.
            </p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <button onClick={()=>setDel(null)}
                className="py-3 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 transition-colors font-bold">
                Cancelar
              </button>
              <button onClick={handleDelete}
                className="py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-400 transition-colors">
                Eliminar
              </button>
            </div>
          </ModalWrap>
        )}
      </AnimatePresence>
    </div>
  );
};

// ══════════════════════════════════════
// Subcomponentes
// ══════════════════════════════════════

const EventCard = ({ event, onEdit, onDelete, compact=false }) => {
  const s = EVENT_TYPES[event.type] ?? EVENT_TYPES.Otro;
  return (
    <motion.div layout initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
      className={`bento-card flex items-start gap-4 group hover:border-white/10 ${compact?'!p-4':''}`}
    >
      <div style={{width:4, alignSelf:'stretch', borderRadius:4, background:s.dot, flexShrink:0}}/>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span style={{fontSize:10, fontWeight:900, padding:'2px 8px', borderRadius:999,
            background:s.badge, color:s.badgeText, textTransform:'uppercase', letterSpacing:1}}>
            {event.type}
          </span>
          {!compact && (
            <span className="text-[10px] text-gray-500 font-bold">
              {new Date(event.date+'T12:00:00').toLocaleDateString('es-CO',{weekday:'short',day:'numeric',month:'short'})}
            </span>
          )}
        </div>
        <h4 className={`font-bold truncate ${compact?'text-sm':'text-base'}`}>{event.title}</h4>
        <div className="flex items-center gap-4 mt-1 flex-wrap">
          {event.time     && <span className="flex items-center gap-1 text-[11px] text-gray-500"><Clock size={12}/> {event.time}</span>}
          {event.location && <span className="flex items-center gap-1 text-[11px] text-gray-500"><MapPin size={12}/> {event.location}</span>}
        </div>
        {!compact && event.description && (
          <p className="text-xs text-gray-500 mt-2 flex items-start gap-1">
            <AlignLeft size={12} className="mt-0.5 shrink-0"/>{event.description}
          </p>
        )}
      </div>
      <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={()=>onEdit(event)}
          className="p-2 text-gray-500 hover:text-gold-500 hover:bg-gold-500/10 rounded-xl transition-all">
          <PencilSimple size={15} weight="bold"/>
        </button>
        <button onClick={()=>onDelete(event.id)}
          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
          <Trash size={15} weight="bold"/>
        </button>
      </div>
    </motion.div>
  );
};

const ModalWrap = ({ title, children, onClose }) => (
  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm"
    onClick={e=>e.target===e.currentTarget&&onClose()}>
    <motion.div initial={{scale:0.95,opacity:0,y:10}} animate={{scale:1,opacity:1,y:0}} exit={{scale:0.95,opacity:0}}
      className="bento-card max-w-md w-full relative max-h-[90vh] overflow-y-auto">
      <button onClick={onClose} className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors">
        <X size={22}/>
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

export default Events;
