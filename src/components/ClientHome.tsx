import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Send, HelpCircle, LogOut, Home, MessageSquare, 
  Paperclip, Terminal, User, FileText, ChevronRight, Search, 
  ArrowRight, ShieldCheck, Cpu, Database, AlertTriangle, X, CheckCircle2
} from 'lucide-react';
import { Ticket, FAQItem, ThemeConfig, BotChatMessage, CyberpunkStyle } from '../types';
import { FAQ_DATA } from '../data/faqs';
import { QUICK_PROMPTS, getBotResponse } from '../lib/botAnswers';
import { isSupabaseConfigured, saveTicketToSupabase, saveSuggestionToSupabase } from '../lib/supabase';

interface ClientHomeProps {
  user: { email: string; nombre: string; role: 'client' | 'auditor'; empresa?: string; cedula?: string };
  theme: ThemeConfig;
  onLogout: () => void;
  themesList: ThemeConfig[];
  onSelectTheme: (style: CyberpunkStyle) => void;
}

type ClientTab = 'inicio' | 'ticket' | 'faq';

export default function ClientHome({
  user,
  theme,
  onLogout,
  themesList,
  onSelectTheme
}: ClientHomeProps) {
  const [activeTab, setActiveTab] = useState<ClientTab>('inicio');
  
  // Ticket form state
  const [incidente, setIncidente] = useState('Sospecha de Correo Falso (Phishing)');
  const [prioridad, setPrioridad] = useState<'Baja' | 'Media' | 'Alta'>('Baja');
  const [observaciones, setObservaciones] = useState('');
  const [ticketError, setTicketError] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  
  // Local tickets state (just to show client his ticket count)
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);

  // Suggestions box states
  const [sugTipo, setSugTipo] = useState<'Queja' | 'Sugerencia'>('Queja');
  const [sugMensaje, setSugMensaje] = useState('');
  const [sugError, setSugError] = useState('');
  const [sugSuccess, setSugSuccess] = useState(false);
  const [mySuggestions, setMySuggestions] = useState<any[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // FAQ search state
  const [faqSearch, setFaqSearch] = useState('');
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>('Todos');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  // Bot states
  const [botMessages, setBotMessages] = useState<BotChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'bot',
      text: `👋 ¡Hola ${user.nombre}! Bienvenido al Micro-SOC Inteligente local.\n\nHe levantado blindaje seguro sobre tu empresa "${user.empresa || 'PYME Local'}". ¿Qué anomalía de seguridad observas hoy? Recuerda que puedes rellenar un Ticket formal en el menú izquierdo en cualquier momento.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [botInput, setBotInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);

  // Load client tickets and suggestions from localstorage
  useEffect(() => {
    loadTickets();
    loadSuggestions();
  }, [user.email]);

  const loadTickets = () => {
    const raw = localStorage.getItem('msoc_tickets_db');
    if (raw) {
      const all: Ticket[] = JSON.parse(raw);
      const filtered = all.filter(t => t.email.trim().toLowerCase() === user.email.trim().toLowerCase());
      setMyTickets(filtered);
    }
  };

  const loadSuggestions = () => {
    const raw = localStorage.getItem('msoc_suggestions_db');
    if (raw) {
      const all = JSON.parse(raw);
      const filtered = all.filter((s: any) => s.email.trim().toLowerCase() === user.email.trim().toLowerCase());
      setMySuggestions(filtered);
    }
  };

  // Submit Ticket handler
  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketError('');
    setTicketSuccess('');
    setIsSubmittingTicket(true);

    // Observations validation (min 10 characters)
    if (observaciones.trim().length < 10) {
      setTicketError('Las observaciones del incidente deben contener un mínimo de 10 caracteres explicativos.');
      setIsSubmittingTicket(false);
      return;
    }

    const raw = localStorage.getItem('msoc_tickets_db');
    const all: Ticket[] = raw ? JSON.parse(raw) : [];

    // Auto-incremental ticket number
    const maxNum = all.length > 0 ? Math.max(...all.map(t => t.numero)) : 0;
    const nextNum = maxNum + 1;

    // Unique hex ID
    const randomHex = Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0');
    const uniqueId = `MSOC-${randomHex}-${new Date().getFullYear()}`;

    const newTicket: Ticket = {
      id: uniqueId,
      numero: nextNum,
      email: user.email,
      incidente,
      prioridad,
      observaciones: observaciones.trim(),
      status: 'pendiente',
      fechaCreacion: new Date().toLocaleString('es-ES', { 
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }),
      userNombre: user.nombre,
      userEmpresa: user.empresa || 'PYME'
    };

    // 1. Post email alert to Formspree endpoint (mnjylqbd)
    let formspreeNotified = false;
    try {
      const response = await fetch("https://formspree.io/f/mnjylqbd", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ticket_id: uniqueId,
          numero: nextNum,
          email: user.email,
          nombre_solicitante: user.nombre,
          empresa: user.empresa || 'PYME',
          incidente: incidente,
          prioridad: prioridad,
          observaciones: observaciones.trim(),
          fecha_creacion: newTicket.fechaCreacion,
          sistema: "Micro-SOC Cybersecurity Platform Alerts"
        })
      });
      if (response.ok) {
        formspreeNotified = true;
      }
    } catch (fsErr) {
      console.warn('Failed to send email alert via Formspree AJAX:', fsErr);
    }

    // 2. If Supabase is configured, try uploading it live!
    let supabaseSaved = false;
    if (isSupabaseConfigured()) {
      try {
        await saveTicketToSupabase(newTicket);
        supabaseSaved = true;
      } catch (err: any) {
        console.warn('Failed to upload live ticket to Supabase:', err);
      }
    }

    const updated = [...all, newTicket];
    localStorage.setItem('msoc_tickets_db', JSON.stringify(updated));

    // Reset Form
    setObservaciones('');
    
    // Formulate success feedback with dynamic components informed
    let feedback = `¡Ticket ${uniqueId} enviado exitosamente!`;
    const details = [];
    if (formspreeNotified) details.push('Notificación de Alerta por Correo de Formspree despachada');
    if (supabaseSaved) details.push('Sincronizado con Supabase');
    else details.push('Guardado en bitácora local');
    
    setTicketSuccess(`${feedback} (${details.join(' y ')}).`);
    setIsSubmittingTicket(false);
    loadTickets();
    
    // Auto-scroll up
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSugError('');
    setSugSuccess(false);

    if (sugMensaje.trim().length < 10) {
      setSugError('Por favor redacta un mensaje descriptivo de mínimo 10 caracteres.');
      return;
    }

    const newSuggestion = {
      email: user.email,
      empresa: user.empresa || 'PYME Local',
      tipo: sugTipo,
      mensaje: sugMensaje.trim(),
      fechaCreacion: new Date().toLocaleString('es-ES', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    };

    // Save live suggestions to Supabase if configured!
    if (isSupabaseConfigured()) {
      try {
        await saveSuggestionToSupabase({
          email: newSuggestion.email,
          empresa: newSuggestion.empresa,
          tipo: newSuggestion.tipo,
          mensaje: newSuggestion.mensaje,
          fechaCreacion: newSuggestion.fechaCreacion
        });
      } catch (err: any) {
        console.warn('Failed to upload suggestion to Supabase:', err);
      }
    }

    // Always fallback/cache on LocalStorage for instant live lists
    const raw = localStorage.getItem('msoc_suggestions_db');
    const existing = raw ? JSON.parse(raw) : [];
    const updated = [...existing, newSuggestion];
    localStorage.setItem('msoc_suggestions_db', JSON.stringify(updated));

    setShowConfirmModal(true);
    setSugSuccess(true);
    setSugMensaje('');
    loadSuggestions();
  };

  const handleSuggestionCancel = () => {
    setSugMensaje('');
    setSugError('');
    setSugSuccess(false);
  };

  // Bot msg engine
  const handleBotSend = (textToSend?: string) => {
    const msgText = textToSend || botInput;
    if (!msgText.trim()) return;

    if (!textToSend) setBotInput('');

    // Append user message
    const userMsg: BotChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: msgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setBotMessages(prev => [...prev, userMsg]);
    setIsBotTyping(true);

    // Simulate cyber telemetry typing
    setTimeout(() => {
      const response = getBotResponse(msgText);
      const botMsg: BotChatMessage = {
        id: Math.random().toString(),
        sender: 'bot',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setBotMessages(prev => [...prev, botMsg]);
      setIsBotTyping(false);
    }, 850);
  };

  // FAQ rendering rules
  const uniqueCategories = ['Todos', 'Phishing y Correos', 'Antivirus', 'Redes y VPN', 'Contraseñas', 'Dispositivos', 'Amenazas Reales'];
  
  const filteredFAQs = FAQ_DATA.filter(faq => {
    const matchSearch = faq.pregunta.toLowerCase().includes(faqSearch.toLowerCase()) || 
                        faq.respuesta.toLowerCase().includes(faqSearch.toLowerCase());
    const matchCat = selectedFaqCategory === 'Todos' || faq.categoria === selectedFaqCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-12 gap-8 py-6 px-4 md:px-8">
      
      {/* PERSISTENT NAVIGATION SIDEBAR (LEFT-COL) */}
      <aside className="md:col-span-3 flex flex-col justify-between p-6 rounded-2xl border bg-slate-900/90 border-slate-800 h-fit space-y-8 shadow-md">
        <div className="space-y-6">
          
          {/* Logo brand */}
          <div className="flex items-center gap-3 border-b border-cyan-900/30 bg-cyan-950/20 p-3 rounded-xl">
            <div className="relative">
              <div className="w-8 h-8 rounded bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)] flex items-center justify-center">
                <span className="text-black font-black text-xs">SOC</span>
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            </div>
            <div>
              <p className="text-sm font-bold tracking-tighter text-cyan-400">MICRO-SOC</p>
              <p className="text-[9px] font-normal opacity-70 uppercase tracking-[0.2em]">Cliente</p>
            </div>
          </div>

          {/* User profile capsule */}
          <div className="bg-slate-950 p-3 rounded-xl border border-cyan-500/10 space-y-1 font-mono">
            <div className="flex items-center space-x-2 text-xs text-cyan-300">
              <User className="w-3.5 h-3.5" />
              <span className="font-bold truncate">{user.nombre}</span>
            </div>
            <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            <p className="text-[10px] text-slate-400 border-t border-slate-900 pt-1">🏢 {user.empresa || 'Pyme'}</p>
            {user.cedula && <p className="text-[9px] text-slate-600">ID: {user.cedula}</p>}
          </div>

          {/* Dynamic Link Menu */}
          <nav className="space-y-2">
            <p className="text-[10px] font-mono text-slate-500 tracking-wider uppercase pl-2">SISTEMA MENÚ</p>
            
            <button
              id="menu-client-inicio"
              onClick={() => setActiveTab('inicio')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs transition duration-200 cursor-pointer ${
                activeTab === 'inicio'
                  ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400 font-bold'
                  : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Regresar a Inicio</span>
            </button>

            <button
              id="menu-client-ticket"
              onClick={() => setActiveTab('ticket')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs transition duration-200 cursor-pointer ${
                activeTab === 'ticket'
                  ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400 font-bold'
                  : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Rellenar Ticket</span>
            </button>

            <button
              id="menu-client-faq"
              onClick={() => setActiveTab('faq')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs transition duration-200 cursor-pointer ${
                activeTab === 'faq'
                  ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400 font-bold'
                  : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Preguntas Frecuentes</span>
            </button>
          </nav>

        </div>

        {/* Bottom capsule: Logout */}
        <div className="space-y-4 pt-6 border-t border-slate-800">
          <button
            id="client-logout-btn"
            onClick={onLogout}
            className="w-full py-2 bg-slate-950 hover:bg-red-950/40 text-rose-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/30 rounded-xl text-xs font-mono transition duration-250 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* WORKSPACE SECTION (RIGHT-COL) */}
      <main className="md:col-span-9 space-y-6">

        {/* TAB 1: SCREEN INICIO (DASHBOARD & SOC-BOT) */}
        {activeTab === 'inicio' && (
          <div id="client-screen-inicio" className="space-y-6 animate-fadeIn">
            
            {/* Quick Hero Banner */}
            <div className={`p-6 rounded-2xl border ${theme.cardBg} ${theme.clientGlow} flex flex-col md:flex-row justify-between items-start md:items-center gap-6`}>
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20 uppercase tracking-widest">Estado de Blindaje: Activo</span>
                <h2 className="text-2xl font-extrabold tracking-tight">¿Tienes dudas en tu local sobre una alerta o mail extraño?</h2>
                <p className={`text-xs max-w-xl ${theme.textMuted}`}>
                  Usa nuestra Inteligencia Virtual offline para aclararlo o abre un reporte formal con prioridad de atención en un par de segundos.
                </p>
              </div>
              <button 
                id="btn-goto-ticket"
                onClick={() => setActiveTab('ticket')}
                className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow cursor-pointer uppercase ${theme.clientBtn}`}
              >
                <span>Generar Ticket</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Micro counters stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center space-x-3">
                <div className="bg-cyan-500/10 p-2.5 rounded-xl border border-cyan-500/20">
                  <FileText className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-mono">TICKET INCIDENTES EN REVISIÓN</p>
                  <p className="text-xl font-bold font-mono text-slate-100">{myTickets.filter(t => t.status === 'pendiente' || t.status === 'recibido').length}</p>
                </div>
              </div>
              
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center space-x-3">
                <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                  <Terminal className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-mono font-bold">CASOS DESVIADOS EN ESPERA</p>
                  <p className="text-xl font-bold font-mono text-slate-100">{myTickets.filter(t => t.status === 'espera').length}</p>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center space-x-3">
                <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-mono">EMPRESA MONITOREADA</p>
                  <p className="text-xs font-bold text-emerald-400 uppercase font-mono">Conexión Segura MSOC</p>
                </div>
              </div>
            </div>

            {/* INTERACTIVE WORKSPACE GRID (CHATBOT + SUGGESTIONS BOX) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* CHATBOT BOARD */}
              <div id="assist-chatbot-card" className="lg:col-span-7 border rounded-2xl overflow-hidden bg-slate-900/95 flex flex-col h-[500px] border-slate-800">
                
                {/* Chatbot Header */}
                <div className="bg-slate-950/80 p-4 border-b border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-cyan-400" />
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950"></span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold tracking-tight">AI SOC-BOT <span className="text-xs font-mono text-cyan-400">v1.4</span></h3>
                      <p className="text-[10px] text-slate-500 font-mono">MODO RESPUESTA LOCAL DE CIBERSEGURIDAD</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-cyan-950/50 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded animate-pulse">SISTEMA ONLINE</span>
                </div>

                {/* Messages viewport */}
                <div id="chatbot-msg-container" className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/30">
                  {botMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs whitespace-pre-wrap ${
                        msg.sender === 'user'
                          ? 'bg-cyan-950 border border-cyan-500/20 text-cyan-100 rounded-tr-none'
                          : 'bg-slate-900/90 border border-slate-800/80 text-slate-200 rounded-tl-none'
                      }`}>
                        <div className="mb-1 font-bold text-[10px] uppercase font-mono tracking-wider flex items-center justify-between opacity-70">
                          <span>{msg.sender === 'user' ? 'Tú (Empresa)' : 'Asistente Micro-SOC'}</span>
                          <span className="text-[9px] font-normal">{msg.timestamp}</span>
                        </div>
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  
                  {isBotTyping && (
                    <div className="flex justify-start">
                      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl rounded-tl-none text-xs text-slate-400 animate-pulse flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></span>
                        <span className="font-mono text-[10px]">SOC-BOT analizando anomalía...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Prompt Suggesters */}
                <div className="p-2.5 bg-slate-950/60 border-t border-slate-900 overflow-x-auto flex space-x-1.5 whitespace-nowrap scrollbar-none">
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      id={`quick-prompt-${idx}`}
                      onClick={() => handleBotSend(prompt)}
                      className="text-[10.5px] font-mono px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/50 text-cyan-400/95 hover:border-cyan-500/30 hover:bg-slate-850 cursor-pointer transition shrink-0"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Message Input actions */}
                <div className="p-3 bg-slate-950 border-t border-slate-800/80">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      id="chatbot-text-input"
                      value={botInput}
                      onChange={(e) => setBotInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleBotSend()}
                      placeholder="Describe un correo sospechoso..."
                      className="w-full pl-3 pr-12 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
                    />
                    <button
                      type="button"
                      id="chatbot-send-btn"
                      onClick={() => handleBotSend()}
                      className={`absolute right-1.5 p-1.5 rounded-lg transition-all ${
                        botInput.trim() ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* ACTIVE COMPLAINTS & SUGGESTIONS BOX */}
              <div id="suggestions-box-container" className="lg:col-span-5 border rounded-2xl bg-slate-900/95 border-slate-800 h-[500px] flex flex-col justify-between overflow-hidden relative">
                
                {/* Header */}
                <div className="bg-slate-950/80 p-4 border-b border-slate-800/85 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">📬</span>
                    <div>
                      <h3 className="text-sm font-bold tracking-tight">Buzón de Atención</h3>
                      <p className="text-[9.5px] text-slate-500 font-mono font-bold leading-none mt-0.5">QUEJAS / SUGERENCIAS PYMES</p>
                    </div>
                  </div>
                  {isSupabaseConfigured() ? (
                    <span className="text-[9px] font-mono bg-cyan-950/50 text-cyan-300 border border-cyan-500/20 px-1.5 py-0.5 rounded leading-none">SUPABASE SYNC</span>
                  ) : (
                    <span className="text-[9px] font-mono bg-slate-950 text-slate-500 border border-slate-850 px-1.5 py-0.5 rounded leading-none">LOCAL CACHE</span>
                  )}
                </div>

                {/* Main scrollable block */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-slate-950/15">
                  
                  {/* Select interactive type input */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[10px] text-slate-400 font-mono uppercase tracking-wider">Tipo de Reporte:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        id="btn-sug-type-queja"
                        onClick={() => setSugTipo('Queja')}
                        className={`py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 border cursor-pointer ${
                          sugTipo === 'Queja'
                            ? 'border-amber-500 bg-amber-950/20 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
                            : 'border-slate-800 bg-slate-950 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <span>⚠️</span>
                        <span>Registrar Queja</span>
                      </button>

                      <button
                        type="button"
                        id="btn-sug-type-sugerencia"
                        onClick={() => setSugTipo('Sugerencia')}
                        className={`py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 border cursor-pointer ${
                          sugTipo === 'Sugerencia'
                            ? 'border-cyan-500 bg-cyan-950/20 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                            : 'border-slate-800 bg-slate-950 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <span>💡</span>
                        <span>Sugerencia</span>
                      </button>
                    </div>
                  </div>

                  {/* Form fields */}
                  <form onSubmit={handleSuggestionSubmit} className="space-y-3">
                    
                    {sugError && (
                      <p id="sug-error-text" className="text-[11px] text-red-400 bg-red-950/40 p-2 rounded border border-red-900/30 font-mono">
                        ⚠️ {sugError}
                      </p>
                    )}

                    <div className="space-y-1 text-left">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                        <span>DETALLE DE TU REPORTE</span>
                        <span className={sugMensaje.trim().length >= 10 ? "text-emerald-400" : "text-slate-500"}>
                          {sugMensaje.trim().length}/10 mín.
                        </span>
                      </div>
                      <textarea
                        id="sug-message-textarea"
                        rows={3}
                        value={sugMensaje}
                        onChange={(e) => setSugMensaje(e.target.value)}
                        placeholder={
                          sugTipo === 'Queja'
                            ? 'Describe la queja sobre el servicio, lentitud de análisis forense, etc.'
                            : 'Comparte tus ideas de mejora o herramientas tácticas adicionales que desees.'
                        }
                        className={`w-full p-2.5 bg-slate-950 border rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition ${
                          sugTipo === 'Queja' ? 'focus:border-amber-500' : 'focus:border-cyan-500'
                        }`}
                      />
                    </div>

                    {/* Twin control buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        id="btn-sug-cancel"
                        onClick={handleSuggestionCancel}
                        className="py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer text-center"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        id="btn-sug-submit"
                        className={`py-2 rounded-xl text-xs font-bold transition-all text-center text-slate-950 cursor-pointer ${
                          sugTipo === 'Queja'
                            ? 'bg-amber-400 hover:bg-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.25)] font-bold'
                            : 'bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.25)] font-bold'
                        }`}
                      >
                        Enviar Registro
                      </button>
                    </div>

                  </form>

                  {/* Dynamic mini-log for historic entries by this client */}
                  <div className="pt-3 border-t border-slate-800">
                    <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest pl-1 mb-1.5">HISTORIAL DE ENTRADAS DEL BUZÓN</p>
                    
                    {mySuggestions.length === 0 ? (
                      <p className="text-[10px] text-slate-600 font-mono text-center py-4 bg-slate-950/20 rounded">No has registrado quejas ni sugerencias recientemente en este equipo.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                        {mySuggestions.slice().reverse().map((item, id) => (
                          <div key={id} className="p-2 rounded-lg bg-slate-950 border border-slate-850 flex flex-col space-y-1 text-left font-mono">
                            <div className="flex items-center justify-between text-[8.5px]">
                              <span className={`px-1.5 py-0.5 rounded uppercase font-bold ${
                                item.tipo === 'Queja' ? 'bg-amber-950 text-amber-400 border border-amber-900/30' : 'bg-cyan-950 text-cyan-400 border border-cyan-900/30'
                              }`}>
                                {item.tipo}
                              </span>
                              <span className="text-slate-600">{item.fechaCreacion.split(',')[0]}</span>
                            </div>
                            <p className="text-[10.5px] text-slate-300 break-words leading-tight">{item.mensaje}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* MODAL / GLOWING POPUP OVERLAY */}
                {showConfirmModal && (
                  <div id="suggestions-confirm-overlay" className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center z-40 animate-fadeIn">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-center text-emerald-400 text-2xl mb-4 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      ✔
                    </div>
                    <span className="text-[9.5px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-500/20 px-2 py-0.5 rounded font-bold tracking-widest uppercase mb-1">REGISTRO COMPLETADO</span>
                    <h4 className="text-sm font-extrabold text-slate-100">Buzón Procesado</h4>
                    <p className="text-[11px] text-slate-400 max-w-xs mt-1.5 leading-relaxed">
                      Tu {sugTipo.toLowerCase()} ha sido debidamente archivada e incorporada al expediente de tu sucursal. Los auditores responderán en tu bitácora de soporte.
                    </p>
                    <button
                      type="button"
                      id="btn-confirm-modal-ok"
                      onClick={() => setShowConfirmModal(false)}
                      className="mt-5 px-5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold font-mono transition-all uppercase cursor-pointer"
                    >
                      Entendido
                    </button>
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

        {/* TAB 2: RELLENAR TICKET FORM */}
        {activeTab === 'ticket' && (
          <div id="client-screen-ticket" className="space-y-6 animate-fadeIn">
            
            <div className="bg-slate-900/90 border border-slate-800 p-6 md:p-8 rounded-2xl space-y-6">
              
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-1 rounded border border-cyan-500/20 uppercase font-bold tracking-widest">Soporte Auditoría Pymes</span>
                <h2 className="text-xl md:text-2xl font-bold mt-2">Someter Nuevo Reporte de Incidente</h2>
                <p className={`text-xs ${theme.textMuted} mt-1`}>
                  Nuestros analistas examinarán las bitácoras y observaciones registradas e iniciarán la respuesta.
                </p>
              </div>

              {ticketSuccess && (
                <div id="ticket-success-box" className="p-4 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{ticketSuccess}</span>
                </div>
              )}

              {ticketError && (
                <div id="ticket-validation-error" className="p-3 bg-red-950/60 border border-red-500/30 text-red-300 rounded-xl text-xs">
                  ⚠️ {ticketError}
                </div>
              )}

              <form onSubmit={handleTicketSubmit} className="space-y-5">
                
                {/* 1. Pre-filled Email field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-mono">CORREO ELECTRÓNICO (FIJO POR INICIO DE SESIÓN)</label>
                  <input
                    type="email"
                    id="ticket-email-disabled"
                    disabled
                    value={user.email}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-slate-400 rounded-xl text-xs font-mono cursor-not-allowed opacity-80"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">Se sincroniza por seguridad para evitar usurpación corporativa.</p>
                </div>

                {/* 2. Custom Incidents Retractable Select menu */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-mono">TIPO DE INCIDENTE O ANOMALÍA</label>
                  <select
                    id="ticket-incidente-select"
                    value={incidente}
                    onChange={(e) => setIncidente(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="Sospecha de Correo Falso (Phishing)">Sospecha de Correo Falso (Phishing)</option>
                    <option value="Alerta del Antivirus">Alerta del Antivirus</option>
                    <option value="Falla de Conexión VPN">Falla de Conexión VPN</option>
                    <option value="Sospecha de Ransomware / Secuestro de Datos">Sospecha de Ransomware / Secuestro de Datos</option>
                    <option value="Pérdida de Contraseña / Acceso Denegado">Pérdida de Contraseña / Acceso Denegado</option>
                    <option value="Comportamiento Lento Extremo de Terminal">Comportamiento Lento Extremo de Terminal</option>
                    <option value="Intromisión Física en Red Wifi del Local">Intromisión Física en Red Wifi del Local</option>
                  </select>
                </div>

                {/* 3. Priority selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 font-mono">NIVEL DE PRIORIDAD</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      id="priority-select-baja"
                      onClick={() => setPrioridad('Baja')}
                      className={`px-3 py-2.5 rounded-xl border text-xs text-left transition duration-150 flex items-center space-x-2 ${
                        prioridad === 'Baja'
                          ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300 font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>🟢</span>
                      <span>Baja (No urge)</span>
                    </button>

                    <button
                      type="button"
                      id="priority-select-media"
                      onClick={() => setPrioridad('Media')}
                      className={`px-3 py-2.5 rounded-xl border text-xs text-left transition duration-150 flex items-center space-x-2 ${
                        prioridad === 'Media'
                          ? 'border-amber-500 bg-amber-950/20 text-amber-300 font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>🟡</span>
                      <span>Media (Dificulta)</span>
                    </button>

                    <button
                      type="button"
                      id="priority-select-alta"
                      onClick={() => setPrioridad('Alta')}
                      className={`px-3 py-2.5 rounded-xl border text-xs text-left transition duration-150 flex items-center space-x-2 ${
                        prioridad === 'Alta'
                          ? 'border-red-500 bg-red-950/20 text-red-300 font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>🔴</span>
                      <span>Alta (Hackeo/Secuestro)</span>
                    </button>
                  </div>
                </div>

                {/* 4. Observations - minimum 10 characters */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-slate-400 font-mono">OBSERVACIONES O DETALLES DEL SUCESO </label>
                    <span className={`text-[10px] font-mono ${observaciones.trim().length >= 10 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {observaciones.trim().length}/10 caracteres mín.
                    </span>
                  </div>
                  <textarea
                    id="ticket-observaciones-input"
                    rows={4}
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Describe el suceso que has notado lo más detallado posible (por ejemplo: descripción del archivo adjunto, nombre del remitente del mail sospechoso, o qué alertas lanza tu pantalla de antivirus)."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-cyan-400 transition"
                  ></textarea>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  id="ticket-submit-btn"
                  disabled={isSubmittingTicket}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-300 tracking-wider uppercase cursor-pointer ${
                    isSubmittingTicket ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-705' : theme.clientBtn
                  }`}
                >
                  {isSubmittingTicket ? (
                    <span className="flex items-center justify-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                      <span>Enviando Alertas y Notificación por Correo...</span>
                    </span>
                  ) : (
                    "Someter Ticket a Auditoría Micro-SOC"
                  )}
                </button>

              </form>
            </div>

            {/* Client Historical Ticket View */}
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold tracking-tight">Mis Tickets Recientes en Bitácora</h3>
              
              {myTickets.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono">No has registrado ningún ticket formal todavía con esta sesión.</p>
              ) : (
                <div id="client-tickets-table" className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-400 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 pb-2 text-[10px] font-mono uppercase text-slate-500">
                        <th className="py-2.5">Código / ID</th>
                        <th className="py-2.5">Incidente</th>
                        <th className="py-2.5">Prioridad</th>
                        <th className="py-2.5">Fecha</th>
                        <th className="py-2.5 text-right">Estado Micro-SOC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {myTickets.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-950/40 transition-colors">
                          <td className="py-2.5 font-mono text-cyan-400 font-bold">{t.id}</td>
                          <td className="py-2.5 text-slate-200">{t.incidente}</td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono ${
                              t.prioridad === 'Alta' ? 'bg-red-950/65 text-red-400 border border-red-500/20' :
                              t.prioridad === 'Media' ? 'bg-amber-950/65 text-amber-400 border border-amber-500/20' :
                              'bg-emerald-950/65 text-green-400 border border-emerald-500/20'
                            }`}>
                              {t.prioridad === 'Alta' ? '🔴 ALTA' : t.prioridad === 'Media' ? '🟡 MED' : '🟢 BJ'}
                            </span>
                          </td>
                          <td className="py-2.5 text-slate-500 font-mono">{t.fechaCreacion}</td>
                          <td className="py-2.5 text-right">
                            <span className={`px-2 py-1 rounded text-[10px] uppercase font-mono font-bold ${
                              t.status === 'pendiente' ? 'text-slate-400 border border-slate-850 bg-slate-900/60' :
                              t.status === 'recibido' ? 'text-cyan-400 border border-cyan-500/30 bg-cyan-950/40' :
                              t.status === 'espera' ? 'text-amber-400 border border-amber-500/30 bg-amber-950/40' :
                              'text-red-400 border border-red-500/30 bg-red-950/40'
                            }`}>
                              {t.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: FAQ CORNER ACCORDION */}
        {activeTab === 'faq' && (
          <div id="client-screen-faq" className="space-y-6 animate-fadeIn">
            
            <div className={`p-6 rounded-2xl border ${theme.cardBg} border-slate-800`}>
              <h2 className="text-xl font-bold tracking-tight mb-2">Preguntas Frecuentes de Seguridad (FAQ)</h2>
              <p className={`text-xs ${theme.textMuted} mb-6`}>
                Muchas fallas comunes son falsas alarmas inofensivas. Despeja tu mente evaluando estas aclaraciones de seguridad.
              </p>

              {/* Filtering Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                
                {/* Search query input */}
                <div className="sm:col-span-2 relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    id="faq-search-input"
                    placeholder="Escribe palabras clave para buscar (ej: phishing, vpn...)"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                  />
                </div>

                {/* Category select */}
                <select
                  id="faq-category-filter"
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
                  value={selectedFaqCategory}
                  onChange={(e) => setSelectedFaqCategory(e.target.value)}
                >
                  {uniqueCategories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>

              </div>

              {/* Accordion list */}
              <div className="space-y-3">
                {filteredFAQs.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8 font-mono">No hemos encontrado ninguna FAQ que conincida con tu búsqueda.</p>
                ) : (
                  filteredFAQs.map((faq) => {
                    const isOpen = expandedFaqId === faq.id;
                    return (
                      <div 
                        key={faq.id} 
                        id={`faq-item-${faq.id}`}
                        className={`rounded-xl border transition-all duration-200 ${isOpen ? 'bg-slate-950 border-cyan-800/60' : 'bg-slate-950/40 border-slate-850'}`}
                      >
                        <button
                          type="button"
                          id={`faq-toggle-btn-${faq.id}`}
                          onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                          className="w-full p-4 text-left flex justify-between items-center cursor-pointer select-none"
                        >
                          <div className="pr-4">
                            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/15 mr-2">
                              {faq.categoria}
                            </span>
                            <span className="text-xs md:text-sm font-semibold text-slate-100">{faq.pregunta}</span>
                          </div>
                          <ChevronRight className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90 text-cyan-400' : ''}`} />
                        </button>
                        
                        {isOpen && (
                          <div id={`faq-answer-content-${faq.id}`} className="px-4 pb-4 text-xs text-slate-300 border-t border-slate-900 pt-3 leading-relaxed whitespace-pre-wrap">
                            {faq.respuesta}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
