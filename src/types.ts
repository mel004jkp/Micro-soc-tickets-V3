/**
 * Types & Interfaces for Micro-SOC
 */

export interface RegisteredUser {
  nombre: string;
  email: string;
  empresa: string;
  cedula: string;
  password?: string;
}

export type TicketStatus = 'pendiente' | 'recibido' | 'espera' | 'eliminado';

export interface Ticket {
  id: string; // ID único (ej: MSOC-7B3D-2026)
  numero: number; // Número incremental (ej: 001)
  email: string;
  incidente: string;
  prioridad: 'Baja' | 'Media' | 'Alta';
  observaciones: string;
  status: TicketStatus;
  fechaCreacion: string;
  userNombre?: string;
  userEmpresa?: string;
}

export interface FAQItem {
  id: string;
  pregunta: string;
  respuesta: string;
  categoria: string;
}

export type CyberpunkStyle = 'nano_cyan' | 'synth_gold' | 'terminal_green' | 'neon_violet';

export interface ThemeConfig {
  id: CyberpunkStyle;
  nombre: string;
  bg: string;
  cardBg: string;
  borderColor: string;
  textMuted: string;
  // Dynamic client styles (accented toward cyan/celeste)
  clientAccent: string;
  clientGlow: string;
  clientBtn: string;
  // Dynamic auditor styles (accented toward yellow/amber)
  auditorAccent: string;
  auditorGlow: string;
  auditorBtn: string;
}

export interface BotChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}
