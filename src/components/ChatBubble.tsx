import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { cn } from '../lib/utils';
import { Volume2, Loader2, Check, Square, RefreshCw } from 'lucide-react';
import { playTextToSpeech } from '../lib/audio';
import { motion } from 'motion/react';

interface ChatBubbleProps {
  msg: ChatMessage;
}

export function ChatBubble({ msg }: ChatBubbleProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);
  const isUser = msg.role === 'user';

  useEffect(() => {
    return () => {
      if (stopRef.current) {
        stopRef.current();
      }
    };
  }, []);

  const handleSpeak = async () => {
    if (isSpeaking && stopRef.current) {
      stopRef.current();
      stopRef.current = null;
      setIsSpeaking(false);
      return;
    }

    if (isLoadingAudio) return;

    setIsLoadingAudio(true);
    setAudioError(false);
    try {
      const stop = await playTextToSpeech(msg.content, () => {
        setIsSpeaking(false);
        setIsLoadingAudio(false);
        stopRef.current = null;
      });
      stopRef.current = stop;
      setIsSpeaking(true);
      setIsLoadingAudio(false);
    } catch (e) {
      console.error("ChatBubble speaker error:", e);
      setIsLoadingAudio(false);
      setIsSpeaking(false);
      setAudioError(true);
      setTimeout(() => setAudioError(false), 3000);
    }
  };

  // Preserve newlines while splitting into words
  const renderContent = () => {
    if (isUser) return <p className="whitespace-pre-wrap">{msg.content}</p>;

    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.025,
            },
          },
        }}
        className="whitespace-pre-wrap"
      >
        {msg.content.split(/(\s+)/).map((part, i) => {
          if (/\s+/.test(part)) return <span key={i}>{part}</span>;
          return (
            <motion.span
              key={i}
              variants={{
                hidden: { opacity: 0, filter: "blur(4px)", y: 4 },
                visible: { opacity: 1, filter: "blur(0px)", y: 0 },
              }}
              className="inline-block"
            >
              {part}
            </motion.span>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div className={cn(
      "flex w-full mb-6",
      isUser ? "justify-end" : "justify-start"
    )}>
      <motion.div 
        layout
        initial={{ 
          opacity: 0, 
          scale: 0.8, 
          y: 20,
          x: isUser ? 20 : -20 
        }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: 0,
          x: 0 
        }}
        transition={{ 
          type: "spring", 
          damping: 25, 
          stiffness: 350,
          layout: { duration: 0.2 }
        }}
        className={cn(
          "max-w-[85%] sm:max-w-[75%] p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[1.8rem] relative group transition-all duration-300",
          isUser 
            ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-tr-none shadow-lg shadow-slate-900/5 dark:shadow-none" 
            : "bg-white dark:bg-slate-900/90 backdrop-blur-md border border-slate-100 dark:border-white/10 text-slate-800 dark:text-slate-200 rounded-tl-none font-medium shadow-sm ring-1 ring-slate-200/50 dark:ring-white/5"
        )}
      >
        <div className={cn(
          "flex items-center justify-between mb-2.5 text-[9px] font-black uppercase tracking-[0.2em]",
          isUser ? "text-slate-400 dark:text-slate-500" : "text-rose-500 dark:text-rose-400"
        )}>
          <div className="flex items-center gap-2">
            {isUser ? (
              <>
                <div className="w-1 h-1 rounded-full bg-slate-600 dark:bg-slate-400" />
                <span>You</span>
              </>
            ) : (
               <>
                 <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                 <span>VibeJudge</span>
               </>
            )}
          </div>
          
          {isUser && (
            <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
              <div className="flex -space-x-1">
                <Check size={8} className="text-emerald-500" strokeWidth={4} />
                <Check size={8} className="text-emerald-500" strokeWidth={4} />
              </div>
            </div>
          )}
        </div>

        {msg.imageData && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 overflow-hidden rounded-xl border border-white/10"
          >
            <img src={msg.imageData} alt="chat context" className="w-full h-auto object-cover" />
          </motion.div>
        )}
        
        <div className="text-sm sm:text-base leading-relaxed tracking-tight selection:bg-rose-400/30">
          {renderContent()}
        </div>
        
        {!isUser && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-white/5"
          >
            <div className="flex items-center gap-1.5">
               <div className="w-1 h-1 rounded-full bg-rose-400/50" />
               <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400/80">Sentiment Authenticity Verified</span>
            </div>
          </motion.div>
        )}

        {!isUser && (
          <button
            onClick={handleSpeak}
            disabled={isLoadingAudio}
            className={cn(
              "absolute -right-3 -bottom-3 p-3 rounded-2xl shadow-xl border transition-all translate-y-2 group-hover:translate-y-0",
              isSpeaking 
                ? "bg-rose-500 text-white border-rose-400 opacity-100 scale-110" 
                : audioError
                  ? "bg-amber-500 text-white border-amber-400 opacity-100"
                  : "bg-white dark:bg-slate-900 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 border-slate-100 dark:border-white/10 opacity-0 group-hover:opacity-100"
            )}
          >
            {isLoadingAudio ? (
              <Loader2 size={14} className="animate-spin" />
            ) : audioError ? (
              <RefreshCw size={14} />
            ) : isSpeaking ? (
              <Square size={14} fill="currentColor" />
            ) : (
              <Volume2 size={14} />
            )}
          </button>
        )}
      </motion.div>
    </div>
  );
}
