import React, { useEffect, useState } from 'react';
import { ShieldCheck, Clock, XCircle, ArrowRight, RefreshCw, Check, Lock } from 'lucide-react';
import { sound } from '../services/audio';

interface SuccessCelebrationProps {
  outcome: 'approved' | 'declined' | 'pending_admin_review' | 'annulled';
  fullName?: string;
  curp?: string;
  statusMessage?: string;
  annulmentReason?: string;
  onReset: () => void;
  onGoToStore?: () => void;
  captures?: { ineFront: string; ineBack: string; liveFace: string } | null;
}

export const SuccessCelebration: React.FC<SuccessCelebrationProps> = ({
  outcome,
  fullName,
  curp,
  statusMessage,
  annulmentReason,
  onReset,
  onGoToStore,
}) => {
  // Animation phases: 'spinning' -> 'closing' -> 'revealed'
  const [animPhase, setAnimPhase] = useState<'spinning' | 'closing' | 'revealed'>('spinning');

  useEffect(() => {
    sound.playScanLaser();
    const t1 = setTimeout(() => {
      setAnimPhase('closing');
      sound.playQuantumLock();
    }, 1400);

    const t2 = setTimeout(() => {
      setAnimPhase('revealed');
      if (outcome === 'approved') {
        sound.playSuccess();
      }
    }, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [outcome]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900 border border-cyan-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Animated Circle Spinner & Palomita (Checkmark) */}
      <div className="relative w-36 h-36 my-6 flex items-center justify-center">
        {/* Outer rotating ring during spinning phase */}
        {animPhase === 'spinning' && (
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 border-r-purple-500 animate-spin duration-700" />
        )}

        {/* Ring closing animation */}
        <div
          className={`w-28 h-28 rounded-full border-4 transition-all duration-700 flex items-center justify-center ${
            animPhase === 'spinning'
              ? 'border-cyan-500/40 scale-100'
              : animPhase === 'closing'
              ? 'border-cyan-400 scale-95 shadow-[0_0_25px_#22d3ee]'
              : outcome === 'approved'
              ? 'border-emerald-400 bg-emerald-950/60 shadow-[0_0_30px_rgba(52,211,153,0.5)] scale-100'
              : outcome === 'pending_admin_review'
              ? 'border-amber-400 bg-amber-950/60 shadow-[0_0_30px_rgba(251,191,36,0.4)] scale-100'
              : 'border-rose-500 bg-rose-950/60 shadow-[0_0_30px_rgba(244,63,94,0.5)] scale-100'
          }`}
        >
          {animPhase === 'revealed' ? (
            outcome === 'approved' ? (
              <svg className="w-14 h-14 text-emerald-400 animate-fade-in" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : outcome === 'pending_admin_review' ? (
              <Clock className="w-12 h-12 text-amber-400 animate-fade-in" />
            ) : (
              <XCircle className="w-12 h-12 text-rose-500 animate-fade-in" />
            )
          ) : (
            <div className="w-6 h-6 rounded-full bg-cyan-400 animate-ping" />
          )}
        </div>
      </div>

      {/* Dynamic Content based on Outcome */}
      {animPhase === 'revealed' && (
        <div className="space-y-4 max-w-lg animate-fade-in">
          {outcome === 'approved' && (
            <>
              <div className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/50">
                VERIFICACIÓN EXITOSA • ACCESO VIP CONCEDIDO
              </div>
              <h2 className="text-2xl font-mono font-extrabold text-white">
                ¡Gracias! Tu identidad ha sido validada correctamente
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                Tu credencial INE oficial y tu selfie con documento en mano han sido autenticados con éxito sin margen de error. Tu membresía en <strong>AppSwinger</strong> se encuentra 100% activa.
              </p>

              {/* Verified Identity Badge */}
              <div className="p-4 bg-slate-950/80 border border-emerald-500/30 rounded-2xl text-left font-mono text-xs space-y-1.5 shadow-lg">
                <div className="text-emerald-400 font-bold text-sm">
                  {fullName || 'TITULAR VERIFICADO'}
                </div>
                <div className="text-slate-400 text-[11px] flex items-center justify-between">
                  <span>CURP: {curp || 'VERIFICADA'}</span>
                  <span className="text-emerald-400 font-semibold">• MAYOR DE 18 AÑOS</span>
                </div>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={onGoToStore || onReset}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-xl text-xs font-mono font-bold shadow-lg shadow-emerald-950 flex items-center justify-center space-x-2 cursor-pointer transition-all"
                >
                  <span>Continuar a AppSwinger Store</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onReset}
                  className="w-full sm:w-auto px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono border border-slate-700 transition-colors"
                >
                  Cerrar Pantalla
                </button>
              </div>
            </>
          )}

          {outcome === 'pending_admin_review' && (
            <>
              <div className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-950 text-amber-400 border border-amber-500/50">
                EXPEDIENTE EN REVISIÓN MANUAL
              </div>
              <h2 className="text-2xl font-mono font-extrabold text-white">
                Espera la validación de administradores
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                Tus capturas han sido recibidas y cifradas de forma segura. Debido a variaciones de iluminación o reflejos ópticos en el documento, un administrador de <strong>AppSwinger</strong> verificará tu expediente manualmente en un plazo de 3 a 5 minutos.
              </p>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-400">
                FOLIO DE AUDITORÍA: <strong className="text-cyan-300">#ASW-{Math.floor(100000 + Math.random() * 900000)}</strong>
              </div>

              <div className="pt-3 flex justify-center">
                <button
                  onClick={onReset}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-mono font-bold border border-slate-700 transition-all cursor-pointer"
                >
                  Cerrar Pantalla y Esperar Notificación
                </button>
              </div>
            </>
          )}

          {outcome === 'declined' && (
            <>
              <div className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-950 text-rose-400 border border-rose-500/50">
                VERIFICACIÓN REPROBADA • DECLINED
              </div>
              <h2 className="text-2xl font-mono font-extrabold text-white">
                Prueba no superada o datos alterados
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {annulmentReason ||
                  'El análisis forense detectó discrepancias, oclusión en datos críticos, código QR no válido o manipulación digital en la credencial INE. El resultado ha sido enviado a la tienda en línea como declined.'}
              </p>

              <div className="pt-3 flex justify-center">
                <button
                  onClick={onReset}
                  className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-mono font-bold shadow-lg shadow-rose-950 flex items-center space-x-2 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reintentar Verificación Genuina</span>
                </button>
              </div>
            </>
          )}

          {outcome === 'annulled' && (
            <>
              <div className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-950 text-rose-400 border border-rose-500/50">
                PROCESO ANULADO POR SEGURIDAD
              </div>
              <h2 className="text-2xl font-mono font-extrabold text-white">
                No se pudo validar la identidad
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {annulmentReason ||
                  'El rostro en vivo de la selfie no coincide suficientemente con la fotografía oficial de la credencial INE, o el documento sostenido en mano no es legible.'}
              </p>

              <div className="pt-3 flex justify-center">
                <button
                  onClick={onReset}
                  className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-mono font-bold shadow-lg shadow-rose-950 flex items-center space-x-2 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reintentar Verificación Genuina</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
