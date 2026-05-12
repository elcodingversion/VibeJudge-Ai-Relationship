import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CurhatInput } from '../components/CurhatInput';
import { VibeResult } from '../components/VibeResult';
import { PatternRadar } from '../components/PatternRadar';
import { ChatBubble } from '../components/ChatBubble';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { CurhatEntry, ChatMessage } from '../types';
import { analyzeVibe } from '../services/gemini';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Hash, History, PlusCircle, Trash2, Moon, Sun, AlertCircle } from 'lucide-react';

export default function HomeScreen() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<CurhatEntry[]>([]);
  const [activeSession, setActiveSession] = useState<CurhatEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'curhat' | 'radar'>('curhat');
  const [error, setError] = useState<string | null>(null);
  const [showJudge, setShowJudge] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const wasLoading = useRef(false);

  // Auto-scroll logic
  useEffect(() => {
    if (activeSession && activeSession.messages.length > 0) {
      const timer = setTimeout(() => {
        // If we just finished loading and showJudge is active, 
        // stay at the top to show the "Green Flag" card result
        if (wasLoading.current && !isLoading && showJudge) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          // Normal chat follow-ups scroll to bottom
          scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
        wasLoading.current = isLoading;
      }, 100);
      return () => clearTimeout(timer);
    }
    wasLoading.current = isLoading;
  }, [activeSession?.messages.length, isLoading, showJudge]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vibejudge_theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Apply dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('vibejudge_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('vibejudge_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const saved = localStorage.getItem('vibejudge_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('vibejudge_history', JSON.stringify(history));
  }, [history]);

  const handleAnalyze = async (text: string, isMirrorMode: boolean, imageData?: string) => {
    if (!text.trim() && !imageData) return;
    
    setIsLoading(true);
    setError(null);
    
    // Create new message
    const userMessage: ChatMessage = { role: 'user', content: text, imageData };
    const currentMessages = activeSession ? [...activeSession.messages, userMessage] : [userMessage];

    try {
      // Add a timeout of 45 seconds
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("AI-nya lagi bengong lama banget. Coba kirim ulang ya!")), 45000)
      );
      
      const { analysis, responseText } = await Promise.race([
        analyzeVibe(currentMessages, isMirrorMode),
        timeoutPromise
      ]) as { analysis: any, responseText: string };

      const modelMessage: ChatMessage = { role: 'model', content: responseText, analysis };
      
      const updatedMessages = [...currentMessages, modelMessage];

      if (activeSession) {
        // Update existing session
        const updatedSession = { 
          ...activeSession, 
          messages: updatedMessages, 
          lastAnalysis: analysis 
        };
        setActiveSession(updatedSession);
        setHistory(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
        // Don't force showJudge to true if we are already in a session, 
        // let the scroll stay focused on the new message
      } else {
        // Create new session
        const newSession: CurhatEntry = {
          id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
          timestamp: Date.now(),
          messages: updatedMessages,
          lastAnalysis: analysis,
          isMirrorMode
        };
        setActiveSession(newSession);
        setHistory(prev => [newSession, ...prev]);
        setShowJudge(true);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    if (confirm("Hapus semua histori?")) {
      setHistory([]);
      localStorage.removeItem('vibejudge_history');
      setActiveSession(null);
    }
  };

  const bgColor = useMemo(() => {
    if (isLoading) return isDarkMode ? 'bg-slate-900' : 'bg-slate-100';
    if (!activeSession || !activeSession.lastAnalysis) return isDarkMode ? 'bg-slate-950' : 'bg-slate-50';
    
    switch (activeSession.lastAnalysis.flag) {
      case 'GREEN': return isDarkMode ? 'bg-emerald-950/30' : 'bg-emerald-50';
      case 'YELLOW': return isDarkMode ? 'bg-amber-950/30' : 'bg-amber-50';
      case 'RED': return isDarkMode ? 'bg-rose-950/30' : 'bg-rose-50';
      default: return isDarkMode ? 'bg-slate-950' : 'bg-slate-50';
    }
  }, [activeSession, isLoading, isDarkMode]);

  return (
    <div className={cn("min-h-screen transition-colors duration-1000 font-sans selection:bg-slate-200 flex flex-col noise-bg", bgColor)}>
      <div className="flex-1 w-full max-w-full md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-16 flex flex-col relative">
        
        {/* Decorative Vibes */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-rose-400/5 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-400/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        {/* Header */}
        {!activeSession && (
          <header className="text-center mb-12 sm:mb-20 space-y-4 sm:space-y-6 relative">
            <div className="absolute -top-8 right-0 sm:-top-12">
               <button 
                 onClick={() => setIsDarkMode(!isDarkMode)}
                 className="p-2 sm:p-3 bg-white/50 backdrop-blur-md dark:bg-slate-900/50 border border-slate-200/50 dark:border-white/5 rounded-2xl shadow-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all active:scale-95"
               >
                 {isDarkMode ? <Sun size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Moon size={16} className="sm:w-[18px] sm:h-[18px]" />}
               </button>
            </div>

            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1 sm:py-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-full shadow-sm text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"
            >
              <Heart size={8} className="sm:w-[10px] sm:h-[10px] text-rose-500 fill-rose-500" />
              Social Psychologist AI
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-display font-black tracking-[-0.05em] text-slate-950 dark:text-white leading-[0.85] uppercase">
                Vibe<br /><span className="text-transparent bg-clip-text bg-gradient-to-br from-slate-400 to-slate-200 dark:from-slate-600 dark:to-slate-800">Judge</span>
              </h1>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-slate-500 dark:text-slate-400 font-medium max-w-[240px] sm:max-w-[280px] mx-auto text-xs sm:text-sm leading-relaxed"
            >
              AI ahli hubungan yang jujur, objektif, dan tanpa drama. <span className="text-slate-900 dark:text-white font-bold">Curhat lo aman di sini.</span>
            </motion.p>
          </header>
        )}

        {activeSession && (
          <header className="flex items-center justify-between mb-6 sm:mb-8 sticky top-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl px-3 sm:px-4 py-2 sm:py-3 rounded-2xl border border-white/20 dark:border-white/5 z-30 transition-all shadow-lg shadow-black/5">
            <button onClick={() => setActiveSession(null)} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-black uppercase tracking-[0.1em] text-[8px] sm:text-[10px] transition-colors">
              ← Home
            </button>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className={cn(
                "w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ring-2 sm:ring-4 ring-white dark:ring-slate-800 shadow-sm",
                activeSession.lastAnalysis.flag === 'GREEN' ? "bg-emerald-400" :
                activeSession.lastAnalysis.flag === 'YELLOW' ? "bg-amber-400" : "bg-rose-400"
              )} />
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.1em] text-slate-900 dark:text-white">Active Vibe</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl transition-colors text-slate-500"
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button 
                onClick={() => setShowJudge(!showJudge)} 
                className={cn(
                  "p-2 rounded-xl transition-all",
                  showJudge ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <Hash size={16} />
              </button>
            </div>
          </header>
        )}

        {/* Navigation */}
        {!activeSession && (
          <nav className="flex justify-center mb-10">
            <div className="bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm flex gap-1 transition-colors">
              <NavButton 
                active={activeTab === 'curhat'} 
                onClick={() => { setActiveTab('curhat'); }}
                icon={<PlusCircle size={16} />}
                label="Curhat"
              />
              <NavButton 
                active={activeTab === 'radar'} 
                onClick={() => setActiveTab('radar')}
                icon={<History size={16} />}
                label="Radar"
              />
            </div>
          </nav>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {!activeSession ? (
              activeTab === 'curhat' ? (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-6"
                >
                  <ErrorBoundary name="Curhat Input">
                    <CurhatInput onAnalyze={handleAnalyze} isLoading={isLoading} />
                  </ErrorBoundary>
                  
                  {error && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-2">
                      <Trash2 size={16} />
                      {error}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="radar"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                >
                  <div className="flex justify-between items-center mb-6 px-2">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Relationship History</h2>
                    {history.length > 0 && (
                      <button 
                        onClick={clearHistory}
                        className="text-rose-500 hover:text-rose-600 p-2 rounded-xl transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                  <ErrorBoundary name="Pattern Radar">
                    <PatternRadar 
                      entries={history} 
                      onSessionSelect={(session) => {
                        setActiveSession(session);
                      }} 
                    />
                  </ErrorBoundary>
                </motion.div>
              )
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 flex-1 flex flex-col"
              >
                {showJudge && activeSession.lastAnalysis && (
                   <div className="mb-8">
                     <ErrorBoundary name="Vibe Judge Result">
                       <VibeResult 
                         analysis={activeSession.lastAnalysis} 
                         onClose={() => setShowJudge(false)}
                       />
                     </ErrorBoundary>
                   </div>
                )}

                <div className="space-y-6 pb-32">
                   {error && (
                     <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 rounded-2xl text-rose-600 dark:text-rose-400 text-sm font-bold flex items-center gap-2 mb-4">
                       <AlertCircle size={16} />
                       {error}
                     </div>
                   )}
                   <ErrorBoundary name="Chat Conversation">
                    <AnimatePresence initial={false}>
                      {activeSession.messages.map((msg, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ 
                            duration: 0.4, 
                            ease: [0.23, 1, 0.32, 1]
                          }}
                        >
                          <ChatBubble msg={msg} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                   </ErrorBoundary>
                                      {isLoading && (
                     <motion.div 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="flex justify-start mb-6"
                     >
                       <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/50 dark:border-white/10 p-5 rounded-[2rem] rounded-tl-none shadow-xl flex flex-col gap-3 min-w-[200px]">
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                             <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Judge is thinking</span>
                          </div>
                          <div className="space-y-2">
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                               <motion.div 
                                 animate={{ x: ['-100%', '100%'] }}
                                 transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                 className="h-full w-1/2 bg-gradient-to-r from-transparent via-rose-400/30 to-transparent"
                               />
                            </div>
                            <div className="h-2 w-[80%] bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                               <motion.div 
                                 animate={{ x: ['-100%', '100%'] }}
                                 transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.2 }}
                                 className="h-full w-1/2 bg-gradient-to-r from-transparent via-rose-400/20 to-transparent"
                               />
                            </div>
                          </div>
                       </div>
                     </motion.div>
                   )}

                   {!isLoading && (
                     <motion.div 
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="mt-12 mb-8"
                     >
                        <CurhatInput 
                          onAnalyze={handleAnalyze} 
                          isLoading={isLoading} 
                          isCompact={true}
                          placeholder="Lanjut curhat di sini..."
                          initialMirrorMode={activeSession.isMirrorMode}
                        />
                     </motion.div>
                   )}

                   <div ref={scrollRef} className="h-1" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Global Footer */}
        {!activeSession && (
          <footer className="mt-20 pt-10 border-t border-slate-200/50 flex flex-col items-center gap-4 text-slate-400">
            <div className="flex items-center gap-6">
              <FooterLink label="Privacy" onClick={() => alert("Data lo aman secara lokal di browser ini. Kita nggak simpan curhat lo di server.")} />
              <FooterLink label="Psychology 101" onClick={() => navigate('/psychology')} />
              <FooterLink label="Bantuan" onClick={() => alert("Butuh bantuan? DM kita di Instagram @vibejudge_app (fiktif).")} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-tighter opacity-50">
              Powered by Gemini AI • Relationship Expert in your pocket
            </p>
            <p className="text-[9px] font-medium opacity-40 text-center max-w-xs">
              2026 @elcodingversion. All rights reserved. <br/>
              <span className="italic">(But honestly, this was just made for fun!)</span>
            </p>
          </footer>
        )}

      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all relative group",
        active 
          ? "text-white dark:text-slate-900" 
          : "text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
      )}
    >
      {active && (
        <motion.div
           layoutId="nav-pill"
           className="absolute inset-0 bg-slate-900 dark:bg-white rounded-xl shadow-xl shadow-slate-900/10"
           transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <div className="relative z-10 flex items-center gap-2">
        {icon}
        {label}
      </div>
    </button>
  );
}

function FooterLink({ label, onClick }: { label: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="text-[10px] font-bold uppercase tracking-widest hover:text-slate-600 transition-colors"
    >
      {label}
    </button>
  );
}
