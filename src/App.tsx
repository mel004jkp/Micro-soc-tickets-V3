import React, { useState, useEffect } from 'react';
import { THEME_PRESETS } from './data/themes';
import { ThemeConfig, CyberpunkStyle } from './types';
import LoginRegister from './components/LoginRegister';
import ClientHome from './components/ClientHome';
import AuditorHome from './components/AuditorHome';

export default function App() {
  // Theme state
  const [currentStyle, setCurrentStyle] = useState<CyberpunkStyle>('nano_cyan');
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(THEME_PRESETS[0]);

  // Session user state
  const [sessionUser, setSessionUser] = useState<{
    email: string;
    nombre: string;
    role: 'client' | 'auditor';
    empresa?: string;
    cedula?: string;
  } | null>(null);

  // Sync current theme config object when style changes
  useEffect(() => {
    const found = THEME_PRESETS.find(t => t.id === currentStyle);
    if (found) {
      setCurrentTheme(found);
    }
  }, [currentStyle]);

  // Handle successful login
  const handleLoginSuccess = (user: {
    email: string;
    nombre: string;
    role: 'client' | 'auditor';
    empresa?: string;
    cedula?: string;
  }) => {
    setSessionUser(user);
  };

  // Handle logout
  const handleLogout = () => {
    setSessionUser(null);
  };

  // Update theme helper
  const handleSelectTheme = (style: CyberpunkStyle) => {
    setCurrentStyle(style);
  };

  return (
    <div id="app-root-container" className={`min-h-screen transition-all duration-300 ${currentTheme.bg} pb-12 relative overflow-x-hidden`}>
      
      {/* Sleek Interface dot overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none sleek-dots" />
      
      {/* Decorative Top cyberpunk lightbar aligned based on user role */}
      <div 
        id="cyberpunk-topbar" 
        className={`h-1.5 w-full transition-all duration-300 ${
          sessionUser 
            ? sessionUser.role === 'client' 
              ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' 
              : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
            : 'bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400'
        }`}
      />

      {/* Main app frame */}
      <div className="max-w-7xl mx-auto pt-6 px-1">
        
        {/* Guard conditions logic */}
        {!sessionUser ? (
          <LoginRegister
            theme={currentTheme}
            onSelectTheme={handleSelectTheme}
            themesList={THEME_PRESETS}
            onLoginSuccess={handleLoginSuccess}
          />
        ) : sessionUser.role === 'client' ? (
          <ClientHome
            user={sessionUser}
            theme={currentTheme}
            onLogout={handleLogout}
            themesList={THEME_PRESETS}
            onSelectTheme={handleSelectTheme}
          />
        ) : (
          <AuditorHome
            user={sessionUser}
            theme={currentTheme}
            onLogout={handleLogout}
            themesList={THEME_PRESETS}
            onSelectTheme={handleSelectTheme}
          />
        )}

      </div>
    </div>
  );
}
