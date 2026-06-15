import { ThemeConfig } from '../types';

export const THEME_PRESETS: ThemeConfig[] = [
  {
    id: 'nano_cyan',
    nombre: 'Sleek Interface (Celeste / Ámbar)',
    bg: 'bg-black text-gray-200 font-sans min-h-screen relative sleek-dots',
    cardBg: 'bg-slate-900/50 border border-cyan-500/20 rounded-xl shadow-2xl',
    borderColor: 'border-cyan-900/50',
    textMuted: 'text-cyan-100/60',
    
    // Client styles
    clientAccent: 'text-cyan-400',
    clientGlow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)] border-cyan-500/20',
    clientBtn: 'bg-cyan-600 hover:bg-cyan-500 text-black font-bold py-2.5 rounded-lg transition-all shadow-[0_0_20px_rgba(8,145,178,0.35)]',

    // Auditor styles
    auditorAccent: 'text-yellow-550 text-yellow-500',
    auditorGlow: 'shadow-[0_0_20px_rgba(234,179,8,0.15)] border-yellow-500/25',
    auditorBtn: 'bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 rounded-lg transition-all shadow-[0_0_20px_rgba(234,179,8,0.35)]'
  },
  {
    id: 'neon_violet',
    nombre: 'Deep Spectrum (Violeta / Neón)',
    bg: 'bg-black text-zinc-100 font-sans min-h-screen relative sleek-dots',
    cardBg: 'bg-zinc-900/50 border border-violet-500/20 rounded-xl shadow-2xl',
    borderColor: 'border-violet-900/50',
    textMuted: 'text-zinc-400',

    // Client styles
    clientAccent: 'text-violet-400',
    clientGlow: 'shadow-[0_0_20px_rgba(139,92,246,0.15)] border-violet-500/20',
    clientBtn: 'bg-violet-600 hover:bg-violet-500 text-white font-bold py-2.5 rounded-lg transition-all shadow-[0_0_20px_rgba(139,92,246,0.35)]',

    // Auditor styles
    auditorAccent: 'text-fuchsia-400',
    auditorGlow: 'shadow-[0_0_20px_rgba(217,70,239,0.15)] border-fuchsia-400/20',
    auditorBtn: 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-2.5 rounded-lg transition-all shadow-[0_0_20px_rgba(217,70,239,0.35)]'
  },
  {
    id: 'terminal_green',
    nombre: 'Phosphor Matrix (Verde / Cobalto)',
    bg: 'bg-black text-emerald-350 font-mono min-h-screen relative sleek-dots',
    cardBg: 'bg-black border border-emerald-900/50 rounded-xl shadow-2xl',
    borderColor: 'border-emerald-950',
    textMuted: 'text-emerald-600/80',

    // Client styles
    clientAccent: 'text-emerald-400 font-mono',
    clientGlow: 'shadow-[0_0_15px_rgba(16,185,129,0.1)] border-emerald-500/25',
    clientBtn: 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-500/40 font-mono py-2.5 rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]',

    // Auditor styles
    auditorAccent: 'text-cyan-400 font-mono',
    auditorGlow: 'shadow-[0_0_15px_rgba(34,211,238,0.1)] border-cyan-500/25',
    auditorBtn: 'bg-cyan-950 text-cyan-300 hover:bg-cyan-900 border border-cyan-500/40 font-mono py-2.5 rounded-lg transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]'
  }
];
