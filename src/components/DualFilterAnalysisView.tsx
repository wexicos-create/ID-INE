import React from 'react';
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Cpu,
  Zap,
  Lock,
  Binary,
  Layers,
  FileCheck,
  KeyRound,
  Download,
  AlertOctagon,
} from 'lucide-react';

interface Filter1Result {
  passed: boolean;
  confidenceScore: number;
  ineFrontDetected: boolean;
  ineBackDetected: boolean;
  liveFaceDetected: boolean;
  detectedName: string;
  detectedCurp: string;
  detectedClaveElector: string;
  qualityScore: number;
  observations: string;
}

interface Filter2Result {
  certified: boolean;
  outcome?: 'approved' | 'pending_admin_review' | 'annulled';
  processAnnulled?: boolean;
  annulmentReason?: string;
  facesAndDocMatch?: boolean;
  idInHandConfirmed?: boolean;
  marginOfErrorPercent: number;
  biometricMatchScore: number;
  livenessScore: number;
  ineAuthenticityScore: number;
  forensicDetails: {
    guillochePatternValid?: boolean;
    microtextIntegrity?: boolean;
    ghostPhotoVerified?: boolean;
    screenMoirDetectFree?: boolean;
    paperCopyTamperFree?: boolean;
    ocrCurpCrossCheckPassed?: boolean;
    skinMicroTextureReal?: boolean;
    deepfakeArtifactFree?: boolean;
    liveHoldingCardVerified?: boolean;
  };
  extractedData: {
    fullName: string;
    curp: string;
    claveElector: string;
    ineModel: string;
    vigencia: string;
    isAdult18Plus?: boolean;
  };
  verdictTitle?: string;
  statusMessage?: string;
  forensicConclusion: string;
  riskFlags?: string[];
}

interface QuantumSeal {
  algorithm: string;
  quantumHash: string;
  latticeKeyId: string;
  zkpVerificationToken: string;
  entropyBits: number;
  isUndecryptableByShorAlgorithm: boolean;
  tamperProofChecksum: string;
  timestamp: string;
}

interface DualFilterProps {
  filter1Data: { result: Filter1Result; durationMs: number } | null;
  filter2Data: { result: Filter2Result; durationMs: number; modelUsed: string } | null;
  quantumSeal: QuantumSeal | null;
  loadingFilter1: boolean;
  loadingFilter2: boolean;
  loadingQuantum: boolean;
  onOpenVault: () => void;
  onReset: () => void;
}

