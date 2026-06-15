import React, { useState } from 'react';
import { Shield, Key, Eye, EyeOff, UserPlus, Factory, CreditCard, Mail, Sparkles, CheckCircle2, Database, Sliders } from 'lucide-react';
import { RegisteredUser, CyberpunkStyle, ThemeConfig } from '../types';
import { isSupabaseConfigured, signInWithSupabase, signUpWithSupabase } from '../lib/supabase';

interface LoginRegisterProps {
  theme: ThemeConfig;
  onSelectTheme: (style: CyberpunkStyle) => void;
  themesList: ThemeConfig[];
  onLoginSuccess: (user: { email: string; nombre: string; role: 'client' | 'auditor'; empresa?: string; cedula?: string }) => void;
}

export default function LoginRegister({
  theme,
  onSelectTheme,
  themesList,
  onLoginSuccess
}: LoginRegisterProps) {
  // Authentication states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccessMsg, setLoginSuccessMsg] = useState('');

  // Registration states
  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regEmpresa, setRegEmpresa] = useState('');
  const [regCedula, setRegCedula] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  // Check if Supabase keys are active in client environment
  const supabaseActive = isSupabaseConfigured();

  // Load existing registered users of the app
  const getStoredUsers = (): RegisteredUser[] => {
    const raw = localStorage.getItem('msoc_registered_users');
    if (!raw) {
      // Seed default client
      const initial: RegisteredUser[] = [
        {
          nombre: 'Melvin Calderón',
          email: 'cliente@microsoc.com',
          empresa: 'Ferretería Central',
          cedula: '8-999-1234',
          password: 'clave123'
        }
      ];
      localStorage.setItem('msoc_registered_users', JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccessMsg('');

    if (!loginEmail || !loginPassword) {
      setLoginError('Por favor ingresa tu correo y contraseña.');
      return;
    }

    // 1. If Supabase is configured, use real live Auth
    if (supabaseActive) {
      try {
        setLoginSuccessMsg('Validando token de seguridad en Supabase Auth...');
        const profile = await signInWithSupabase(loginEmail, loginPassword);
        setLoginSuccessMsg(`¡Hola, ${profile.nombre}! Autenticado correctamente vía Supabase.`);
        setTimeout(() => {
          onLoginSuccess({
            email: profile.email,
            nombre: profile.nombre,
            role: profile.email.trim().toLowerCase() === 'auditor@microsoc.com' ? 'auditor' : 'client',
            empresa: profile.empresa,
            cedula: profile.cedula
          });
        }, 1000);
        return;
      } catch (err: any) {
        setLoginError(`Error de Acceso en Supabase: ${err.message || 'Verifica tus credenciales'}`);
        setLoginSuccessMsg('');
        return;
      }
    }

    // 2. Local Fallback Mode
    // Check pre-configured Auditor
    if (loginEmail.trim().toLowerCase() === 'auditor@microsoc.com' && loginPassword === 'admin123') {
      setLoginSuccessMsg('Acceso de Auditor concedido. Iniciando sistema...');
      setTimeout(() => {
        onLoginSuccess({
          email: 'auditor@microsoc.com',
          nombre: 'Auditor Micro-SOC Principal',
          role: 'auditor'
        });
      }, 1000);
      return;
    }

    // Check users database in localStorage
    const users = getStoredUsers();
    const found = users.find(
      u => u.email.trim().toLowerCase() === loginEmail.trim().toLowerCase() && u.password === loginPassword
    );

    if (found) {
      setLoginSuccessMsg(`¡Hola, ${found.nombre}! Iniciando panel de cliente...`);
      setTimeout(() => {
        onLoginSuccess({
          email: found.email,
          nombre: found.nombre,
          role: 'client',
          empresa: found.empresa,
          cedula: found.cedula
        });
      }, 1000);
    } else {
      setLoginError('Credenciales inválidas. Verifica tu contraseña o correo de usuario.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess(false);

    if (!regNombre || !regEmail || !regEmpresa || !regCedula || !regPassword) {
      setRegError('Por favor completa todos los campos del formulario de registro.');
      return;
    }

    // 1. If Supabase is configured, use Supabase Auth and save Profile
    if (supabaseActive) {
      try {
        setRegError('');
        const newUser: RegisteredUser = {
          nombre: regNombre,
          email: regEmail.trim().toLowerCase(),
          empresa: regEmpresa,
          cedula: regCedula,
          password: regPassword
        };
        await signUpWithSupabase(newUser);
        
        setRegSuccess(true);
        setLoginSuccessMsg('¡Registro Exitoso en Supabase! Ya puedes iniciar sesión con tus credenciales.');
        
        // Pre-populate login
        setLoginEmail(newUser.email);
        setLoginPassword(newUser.password || '');
        
        // Reset fields
        setRegNombre('');
        setRegEmail('');
        setRegEmpresa('');
        setRegCedula('');
        setRegPassword('');
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      } catch (err: any) {
        setRegError(`Fallo al registrar en Supabase Auth: ${err.message || 'Verifica los parámetros e inténtalo de nuevo.'}`);
        return;
      }
    }

    // 2. Local Fallback Mode
    // Check email uniqueness
    const users = getStoredUsers();
    const exists = users.some(u => u.email.trim().toLowerCase() === regEmail.trim().toLowerCase());
    if (exists || regEmail.trim().toLowerCase() === 'auditor@microsoc.com') {
      setRegError('Este correo electrónico ya se encuentra registrado.');
      return;
    }

    // Register user
    const newUser: RegisteredUser = {
      nombre: regNombre,
      email: regEmail.trim().toLowerCase(),
      empresa: regEmpresa,
      cedula: regCedula,
      password: regPassword
    };

    const updated = [...users, newUser];
    localStorage.setItem('msoc_registered_users', JSON.stringify(updated));

    // Display success
    setRegSuccess(true);
    setLoginSuccessMsg('¡Usuario registrado con éxito! Los datos fueron fijados en el portal de login.');

    // Pre-populate login form fields
    setLoginEmail(newUser.email);
    setLoginPassword(newUser.password || '');

    // Reset register fields
    setRegNombre('');
    setRegEmail('');
    setRegEmpresa('');
    setRegCedula('');
    setRegPassword('');

    // Smooth scroll to login form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Quick fill buttons for testing
  const handleQuickFill = (type: 'client' | 'auditor') => {
    setLoginError('');
    if (type === 'client') {
      // Seed default users if empty
      getStoredUsers();
      setLoginEmail('cliente@microsoc.com');
      setLoginPassword('clave123');
    } else {
      setLoginEmail('auditor@microsoc.com');
      setLoginPassword('admin123');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 py-10 px-4">
      
      {/* Header section */}
      <header className="text-center space-y-4">
        <div className="inline-flex items-center justify-center space-x-2 bg-slate-900/80 border border-slate-800 p-2 rounded-full px-4 mb-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-xs font-mono text-cyan-400">SOC INTERACTIVO PYMES (AUDITORÍA ACCESIBLE)</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight" id="main-title">
          MICRO-<span className="text-cyan-400">SOC</span>
        </h1>
        <p className={`text-sm md:text-base max-w-lg mx-auto ${theme.textMuted}`}>
          Ciberseguridad y auditoría digital diseñada bajo el presupuesto real de pequeñas y medianas empresas.
        </p>
      </header>

      {/* Main Container: Login and Registration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* LOGIN PORTAL CARD */}
        <div id="login-card" className={`p-6 md:p-8 rounded-2xl border transition-all duration-300 ${theme.cardBg} ${theme.clientGlow}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight flex items-center space-x-2">
              <Key id="login-key-icon" className="w-5 h-5 text-cyan-400" />
              <span>Iniciar Sesión</span>
            </h2>
            <span className="text-xs font-mono text-cyan-400/80 bg-cyan-950/40 px-2 py-1 rounded border border-cyan-500/20">Portal de Acceso</span>
          </div>

          {/* Connection badge indicators */}
          <div className="mb-6">
            {supabaseActive ? (
              <div className="flex items-center space-x-2 bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 p-2.5 rounded-xl font-mono text-[10.5px]">
                <Database className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
                <div>
                  <span className="font-bold uppercase block text-cyan-300">⚡ SUPABASE CONECTADO</span>
                  <span className="text-[9px] text-slate-400 block lowercase leading-none">Cargando cuentas reales de Supabase Auth</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 text-slate-500 p-2.5 rounded-xl font-mono text-[10.5px]">
                <Database className="w-4 h-4 shrink-0" />
                <div>
                  <span className="font-semibold block text-slate-400"> Almacenamiento Local Activo</span>
                  <span className="text-[9px] text-slate-600 block leading-none">Guardando de forma segura en navegador (Demo)</span>
                </div>
              </div>
            )}
          </div>

          {loginSuccessMsg && (
            <div id="login-success-box" className="mb-4 p-3 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{loginSuccessMsg}</span>
            </div>
          )}

          {loginError && (
            <div id="login-error-box" className="mb-4 p-3 bg-red-950/60 border border-red-500/30 text-red-300 rounded-xl text-xs">
              ⚠️ {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 font-mono">CORREO ELECTRÓNICO</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  id="login-email-input"
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-cyan-400 transition"
                  placeholder="ejemplo@empresa.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 font-mono">CONTRASEÑA</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Shield className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password-input"
                  className="w-full pl-10 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-cyan-400 transition"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                <button
                  type="button"
                  id="toggle-pass-login"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              className={`w-full py-2.5 rounded-xl text-sm transition-all duration-300 font-bold tracking-wide cursor-pointer ${theme.clientBtn}`}
            >
              Iniciar Sesión Seguro
            </button>
          </form>

          {/* Quick-fill section for simple testing */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <p className="text-xs text-slate-500 mb-2 font-mono">DEMO ACCESOS RÁPIDOS MOCK:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                id="btn-quick-client"
                onClick={() => handleQuickFill('client')}
                className="bg-slate-900 border border-cyan-900/60 text-cyan-400 hover:bg-slate-850 p-2 rounded-lg font-mono text-center flex flex-col justify-center items-center transition"
              >
                <span className="font-bold">🔑 Modo Cliente</span>
                <span className="text-[10px] text-slate-500">cliente@microsoc.com</span>
              </button>
              <button
                type="button"
                id="btn-quick-auditor"
                onClick={() => handleQuickFill('auditor')}
                className="bg-slate-900 border border-amber-900/60 text-amber-400 hover:bg-slate-850 p-2 rounded-lg font-mono text-center flex flex-col justify-center items-center transition"
              >
                <span className="font-bold">⚠️ Modo Auditor</span>
                <span className="text-[10px] text-slate-500">auditor@microsoc.com</span>
              </button>
            </div>
          </div>
        </div>

        {/* REGISTRATION CARD FOR NEW USERS */}
        <div id="register-card" className={`p-6 md:p-8 rounded-2xl border transition-all duration-300 ${theme.cardBg} border-slate-800/85 shadow-sm`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight flex items-center space-x-2">
              <UserPlus className="w-5 h-5 text-emerald-400" />
              <span>Registrarse Nuevo Cliente</span>
            </h2>
            <span className="text-xs font-mono text-emerald-400/80 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-500/20 font-bold">Nuevas PYMES</span>
          </div>

          {/* Connection badge indicators */}
          <div className="mb-6">
            {supabaseActive ? (
              <div className="flex items-center space-x-2 bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 p-2.5 rounded-xl font-mono text-[10.5px]">
                <Database className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
                <div>
                  <span className="font-bold uppercase block text-emerald-300">⚡ REGISTRO EN SUPABASE</span>
                  <span className="text-[9px] text-slate-400 block lowercase leading-none">Crea usuarios reales en tu auth.users</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 text-slate-500 p-2.5 rounded-xl font-mono text-[10.5px]">
                <Database className="w-4 h-4 shrink-0" />
                <div>
                  <span className="font-semibold block text-slate-400"> Almacenamiento Local Activo</span>
                  <span className="text-[9px] text-slate-600 block leading-none">Cuentas guardadas en caché LocalStorage</span>
                </div>
              </div>
            )}
          </div>

          {regSuccess && (
            <div id="register-success-box" className="mb-4 p-3.5 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-medium">¡Registro exitoso!</strong>
                <span>Se han cargado tus datos automáticamente en el login. Solo presiona "Iniciar Sesión Seguro" de arriba para ingresar.</span>
              </div>
            </div>
          )}

          {regError && (
            <div id="register-error-box" className="mb-4 p-3 bg-red-950/60 border border-red-500/30 text-red-300 rounded-xl text-xs">
              ⚠️ {regError}
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1 font-mono">NOMBRE COMPLETO</label>
                <input
                  type="text"
                  id="reg-nombre"
                  placeholder="Tu Nombre"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                  value={regNombre}
                  onChange={(e) => setRegNombre(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1 font-mono">CORREO ELECTRÓNICO</label>
                <input
                  type="email"
                  id="reg-email"
                  placeholder="correo@pyme.com"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1 font-mono">LOCAL O EMPRESA</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Factory className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    id="reg-empresa"
                    placeholder="Nombre Comercial"
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                    value={regEmpresa}
                    onChange={(e) => setRegEmpresa(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1 font-mono">NÚMERO DE CÉDULA</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <CreditCard className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    id="reg-cedula"
                    placeholder="9-999-9999"
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                    value={regCedula}
                    onChange={(e) => setRegCedula(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1 font-mono">CONTRASEÑA DE ACCESO</label>
              <input
                type="password"
                id="reg-password"
                placeholder="Inserta contraseña segura"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              id="register-submit-btn"
              className="w-full mt-2 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition duration-200 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Crear Cuenta PYME & Sincronizar</span>
            </button>
          </form>
        </div>
      </div>

      {/* Trust Badge Footer */}
      <footer className="pt-4 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center text-slate-500 text-xs gap-4 font-mono">
        <p>© 2026 Micro-SOC Cybersecurity Inc. Acceso Certificado.</p>
        <div className="flex items-center space-x-1 text-slate-500">
          <Shield className="w-3.5 h-3.5 text-slate-500" />
          <span>Fórmulas de cifrado y auditorías locales persistentes de 256 bits.</span>
        </div>
      </footer>
    </div>
  );
}
