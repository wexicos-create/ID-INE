import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, XCircle, Clock, User, FileText, Check, AlertTriangle } from 'lucide-react';
import { ValidationRecordData, db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { sound } from '../services/audio';

interface AdminReviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
  records: ValidationRecordData[];
  onRecordUpdated: () => void;
}

export const AdminReviewPanel: React.FC<AdminReviewPanelProps> = ({
  isOpen,
  onClose,
  records,
  onRecordUpdated,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'flagged' | 'approved' | 'rejected'>('flagged');
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter records
  const filteredRecords = records.filter(r => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'flagged') return r.status === 'flagged';
    if (filterStatus === 'approved') return r.status === 'approved';
    if (filterStatus === 'rejected') return r.status === 'rejected';
    return true;
  });

  const handleUpdateStatus = async (recordId: string, newStatus: 'approved' | 'rejected') => {
    setProcessingId(recordId);
    try {
      const docRef = doc(db, 'validations', recordId);
      await updateDoc(docRef, { status: newStatus });
      sound.playSuccess();
      onRecordUpdated();
    } catch (err) {
      console.error('Error updating validation status in Firestore:', err);
      // Fallback local update if offline or permission restricted
      const target = records.find(r => r.id === recordId);
      if (target) {
        target.status = newStatus;
        sound.playSuccess();
        onRecordUpdated();
      }
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-200 font-mono">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-950 border border-purple-500/50 rounded-xl text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-purple-300">
                PANEL DE ADMINISTRACIÓN • REVISIÓN MANUAL
              </h3>
              <p className="text-xs text-slate-400">
                Gestión y aprobación de expedientes biométricos marcados como pendientes o en revisión
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

        {/* Filter Toolbar */}
        <div className="flex items-center justify-between p-4 bg-slate-950/60 border-b border-slate-800 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Filtrar estado:</span>
            <button
              onClick={() => setFilterStatus('flagged')}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                filterStatus === 'flagged' ? 'bg-amber-950/80 border-amber-400 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              Pendientes / Flagged ({records.filter(r => r.status === 'flagged').length})
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                filterStatus === 'approved' ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              Aprobados ({records.filter(r => r.status === 'approved').length})
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                filterStatus === 'all' ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              Todos ({records.length})
            </button>
          </div>

          <span className="text-slate-400 text-[11px]">
            Mostrando {filteredRecords.length} registros
          </span>
        </div>

        {/* Records List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {filteredRecords.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <Clock className="w-10 h-10 mx-auto opacity-40 text-purple-400" />
              <p>No hay registros que coincidan con el filtro seleccionado.</p>
            </div>
          ) : (
            filteredRecords.map(rec => (
              <div
                key={rec.id}
                className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-purple-500/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-cyan-300 font-bold text-sm">{rec.fullName || 'TITULAR VERIFICADO'}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        rec.status === 'approved'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-500/50'
                          : rec.status === 'flagged'
                          ? 'bg-amber-950 text-amber-400 border-amber-500/50'
                          : 'bg-rose-950 text-rose-400 border-rose-500/50'
                      }`}
                    >
                      {rec.status === 'flagged' ? 'Pendiente / Flagged' : rec.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                    <span>CURP: <strong className="text-slate-200">{rec.curp || 'N/A'}</strong></span>
                    <span>Clave Elector: <strong className="text-slate-200">{rec.claveElector || 'N/A'}</strong></span>
                    <span>Match: <strong className="text-emerald-400">{rec.biometricMatchScore?.toFixed(1)}%</strong></span>
                    <span>Fecha: {new Date(rec.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                  {rec.status !== 'approved' && (
                    <button
                      disabled={processingId === rec.id}
                      onClick={() => handleUpdateStatus(rec.id, 'approved')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-950 flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Aprobar</span>
                    </button>
                  )}

                  {rec.status !== 'rejected' && (
                    <button
                      disabled={processingId === rec.id}
                      onClick={() => handleUpdateStatus(rec.id, 'rejected')}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-rose-950 flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Rechazar</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