export const DualFilterAnalysisView: React.FC<DualFilterProps> = ({
  filter1Data,
  filter2Data,
  quantumSeal,
  loadingFilter1,
  loadingFilter2,
  loadingQuantum,
  onOpenVault,
  onReset,
}) => {
  return (
    <div className="w-full space-y-6">
      {/* Title & Pipeline Banner */}
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                PIPELINE DUAL DE IA
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                SIN MARGEN DE ERROR
              </span>
            </div>
            <h2 className="text-xl font-bold font-mono text-slate-100">
              Escrutinio Biométrico y Forense INE
            </h2>
            <p className="text-xs text-slate-400">
              Validación en dos etapas: Pre-filtro de alta velocidad + Escrutinio pixel a pixel a máxima capacidad.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {quantumSeal && (
              <button
                onClick={onOpenVault}
                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white rounded-xl text-xs font-mono font-bold shadow-lg shadow-cyan-950 cursor-pointer transition-all"
              >
                <Lock className="w-4 h-4" />
                <span>Bóveda Biocuántica</span>
              </button>
            )}
            <button
              onClick={onReset}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono border border-slate-700 transition-colors"
            >
              Nuevo Escaneo
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Filter 1 vs Filter 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ======================= FILTRO 1: NORMAL / RÁPIDO ======================= */}
        <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-cyan-950 border border-cyan-500/40 rounded-xl text-cyan-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-mono text-sm font-bold text-cyan-300">
                    FILTRO 1: Pre-Validación Normal
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    gemini-3.1-flash-lite • Baja Latencia
                  </span>
                </div>
              </div>

              {loadingFilter1 ? (
                <span className="text-xs font-mono text-cyan-400 font-semibold animate-pulse">
                  Analizando...
                </span>
              ) : filter1Data?.result.passed ? (
                <div className="flex items-center space-x-1.5 text-xs font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>PRE-APROBADO</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 text-xs font-mono text-rose-400 font-bold bg-rose-950/60 border border-rose-500/40 px-2.5 py-1 rounded-lg">
                  <XCircle className="w-4 h-4" />
                  <span>OBSERVACIONES</span>
                </div>
              )}
            </div>

            {loadingFilter1 ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-mono text-slate-400">
                  Verificando estructura geométrica y rostros en milisegundos...
                </p>
              </div>
            ) : filter1Data ? (
              <div className="space-y-4">
                {/* Confidence Bar */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Confianza Estructural:</span>
                    <span className="text-cyan-300 font-bold">
                      {filter1Data.result.confidenceScore}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-cyan-400 rounded-full transition-all duration-700"
                      style={{ width: `${filter1Data.result.confidenceScore}%` }}
                    />
                  </div>
                </div>

                {/* Checklist */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
                    <span className="text-slate-400">INE Anverso:</span>
                    {filter1Data.result.ineFrontDetected ? (
                      <span className="text-emerald-400 font-bold">DETECTADA</span>
                    ) : (
                      <span className="text-rose-400 font-bold">NO DETECTADA</span>
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
                    <span className="text-slate-400">INE Reverso:</span>
                    {filter1Data.result.ineBackDetected ? (
                      <span className="text-emerald-400 font-bold">DETECTADA</span>
                    ) : (
                      <span className="text-rose-400 font-bold">NO DETECTADA</span>
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
                    <span className="text-slate-400">Rostro Vivo:</span>
                    {filter1Data.result.liveFaceDetected ? (
                      <span className="text-emerald-400 font-bold">DETECTADO</span>
                    ) : (
                      <span className="text-rose-400 font-bold">NO DETECTADO</span>
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
                    <span className="text-slate-400">Calidad Óptica:</span>
                    <span className="text-cyan-400 font-bold">
                      {filter1Data.result.qualityScore}%
                    </span>
                  </div>
                </div>

                {/* Observations */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300">
                  <span className="font-mono text-cyan-400 font-bold block mb-1">
                    Dictamen Filtro 1:
                  </span>
                  {filter1Data.result.observations}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs font-mono text-slate-500">
                Esperando capturas automáticas...
              </div>
            )}
          </div>

          {filter1Data && (
            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-[11px] font-mono text-slate-400">
              <span>Tiempo de ejecución:</span>
              <span className="text-cyan-300 font-bold">{filter1Data.durationMs} ms</span>
            </div>
          )}
        </div>

        {/* ======================= FILTRO 2: PIXEL-A-PIXEL FORENSE ======================= */}
        <div className="bg-slate-900/90 border border-purple-500/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-purple-950 border border-purple-500/40 rounded-xl text-purple-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-mono text-sm font-bold text-purple-300">
                    FILTRO 2: Escrutinio Pixel a Pixel
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    gemini-4-argon • ThinkingLevel.HIGH (Forense)
                  </span>
                </div>
              </div>

              {loadingFilter2 ? (
                <span className="text-xs font-mono text-purple-400 font-semibold animate-pulse">
                  Escrutinio Profundo...
                </span>
              ) : filter2Data?.result.certified ? (
                <div className="flex items-center space-x-1.5 text-xs font-mono text-emerald-400 font-bold bg-emerald-950/70 border border-emerald-500 px-2.5 py-1 rounded-lg">
                  <ShieldCheck className="w-4 h-4" />
                  <span>CERTIFICADO 100%</span>
                </div>
              ) : filter2Data ? (
                <div className="flex items-center space-x-1.5 text-xs font-mono text-rose-400 font-bold bg-rose-950/70 border border-rose-500 px-2.5 py-1 rounded-lg">
                  <AlertOctagon className="w-4 h-4" />
                  <span>DISCREPANCIA</span>
                </div>
              ) : null}
            </div>

            {loadingFilter2 ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-mono text-slate-300 text-center max-w-sm">
                  Examinando tramas Guilloche, microtexto, foto fantasma UV y vectores biométricos 1:1 sin margen de error...
                </p>
              </div>
            ) : filter2Data ? (
              <div className="space-y-4">
                {/* Zero Error Margin Ribbon */}
                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="p-2 bg-slate-950 border border-emerald-500/40 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">MARGEN DE ERROR</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {filter2Data.result.marginOfErrorPercent.toFixed(2)}%
                    </span>
                  </div>

                  <div className="p-2 bg-slate-950 border border-cyan-500/40 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">MATCH FACIAL 1:1</span>
                    <span className="text-lg font-bold text-cyan-300">
                      {filter2Data.result.biometricMatchScore.toFixed(1)}%
                    </span>
                  </div>

                  <div className="p-2 bg-slate-950 border border-purple-500/40 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">PRUEBA DE VIDA</span>
                    <span className="text-lg font-bold text-purple-300">
                      {filter2Data.result.livenessScore.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Forensic Check Matrix */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
                    <span className="text-slate-400">Microtexto Guilloche:</span>
                    <span className={filter2Data.result.forensicDetails.guillochePatternValid ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {filter2Data.result.forensicDetails.guillochePatternValid ? 'VÁLIDO' : 'ANÓMALO'}
                    </span>
                  </div>

                  <div className="p-2 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
                    <span className="text-slate-400">Foto Fantasma UV:</span>
                    <span className={filter2Data.result.forensicDetails.ghostPhotoVerified ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {filter2Data.result.forensicDetails.ghostPhotoVerified ? 'VERIFICADA' : 'FALSA'}
                    </span>
                  </div>

                  <div className="p-2 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
                    <span className="text-slate-400">Anti-Pantalla (Moiré):</span>
                    <span className={filter2Data.result.forensicDetails.screenMoirDetectFree ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {filter2Data.result.forensicDetails.screenMoirDetectFree ? 'FÍSICA REAL' : 'PANTALLA'}
                    </span>
                  </div>

                  <div className="p-2 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
                    <span className="text-slate-400">Cruce OCR vs CURP:</span>
                    <span className={filter2Data.result.forensicDetails.ocrCurpCrossCheckPassed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {filter2Data.result.forensicDetails.ocrCurpCrossCheckPassed ? 'CONSISTENTE' : 'ERROR'}
                    </span>
                  </div>

                  <div className="p-2 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
                    <span className="text-slate-400">Microvascularidad Cutánea:</span>
                    <span className={filter2Data.result.forensicDetails.skinMicroTextureReal ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {filter2Data.result.forensicDetails.skinMicroTextureReal ? 'HUMANO VIVO' : 'MÁSCARA'}
                    </span>
                  </div>

                  <div className="p-2 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
                    <span className="text-slate-400">Anti-Deepfake:</span>
                    <span className={filter2Data.result.forensicDetails.deepfakeArtifactFree ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {filter2Data.result.forensicDetails.deepfakeArtifactFree ? 'AUTÉNTICO' : 'SINTÉTICO'}
                    </span>
                  </div>
                </div>

                {/* Extracted Validated Identity Card */}
                <div className="p-3 bg-gradient-to-br from-slate-950 to-slate-900 border border-purple-500/30 rounded-xl text-xs font-mono space-y-1">
                  <div className="text-purple-300 font-bold text-sm">
                    {filter2Data.result.extractedData.fullName || 'TITULAR VERIFICADO'}
                  </div>
                  <div className="text-slate-400 text-[11px] grid grid-cols-2 gap-1 pt-1">
                    <div>CURP: <span className="text-slate-200">{filter2Data.result.extractedData.curp}</span></div>
                    <div>CLAVE: <span className="text-slate-200">{filter2Data.result.extractedData.claveElector}</span></div>
                    <div>MODELO: <span className="text-slate-200">{filter2Data.result.extractedData.ineModel}</span></div>
                    <div>VIGENCIA: <span className="text-slate-200">{filter2Data.result.extractedData.vigencia}</span></div>
                  </div>
                </div>

                {/* Conclusion */}
                <p className="text-xs text-slate-300 italic">
                  "{filter2Data.result.forensicConclusion}"
                </p>
              </div>
            ) : (
              <div className="py-8 text-center text-xs font-mono text-slate-500">
                Se ejecutará tras el paso del Filtro 1.
              </div>
            )}
          </div>

          {filter2Data && (
            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-[11px] font-mono text-slate-400">
              <span>Modelo: <strong className="text-purple-300">{filter2Data.modelUsed}</strong></span>
              <span>Tiempo: <strong className="text-purple-300">{filter2Data.durationMs} ms</strong></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
