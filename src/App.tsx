/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  Wind, 
  Zap,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Check
} from 'lucide-react';
import { View, AnalysisResult, Aroma } from './types';
import { AROMAS_LIST } from './constants';
import { analyzeMoodFromAudio } from './services/geminiService';

// --- Components ---

const Header = () => (
  <header className="sticky top-0 z-50 w-full px-8 py-6 glass flex items-center justify-between">
    <div className="w-8 h-8 rounded-full bg-lavender/10 flex items-center justify-center text-lavender">
      <Sparkles size={18} />
    </div>
    <h1 className="font-serif italic tracking-[0.3em] text-lg text-lavender uppercase font-light">
      Santuário
    </h1>
    <div className="w-8" />
  </header>
);

// --- Views ---

const HomeView = ({ onStart }: { onStart: () => void }) => (
  <div className="flex flex-col items-center justify-center h-full text-center px-6">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12"
    >
      <h2 className="font-serif text-5xl mb-4">Bom dia.</h2>
      <p className="text-gray-500 font-light text-lg">Como você está se sentindo hoje?</p>
    </motion.div>

    <div className="relative group">
      <div className="absolute inset-0 bg-lavender/5 rounded-full blur-[60px] animate-pulse" />
      <div className="absolute -inset-8 rounded-full border border-lavender/10" />
      <div className="absolute -inset-16 rounded-full border border-lavender/5" />
      
      <button 
        onClick={onStart}
        className="relative w-56 h-56 rounded-full glass shadow-2xl flex flex-col items-center justify-center gap-2 group-hover:scale-105 transition-transform duration-500 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-lavender/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <Mic size={48} className="text-lavender mb-2" />
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-700">Começar meu dia</span>
      </button>
    </div>
  </div>
);

const RecordingView = ({ onStop, onCancel }: { onStop: (blob: Blob, transcript?: string) => void, onCancel: () => void }) => {
  const [seconds, setSeconds] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const speechRecognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>("");

  useEffect(() => {
    let interval: number;
    
    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder.current = new MediaRecorder(stream);
        chunks.current = []; // Clear previous chunks

        // Inicia transcrição de fala em tempo real caso o navegador suporte (Web Speech API)
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          try {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'pt-BR';
            recognition.onresult = (event: any) => {
              let text = '';
              for (let i = 0; i < event.results.length; i++) {
                text += event.results[i][0].transcript + ' ';
              }
              transcriptRef.current = text.trim();
            };
            recognition.onerror = (e: any) => {
              console.warn("[SpeechRecognition] Aviso:", e);
            };
            recognition.start();
            speechRecognitionRef.current = recognition;
          } catch (srErr) {
            console.warn("[SpeechRecognition] Inicialização falhou:", srErr);
          }
        }

        mediaRecorder.current.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.current.push(e.data);
        };

        mediaRecorder.current.onstop = () => {
          if (speechRecognitionRef.current) {
            try {
              speechRecognitionRef.current.stop();
            } catch (_) {}
          }
          const blob = new Blob(chunks.current, { type: 'audio/webm' });
          if (blob.size > 0) {
            onStop(blob, transcriptRef.current);
          } else {
            console.error("Audio blob is empty");
            onCancel();
          }
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.current.start(1000); // Collect data every second for safety
        setIsReady(true);
        interval = window.setInterval(() => setSeconds(s => s + 1), 1000);
      } catch (err) {
        console.error("Mic access denied or error:", err);
        alert("Não foi possível acessar o microfone. Por favor, verifique as permissões.");
        onCancel();
      }
    };

    startRecording();

    return () => {
      if (interval) clearInterval(interval);
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (_) {}
      }
      if (mediaRecorder.current?.state === 'recording') {
        mediaRecorder.current.stop();
      }
    };
  }, []);

  const handleStop = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="mb-12">
        <h2 className="font-serif text-3xl text-lavender flex items-center justify-center gap-3">
          <span className={`w-3 h-3 bg-red-500 rounded-full ${isReady ? 'animate-pulse' : 'opacity-20'} shadow-[0_0_12px_rgba(239,68,68,0.5)]`} />
          {isReady ? 'Ouvindo você...' : 'Preparando...'}
        </h2>
        <p className="text-gray-500 font-light mt-2">Sinta-se à vontade para falar o quanto precisar. Este é o seu espaço.</p>
      </div>

      <div className="flex items-center gap-1.5 h-32 mb-20 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={isReady ? { 
              height: [20, Math.random() * 80 + 20, 20],
            } : { height: 20 }}
            transition={{ 
              repeat: Infinity, 
              duration: 0.5 + Math.random(),
              ease: "easeInOut"
            }}
            className="w-1.5 rounded-full bg-lavender/60"
          />
        ))}
      </div>

      <button 
        onClick={handleStop}
        disabled={!isReady}
        className={`px-12 py-5 rounded-full bg-lavender text-white flex items-center gap-3 shadow-2xl transition-all ${!isReady ? 'opacity-50 cursor-not-allowed' : 'hover:bg-lavender/90 active:scale-95 hover:shadow-lavender/40'}`}
      >
        <span className="font-semibold uppercase tracking-widest text-sm">Finalizar Relatório</span>
        <ChevronRight size={20} />
      </button>
      
      <button 
        onClick={onCancel}
        className="mt-6 text-gray-400 text-xs uppercase tracking-widest hover:text-gray-600 transition-colors"
      >
        Cancelar gravação
      </button>
    </div>
  );
};

