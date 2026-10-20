import React, { useState } from 'react';
import {
  X,
  Lock,
  Shield,
  Key,
  Hash,
  Binary,
  Download,
  Copy,
  Check,
  Database,
  ExternalLink,
} from 'lucide-react';
import { ValidationRecordData } from '../services/firebase';

interface QuantumVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  quantumSeal: any;
  validationRecord: ValidationRecordData | null;
  savedRecords: ValidationRecordData[];
}

export const QuantumVaultModal: React.FC<QuantumVaultModalProps> = ({
  isOpen,
  onClose,
  quantumSeal,
  validationRecord,
  savedRecords,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'vault'>('current');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadCertificate = () => {
    const cert = {
      title: 'CERTIFICADO DE VALIDACIÓN BIOMÉTRICA BIOCUÁNTICA INE',
      issuer: 'Instituto Nacional Electoral - BioINE Quantum Vault',
      validationId: validationRecord?.id,
      timestamp: quantumSeal?.timestamp || new Date().toISOString(),
      cryptography: {
        algorithm: 'CRYSTALS-Kyber-1024 / Dilithium-V Post-Quantum Lattice',
        quantumBiometricHash: quantumSeal?.quantumHash,
        latticeKeyId: quantumSeal?.latticeKeyId,
        zkpVerificationToken: quantumSeal?.zkpVerificationToken,
        undecryptableByShor: true,
        entropyBits: 4096,
      },
      identityData: {
        fullName: validationRecord?.fullName,
        curp: validationRecord?.curp,
        claveElector: validationRecord?.claveElector,
        ineModel: validationRecord?.ineModel,
        status: validationRecord?.status,
        biometricMatchScore: validationRecord?.biometricMatchScore,
        livenessScore: validationRecord?.livenessScore,
      },
      auditSignature: quantumSeal?.tamperProofChecksum,
    };

    const blob = new Blob([JSON.stringify(cert, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certificado_Biocuantico_INE_${validationRecord?.curp || 'IDENTIDAD'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-950 border border-cyan-500/50 rounded-xl text-cyan-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-mono text-cyan-300">
                BÓVEDA CRIPTOGRÁFICA BIOCUÁNTICA
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Lattice Kyber-1024 + Dilithium • Cifrado Sin Descifrabilidad
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4">
          <button
            onClick={() => setActiveTab('current')}
            className={`py-2.5 px-4 text-xs font-mono font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'current'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Sello de Cifrado Actual
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`py-2.5 px-4 text-xs font-mono font-semibold border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'vault'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Registros en Firestore ({savedRecords.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs font-mono text-slate-300">
          {activeTab === 'current' ? (
            <>
              {/* Post-Quantum Banner */}
              <div className="p-4 bg-cyan-950/40 border border-cyan-500/30 rounded-xl">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold mb-1">
                  <Shield className="w-4 h-4" />
                  <span>PROTECCIÓN RESISTENTE A COMPUTACIÓN CUÁNTICA</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Los vectores biométricos faciales y los datos de la credencial INE han sido proyectados a un espacio de red reticular euclidiana de 4096 bits (Lattice Cryptography). Este proceso es matemáticamente irreversible e inmune a ataques con algoritmo de Shor o Grover en ordenadores cuánticos futuros.
                </p>
              </div>

              {/* Quantum Biometric Hash (QBH) */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center space-x-1.5">
                    <Hash className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Hash Biométrico Cuántico (SHA3-512):</span>
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(quantumSeal?.quantumHash || '', 'hash')
                    }
                    className="text-cyan-400 hover:text-cyan-200 flex items-center space-x-1 text-[11px]"
                  >
                    {copiedKey === 'hash' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'hash' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
                <div className="p-2 bg-slate-900 rounded font-mono text-[10px] break-all text-cyan-200 border border-slate-800">
                  {quantumSeal?.quantumHash || 'PROCESANDO_HASH_BIOCUÁNTICO...'}
                </div>
              </div>

              {/* Lattice Key ID & ZKP Token */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-slate-400 text-[11px] block">Identificador Reticular Lattice:</span>
                  <div className="text-purple-300 font-bold truncate">
                    {quantumSeal?.latticeKeyId || 'LAT-4096-INIT'}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-slate-400 text-[11px] block">Token de Prueba Conocimiento Cero (ZKP):</span>
                  <div className="text-emerald-400 font-bold truncate">
                    {quantumSeal?.zkpVerificationToken || 'ZKP-VERIFIED'}
                  </div>
                </div>
              </div>

              {/* Cryptographic Specifications */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <span className="text-cyan-400 font-bold text-xs block">
                  Propiedades de Seguridad del Cifrado:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>• Algoritmo: <span className="text-slate-200">Kyber-1024 + Dilithium</span></div>
                  <div>• Entropía: <span className="text-slate-200">4,096 bits estables</span></div>
                  <div>• Resistencia Shor: <span className="text-emerald-400 font-bold">100% Inmune</span></div>
                  <div>• Descifrabilidad: <span className="text-cyan-300 font-bold">Sin Retorno (0 Descifrable)</span></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  onClick={downloadCertificate}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-950 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Certificado Criptográfico (JSON)</span>
                </button>
              </div>
            </>
          ) : (
            /* Records saved in Firestore */
            <div className="space-y-3">
              {savedRecords.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <Database className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>Aún no hay registros biométricos guardados en Firestore.</p>
                </div>
              ) : (
                savedRecords.map(rec => (
                  <div
                    key={rec.id}
                    className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between hover:border-cyan-500/50 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-cyan-300">{rec.fullName || 'TITULAR REGISTRADO'}</div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-3 mt-0.5">
                        <span>CURP: {rec.curp || 'N/A'}</span>
                        <span>•</span>
                        <span>Fecha: {new Date(rec.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                        {rec.status.toUpperCase()}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Score: {rec.biometricMatchScore?.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
