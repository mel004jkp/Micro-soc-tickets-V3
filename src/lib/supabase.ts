import { createClient } from '@supabase/supabase-js';
import { RegisteredUser, Ticket, TicketStatus } from '../types';

// Read configuration from environment variables
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// Detect if Supabase has been configured
export const isSupabaseConfigured = (): boolean => {
  return supabaseUrl.trim() !== '' && supabaseAnonKey.trim() !== '';
};

// Initialize Supabase Client safely
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/******************************************************************************
 * SQL SCHEMAS FOR SUPABASE (Copy & Paste these in your Supabase SQL Editor!)
 * 
 * -- 1. TABLE: profiles
 * create table public.profiles (
 *   id uuid references auth.users on delete cascade primary key,
 *   nombre text not null,
 *   email text not null,
 *   empresa text not null,
 *   cedula text not null,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * 
 * -- 2. TABLE: tickets
 * create table public.tickets (
 *   id text primary key,
 *   numero serial,
 *   email text not null,
 *   incidente text not null,
 *   prioridad text not null check (prioridad in ('Baja', 'Media', 'Alta')),
 *   observaciones text not null,
 *   status text not null check (status in ('pendiente', 'recibido', 'espera', 'eliminado')),
 *   fecha_creacion text not null,
 *   user_nombre text,
 *   user_empresa text,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * 
 * -- 3. TABLE: suggestions (Complaints & Suggestions box)
 * create table public.suggestions (
 *   id uuid default gen_random_uuid() primary key,
 *   email text not null,
 *   empresa text not null,
 *   tipo text not null check (tipo in ('Queja', 'Sugerencia')),
 *   mensaje text not null,
 *   fecha_creacion text not null,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * 
 * -- Enable Realtime on these tables if you'd like hot reloads in live environments!
 *****************************************************************************/

export interface SuggestionItem {
  id?: string;
  email: string;
  empresa: string;
  tipo: 'Queja' | 'Sugerencia';
  mensaje: string;
  fechaCreacion: string;
}

/**
 * Register a user securely using Supabase Auth & profiles table.
 */
export async function signUpWithSupabase(user: RegisteredUser & { password?: string }) {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Please verify your environment variables.');
  }

  if (!user.password) {
    throw new Error('Contraseña requerida para registro de Supabase Auth.');
  }

  // 1. Create User in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: user.email,
    password: user.password,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('No se pudo crear la cuenta de usuario.');

  // 2. Insert into profiles table for custom attributes (nombre, empresa, cedula)
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      nombre: user.nombre,
      email: user.email,
      empresa: user.empresa,
      cedula: user.cedula,
    });

  if (profileError) throw profileError;

  return {
    email: user.email,
    nombre: user.nombre,
    empresa: user.empresa,
    cedula: user.cedula,
  };
}

/**
 * Signs in a user using Supabase Auth.
 * Automatically fetches their associated profile.
 */
export async function signInWithSupabase(email: string, password: string): Promise<RegisteredUser> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized.');
  }

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('Credenciales incorrectas o no válidas.');

  // Fetch the registered profile for this user ID
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError) {
    // If table profiles is not yet ready, we return credentials with generic fallback values
    return {
      nombre: email.split('@')[0],
      email: email,
      empresa: 'Empresa General',
      cedula: 'N/A'
    };
  }

  return {
    nombre: profile.nombre,
    email: profile.email,
    empresa: profile.empresa,
    cedula: profile.cedula,
  };
}

/**
 * Saves a security ticket into Supabase database
 */
export async function saveTicketToSupabase(ticket: Ticket): Promise<Ticket> {
  if (!supabase) throw new Error('Supabase no configurado.');

  const { error } = await supabase
    .from('tickets')
    .insert({
      id: ticket.id,
      email: ticket.email,
      incidente: ticket.incidente,
      prioridad: ticket.prioridad,
      observaciones: ticket.observaciones,
      status: ticket.status,
      fecha_creacion: ticket.fechaCreacion,
      user_nombre: ticket.userNombre,
      user_empresa: ticket.userEmpresa,
    });

  if (error) throw error;
  return ticket;
}

/**
 * Fetches all tickets from Supabase database
 */
export async function fetchTicketsFromSupabase(): Promise<Ticket[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(row => ({
    id: row.id,
    numero: row.numero,
    email: row.email,
    incidente: row.incidente,
    prioridad: row.prioridad,
    observaciones: row.observaciones,
    status: row.status as TicketStatus,
    fechaCreacion: row.fecha_creacion,
    userNombre: row.user_nombre,
    userEmpresa: row.user_empresa
  }));
}

/**
 * Updates a ticket's status on Supabase
 */
export async function updateTicketStatusInSupabase(id: string, status: TicketStatus): Promise<void> {
  if (!supabase) throw new Error('Supabase no configurado.');

  const { error } = await supabase
    .from('tickets')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
}

/**
 * Deletes a ticket permanently from Supabase
 */
export async function deleteTicketFromSupabase(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase no configurado.');

  const { error } = await supabase
    .from('tickets')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Saves a suggestion or complaint into Supabase database
 */
export async function saveSuggestionToSupabase(suggestion: SuggestionItem): Promise<SuggestionItem> {
  if (!supabase) throw new Error('Supabase no configurado.');

  const { error } = await supabase
    .from('suggestions')
    .insert({
      email: suggestion.email,
      empresa: suggestion.empresa,
      tipo: suggestion.tipo,
      mensaje: suggestion.mensaje,
      fecha_creacion: suggestion.fechaCreacion,
    });

  if (error) throw error;
  return suggestion;
}