const AnalysisView = () => (
  <div className="flex flex-col items-center justify-center h-full text-center px-6">
    <div className="relative w-64 h-64 flex items-center justify-center mb-16">
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 90, 180, 270, 360],
          borderRadius: ["43% 57% 62% 38% / 46% 41% 59% 54%", "60% 40% 30% 70% / 50% 30% 70% 50%", "43% 57% 62% 38% / 46% 41% 59% 54%"]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-lavender/20 blur-3xl opacity-50" 
      />
      
      <motion.div 
        animate={{ 
          borderRadius: ["43% 57% 62% 38% / 46% 41% 59% 54%", "50% 50% 50% 50% / 50% 50% 50% 50%", "43% 57% 62% 38% / 46% 41% 59% 54%"]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="w-48 h-48 bg-gradient-to-br from-lavender to-lavender/60 shadow-2xl flex items-center justify-center text-white relative z-10"
      >
        <Wind size={64} className="opacity-80" />
      </motion.div>
    </div>

    <div className="space-y-4">
      <p className="text-lavender tracking-[0.2em] font-semibold uppercase text-xs">Analisando suas emoções...</p>
      <h2 className="font-serif text-4xl">Pense em algo bom</h2>
    </div>
  </div>
);

const ResultView = ({ 
  result, 
  selectedAroma, 
  onSelectAroma, 
  onReset, 
  onShowUsage 
}: { 
  result: AnalysisResult, 
  selectedAroma: Aroma,
  onSelectAroma: (aroma: Aroma) => void,
  onReset: () => void, 
  onShowUsage: () => void 
}) => {
  const [showTranscript, setShowTranscript] = useState(false);
  const isCustomAroma = selectedAroma.id !== result.aroma.id;

  const currentAlternative = result.alternatives?.find(alt => alt.aroma.id === selectedAroma.id);
  const currentExplanation = isCustomAroma
    ? (currentAlternative?.reason || selectedAroma.benefits)
    : result.aromaExplanation;

  return (
    <div className="flex flex-col gap-10 h-full p-6 pt-0 pb-32">
      <div className="text-center">
         <span className="text-xs uppercase tracking-widest text-lavender font-bold inline-block mb-2">Identificamos</span>
         <h2 className="font-serif text-3xl mb-1">{result.emotion.label}</h2>
         <p className="text-gray-500 font-light text-sm italic">"{result.emotion.description}"</p>
      </div>

      <section className="relative h-[420px] rounded-xxl overflow-hidden shadow-2xl transition-all">
        <img 
          src={selectedAroma.imageUrl} 
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300" 
          alt={selectedAroma.name} 
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/20" />
        
        {isCustomAroma && (
          <div className="absolute top-4 left-4 z-20">
            <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-semibold text-lavender shadow-md uppercase tracking-wider">
              Alternativa Ativa
            </span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 w-full p-8 glass border-t-0 rounded-t-xxl">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gray-600 font-bold">{selectedAroma.category}</span>
          <h1 className="font-serif text-5xl text-gray-900 mt-1">{selectedAroma.name}</h1>
        </div>
      </section>

      {isCustomAroma && (
        <button 
          onClick={() => onSelectAroma(result.aroma)}
          className="text-xs font-semibold text-lavender underline underline-offset-4 text-center hover:text-lavender/80 transition-colors"
        >
          Voltar para a recomendação principal ({result.aroma.name})
        </button>
      )}

      <div className="space-y-8 px-2 text-left">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="p-6 bg-lavender/5 border border-lavender/10 rounded-2xl text-center italic text-lavender font-serif text-xl"
        >
          "{result.quote}"
        </motion.div>

        <section>
          <div className="flex items-center gap-2 mb-3">
             <div className="w-1.5 h-6 bg-lavender rounded-full" />
             <h3 className="font-serif text-2xl">
               {isCustomAroma ? 'Por que esta alternativa?' : 'Por que este aroma?'}
             </h3>
          </div>
          <p className="text-gray-600 leading-relaxed font-light mb-6">{currentExplanation}</p>

          <h3 className="font-serif text-2xl mb-3">Benefícios</h3>
          <p className="text-gray-600 leading-relaxed font-light">{selectedAroma.benefits}</p>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {selectedAroma.tags.map(tag => (
              <span key={tag} className="px-4 py-1.5 bg-sage/10 text-sage text-xs rounded-full font-bold">
                {tag}
              </span>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-100/50 rounded-xl border border-white space-y-2">
            <div className="flex items-center gap-2 text-gray-500">
              <Wind size={16} />
              <span className="text-xs uppercase tracking-tighter">Notas</span>
            </div>
            <p className="text-sm font-medium">{selectedAroma.notes}</p>
          </div>
          <div className="p-4 bg-gray-100/50 rounded-xl border border-white space-y-2">
            <div className="flex items-center gap-2 text-gray-500">
              <Zap size={16} />
              <span className="text-xs uppercase tracking-tighter">Intensidade</span>
            </div>
            <div className="flex items-center gap-1 h-3">
               <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-lavender" style={{ width: `${selectedAroma.intensity}%` }} />
               </div>
            </div>
          </div>
        </div>

        {/* --- +3 Opções Alternativas --- */}
        {result.alternatives && result.alternatives.length > 0 && (
          <section className="pt-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 bg-sage rounded-full" />
              <h3 className="font-serif text-2xl">Não tem este aroma?</h3>
            </div>
            <p className="text-gray-600 font-light text-sm">
              Separamos 3 opções alternativas para o caso de você não ter <strong>{result.aroma.name}</strong> em casa:
            </p>

            <div className="space-y-3 pt-1">
              {result.alternatives.slice(0, 3).map((alt, idx) => {
                const isSelected = selectedAroma.id === alt.aroma.id;
                return (
                  <div
                    key={alt.aroma.id}
                    onClick={() => onSelectAroma(alt.aroma)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                      isSelected
                        ? 'bg-lavender/10 border-lavender shadow-sm ring-1 ring-lavender'
                        : 'bg-white/80 border-gray-100 hover:border-lavender/30 hover:bg-white'
                    }`}
                  >
                    <img
                      src={alt.aroma.imageUrl}
                      alt={alt.aroma.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sage">
                          Opção {idx + 1} • {alt.aroma.category}
                        </span>
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-lavender text-white">
                            <Check size={10} />
                            Ativo
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-medium tracking-wide">
                            Toque para usar
                          </span>
                        )}
                      </div>
                      <h4 className="font-serif text-lg text-gray-900 leading-snug">{alt.aroma.name}</h4>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-relaxed font-light">
                        {alt.reason || alt.aroma.benefits}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div className="pt-4 space-y-4">
          <button 
            onClick={() => setShowTranscript(!showTranscript)}
            className="text-xs text-gray-400 underline underline-offset-4 w-full text-center"
          >
            {showTranscript ? 'Ocultar o que eu disse' : 'Ver transcrição do meu áudio'}
          </button>
          
          {showTranscript && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="p-4 bg-gray-50 rounded-xl text-gray-500 text-sm italic border border-gray-100"
            >
              "{result.transcription}"
            </motion.div>
          )}
        </div>

        <div className="space-y-3 pt-4">
          <button 
            onClick={onShowUsage}
            className="w-full bg-lavender text-white py-5 rounded-full font-bold text-sm tracking-widest uppercase shadow-lg hover:shadow-lavender/20 transition-all"
          >
            Como utilizar este aroma
          </button>
          <button 
            onClick={onReset}
            className="w-full bg-white border border-gray-200 text-gray-700 py-4 rounded-full font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} />
            Nova Análise
          </button>
        </div>
      </div>
    </div>
  );
};

const UsageView = ({ aroma, usageMethod, onBack }: { aroma: Aroma, usageMethod: string, onBack: () => void }) => (
  <div className="flex flex-col gap-12 h-screen px-6 pt-4 pb-32">
    <div className="relative h-64 rounded-3xl overflow-hidden shadow-xl mb-4">
      <img src={aroma.imageUrl} className="absolute inset-0 w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-6 left-6">
        <h2 className="text-white font-serif text-3xl">{aroma.name}</h2>
        <p className="text-white/80 text-xs uppercase tracking-widest">{aroma.category}</p>
      </div>
    </div>

    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-6 bg-lavender rounded-full" />
          <h3 className="font-serif text-2xl">Ritual Recomendado</h3>
        </div>
        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm leading-relaxed text-gray-600 font-light text-lg italic">
          "{usageMethod}"
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-6 bg-sage rounded-full" />
          <h3 className="font-serif text-2xl">Dicas para o seu dia</h3>
        </div>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
             <div className="mt-1 w-5 h-5 rounded-full bg-sage/10 flex items-center justify-center shrink-0">
               <div className="w-1.5 h-1.5 rounded-full bg-sage" />
             </div>
             <p className="text-gray-600 font-light">Mantenha o aroma próximo ao seu local de trabalho ou descanso.</p>
          </li>
          <li className="flex items-start gap-3">
             <div className="mt-1 w-5 h-5 rounded-full bg-sage/10 flex items-center justify-center shrink-0">
               <div className="w-1.5 h-1.5 rounded-full bg-sage" />
             </div>
             <p className="text-gray-600 font-light">Repita o ritual sempre que sentir a emoção predominando.</p>
          </li>
        </ul>
      </section>
    </motion.div>

    <div className="pt-8">
      <button 
        onClick={onBack}
        className="w-full bg-gray-900 text-white py-5 rounded-full font-bold text-sm tracking-widest uppercase shadow-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
      >
        <ChevronRight size={18} className="rotate-180" />
        Voltar para a análise
      </button>
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [view, setView] = useState<View>('home');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedAroma, setSelectedAroma] = useState<Aroma | null>(null);

  const startAnalysis = async (blob: Blob, clientTranscript?: string) => {
    setView('analysis');
    try {
      console.log("Iniciando análise do áudio...", blob.size, "transcrição:", clientTranscript);
      const result = await analyzeMoodFromAudio(blob, clientTranscript);
      setAnalysisResult(result);
      setSelectedAroma(result.aroma);
      // Mantém na tela de análise por um tempo mínimo para a animação
      setTimeout(() => setView('result'), 2500);
    } catch (err) {
      console.error("Falha na análise:", err);
      alert("Houve um problema ao analisar seus sentimentos. Tente novamente.");
      setView('home');
    }
  };

  return (
    <div className="min-h-screen bg-cream relative flex flex-col md:max-w-md mx-auto shadow-2xl border-x border-gray-100">
      {/* Decorative Background Orbs */}
      <div className="ambient-orb top-[-10%] left-[-20%] w-80 h-80 bg-lavender/30" />
      <div className="ambient-orb bottom-[-10%] right-[-20%] w-96 h-96 bg-sage/20" />
      <div className="absolute inset-0 bg-white/40 pointer-events-none" />

      <Header />

      <main className="flex-1 relative z-10 overflow-y-auto overflow-x-hidden pt-8">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <HomeView onStart={() => setView('recording')} />
            </motion.div>
          )}
          {view === 'recording' && (
            <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <RecordingView onStop={startAnalysis} onCancel={() => setView('home')} />
            </motion.div>
          )}
          {view === 'analysis' && (
            <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <AnalysisView />
            </motion.div>
          )}
          {view === 'result' && analysisResult && (
            <motion.div key="result" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="h-full">
              <ResultView 
                result={analysisResult} 
                selectedAroma={selectedAroma || analysisResult.aroma}
                onSelectAroma={(aroma) => setSelectedAroma(aroma)}
                onReset={() => {
                  setSelectedAroma(null);
                  setView('home');
                }} 
                onShowUsage={() => setView('usage')}
              />
            </motion.div>
          )}
          {view === 'usage' && analysisResult && (
            <motion.div key="usage" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="h-full overflow-y-auto">
              <UsageView 
                aroma={selectedAroma || analysisResult.aroma}
                usageMethod={analysisResult.usageMethod}
                onBack={() => setView('result')} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
