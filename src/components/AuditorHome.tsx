import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck as ShieldCheckIcon, AlertTriangle as AlertTriangleIcon, 
  HelpCircle as HelpCircleIcon, LogOut as LogOutIcon, 
  Layers as LayersIcon, Clock as ClockIcon, Trash2 as Trash2Icon, 
  User as UserIcon, Factory as FactoryIcon, Terminal as TerminalIcon, 
  Check as CheckIcon, X as XIcon, ShieldAlert as ShieldAlertIcon, Cpu as CpuIcon
} from 'lucide-react';
import { Ticket, ThemeConfig, CyberpunkStyle } from '../types';

interface AuditorHomeProps {
  user: { email: string; nombre: string; role: 'client' | 'auditor' };
  theme: ThemeConfig;
  onLogout: () => void;
  themesList: ThemeConfig[];
  onSelectTheme: (style: CyberpunkStyle) => void;
}

type AuditorTab = 'panel_activos' | 'espera' | 'eliminados';

export default function AuditorHome({
  user,
  theme,
  onLogout,
  themesList,
  onSelectTheme
}: AuditorHomeProps) {
  const [activeTab, setActiveTab] = useState<AuditorTab>('panel_activos');
  
  // All tickets in system
  const [tickets, setTickets] = useState<Ticket[]>([]);
  // Selected ticket for detailed view
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  
  // Delete confirmation modal states
  const [isDeleteConfirmId, setIsDeleteConfirmId] = useState<string | null>(null);

  // Checkboxes for permanently purging deleted tickets
  const [selectedPurgeIds, setSelectedPurgeIds] = useState<string[]>([]);
  // Selected deleted ticket for detail view & restore action
  const [selectedDeletedTicketId, setSelectedDeletedTicketId] = useState<string | null>(null);

  // Seed default demo tickets if empty
  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = () => {
    const raw = localStorage.getItem('msoc_tickets_db');
    if (!raw) {
      const demoTickets: Ticket[] = [
        {
          id: 'MSOC-5D21-2026',
          numero: 1,
          email: 'calderonmelvin662@gmail.com',
          incidente: 'Sospecha de Correo Falso (Phishing)',
          prioridad: 'Alta',
          observaciones: 'Recibí un correo que dice ser de soporte diciendo que mi contraseña de la VPN caducaba hoy y me pide ingresar mis datos de administrador doméstico. Viene de un correo extraño.',
          status: 'pendiente',
          fechaCreacion: '13/06/2026, 09:12',
          userNombre: 'Melvin Calderón',
          userEmpresa: 'Micro-Cyber Mini-Mart'
        },
        {
          id: 'MSOC-A8F1-2026',
          numero: 2,
          email: 'pyme_antivirus@gmail.com',
          incidente: 'Alerta del Antivirus',
          prioridad: 'Media',
          observaciones: 'El antivirus del servidor central bloqueó una descarga de un plugin desconocido que bajó un contador. Dice falsedad detectada "Trojan.Win32.Generic".',
          status: 'pendiente',
          fechaCreacion: '13/06/2026, 11:45',
          userNombre: 'Laura Gómez',
          userEmpresa: 'Gómez Consultores S.A.'
        },
        {
          id: 'MSOC-F79C-2026',
          numero: 3,
          email: 'fernando@ferrecentral.com',
          incidente: 'Falla de Conexión VPN',
          prioridad: 'Baja',
          observaciones: 'La VPN no conecta para la sucursal Norte. Creemos que es fallo del enlace de fibra local.',
          status: 'espera',
          fechaCreacion: '12/06/2026, 17:30',
          userNombre: 'Fernando Ruiz',
          userEmpresa: 'Ferretería Central SL'
        }
      ];
      localStorage.setItem('msoc_tickets_db', JSON.stringify(demoTickets));
      setTickets(demoTickets);
    } else {
      setTickets(JSON.parse(raw));
    }
  };

  // Change Ticket Status
  const handleUpdateStatus = (id: string, newStatus: 'recibido' | 'espera' | 'pendiente') => {
    const raw = localStorage.getItem('msoc_tickets_db');
    if (raw) {
      const all: Ticket[] = JSON.parse(raw);
      const updated = all.map(t => {
        if (t.id === id) {
          return { ...t, status: newStatus };
        }
        return t;
      });
      localStorage.setItem('msoc_tickets_db', JSON.stringify(updated));
      setTickets(updated);
      
      // Update selected ticket state in view
      if (selectedTicketId === id && newStatus === 'espera') {
        setSelectedTicketId(null); // Clear detail if moved out of active
      }
      if (selectedDeletedTicketId === id) {
        setSelectedDeletedTicketId(null);
      }
    }
  };

  // Initiate Delete Prompt (nested confirmation popup)
  const openDeletePrompt = (id: string) => {
    setIsDeleteConfirmId(id);
  };

  const closeDeletePrompt = () => {
    setIsDeleteConfirmId(null);
  };

  // Confirm delete (makes ticket 'eliminado')
  const handleConfirmDelete = (id: string) => {
    const raw = localStorage.getItem('msoc_tickets_db');
    if (raw) {
      const all: Ticket[] = JSON.parse(raw);
      const updated = all.map(t => {
        if (t.id === id) {
          return { ...t, status: 'eliminado' as const };
        }
        return t;
      });
      localStorage.setItem('msoc_tickets_db', JSON.stringify(updated));
      setTickets(updated);
      setSelectedTicketId(null);
      setIsDeleteConfirmId(null);
    }
  };

  // Toggle Checkboxes for final purging
  const handleTogglePurgeSelect = (id: string) => {
    setSelectedPurgeIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllDeleted = (deletedItems: Ticket[]) => {
    if (selectedPurgeIds.length === deletedItems.length) {
      setSelectedPurgeIds([]);
    } else {
      setSelectedPurgeIds(deletedItems.map(t => t.id));
    }
  };

  // Permanent Delete Purge
  const handlePermanentPurge = () => {
    if (selectedPurgeIds.length === 0) return;
    
    const raw = localStorage.getItem('msoc_tickets_db');
    if (raw) {
      const all: Ticket[] = JSON.parse(raw);
      const updated = all.filter(t => !selectedPurgeIds.includes(t.id));
      localStorage.setItem('msoc_tickets_db', JSON.stringify(updated));
      setTickets(updated);
      if (selectedDeletedTicketId && selectedPurgeIds.includes(selectedDeletedTicketId)) {
        setSelectedDeletedTicketId(null);
      }
      setSelectedPurgeIds([]);
    }
  };

  // Filter lists for tabs
  const activeTickets = tickets.filter(t => t.status === 'pendiente' || t.status === 'recibido');
  const waitingTickets = tickets.filter(t => t.status === 'espera');
  const deletedTickets = tickets.filter(t => t.status === 'eliminado');

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-12 gap-8 py-6 px-4 md:px-8 text-amber-50">
      
      {/* PERSISTENT SIDEBAR - BOTTOM LEFT NAVIGATION */}
      <aside className="md:col-span-3 flex flex-col justify-between p-6 rounded-2xl border bg-slate-900 border-amber-900/30 h-fit space-y-8 shadow-md">
        
        <div className="space-y-6">
          
          {/* Logo brand */}
          <div className="flex items-center gap-3 border-b border-yellow-900/30 bg-yellow-950/20 p-3 rounded-xl">
            <div className="relative">
              <div className="w-8 h-8 rounded bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)] flex items-center justify-center">
                <span className="text-black font-black text-xs">ADM</span>
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            </div>
            <div>
              <p className="text-sm font-bold tracking-tighter text-yellow-500">PANEL AUDITOR</p>
              <p className="text-[9px] font-normal opacity-70 uppercase tracking-[0.2em] text-yellow-550 text-yellow-500">Staff Only</p>
            </div>
          </div>

          {/* User profile capsule in yellow theme */}
          <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/10 space-y-1 font-mono">
            <div className="flex items-center space-x-2 text-xs text-amber-300">
              <UserIcon className="w-3.5 h-3.5" />
              <span className="font-bold truncate">{user.nombre}</span>
            </div>
            <p className="text-[9.5px] text-slate-500">CORREO: {user.email}</p>
            <p className="text-[10px] text-amber-400 border-t border-slate-900 pt-1">👷 Rol: Auditor Técnico</p>
          </div>

          {/* Navigation Menu (Instructed at bottom-left position) */}
          <nav className="space-y-2 pt-2">
            <p className="text-[10px] font-mono text-slate-500 tracking-wider uppercase pl-2">PANEL DE CONTROL AUDITOR</p>
            
            <button
              id="menu-auditor-panel"
              onClick={() => { setActiveTab('panel_activos'); setSelectedDeletedTicketId(null); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs transition duration-200 cursor-pointer ${
                activeTab === 'panel_activos'
                  ? 'bg-amber-500/10 text-amber-300 border-l-2 border-amber-400 font-bold'
                  : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
              }`}
            >
              <LayersIcon className="w-4 h-4" />
              <span>Panel de Tickets ({activeTickets.length})</span>
            </button>

            <button
              id="menu-auditor-espera"
              onClick={() => { setActiveTab('espera'); setSelectedDeletedTicketId(null); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs transition duration-200 cursor-pointer ${
                activeTab === 'espera'
                  ? 'bg-amber-500/10 text-amber-300 border-l-2 border-amber-400 font-bold'
                  : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
              }`}
            >
              <ClockIcon className="w-4 h-4" />
              <span>Tickets en espera ({waitingTickets.length})</span>
            </button>

            <button
              id="menu-auditor-eliminados"
              onClick={() => { setActiveTab('eliminados'); setSelectedDeletedTicketId(null); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs transition duration-200 cursor-pointer ${
                activeTab === 'eliminados'
                  ? 'bg-amber-500/10 text-amber-300 border-l-2 border-amber-400 font-bold'
                  : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
              }`}
            >
              <Trash2Icon className="w-4 h-4" />
              <span>Tickets eliminados ({deletedTickets.length})</span>
            </button>
          </nav>
        </div>

        {/* Bottom capsule: Logout */}
        <div className="space-y-4 pt-6 border-t border-slate-800">
          <button
            id="auditor-logout-btn"
            onClick={onLogout}
            className="w-full py-2 bg-slate-950 hover:bg-red-950/40 text-rose-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/30 rounded-xl text-xs font-mono transition duration-250 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <LogOutIcon className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>

      </aside>

      {/* AUDITOR DATA CONTAINER ROW */}
      <main className="md:col-span-9 space-y-6">
        
        {/* TAB 1: PANEL DE TICKETS ACTIVOS  */}
        {activeTab === 'panel_activos' && (
          <div id="auditor-screen-activos" className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
            
            {/* LEFT-GRID: TICKETS DIRECTORIES */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-slate-900 border border-amber-950/50 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wide">Panel Operativo Activo</h2>
                  <p className="text-[10px] text-slate-400 font-mono">TICKETS PENDIENTES & VALIDADOS</p>
                </div>
                <span className="text-xs bg-amber-950 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-bold">
                  {activeTickets.length} CASOS
                </span>
              </div>

              {activeTickets.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/60 border border-slate-850 rounded-xl space-y-3">
                  <p className="text-xs text-slate-500 font-mono">Ningún ticket activo en espera de ser recibido.</p>
                  <p className="text-[11px] text-amber-400/80 font-mono">¡Las PYMES de tu red están completamente seguras!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {activeTickets.map((t) => {
                    const isSelected = selectedTicketId === t.id;
                    return (
                      <div
                        key={t.id}
                        id={`ticket-card-${t.id}`}
                        onClick={() => setSelectedTicketId(t.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                          isSelected 
                            ? 'bg-slate-900 border-amber-450 shadow-[0_0_12px_rgba(245,158,11,0.2)]' 
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-mono font-bold text-amber-400">{t.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold font-mono ${
                            t.prioridad === 'Alta' ? 'bg-red-950/80 text-rose-300 border border-red-500/20 animate-pulse' :
                            t.prioridad === 'Media' ? 'bg-amber-950/80 text-amber-300 border border-amber-500/20' :
                            'bg-emerald-950/80 text-emerald-300 border border-emerald-500/20'
                          }`}>
                            {t.prioridad}
                          </span>
                        </div>

                        <p className="text-xs font-bold text-slate-100 truncate mb-1">{t.incidente}</p>
                        <p className="text-[11px] text-slate-400 truncate mb-2">{t.observaciones}</p>

                        <div className="border-t border-slate-850/60 pt-2.5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span className="truncate max-w-[120px]">🏢 {t.userEmpresa}</span>
                          <span>📅 {t.fechaCreacion.split(',')[0]}</span>
                          <span className={`uppercase font-bold ${t.status === 'recibido' ? 'text-amber-400' : 'text-slate-500'}`}>
                            {t.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT-GRID: EXPANDED DETAILED CONTEXT OF THE ACTIVE TICKET */}
            <div className="lg:col-span-6">
              {!selectedTicket ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-2xl h-full flex flex-col justify-center items-center text-slate-500 space-y-3">
                  <TerminalIcon className="w-10 h-10 text-slate-600 animate-pulse" />
                  <p className="text-xs font-mono">Seleccione un Ticket de la lista de auditorías para desplegar los detalles y validar su acuse de recibo.</p>
                </div>
              ) : (
                <div id="expanded-ticket-view" className={`p-6 rounded-2xl border ${theme.cardBg} ${theme.auditorGlow} space-y-6 transition-all duration-300`}>
                  
                  {/* Title & Metadata code */}
                  <div className="border-b border-amber-900/20 pb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-mono text-amber-400">EXPEDIENTE DIGITAL DE INCIDENTE</span>
                      <span className="text-[11px] font-mono text-slate-500 font-bold">Ticket Nº {selectedTicket.numero.toString().padStart(3, '0')}</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-amber-300">{selectedTicket.id}</h3>
                    <p className="text-xs font-bold text-slate-100 mt-1">{selectedTicket.incidente}</p>
                  </div>

                  {/* Customer details verification block */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/10 space-y-2 text-xs font-mono">
                    <div className="grid grid-cols-2 gap-2 text-slate-400">
                      <div>
                        <span className="text-[10px] text-slate-600 uppercase block">CONTACTO</span>
                        <span className="text-slate-100 font-bold">{selectedTicket.userNombre}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-600 uppercase block">EMPRESA / COMERCIAL</span>
                        <span className="text-amber-400 font-bold">{selectedTicket.userEmpresa}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-400 pt-2 border-t border-slate-900">
                      <div>
                        <span className="text-[10px] text-slate-600 uppercase block">CORREO EMISOR</span>
                        <span className="text-slate-350 select-all truncate block">{selectedTicket.email}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-600 uppercase block">FECHA Sometida</span>
                        <span className="text-slate-350 block">{selectedTicket.fechaCreacion}</span>
                      </div>
                    </div>
                  </div>

                  {/* Observations block */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Observaciones del Cliente</span>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-905 min-h-[100px] whitespace-pre-wrap">
                      {selectedTicket.observaciones}
                    </p>
                  </div>

                  {/* HIGHLY IMPORTANT: Validation Statement of Receipt */}
                  <div className="p-3.5 bg-amber-950/30 border border-amber-500/20 rounded-xl space-y-1.5 font-mono">
                    <div className="flex items-center space-x-1.5">
                      <ShieldCheckIcon className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-amber-400">ACUSE Y FIRMA DE VALIDACIÓN DE MICRO-SOC</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Este ticket de auditoria digital ha sido verificado y admitido de forma segura para resguardar la PYME. Código de validez: <span className="text-amber-300">MSOC-VERIFY-{selectedTicket.id.split('-')[1] || '0000'}</span>.
                    </p>
                  </div>

                  {/* INTERACTIVE ACTION BUTTON CONTROLS */}
                  <div className="pt-2 border-t border-slate-850/60 flex flex-col sm:flex-row gap-2.5">
                    
                    {/* BUTTON 1: RECEIVE TICKET */}
                    <button
                      type="button"
                      id="btn-receive-ticket"
                      onClick={() => handleUpdateStatus(selectedTicket.id, 'recibido')}
                      disabled={selectedTicket.status === 'recibido'}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 border cursor-pointer ${
                        selectedTicket.status === 'recibido'
                          ? 'border-amber-400/40 bg-amber-500/10 text-amber-400 cursor-not-allowed opacity-80'
                          : 'border-amber-500 bg-amber-550 hover:bg-amber-600 text-slate-950 hover:shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                      }`}
                    >
                      <CheckIcon className="w-3.5 h-3.5" />
                      <span>{selectedTicket.status === 'recibido' ? 'Ticket Recibido' : 'Recibir Ticket'}</span>
                    </button>

                    {/* BUTTON 2: SEND TO WAIT LIST (ESPERA) */}
                    <button
                      type="button"
                      id="btn-hold-ticket"
                      onClick={() => handleUpdateStatus(selectedTicket.id, 'espera')}
                      className="px-3.5 py-2 rounded-xl text-xs bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-350 font-bold transition flex items-center justify-center space-x-1 shrink-0 cursor-pointer"
                    >
                      <ClockIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>Enviar a espera</span>
                    </button>

                    {/* BUTTON 3: ELIMINAR TICKET (REQUIRES DEEP MODAL POPUP) */}
                    <button
                      type="button"
                      id="btn-delete-ticket-trigger"
                      onClick={() => openDeletePrompt(selectedTicket.id)}
                      className="px-3.5 py-2 rounded-xl text-xs bg-slate-950 hover:bg-rose-950/20 border border-slate-800 hover:border-red-500/20 text-rose-400 font-bold transition flex items-center justify-center space-x-1 shrink-0 cursor-pointer"
                    >
                      <Trash2Icon className="w-3.5 h-3.5 text-rose-500" />
                      <span>Eliminar</span>
                    </button>

                  </div>

                  {/* NESTED CONFIRMATION POPUP FOR TRASHING */}
                  {isDeleteConfirmId === selectedTicket.id && (
                    <div id="delete-confirmation-overlay" className="mt-4 p-4 rounded-xl bg-red-950/80 border border-red-500/40 space-y-3 font-mono animate-fadeIn">
                      <p className="text-xs text-red-200 flex items-center space-x-1.5 font-bold">
                        <AlertTriangleIcon className="w-4 h-4 text-red-400 animate-bounce" />
                        <span>¿Seguro que desea eliminar?</span>
                      </p>
                      <p className="text-[10px] text-red-300">
                        El ticket será desviado al panel de tickets eliminados. Se desactivará de la cola de atención inmediata de auditores.
                      </p>
                      <div className="flex space-x-2 justify-end">
                        
                        {/* GREEN CHECK HOOK BUTTON */}
                        <button
                          type="button"
                          id="btn-confirm-delete-yes"
                          onClick={() => handleConfirmDelete(selectedTicket.id)}
                          title="Confirmar eliminación"
                          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 p-1.5 rounded-lg flex items-center justify-center cursor-pointer transition shadow"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>

                        {/* RED X BUTTON */}
                        <button
                          type="button"
                          id="btn-confirm-delete-no"
                          onClick={closeDeletePrompt}
                          title="Cancelar"
                          className="bg-red-650 hover:bg-red-700 text-slate-100 p-1.5 rounded-lg flex items-center justify-center cursor-pointer transition shadow"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>

                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: TICKETS EN ESPERA (WAITING) */}
        {activeTab === 'espera' && (
          <div id="auditor-screen-espera" className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 animate-fadeIn">
            <div>
              <h2 className="text-base font-bold text-amber-400 uppercase tracking-widest font-mono">Bandeja de Casos en Espera / Prórroga</h2>
              <p className="text-xs text-slate-500 mt-1">Casos secundarios que esperan respuesta de red externa del cliente, proveedor o mantenimiento.</p>
            </div>

            {waitingTickets.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono py-8 text-center">No hay ningún reporte en estado de prórroga.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {waitingTickets.map((t) => (
                  <div key={t.id} id={`waiting-ticket-${t.id}`} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="font-bold text-slate-400">{t.id}</span>
                      <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-amber-400">{t.prioridad}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-200">{t.incidente}</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed italic">"{t.observaciones}"</p>
                    <div className="text-[10px] text-slate-600 font-mono flex justify-between items-center pt-2 border-t border-slate-900">
                      <span>🏢 {t.userEmpresa}</span>
                      <button
                        type="button"
                        id={`btn-restore-ticket-${t.id}`}
                        onClick={() => handleUpdateStatus(t.id, 'pendiente')}
                        className="text-xs font-bold text-amber-400 hover:text-amber-300 font-mono"
                      >
                        [ Re-activar ]
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TICKETS ELIMINADOS (TRASHED TABLE WITH CHECKBOX BULK PURGE) */}
        {activeTab === 'eliminados' && (
          <div id="auditor-screen-eliminados" className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
            
            {/* LEFT COLUMN: TABLE OF DELETED TICKETS */}
            <div className={`bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 ${selectedDeletedTicketId ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-base font-bold text-red-400 uppercase tracking-widest font-mono">Panel de Tickets Reclamados / Eliminados</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedDeletedTicketId 
                      ? 'Visualizando detalle operativo a la derecha.' 
                      : 'Registros desactivados. Selecciona uno para visualizar su ficha o restaurar al panel principal.'}
                  </p>
                </div>

                {deletedTickets.length > 0 && (
                  <button
                    type="button"
                    id="btn-purge-selected"
                    onClick={handlePermanentPurge}
                    disabled={selectedPurgeIds.length === 0}
                    className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                      selectedPurgeIds.length === 0
                        ? 'bg-slate-950 text-slate-500 border border-slate-850 cursor-not-allowed'
                        : 'bg-red-500 hover:bg-red-600 text-slate-950 font-bold'
                    }`}
                  >
                    <Trash2Icon className="w-3.5 h-3.5" />
                    <span>Purgar Físicamente ({selectedPurgeIds.length})</span>
                  </button>
                )}
              </div>

              {deletedTickets.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono py-12 text-center">Sin tickets eliminados en el historial reciente.</p>
              ) : (
                <div id="deleted-tickets-table-container" className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-400 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] font-mono uppercase text-slate-500">
                        <th className="py-2.5 pl-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="mr-2 cursor-pointer"
                            checked={selectedPurgeIds.length === deletedTickets.length && deletedTickets.length > 0}
                            onChange={() => handleSelectAllDeleted(deletedTickets)}
                          />
                        </th>
                        <th className="py-2.5">Número</th>
                        <th className="py-2.5">ID del Ticket</th>
                        <th className="py-2.5">Empresa</th>
                        <th className="py-2.5">Incidente</th>
                        <th className="py-2.5 text-right font-bold text-red-500 font-mono">Operación / Ficha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {deletedTickets.map((t) => {
                        const isSelected = selectedPurgeIds.includes(t.id);
                        const isCurrentSelection = selectedDeletedTicketId === t.id;
                        return (
                          <tr 
                            key={t.id} 
                            id={`deleted-row-${t.id}`}
                            onClick={() => setSelectedDeletedTicketId(isCurrentSelection ? null : t.id)}
                            className={`hover:bg-slate-950/40 transition-colors cursor-pointer ${
                              isCurrentSelection 
                                ? 'bg-amber-950/20 border-l-2 border-amber-400' 
                                : isSelected 
                                  ? 'bg-red-950/10' 
                                  : ''
                            }`}
                          >
                            <td className="py-3 pl-2" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                className="cursor-pointer"
                                checked={isSelected}
                                onChange={() => handleTogglePurgeSelect(t.id)}
                              />
                            </td>
                            <td className="py-3 font-mono text-slate-500">#{t.numero.toString().padStart(3, '0')}</td>
                            <td className="py-3 font-mono font-bold text-slate-350">{t.id}</td>
                            <td className="py-3 text-slate-300">{t.userEmpresa}</td>
                            <td className="py-3 text-slate-400 truncate max-w-[150px]" title={t.incidente}>
                              {t.incidente}
                            </td>
                            <td className="py-3 text-right">
                              <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                                isCurrentSelection 
                                  ? 'bg-amber-950 text-amber-400 border-amber-500/30' 
                                  : 'bg-slate-950 text-slate-500 border-slate-800'
                              }`}>
                                {isCurrentSelection ? 'Viendo Ficha 👁️' : 'Ver Ficha 🔍'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: DETAIL PANEL FOR SELECTED DELETED TICKET */}
            {selectedDeletedTicketId && (
              (() => {
                const sdt = tickets.find(t => t.id === selectedDeletedTicketId);
                if (!sdt) return null;
                return (
                  <div 
                    id="deleted-ticket-detail-panel" 
                    className={`lg:col-span-5 p-6 rounded-2xl border ${theme.cardBg} ${theme.auditorGlow} space-y-6 transition-all duration-300 h-fit animate-fadeIn`}
                  >
                    <div className="border-b border-yellow-900/20 pb-4 flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono text-amber-500 font-bold block uppercase tracking-widest">EXPEDIENTE DIGITAL DEPURADO</span>
                        <h3 className="text-base font-extrabold text-amber-300 mt-1">{sdt.id}</h3>
                      </div>
                      <button 
                        onClick={() => setSelectedDeletedTicketId(null)}
                        className="text-slate-500 hover:text-slate-200 transition p-1"
                        title="Cerrar expediente"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Metadata summary */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-yellow-500/10 space-y-2 text-xs font-mono">
                      <div className="grid grid-cols-2 gap-2 text-slate-400">
                        <div>
                          <span className="text-[10px] text-slate-600 uppercase block">CONTACTO ORIGINAL</span>
                          <span className="text-slate-100 font-bold">{sdt.userNombre}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-600 uppercase block">EMPRESA / COMERCIAL</span>
                          <span className="text-amber-400 font-bold">{sdt.userEmpresa}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-slate-400 pt-2 border-t border-slate-900">
                        <div>
                          <span className="text-[10px] text-slate-600 uppercase block">CORREO</span>
                          <span className="text-slate-350 select-all truncate block">{sdt.email}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-600 uppercase block">FECHA CREACIÓN</span>
                          <span className="text-slate-350 block">{sdt.fechaCreacion}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-900">
                        <span className="text-[10px] text-slate-600 uppercase block">PRIORIDAD ANTERIOR</span>
                        <span className={`inline-block px-2 py-0.5 mt-0.5 rounded text-[9px] uppercase font-bold font-mono ${
                          sdt.prioridad === 'Alta' ? 'bg-red-950/80 text-rose-300 border border-red-500/20' :
                          sdt.prioridad === 'Media' ? 'bg-amber-950/80 text-amber-300 border border-amber-500/20' :
                          'bg-emerald-950/80 text-emerald-300 border border-emerald-500/20'
                        }`}>
                          {sdt.prioridad}
                        </span>
                      </div>
                    </div>

                    {/* Incident & description block */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Tipo de Incidente</span>
                      <p className="text-xs text-slate-200 font-bold leading-none">{sdt.incidente}</p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Observación de Seguridad</span>
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-900 min-h-[90px] whitespace-pre-wrap italic">
                        "{sdt.observaciones}"
                      </p>
                    </div>

                    {/* ACTIONS CONTAINER FOR RESTORE OR FORCE PURGE */}
                    <div className="pt-4 border-t border-slate-850/60 flex flex-col gap-2.5">
                      <button
                        type="button"
                        id="btn-restore-deleted-ticket"
                        onClick={() => handleUpdateStatus(sdt.id, 'pendiente')}
                        className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs rounded-xl transition duration-200 flex items-center justify-center space-x-1.5 shadow-[0_0_15px_rgba(234,179,8,0.2)] cursor-pointer"
                      >
                        <LayersIcon className="w-4 h-4" />
                        <span>Mandar al Panel de Tickets</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPurgeIds([sdt.id]);
                          setIsDeleteConfirmId(sdt.id);
                        }}
                        className="w-full py-2 bg-slate-950 hover:bg-rose-950/20 border border-slate-850 hover:border-red-500/20 text-rose-400 font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <Trash2Icon className="w-3.5 h-3.5 text-rose-500" />
                        <span>Purgar Físicamente</span>
                      </button>
                    </div>

                    {/* CONFIRMATION OVERLAY FOR SINGLE TICKETS */}
                    {isDeleteConfirmId === sdt.id && (
                      <div className="mt-4 p-4 rounded-xl bg-red-950/80 border border-red-500/40 space-y-3 font-mono animate-fadeIn">
                        <p className="text-xs text-rose-200 flex items-center space-x-1.5 font-bold">
                          <AlertTriangleIcon className="w-4 h-4 text-red-500 animate-bounce" />
                          <span>¿Confirmar purga física?</span>
                        </p>
                        <p className="text-[10px] text-red-300 leading-relaxed">
                          Se depurará el registro irreversiblemente de las bases locales. Esta acción no se puede deshacer.
                        </p>
                        <div className="flex space-x-2 justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              const raw = localStorage.getItem('msoc_tickets_db');
                              if (raw) {
                                const all: Ticket[] = JSON.parse(raw);
                                const updated = all.filter(item => item.id !== sdt.id);
                                localStorage.setItem('msoc_tickets_db', JSON.stringify(updated));
                                setTickets(updated);
                                setSelectedDeletedTicketId(null);
                                setIsDeleteConfirmId(null);
                              }
                            }}
                            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 p-1.5 rounded-lg flex items-center justify-center cursor-pointer"
                            title="Confirmar"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsDeleteConfirmId(null)}
                            className="bg-red-650 hover:bg-red-700 text-white p-1.5 rounded-lg flex items-center justify-center cursor-pointer"
                            title="Cancelar"
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </div>
        )}

      </main>
    </div>
  );
}
