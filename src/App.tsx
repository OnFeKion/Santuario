/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  MicOff, 
  Wind, 
  Sparkles, 
  ChevronRight, 
  RefreshCw, 
  Check,
  BookOpen,
  ArrowLeft,
  X
} from 'lucide-react';
import { View, AnalysisResult, Aroma } from './types';
import { analyzeMoodFromAudio } from './services/geminiService';
import { AROMAS_LIST } from './constants';

// --- Components ---

const Header = ({ 
  currentView, 
  onGoHome, 
  onOpenCatalog 
}: { 
  currentView: View; 
  onGoHome: () => void; 
  onOpenCatalog: () => void; 
}) => (
  <header className="sticky top-0 z-50 w-full px-6 py-4 glass flex items-center justify-between border-b border-gray-100/60">
    <button 
      onClick={onGoHome}
      className="flex items-center gap-2.5 text-lavender hover:opacity-80 transition-opacity cursor-pointer text-left"
      title="Início"
    >
      <div className="w-8 h-8 rounded-full bg-lavender/10 flex items-center justify-center text-lavender shadow-sm">
        <Sparkles size={16} />
      </div>
      <h1 className="font-serif italic tracking-[0.3em] text-base text-lavender uppercase font-light">
        Santuário
      </h1>
    </button>

    <button 
      onClick={onOpenCatalog}
      className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide flex items-center gap-1.5 transition-all cursor-pointer ${
        currentView === 'catalog' 
          ? 'bg-lavender text-white shadow-md' 
          : 'bg-white/80 border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-white shadow-sm'
      }`}
      title="Ver os 27 Aromas Oficiais"
    >
      <BookOpen size={14} />
      <span>27 Aromas</span>
    </button>
  </header>
);

// --- Views ---

const HomeView = ({ 
  onStart, 
  onOpenCatalog 
}: { 
  onStart: () => void; 
  onOpenCatalog: () => void; 
}) => (
  <div className="flex flex-col items-center justify-center h-full text-center px-6 py-6">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <h2 className="font-serif text-5xl mb-3">Bom dia.</h2>
      <p className="text-gray-500 font-light text-base">Como você está se sentindo hoje?</p>
    </motion.div>

    <div className="relative group mb-8">
      <div className="absolute inset-0 bg-lavender/5 rounded-full blur-[60px] animate-pulse" />
      <div className="absolute -inset-8 rounded-full border border-lavender/10" />
      <div className="absolute -inset-16 rounded-full border border-lavender/5" />
      
      <button 
        onClick={onStart}
        className="relative w-52 h-52 rounded-full glass shadow-2xl flex flex-col items-center justify-center gap-2 group-hover:scale-105 transition-transform duration-500 overflow-hidden cursor-pointer"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-lavender/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <Mic size={44} className="text-lavender mb-2" />
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-700">Falar com a IA</span>
        <span className="text-[11px] text-gray-400 font-light">Interpretação sensorial</span>
      </button>
    </div>

    <button 
      onClick={onOpenCatalog}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/90 border border-gray-200 text-xs font-semibold tracking-wider uppercase text-gray-700 hover:text-lavender hover:border-lavender/40 hover:bg-white shadow-sm transition-all cursor-pointer"
    >
      <BookOpen size={14} className="text-lavender" />
      <span>Explorar os 27 Aromas Oficiais</span>
    </button>
  </div>
);

const RecordingView = ({ 
  onStop, 
  onCancel 
}: { 
  onStop: (blob: Blob, transcript?: string) => void; 
  onCancel: () => void; 
}) => {
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
        chunks.current = [];

        // Captura fala em tempo real caso o navegador suporte nativamente
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
            recognition.start();
            speechRecognitionRef.current = recognition;
          } catch (_) {
            // Suporte resiliente
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
            onCancel();
          }
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.current.start(1000);
        setIsReady(true);
        interval = window.setInterval(() => setSeconds(s => s + 1), 1000);
      } catch (_) {
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
        className={`px-12 py-5 rounded-full bg-lavender text-white flex items-center gap-3 shadow-2xl transition-all cursor-pointer ${!isReady ? 'opacity-50 cursor-not-allowed' : 'hover:bg-lavender/90 active:scale-95 hover:shadow-lavender/40'}`}
      >
        <span className="font-semibold uppercase tracking-widest text-sm">Finalizar Relato</span>
        <ChevronRight size={20} />
      </button>
      
      <button 
        onClick={onCancel}
        className="mt-6 text-gray-400 text-xs uppercase tracking-widest hover:text-gray-600 transition-colors cursor-pointer"
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
      <p className="text-lavender tracking-[0.2em] font-semibold uppercase text-xs">Interpretando através da IA...</p>
      <h2 className="font-serif text-4xl">Sintonizando sua energia</h2>
    </div>
  </div>
);

const NotHeardView = ({ 
  message, 
  onRetry, 
  onCancel 
}: { 
  message?: string; 
  onRetry: () => void; 
  onCancel: () => void; 
}) => (
  <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-24 h-24 rounded-full bg-amber-50 border border-amber-200/60 shadow-lg flex items-center justify-center text-amber-600 mb-8"
    >
      <MicOff size={40} className="stroke-[1.5]" />
    </motion.div>

    <motion.div
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="space-y-4 max-w-sm"
    >
      <span className="text-[11px] uppercase tracking-[0.25em] text-amber-700/80 font-bold px-3 py-1 rounded-full bg-amber-100/60 inline-block">
        Atenção à escuta
      </span>
      <h2 className="font-serif text-3xl text-gray-900">Não consegui te ouvir</h2>
      <p className="text-gray-600 font-light text-base leading-relaxed">
        {message || "Não conseguimos captar as suas palavras com clareza suficiente para interpretar sua sensação."}
      </p>
      <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm text-xs text-gray-500 font-light leading-relaxed mt-4">
        A indicação aromaterapêutica só acontece a partir da interpretação real do seu relato, sem suposições automáticas.
      </div>
    </motion.div>

    <div className="w-full max-w-xs space-y-3 mt-10">
      <button 
        onClick={onRetry}
        className="w-full bg-lavender text-white py-4 rounded-full font-semibold text-sm tracking-wider uppercase shadow-xl hover:bg-lavender/90 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <RefreshCw size={18} />
        Gravar Relato Novamente
      </button>

      <button 
        onClick={onCancel}
        className="w-full py-3 text-gray-400 hover:text-gray-600 text-xs uppercase tracking-widest transition-colors cursor-pointer"
      >
        Voltar ao início
      </button>
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
  result: AnalysisResult; 
  selectedAroma: Aroma; 
  onSelectAroma: (aroma: Aroma) => void; 
  onReset: () => void; 
  onShowUsage: () => void; 
}) => {
  const [showTranscript, setShowTranscript] = useState(false);
  const aroma = selectedAroma || result.aroma;
  const isCustomAroma = aroma && result.aroma && aroma.id !== result.aroma.id;

  const currentAlternative = result.alternatives?.find(alt => alt.aroma.id === aroma?.id);
  const currentExplanation = isCustomAroma
    ? (currentAlternative?.reason || aroma?.benefits)
    : (result.aromaExplanation || aroma?.benefits);

  if (!aroma) return null;

  return (
    <div className="flex flex-col gap-10 h-full p-6 pt-0 pb-32">
      <div className="text-center">
         <span className="text-xs uppercase tracking-widest text-lavender font-bold inline-block mb-2">Identificamos</span>
         <h2 className="font-serif text-3xl mb-1">{result.emotion?.label || "Sensação Acolhida"}</h2>
         <p className="text-gray-500 font-light text-sm italic">"{result.emotion?.description || 'Interpretado através da IA'}"</p>
      </div>

      <section className="relative h-[420px] rounded-xxl overflow-hidden shadow-2xl transition-all bg-gradient-to-br from-sage/20 via-cream to-lavender/20">
        <img 
          src={aroma.imageUrl} 
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300" 
          alt={aroma.name} 
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.onerror = null;
            target.src = '/images/aromas/lavanda.jpg';
          }}
        />
        <div className="absolute inset-0 bg-black/25" />
        
        {isCustomAroma && (
          <div className="absolute top-4 left-4 z-20">
            <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-semibold text-lavender shadow-md uppercase tracking-wider">
              Alternativa Ativa
            </span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 w-full p-8 glass border-t-0 rounded-t-xxl">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gray-600 font-bold">{aroma.category}</span>
          <h1 className="font-serif text-5xl text-gray-900 mt-1">{aroma.name}</h1>
        </div>
      </section>

      {/* Relato Ouvido */}
      {result.transcription && (
        <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-4 shadow-sm">
          <button 
            onClick={() => setShowTranscript(v => !v)}
            className="w-full flex items-center justify-between text-left text-xs uppercase tracking-wider font-semibold text-gray-500 hover:text-gray-800 transition-colors"
          >
            <span>O que a IA compreendeu do seu relato</span>
            <span className="text-lavender lowercase font-normal">{showTranscript ? 'ocultar' : 'ver'}</span>
          </button>
          {showTranscript && (
            <p className="mt-3 text-sm text-gray-700 italic border-l-2 border-lavender pl-3 leading-relaxed">
              "{result.transcription}"
            </p>
          )}
        </div>
      )}

      {/* Razão e Benefícios Terapêuticos */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-lavender rounded-full" />
          <h3 className="font-serif text-2xl">Por que este aroma?</h3>
        </div>
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm leading-relaxed text-gray-600 font-light text-base">
          {currentExplanation}
        </div>
      </section>

      {/* Aromas Alternativos */}
      {result.alternatives && result.alternatives.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 bg-sage rounded-full" />
              <h3 className="font-serif text-2xl">Opções Alternativas</h3>
            </div>
            <span className="text-[11px] text-gray-400 font-light">Toque para alternar</span>
          </div>

          <div className="grid gap-3">
            {result.alternatives.map((alt, idx) => {
              const isSelected = aroma.id === alt.aroma.id;
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
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm bg-gradient-to-br from-sage/20 to-lavender/20 flex items-center justify-center">
                    <img
                      src={alt.aroma.imageUrl}
                      alt={alt.aroma.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/images/aromas/lavanda.jpg';
                      }}
                    />
                  </div>
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
                        <span className="text-[10px] text-gray-400 font-medium">Trocar</span>
                      )}
                    </div>
                    <h4 className="font-serif text-lg text-gray-900 leading-tight">{alt.aroma.name}</h4>
                    <p className="text-xs text-gray-500 font-light truncate mt-0.5">{alt.reason || alt.aroma.benefits}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Ritual de Uso Recomendado */}
      {result.usageMethod && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-lavender rounded-full" />
            <h3 className="font-serif text-2xl">Ritual Recomendado</h3>
          </div>
          <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm leading-relaxed text-gray-600 font-light text-base italic">
            "{result.usageMethod}"
          </div>
        </section>
      )}

      {/* Reflexão Inspiradora */}
      {result.quote && (
        <div className="p-8 rounded-3xl bg-lavender/10 border border-lavender/20 text-center space-y-2">
          <Sparkles className="w-6 h-6 text-lavender mx-auto mb-2 opacity-70" />
          <p className="font-serif italic text-lg text-gray-800 leading-relaxed">
            "{result.quote}"
          </p>
        </div>
      )}

      {/* Detalhes Técnicos e Botões de Ação */}
      <div className="pt-2 space-y-3">
        <button 
          onClick={onShowUsage}
          className="w-full bg-lavender text-white py-5 rounded-full font-bold text-sm tracking-widest uppercase shadow-xl hover:bg-lavender/90 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Ver Ritual Completo</span>
          <ChevronRight size={18} />
        </button>

        <button 
          onClick={onReset}
          className="w-full bg-white border border-gray-200 text-gray-700 py-4 rounded-full font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-all"
        >
          <RefreshCw size={14} />
          Nova Análise
        </button>
      </div>
    </div>
  );
};

const UsageView = ({ 
  aroma, 
  usageMethod, 
  onBack 
}: { 
  aroma: Aroma; 
  usageMethod: string; 
  onBack: () => void; 
}) => (
  <div className="flex flex-col gap-10 h-full px-6 pt-2 pb-32 overflow-y-auto">
    <div className="relative h-64 rounded-3xl overflow-hidden shadow-xl mb-2 bg-gradient-to-br from-sage/20 via-cream to-lavender/20">
      <img 
        src={aroma.imageUrl} 
        className="absolute inset-0 w-full h-full object-cover" 
        alt={aroma.name} 
        referrerPolicy="no-referrer"
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement;
          target.onerror = null;
          target.src = '/images/aromas/lavanda.jpg';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-6 left-6">
        <h2 className="text-white font-serif text-4xl">{aroma.name}</h2>
        <p className="text-white/80 text-xs uppercase tracking-widest mt-1">{aroma.category}</p>
      </div>
    </div>

    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-6 bg-lavender rounded-full" />
          <h3 className="font-serif text-2xl">Ritual Recomendado</h3>
        </div>
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm leading-relaxed text-gray-700 font-light text-base italic">
          "{usageMethod}"
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-6 bg-sage rounded-full" />
          <h3 className="font-serif text-2xl">Propriedades & Notas</h3>
        </div>
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-0.5">Notas Olfativas</span>
            <p className="text-sm text-gray-800 italic">{aroma.notes}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-0.5">Ação Terapêutica</span>
            <p className="text-sm text-gray-600 font-light leading-relaxed">{aroma.benefits}</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-6 bg-sage rounded-full" />
          <h3 className="font-serif text-2xl">Dicas para o seu dia</h3>
        </div>
        <ul className="space-y-3">
          <li className="flex items-start gap-3 bg-white/70 p-3.5 rounded-2xl border border-gray-100">
             <div className="mt-0.5 w-5 h-5 rounded-full bg-sage/10 flex items-center justify-center shrink-0">
               <div className="w-1.5 h-1.5 rounded-full bg-sage" />
             </div>
             <p className="text-gray-600 text-xs leading-relaxed font-light">Mantenha o aroma próximo ao seu local de trabalho ou descanso.</p>
          </li>
          <li className="flex items-start gap-3 bg-white/70 p-3.5 rounded-2xl border border-gray-100">
             <div className="mt-0.5 w-5 h-5 rounded-full bg-sage/10 flex items-center justify-center shrink-0">
               <div className="w-1.5 h-1.5 rounded-full bg-sage" />
             </div>
             <p className="text-gray-600 text-xs leading-relaxed font-light">Repita o ritual sempre que sentir a necessidade de reequilíbrio.</p>
          </li>
        </ul>
      </section>
    </motion.div>

    <div className="pt-4">
      <button 
        onClick={onBack}
        className="w-full bg-gray-900 text-white py-5 rounded-full font-bold text-sm tracking-widest uppercase shadow-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <ChevronRight size={18} className="rotate-180" />
        Voltar para o resultado
      </button>
    </div>
  </div>
);

const CatalogView = ({ 
  onSelectAroma, 
  onBack 
}: { 
  onSelectAroma: (aroma: Aroma) => void; 
  onBack: () => void; 
}) => {
  const [selectedDetail, setSelectedDetail] = useState<Aroma | null>(null);

  return (
    <div className="flex flex-col h-full px-5 pt-1 pb-28 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-500 hover:text-gray-900 transition-colors cursor-pointer py-1"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>
        <span className="text-[10px] uppercase tracking-widest font-bold text-lavender bg-lavender/10 px-3 py-1 rounded-full">
          27 Aromas Naturais
        </span>
      </div>

      <div className="mb-6">
        <h2 className="font-serif text-3xl text-gray-900 mb-1">Catálogo Botânico</h2>
        <p className="text-gray-500 font-light text-xs leading-relaxed">
          Fotos botânicas autênticas de cada planta na ordem oficial exata.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {AROMAS_LIST.map((aroma, index) => (
          <div 
            key={aroma.id}
            onClick={() => setSelectedDetail(aroma)}
            className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col"
          >
            <div className="relative h-44 overflow-hidden bg-gradient-to-br from-sage/20 via-cream to-lavender/20">
              <img 
                src={aroma.imageUrl} 
                alt={aroma.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/images/aromas/lavanda.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] font-bold text-gray-800 shadow-sm">
                #{index + 1}
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-white/80 block">
                  {aroma.category}
                </span>
                <h3 className="font-serif text-2xl font-normal leading-tight text-white drop-shadow-sm">
                  {aroma.name}
                </h3>
              </div>
            </div>
            
            <div className="p-4 flex-1 flex flex-col justify-between">
              <p className="text-xs text-gray-600 font-light line-clamp-2 leading-relaxed mb-3">
                {aroma.benefits}
              </p>
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <span className="text-[10px] font-medium text-gray-400 italic truncate max-w-[180px]">
                  {aroma.notes}
                </span>
                <span className="text-[11px] font-semibold text-lavender flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Ver detalhes
                  <ChevronRight size={12} />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Detalhes do Aroma */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="relative h-56 shrink-0 bg-gray-100">
              <img 
                src={selectedDetail.imageUrl} 
                alt={selectedDetail.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <button 
                onClick={() => setSelectedDetail(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-4 left-4 text-white">
                <span className="text-[10px] uppercase tracking-wider font-semibold opacity-90 block">
                  {selectedDetail.category}
                </span>
                <h3 className="font-serif text-3xl font-normal text-white">
                  {selectedDetail.name}
                </h3>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                  Benefícios Terapêuticos
                </h4>
                <p className="text-sm text-gray-700 font-light leading-relaxed">
                  {selectedDetail.benefits}
                </p>
              </div>

              <div>
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                  Notas Olfativas
                </h4>
                <p className="text-sm text-gray-600 italic">
                  {selectedDetail.notes}
                </p>
              </div>

              <div>
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">
                  Sentimentos & Emoções
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDetail.tags.map(tag => (
                    <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full bg-sage/10 text-sage font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => {
                    const aroma = selectedDetail;
                    setSelectedDetail(null);
                    onSelectAroma(aroma);
                  }}
                  className="w-full py-4 rounded-full bg-lavender text-white font-semibold text-xs uppercase tracking-wider hover:bg-lavender/90 transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Vivenciar Ritual deste Aroma</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<View>('home');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedAroma, setSelectedAroma] = useState<Aroma | null>(null);

  const startAnalysis = async (blob: Blob, clientTranscript?: string) => {
    setView('analysis');
    try {
      const result = await analyzeMoodFromAudio(blob, clientTranscript);
      setAnalysisResult(result);
      if (result.notHeard || !result.aroma) {
        setView('not_heard');
        return;
      }
      setSelectedAroma(result.aroma);
      // Tempo confortável para contemplar a animação
      setTimeout(() => setView('result'), 2000);
    } catch (_) {
      setAnalysisResult({
        notHeard: true,
        notHeardMessage: "Não consegui ouvir ou compreender o que você disse. Por favor, tente gravar novamente."
      });
      setView('not_heard');
    }
  };

  const handleSelectFromCatalog = (aroma: Aroma) => {
    setSelectedAroma(aroma);
    setAnalysisResult({
      emotion: {
        label: aroma.tags[0] || aroma.name,
        description: `Aroma ${aroma.name} explorado no catálogo botânico.`
      },
      aroma: aroma,
      aromaExplanation: aroma.benefits,
      usageMethod: `Pingue de 2 a 3 gotas de óleo essencial de ${aroma.name} nas palmas das mãos, friccione levemente e faça 3 inalações profundas e lentas.`,
      quote: `Permita que as propriedades terapêuticas naturais do ${aroma.name} restaurem o seu equilíbrio interior.`
    });
    setView('result');
  };

  return (
    <div className="min-h-screen bg-cream relative flex flex-col md:max-w-md mx-auto shadow-2xl border-x border-gray-100">
      {/* Decorative Background Orbs */}
      <div className="ambient-orb top-[-10%] left-[-20%] w-80 h-80 bg-lavender/30" />
      <div className="ambient-orb bottom-[-10%] right-[-20%] w-96 h-96 bg-sage/20" />
      <div className="absolute inset-0 bg-white/40 pointer-events-none" />

      <Header 
        currentView={view} 
        onGoHome={() => setView('home')} 
        onOpenCatalog={() => setView(view === 'catalog' ? 'home' : 'catalog')} 
      />

      <main className="flex-1 relative z-10 overflow-y-auto overflow-x-hidden pt-6">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <HomeView 
                onStart={() => setView('recording')} 
                onOpenCatalog={() => setView('catalog')}
              />
            </motion.div>
          )}
          {view === 'catalog' && (
            <motion.div key="catalog" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="h-full">
              <CatalogView 
                onSelectAroma={handleSelectFromCatalog}
                onBack={() => setView('home')}
              />
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
          {view === 'not_heard' && (
            <motion.div key="not_heard" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-full">
              <NotHeardView 
                message={analysisResult?.notHeardMessage}
                onRetry={() => setView('recording')}
                onCancel={() => setView('home')}
              />
            </motion.div>
          )}
          {view === 'result' && analysisResult && (selectedAroma || analysisResult.aroma) && (
            <motion.div key="result" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="h-full">
              <ResultView 
                result={analysisResult} 
                selectedAroma={(selectedAroma || analysisResult.aroma)!}
                onSelectAroma={(aroma) => setSelectedAroma(aroma)}
                onReset={() => {
                  setSelectedAroma(null);
                  setView('home');
                }} 
                onShowUsage={() => setView('usage')}
              />
            </motion.div>
          )}
          {view === 'usage' && analysisResult && (selectedAroma || analysisResult.aroma) && (
            <motion.div key="usage" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="h-full overflow-y-auto">
              <UsageView 
                aroma={(selectedAroma || analysisResult.aroma)!}
                usageMethod={analysisResult.usageMethod || "Aplique nos pulsos e inale profundamente."}
                onBack={() => setView('result')} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
