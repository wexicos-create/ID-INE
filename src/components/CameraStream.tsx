import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, CheckCircle, AlertTriangle, ShieldCheck, Hand, Crosshair } from 'lucide-react';
import { sound } from '../services/audio';

export type CaptureStep = 'front' | 'back' | 'face' | 'completed';

interface CameraStreamProps {
  onCapturesComplete: (captures: { ineFront: string; ineBack: string; liveFace: string }) => void;
  onStepChange?: (step: CaptureStep) => void;
}

export const CameraStream: React.FC<CameraStreamProps> = ({ onCapturesComplete, onStepChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Step state
  const [step, setStep] = useState<CaptureStep>('front');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const [frontCapture, setFrontCapture] = useState<string | null>(null);
  const [backCapture, setBackCapture] = useState<string | null>(null);
  const [faceCapture, setFaceCapture] = useState<string | null>(null);

  // Interim checkmark screen message between steps
  const [interimMessage, setInterimMessage] = useState<{ title: string; subtitle: string; nextStep: CaptureStep } | null>(null);

  // Real-time analysis metrics
  const [luxLevel, setLuxLevel] = useState<'baja' | 'optima' | 'alta'>('optima');
  const [sharpnessScore, setSharpnessScore] = useState(0);
  const [stabilityCounter, setStabilityCounter] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [unreadableTimer, setUnreadableTimer] = useState(0);
  const [fingerOccluded, setFingerOccluded] = useState(false);
  const [focusRipple, setFocusRipple] = useState<{ x: number; y: number } | null>(null);

  const activeStreamRef = useRef<MediaStream | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // Enforce rear camera for step 1 & 2, and selfie camera for step 3
  useEffect(() => {
    if (step === 'front' || step === 'back') {
      setFacingMode('environment');
    } else if (step === 'face') {
      setFacingMode('user');
    }
  }, [step]);

  // Manage Camera Stream with Cancellation & Promise Protection
  useEffect(() => {
    let isCancelled = false;

    const initCamera = async () => {
      try {
        setCameraError(null);

        if (activeStreamRef.current) {
          activeStreamRef.current.getTracks().forEach(t => t.stop());
          activeStreamRef.current = null;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (isCancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        activeStreamRef.current = stream;

        if (videoRef.current) {
          const video = videoRef.current;
          video.srcObject = stream;

          const playVideo = async () => {
            try {
              if (!isCancelled && video.srcObject === stream) {
                await video.play();
              }
            } catch (err: any) {
              if (
                err.name !== 'AbortError' &&
                !err.message?.includes('interrupted') &&
                !err.message?.includes('load request')
              ) {
                console.warn('Video play warning:', err);
              }
            }
          };

          video.onloadedmetadata = () => {
            playVideo();
          };

          if (video.readyState >= 2) {
            playVideo();
          }

          setStreamActive(true);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Error accessing camera:', err);
          if (facingMode === 'environment') {
            setFacingMode('user');
            return;
          }
          setCameraError(
            'No se pudo acceder al sensor óptico de la cámara. Permite el acceso para continuar.'
          );
        }
      }
    };

    initCamera();

    return () => {
      isCancelled = true;
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach(t => t.stop());
        activeStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [facingMode, retryKey]);

  useEffect(() => {
    if (onStepChange) {
      onStepChange(step);
    }
  }, [step, onStepChange]);

  // Capture current frame snapshot
  const takeSnapshot = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.94);
  }, []);

  const handleTapToFocus = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setFocusRipple({ x, y });
    sound.playCountdown(880);
    setUnreadableTimer(0);
    setStabilityCounter(15);
    setTimeout(() => setFocusRipple(null), 900);
  };

  // Real-time Video Frame Edge, Occlusion & Stability Detection Loop
  useEffect(() => {
    let animId: number;
    let lastCountdownTick = 0;

    const analyzeFrame = () => {
      const video = videoRef.current;
      const canvas = hiddenCanvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA && step !== 'completed' && !interimMessage) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvas.width = 160;
          canvas.height = 120;
          ctx.drawImage(video, 0, 0, 160, 120);
          const imgData = ctx.getImageData(0, 0, 160, 120);
          const d = imgData.data;

          // Average brightness & finger occlusion heuristic (dark shadow patches over card center)
          let totalLum = 0;
          let darkPatchCount = 0;
          for (let i = 0; i < d.length; i += 4) {
            const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
            totalLum += lum;
            if (lum < 30) darkPatchCount++;
          }
          const avgLum = totalLum / (d.length / 4);
          if (avgLum < 45) setLuxLevel('baja');
          else if (avgLum > 215) setLuxLevel('alta');
          else setLuxLevel('optima');

          // Finger occlusion detection: if too many dark pixels clustered in center
          setFingerOccluded(darkPatchCount > 3500 && (step === 'front' || step === 'back'));

          // Edge sharpness calculation
          let edgeSum = 0;
          for (let y = 1; y < 119; y += 2) {
            for (let x = 1; x < 159; x += 2) {
              const idx = (y * 160 + x) * 4;
              const right = (y * 160 + (x + 1)) * 4;
              const down = ((y + 1) * 160 + x) * 4;
              edgeSum += Math.abs(d[idx] - d[right]) + Math.abs(d[idx] - d[down]);
            }
          }
          const sharpness = Math.min(100, Math.round((edgeSum / 4800) * 1.8));
          setSharpnessScore(sharpness);

          const isGoodLight = avgLum >= 50 && avgLum <= 210;
          const isSharp = sharpness > 35;

          if (isGoodLight && isSharp && !fingerOccluded) {
            setIsReading(true);
            setUnreadableTimer(0);
            setStabilityCounter(prev => {
              const next = prev + 1;
              if (next > 16) {
                const now = Date.now();
                if (now - lastCountdownTick > 900) {
                  lastCountdownTick = now;
                  setCountdown(cur => {
                    const nextCd = cur === null ? 2 : cur - 1;
                    if (nextCd > 0) {
                      sound.playCountdown(440 + (2 - nextCd) * 160);
                    }
                    if (nextCd <= 0) {
                      // Automatic Photo Capture!
                      sound.playCapture();
                      const snap = takeSnapshot();
                      if (snap) {
                        if (step === 'front') {
                          sound.playSuccess();
                          setFrontCapture(snap);
                          setInterimMessage({
                            title: 'Listo, voltea la INE',
                            subtitle: 'Anverso verificado con éxito. Gira tu credencial para capturar el reverso y el código QR de seguridad.',
                            nextStep: 'back',
                          });
                        } else if (step === 'back') {
                          sound.playSuccess();
                          setBackCapture(snap);
                          setInterimMessage({
                            title: 'Listo, ahora sostén tu INE para una selfie',
                            subtitle: 'No olvides mostrar tu rostro con luz sin gorra, lentes o cualquier obstrucción y deteniendo la INE a la altura del pecho.',
                            nextStep: 'face',
                          });
                        } else if (step === 'face') {
                          sound.playSuccess();
                          setFaceCapture(snap);
                          setStep('completed');
                          if (frontCapture && backCapture) {
                            onCapturesComplete({
                              ineFront: frontCapture,
                              ineBack: backCapture,
                              liveFace: snap,
                            });
                          }
                        }
                      }
                      return null;
                    }
                    return nextCd;
                  });
                }
              }
              return next;
            });
          } else {
            setIsReading(false);
            setStabilityCounter(0);
            setCountdown(null);
            setUnreadableTimer(t => t + 1);
          }
        }
      }
      animId = requestAnimationFrame(analyzeFrame);
    };

    animId = requestAnimationFrame(analyzeFrame);
    return () => cancelAnimationFrame(animId);
  }, [step, frontCapture, backCapture, takeSnapshot, onCapturesComplete, interimMessage, fingerOccluded]);

  const handleProceedFromInterim = () => {
    if (interimMessage) {
      setStep(interimMessage.nextStep);
      setInterimMessage(null);
      setCountdown(null);
      setStabilityCounter(0);
    }
  };

  // Automatically reopen camera for the next step after 2.5s
  useEffect(() => {
    if (!interimMessage) return;
    const timer = setTimeout(() => {
      setStep(interimMessage.nextStep);
      setInterimMessage(null);
      setCountdown(null);
      setStabilityCounter(0);
    }, 2500);
    return () => clearTimeout(timer);
  }, [interimMessage]);

  const handleReset = () => {
    setFrontCapture(null);
    setBackCapture(null);
    setFaceCapture(null);
    setStep('front');
    setFacingMode('environment');
    setInterimMessage(null);
    setStabilityCounter(0);
    setCountdown(null);
    setIsReading(false);
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-900 border border-cyan-500/30 rounded-2xl p-4 shadow-2xl overflow-hidden relative">
      <canvas ref={hiddenCanvasRef} className="hidden" />

      {/* Top Header & Telemetry */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
          <span className="font-mono text-xs font-bold text-slate-100 uppercase tracking-wider">
            APPSWINGER GATEWAY • ANÁLISIS EN TIEMPO REAL
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
            {step === 'face' ? 'Cámara Selfie (Frontal)' : 'Cámara Trasera'}
          </span>
        </div>
      </div>

      {/* Progress Steps Indicators */}
      <div className="grid grid-cols-3 gap-2 my-3">
        <div
          className={`flex items-center space-x-2 px-3 py-2 rounded-xl border text-xs font-mono transition-all ${
            step === 'front'
              ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-md'
              : frontCapture
              ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300'
              : 'bg-slate-950/40 border-slate-800 text-slate-500'
          }`}
        >
          {frontCapture ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <div className="w-4 h-4 rounded-full border border-cyan-400 flex items-center justify-center text-[10px]">1</div>}
          <div className="truncate font-semibold">1. Frente INE</div>
        </div>

        <div
          className={`flex items-center space-x-2 px-3 py-2 rounded-xl border text-xs font-mono transition-all ${
            step === 'back'
              ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-md'
              : backCapture
              ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300'
              : 'bg-slate-950/40 border-slate-800 text-slate-500'
          }`}
        >
          {backCapture ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <div className="w-4 h-4 rounded-full border border-cyan-400 flex items-center justify-center text-[10px]">2</div>}
          <div className="truncate font-semibold">2. Reverso + QR</div>
        </div>

        <div
          className={`flex items-center space-x-2 px-3 py-2 rounded-xl border text-xs font-mono transition-all ${
            step === 'face'
              ? 'bg-purple-950/70 border-purple-400 text-purple-200 shadow-md'
              : faceCapture
              ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300'
              : 'bg-slate-950/40 border-slate-800 text-slate-500'
          }`}
        >
          {faceCapture ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <div className="w-4 h-4 rounded-full border border-purple-400 flex items-center justify-center text-[10px]">3</div>}
          <div className="truncate font-semibold">3. Selfie con INE</div>
        </div>
      </div>

      {/* Main Real-Time Camera Feed Viewport */}
      <div
        onClick={handleTapToFocus}
        className="relative flex-1 w-full min-h-[320px] bg-black rounded-xl overflow-hidden border border-slate-700/60 flex items-center justify-center cursor-crosshair select-none"
      >
        {cameraError ? (
          <div className="p-6 text-center text-rose-400 flex flex-col items-center max-w-md">
            <AlertTriangle className="w-12 h-12 mb-3 text-rose-500" />
            <h4 className="font-bold text-base mb-1 font-mono">SENSOR ÓPTICO BLOQUEADO</h4>
            <p className="text-sm text-slate-300 mb-4">{cameraError}</p>
            <button
              onClick={() => setRetryKey(k => k + 1)}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shadow-lg"
            >
              Habilitar Permiso de Cámara
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />

            {/* Tap to focus ripple */}
            {focusRipple && (
              <div
                className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 w-14 h-14 border-2 border-emerald-400 rounded-lg animate-ping z-30"
                style={{ left: focusRipple.x, top: focusRipple.y }}
              />
            )}

            {/* Target Guides */}
            {step === 'front' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6">
                <div className="w-[85%] max-w-[420px] aspect-[1.58/1] border-2 border-dashed border-cyan-400/80 rounded-2xl relative shadow-[0_0_30px_rgba(34,211,238,0.25)]">
                  <div className="absolute top-2 left-3 bg-black/75 px-2 py-0.5 rounded text-[11px] font-mono text-cyan-300">
                    FRENTE DE LA CREDENCIAL INE
                  </div>
                </div>
              </div>
            )}

            {step === 'back' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6">
                <div className="w-[85%] max-w-[420px] aspect-[1.58/1] border-2 border-dashed border-cyan-400/80 rounded-2xl relative shadow-[0_0_30px_rgba(34,211,238,0.25)]">
                  <div className="absolute top-2 left-3 bg-black/75 px-2 py-0.5 rounded text-[11px] font-mono text-cyan-300">
                    REVERSO INE • ESCANEO DE CÓDIGO QR Y OCR
                  </div>
                </div>
              </div>
            )}

            {step === 'face' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                <div className="w-full max-w-[440px] flex items-center justify-around">
                  <div className="w-44 h-56 border-2 border-purple-400 rounded-[50%] relative shadow-[0_0_25px_rgba(168,85,247,0.3)] flex flex-col items-center justify-between p-2">
                    <span className="bg-black/75 px-2 py-0.5 rounded text-[10px] font-mono text-purple-300 mt-2">
                      ROSTRO VIVO
                    </span>
                  </div>
                  <div className="w-32 h-44 border-2 border-dashed border-cyan-400/80 rounded-xl relative shadow-[0_0_20px_rgba(34,211,238,0.25)] flex flex-col items-center justify-between p-2">
                    <span className="bg-black/75 px-1.5 py-0.5 rounded text-[9px] font-mono text-cyan-300 text-center">
                      INE EN MANO
                    </span>
                    <Hand className="w-6 h-6 text-cyan-400/60 my-auto" />
                  </div>
                </div>
              </div>
            )}

            {/* Finger Occlusion Warning Alert */}
            {fingerOccluded && (
              <div className="absolute top-16 inset-x-4 flex justify-center pointer-events-none z-30 animate-bounce">
                <div className="bg-rose-950/95 border-2 border-rose-500 text-rose-200 px-4 py-2 rounded-xl text-xs font-mono font-bold shadow-2xl flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
                  <span>¡Alerta! Dedos cubriendo datos críticos de la INE. Reposiciona tus dedos.</span>
                </div>
              </div>
            )}

            {/* Dynamic Instructions Banner (Auto-dismissing when reading) */}
            {!isReading && countdown === null && !fingerOccluded && (
              <div className="absolute top-4 inset-x-4 flex justify-center pointer-events-none z-20 animate-fade-in">
                <div className="bg-slate-950/90 border border-cyan-500/40 text-cyan-200 px-4 py-2 rounded-xl text-xs font-mono font-medium shadow-xl flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>
                    {step === 'front' && 'Muestra el anverso de tu INE. Validando tamaño y reflejos...'}
                    {step === 'back' && 'Muestra el reverso de tu INE. Escaneando QR y tramas de seguridad...'}
                    {step === 'face' && 'Sostén tu INE a la altura del pecho y mira al frente sin gorra ni lentes.'}
                  </span>
                </div>
              </div>
            )}

            {/* Tap to focus prompt if unreadable */}
            {!isReading && countdown === null && unreadableTimer > 40 && !fingerOccluded && (
              <div className="absolute bottom-12 inset-x-4 flex justify-center pointer-events-none z-20 animate-bounce">
                <div className="bg-amber-950/90 border border-amber-500/70 text-amber-200 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold shadow-2xl flex items-center space-x-2">
                  <Crosshair className="w-4 h-4 text-amber-400" />
                  <span>Toca la pantalla para enfocar</span>
                </div>
              </div>
            )}

            {/* 2-Second Countdown when read successfully */}
            {countdown !== null && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-xs z-30 animate-fade-in">
                <div className="bg-emerald-950/90 border border-emerald-500 px-5 py-2 rounded-2xl mb-4 shadow-[0_0_30px_rgba(52,211,153,0.5)]">
                  <span className="text-sm font-mono font-extrabold text-emerald-300 tracking-wider uppercase">
                    ¡IDENTIFICACIÓN VÁLIDA DETECTADA! NO TE MUEVAS
                  </span>
                </div>

                <div className="w-24 h-24 rounded-full border-4 border-emerald-400 flex items-center justify-center shadow-[0_0_30px_#34d399] bg-slate-950/80">
                  <span className="text-5xl font-mono font-black text-emerald-400 animate-ping">
                    {countdown}
                  </span>
                </div>
                <span className="mt-3 text-xs font-mono tracking-widest text-emerald-200 uppercase font-bold">
                  CAPTURANDO EN 2 SEGUNDOS
                </span>
              </div>
            )}

            {/* INTERIM CHECKMARK MODAL SCREEN ("Listo, voltea la INE" / "Listo, ahora sostén tu INE...") */}
            {interimMessage && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/92 backdrop-blur-md z-40 p-6 animate-fade-in text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_35px_rgba(52,211,153,0.6)] mb-4">
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                </div>

                <h3 className="text-xl font-mono font-bold text-white mb-2">
                  {interimMessage.title}
                </h3>
                <p className="text-xs text-slate-300 max-w-md mb-6 leading-relaxed">
                  {interimMessage.subtitle}
                </p>

                <button
                  onClick={handleProceedFromInterim}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-xl text-xs font-mono font-bold shadow-lg shadow-emerald-950 cursor-pointer transition-all flex items-center space-x-2"
                >
                  <span>Continuar con la Cámara</span>
                </button>
                <div className="mt-4 flex items-center space-x-2 text-[11px] font-mono text-slate-400">
                  <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 animate-[pulse_1s_infinite] w-full" />
                  </div>
                  <span>Abriendo cámara automáticamente...</span>
                </div>
              </div>
            )}

            {/* Live Sensor Metrics Ribbon */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
              <div className="bg-slate-950/85 border border-slate-700/80 px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-300 flex items-center space-x-2">
                <span className="text-cyan-400 font-bold">LUZ:</span>
                <span className={luxLevel === 'optima' ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                  {luxLevel.toUpperCase()}
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-cyan-400 font-bold">ANÁLISIS QR:</span>
                <span className="text-emerald-400 font-semibold">ACTIVO</span>
              </div>

              <div className="bg-slate-950/85 border border-slate-700/80 px-2.5 py-1 rounded-md text-[11px] font-mono text-cyan-300">
                DISPARO: <span className="text-emerald-400 font-bold">2 SEG</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Captured Thumbnails Strip */}
      <div className="mt-3 p-3 bg-slate-950/90 border border-slate-800 rounded-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-950/80 border border-cyan-500/40 rounded-lg text-cyan-400">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-slate-200">
              {step === 'front' && 'Paso 1 de 3: Frente de INE (Cámara trasera)'}
              {step === 'back' && 'Paso 2 de 3: Reverso INE + Código QR (Cámara trasera)'}
              {step === 'face' && 'Paso 3 de 3: Selfie con INE en mano (Cámara frontal)'}
              {step === 'completed' && 'Capturas completadas. Ejecutando análisis forense en milisegundos...'}
            </div>
            <div className="text-[11px] text-slate-400">
              Captura automática al detectar identificación real sin reflejos ni oclusión de dedos.
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {frontCapture && <img src={frontCapture} alt="Frente" className="w-10 h-7 object-cover rounded border border-cyan-500/60" />}
          {backCapture && <img src={backCapture} alt="Reverso" className="w-10 h-7 object-cover rounded border border-cyan-500/60" />}
          {faceCapture && <img src={faceCapture} alt="Selfie" className="w-8 h-8 object-cover rounded-full border border-purple-500/60" />}

          {(frontCapture || backCapture || faceCapture) && (
            <button
              onClick={handleReset}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono border border-slate-700 transition-colors"
              title="Reiniciar capturas"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
