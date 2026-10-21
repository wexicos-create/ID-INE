import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT) || 3000;

// The demo does not accept ID images, bank records, or sensitive payloads on the server.
app.disable('x-powered-by');
app.use(express.json({ limit: '64kb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    service: 'ID-INE / ValidaDepósito demo',
    mode: 'frontend-prototype',
    identityVerification: 'not-connected',
    bankReconciliation: 'not-connected',
  });
});

// Retire the former simulated approval endpoints. They must not return fake identity results.
app.all(['/api/validate/filter1', '/api/validate/filter2', '/api/crypto/quantum-seal'], (_req, res) => {
  res.status(410).json({
    error: 'Este endpoint de demostración fue retirado.',
    code: 'SIMULATED_VERIFICATION_DISABLED',
    message: 'No se realiza autenticación de identidad, prueba de vida, comparación facial ni validación de INE en este servidor.',
  });
});

app.all('/api/*', (_req, res) => {
  res.status(501).json({
    error: 'API no implementada',
    message: 'Esta versión es una demostración de interfaz. No se reciben depósitos ni documentos reales.',
  });
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ID-INE demo] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start ID-INE demo server:', error);
  process.exitCode = 1;
});
