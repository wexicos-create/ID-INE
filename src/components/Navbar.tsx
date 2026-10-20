import React from 'react';
import { ShieldCheck, Lock, User, LogOut, Database, Sparkles, Webhook } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface NavbarProps {
  currentUser: FirebaseUser | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenVault: () => void;
  onOpenApiModal: () => void;
  onOpenAdminPanel: () => void;
  vaultCount: number;
  flaggedCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogin,
  onLogout,
  onOpenVault,
  onOpenApiModal,
  onOpenAdminPanel,
  vaultCount,
  flaggedCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 border-b border-cyan-500/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-950 border border-cyan-400/40">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-base font-extrabold tracking-wider text-slate-100">
                APP<span className="text-cyan-400">SWINGER</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-700/60">
                GATEWAY WEB
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              Verificación Oficial de Mayoría de Edad (+18) & Biometría INE
            </p>
          </div>
        </div>

        {/* Telemetry Pills */}
        <div className="hidden lg:flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-1.5 px-3 py-1 bg-slate-900 border border-cyan-500/30 rounded-full text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>Doble Filtro IA: 3.1-Lite + 4-Argon</span>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1 bg-slate-900 border border-purple-500/30 rounded-full text-purple-300">
            <Lock className="w-3.5 h-3.5" />
            <span>Kyber-1024 Post-Quantum</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {/* API Webhooks Hub Button */}
          <button
            onClick={onOpenApiModal}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-purple-500/40 hover:border-purple-400 text-purple-300 rounded-xl text-xs font-mono font-semibold transition-all shadow-md cursor-pointer"
            title="Conectar Tiendas en Línea vía Webhooks y APIs"
          >
            <Webhook className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">API Webhooks</span>
          </button>

          {/* Admin Panel Button */}
          <button
            onClick={onOpenAdminPanel}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-400 text-amber-300 rounded-xl text-xs font-mono font-semibold transition-all shadow-md cursor-pointer"
            title="Panel de administración para revisión manual"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Panel Admin</span>
            {flaggedCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-950 text-amber-200 rounded text-[10px] border border-amber-800 animate-pulse">
                {flaggedCount}
              </span>
            )}
          </button>

          {/* Bóveda Cuántica Button */}
          <button
            onClick={onOpenVault}
            className="flex items-center space-x-2 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 rounded-xl text-xs font-mono font-semibold transition-all shadow-md cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Bóveda</span>
            <span className="px-1.5 py-0.2 bg-cyan-950 text-cyan-200 rounded text-[10px] border border-cyan-800">
              {vaultCount}
            </span>
          </button>

          {/* User Auth Profile / Login */}
          {currentUser ? (
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700 px-3 py-1 rounded-xl">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Operador'}
                  className="w-6 h-6 rounded-full border border-cyan-400"
                />
              ) : (
                <User className="w-4 h-4 text-cyan-400" />
              )}
              <span className="text-xs font-mono text-slate-200 max-w-[120px] truncate hidden md:inline">
                {currentUser.displayName || currentUser.email}
              </span>
              <button
                onClick={onLogout}
                className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-lg shadow-cyan-950 cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Acceso Operador</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
