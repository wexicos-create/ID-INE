import React, { useState } from 'react';
import { ShieldCheck, Lock, FileText, Check, AlertCircle } from 'lucide-react';

interface DataPrivacyModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export const DataPrivacyModal: React.FC<DataPrivacyModalProps> = ({ isOpen, onAccept }) => {
  const [hasConsented, setHasConsented] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl p-6 text-slate-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-mono text-base font-bold text-slate-100">
              AVISO DE USO Y PROTECCIÓN DE DATOS
            </h3>
            <span className="text-[11px] font-mono text-cyan-400">
              AppSwinger • Verificación Oficial de Identidad y Mayoría de Edad
            </span>
          </div>
        </div>

        <div className="space-y-3 text-xs leading-relaxed text-slate-300 max-h-60 overflow-y-auto pr-2 border-y border-slate-800 py-3 font-sans">
          <p>
            En cumplimiento con la <strong>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</strong> y normativas internacionales de privacidad, <strong>AppSwinger</strong> procesa tus datos personales y biométricos bajo los más altos estándares de seguridad:
          </p>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5 font-mono text-[11px]">
            <div className="flex items-start space-x-2">
              <span className="text-cyan-400 font-bold">•</span>
              <span><strong>Finalidad Única:</strong> Autenticación de mayoría de edad (+18) y verificación biométrica contra credencial INE para prevenir suplantaciones y fraudes en la plataforma.</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-cyan-400 font-bold">•</span>
              <span><strong>Cifrado Biocuántico:</strong> Tus vectores faciales y documentos son encriptados mediante redes reticulares post-cuánticas (Kyber-1024 / SHA3-512) sin descifrabilidad por terceros.</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-cyan-400 font-bold">•</span>
              <span><strong>No Comercialización:</strong> Tus datos no son vendidos, transferidos ni compartidos con fines publicitarios.</span>
            </div>
          </div>

          <p className="text-slate-400 text-[11px]">
            Al continuar, autorizas la toma de 3 capturas en tiempo real (INE anverso, INE reverso y selfie con INE en mano) exclusivamente para esta validación.
          </p>
        </div>

        {/* Consent Checkbox */}
        <label className="flex items-start space-x-3 my-4 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hasConsented}
            onChange={e => setHasConsented(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500/30 accent-cyan-500 cursor-pointer"
          />
          <span className="text-xs text-slate-300 font-mono">
            He leído y acepto el tratamiento de mis datos personales y biométricos para la verificación de identidad en AppSwinger.
          </span>
        </label>

        {/* Action Button */}
        <button
          disabled={!hasConsented}
          onClick={onAccept}
          className={`w-full py-3 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-lg ${
            hasConsented
              ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white cursor-pointer shadow-cyan-950'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Comenzar Verificación de Identidad</span>
        </button>
      </div>
    </div>
  );
};
