import { useState, useRef } from 'react';
import { Send, RefreshCw, AlertCircle, ImageIcon, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface CurhatInputProps {
  onAnalyze: (text: string, isMirrorMode: boolean, imageData?: string) => void;
  isLoading: boolean;
  isCompact?: boolean;
  initialMirrorMode?: boolean;
  placeholder?: string;
}

export function CurhatInput({ onAnalyze, isLoading, isCompact = false, initialMirrorMode = false, placeholder }: CurhatInputProps) {
  const [text, setText] = useState('');
  const [isMirrorMode, setIsMirrorMode] = useState(initialMirrorMode);
  const [imageData, setImageData] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File kegedean, max 5MB ya!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    const trimmedText = text.trim();
    const minLength = isCompact ? 1 : 20;
    if (trimmedText.length < minLength && !imageData) return; 
    onAnalyze(trimmedText, isMirrorMode, imageData);
    setText('');
    setImageData(undefined);
  };

  if (isCompact) {
    return (
      <div className="bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl border border-slate-200/60 dark:border-white/10 p-1.5 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.1)] transition-all">
        <AnimatePresence>
          {imageData && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 6 }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 px-3 pt-1 overflow-hidden"
            >
              <div className="relative group shrink-0">
                <img src={imageData} alt="preview" className="w-8 h-8 object-cover rounded-lg border border-slate-200 dark:border-white/10" />
                <button 
                  onClick={() => setImageData(undefined)} 
                  className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-1 shadow-lg active:scale-90 transition-transform"
                >
                  <X size={8}/>
                </button>
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Attached</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-1.5">
          <div className="relative flex-1 group">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={placeholder || "Balas si Hakim..."}
              rows={1}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-full py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900/5 dark:focus:ring-white/5 resize-none dark:text-slate-200 min-h-[44px] max-h-24 transition-all font-medium leading-tight"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              <ImageIcon size={16} />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>
          <button
            onClick={handleSubmit}
            disabled={isLoading || (text.trim().length < 1 && !imageData)}
            className="w-11 h-11 flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full disabled:bg-slate-100 dark:disabled:bg-slate-800 transition-all active:scale-90 shadow-lg shadow-slate-900/10 disabled:shadow-none shrink-0"
          >
            {isLoading ? <RefreshCw className="animate-spin" size={16} /> : <Send size={16} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Tuangkan Isi Hati
        </label>
        
        <button
          onClick={() => setIsMirrorMode(!isMirrorMode)}
          className={cn(
            "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300",
            isMirrorMode 
              ? "bg-slate-950 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-slate-900/10" 
              : "bg-white/50 backdrop-blur-sm dark:bg-slate-900/50 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-white/5 hover:border-slate-400 dark:hover:border-white/20"
          )}
        >
          <div className={cn(
            "w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full",
            isMirrorMode ? "bg-emerald-400 animate-pulse" : "bg-slate-300 dark:bg-slate-700"
          )} />
          Mirror Mode
        </button>
      </div>

      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder || (isMirrorMode 
            ? "Tulis perilaku kamu ke pasangan di sini... Be honest ya."
            : "Ceritain apa yang lagi kamu rasain atau screenshot chat di sini...")}
          className="skeuo-input w-full min-h-[200px] sm:min-h-[260px] text-base sm:text-lg font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-700 resize-none outline-none focus:border-slate-950 dark:focus:border-white/30 pb-20 transition-all"
          disabled={isLoading}
        />
        
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <AnimatePresence>
            {imageData && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="relative group"
              >
                <img src={imageData} alt="Preview" className="w-12 h-12 object-cover rounded-xl border-2 border-white dark:border-slate-800 shadow-lg" />
                <button 
                  onClick={() => setImageData(undefined)}
                  className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-200 dark:hover:border-white/10 transition-all shadow-sm active:scale-95"
          >
            <ImageIcon size={20} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
        
        {isMirrorMode && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 bg-slate-900/80 dark:bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10"
          >
            <div className="flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-tighter">
              <AlertCircle size={12} className="text-amber-400" />
              Checking your own energy
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 px-2 font-medium">
        <p>{imageData ? "*Analisis chat screenshot aktif." : "*Min. 20 karakter biar AI bisa judge lebih akurat."}</p>
        <p>{text.length} chars</p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading || (text.trim().length < 20 && !imageData)}
        className={cn(
          "skeuo-button w-full flex items-center justify-center gap-4 py-6 text-sm",
          isLoading 
            ? "bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 cursor-not-allowed border-none shadow-none" 
            : "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
        )}
      >
        {isLoading ? (
          <>
            <RefreshCw className="animate-spin" size={18} />
            Analysing Vibes...
          </>
        ) : (
          <>
            Judge My Vibe
            <Send size={16} />
          </>
        )}
      </button>
    </div>
  );
}
