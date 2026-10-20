import React, { useState } from 'react';
import { X, Code, Key, Webhook, Copy, Check, Terminal, ExternalLink, ShieldCheck } from 'lucide-react';

interface ApiIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiIntegrationModal: React.FC<ApiIntegrationModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'keys' | 'webhook' | 'snippet' | 'simulator'>('keys');
  const [copied, setCopied] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState('cliente@tiendaonline.com');
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  if (!isOpen) return null;

  const apiKey = 'asw_live_qnt9982736450192837465019283';
  const webhookUrl = `${window.location.origin}/api/webhook/store-verify`;

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopied(keyId);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleTestWebhook = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/webhook/store-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          storeEvent: 'identity_verified',
          customerEmail: testEmail,
          verificationResult: 'approved',
          curp: 'CURP900101HDFR00',
          fullName: 'MARIA FERNANDA LOPEZ',
          timestamp: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ error: err.message || 'Error en prueba de webhook' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-950 border border-cyan-500/50 rounded-xl text-cyan-400">
              <Webhook className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-mono text-cyan-300">
                API & WEBHOOK INTEGRATION HUB
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Conecta AppSwinger Gateway a Shopify, WooCommerce, Magento o Sitios Web Externos
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

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab('keys')}
            className={`py-3 px-4 font-semibold border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'keys' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>API Keys & Credenciales</span>
          </button>

          <button
            onClick={() => setActiveTab('webhook')}
            className={`py-3 px-4 font-semibold border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'webhook' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Webhook className="w-3.5 h-3.5" />
            <span>URL de Webhook</span>
          </button>

          <button
            onClick={() => setActiveTab('snippet')}
            className={`py-3 px-4 font-semibold border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'snippet' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Widget Embed HTML</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`py-3 px-4 font-semibold border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'simulator' ? 'border-purple-400 text-purple-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Simulador API Store</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs font-mono">
          {activeTab === 'keys' && (
            <div className="space-y-4">
              <div className="p-4 bg-cyan-950/40 border border-cyan-500/30 rounded-xl space-y-2">
                <span className="text-cyan-300 font-bold block">Bearer Token de Producción (API Key)</span>
                <p className="text-slate-300 text-[11px] font-sans">
                  Utiliza este token en las cabeceras HTTP <code className="text-cyan-300">Authorization: Bearer &lt;API_KEY&gt;</code> desde tu servidor de comercio electrónico para validar identidades y consultar estados de verificación.
                </p>
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    readOnly
                    value={apiKey}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-cyan-200 font-mono text-xs select-all"
                  />
                  <button
                    onClick={() => copyToClipboard(apiKey, 'apiKey')}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold flex items-center space-x-1 transition-all cursor-pointer whitespace-nowrap"
                  >
                    {copied === 'apiKey' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copied === 'apiKey' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <span className="text-slate-300 font-bold block">Endpoints de la API REST</span>
                <div className="space-y-1.5 text-[11px] text-slate-400 font-mono">
                  <div className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center justify-between">
                    <span><strong className="text-emerald-400">POST</strong> /api/v1/verify</span>
                    <span className="text-slate-500">Enviar capturas para validación</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center justify-between">
                    <span><strong className="text-cyan-400">GET</strong> /api/v1/status/:id</span>
                    <span className="text-slate-500">Consultar estado aprobado/rechazado</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'webhook' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <span className="text-cyan-300 font-bold block">URL de Webhook para Tienda en Línea</span>
                <p className="text-slate-300 text-[11px] font-sans">
                  Configura esta URL en tu tienda (Shopify / WooCommerce / Custom) para recibir notificaciones automáticas cuando un cliente complete su verificación INE + Selfie (+18).
                </p>
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    readOnly
                    value={webhookUrl}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-cyan-200 font-mono text-xs select-all"
                  />
                  <button
                    onClick={() => copyToClipboard(webhookUrl, 'webhook')}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold flex items-center space-x-1 transition-all cursor-pointer whitespace-nowrap"
                  >
                    {copied === 'webhook' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copied === 'webhook' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'snippet' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <span className="text-cyan-300 font-bold block">Código de Inserción HTML (Iframe / Widget)</span>
                <p className="text-slate-300 text-[11px] font-sans">
                  Pega este fragmento de código en la página de checkout o registro de tu tienda en línea para abrir la pasarela de verificación AppSwinger:
                </p>
                <div className="relative">
                  <pre className="p-3 bg-slate-900 rounded-lg text-[11px] text-cyan-200 overflow-x-auto border border-slate-800 select-all font-mono">
{`<div id="appswinger-verification-gateway"></div>
<script src="${window.location.origin}/gateway-widget.js" 
        data-api-key="asw_live_qnt998" 
        data-redirect-url="/checkout/success">
</script>`}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(`<div id="appswinger-verification-gateway"></div>\n<script src="${window.location.origin}/gateway-widget.js" data-api-key="asw_live_qnt998"></script>`, 'snippet')}
                    className="absolute top-2 right-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-bold"
                  >
                    {copied === 'snippet' ? 'Copiado' : 'Copiar Snippet'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'simulator' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-950/30 border border-purple-500/40 rounded-xl space-y-3">
                <span className="text-purple-300 font-bold block">Simulador de Conexión Webhook</span>
                <p className="text-slate-300 text-[11px] font-sans">
                  Prueba el envío de un evento de verificación aprobado directamente hacia los servidores de tu tienda en línea simulada.
                </p>

                <div className="space-y-2">
                  <label className="text-[11px] text-slate-400 block">Correo Electrónico del Cliente en Tienda:</label>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={e => setTestEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs"
                  />
                </div>

                <button
                  disabled={testing}
                  onClick={handleTestWebhook}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-mono font-bold shadow-lg transition-all cursor-pointer flex items-center space-x-2"
                >
                  <Terminal className="w-4 h-4" />
                  <span>{testing ? 'Enviando Webhook...' : 'Enviar POST Webhook de Prueba'}</span>
                </button>

                {testResult && (
                  <div className="mt-3 p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                    <pre>{JSON.stringify(testResult, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
