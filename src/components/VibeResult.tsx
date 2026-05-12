import { useState, useRef, useEffect } from 'react';
import { VibeAnalysis } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { ShieldCheck, AlertTriangle, AlertCircle, ArrowRight, TrendingUp, Volume2, Loader2, Square, RefreshCw, Download, X } from 'lucide-react';
import { playTextToSpeech } from '../lib/audio';
import jsPDF from 'jspdf';
import * as htmlToImage from 'html-to-image';

interface VibeResultProps {
  analysis: VibeAnalysis;
  onClose?: () => void;
}

export function VibeResult({ analysis, onClose }: VibeResultProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const isRed = analysis.flag === 'RED';
  const isYellow = analysis.flag === 'YELLOW';
  const isGreen = analysis.flag === 'GREEN';

  const flagConfig = {
    RED: {
      color: 'text-rose-500',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
      icon: <AlertCircle size={32} />,
      label: 'Red Flag',
      desc: 'Toxic Alert! 🚩'
    },
    YELLOW: {
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      icon: <AlertTriangle size={32} />,
      label: 'Yellow Flag',
      desc: 'Caution! Pelan-pelan ya... ⚠️'
    },
    GREEN: {
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      icon: <ShieldCheck size={32} />,
      label: 'Green Flag',
      desc: 'Safe & Healthy! ✨'
    }
  };

  const config = flagConfig[analysis.flag] || flagConfig.YELLOW;

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
      const textToSpeak = `${analysis.reasoning}. Masa depannya: ${analysis.futureImpact}. Action plan buat lo: ${analysis.actionPlan}`;
      const stop = await playTextToSpeech(textToSpeak, () => {
        setIsSpeaking(false);
        setIsLoadingAudio(false);
        stopRef.current = null;
      });
      stopRef.current = stop;
      setIsSpeaking(true);
      setIsLoadingAudio(false);
    } catch (e) {
      console.error("VibeResult speaker error:", e);
      setIsLoadingAudio(false);
      setIsSpeaking(false);
      setAudioError(true);
      setTimeout(() => setAudioError(false), 3000);
    }
  };

  const handleDownloadPDF = async () => {
    if (!resultRef.current) return;
    setIsDownloading(true);
    
    // Save current scroll position
    const scrollY = window.scrollY;
    // Scroll to top to help capture correctly
    window.scrollTo(0, 0);

    try {
      // Small delay to ensure any layout shifts or animations are settled
      await new Promise(resolve => setTimeout(resolve, 500));

      const element = resultRef.current;
      if (!element) return;
      
      const width = element.scrollWidth;
      const height = element.scrollHeight;

      // Filter function to remove specific elements from the capture
      const filter = (node: HTMLElement) => {
        const ignore = node.hasAttribute && node.hasAttribute('data-html2canvas-ignore');
        return !ignore;
      };

      const dataUrl = await htmlToImage.toJpeg(element, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        filter: filter as any,
        pixelRatio: 2,
        width: width,
        height: height,
        style: {
          transform: 'none',
          margin: '0',
          padding: '20px',
        }
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(dataUrl);
      const ratio = imgProps.width / imgProps.height;
      
      const margin = 10;
      const finalWidth = pdfWidth - (margin * 2);
      const finalHeight = finalWidth / ratio;
      
      // Handle multi-page if content is too long for one page
      if (finalHeight > (pdfHeight - margin * 2)) {
        const scaledHeight = pdfHeight - (margin * 2);
        const scaledWidth = scaledHeight * ratio;
        pdf.addImage(dataUrl, 'JPEG', (pdfWidth - scaledWidth) / 2, margin, scaledWidth, scaledHeight);
      } else {
        pdf.addImage(dataUrl, 'JPEG', margin, margin, finalWidth, finalHeight);
      }
      
      pdf.save(`vibe-analysis-${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Gagal download PDF. Coba lagi ya!');
    } finally {
      // Restore scroll position
      window.scrollTo(0, scrollY);
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in zoom-in-95 fade-in duration-500 relative" ref={resultRef}>
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-full shadow-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all active:scale-90"
        >
          <X size={14} />
        </button>
      )}
      <div className={cn(
        "skeuo-card p-6 sm:p-8 text-center flex flex-col items-center transition-colors",
        isRed ? "bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30" : 
        isYellow ? "bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30" : 
        "bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30"
      )}>
        <motion.div 
          initial={{ scale: 0.5, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12 }}
          className={cn("p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-xl mb-4 sm:mb-6 ring-4 ring-white/10 dark:ring-white/5", config.color)}
        >
          {config.icon}
        </motion.div>
        
        <h2 className={cn("text-3xl sm:text-5xl font-display font-black uppercase tracking-tighter mb-1", config.color)}>
          {config.label}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mb-6">{config.desc}</p>

        <button
          onClick={handleSpeak}
          data-html2canvas-ignore
          disabled={isLoadingAudio}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all",
            isSpeaking 
              ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" 
              : audioError
                ? "bg-amber-500 text-white"
                : "bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10"
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
          {isLoadingAudio ? "Loading Voice..." : audioError ? "Gagal, coba lagi" : isSpeaking ? "Stop Voice" : "Dengerin Analisis"}
        </button>

        <button
          onClick={handleDownloadPDF}
          data-html2canvas-ignore
          disabled={isDownloading}
          className="mt-3 flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-black/5 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          {isDownloading ? "Saving..." : "Simpan PDF"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {analysis.labels.map(label => (
          <span 
            key={label}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight shadow-sm"
          >
            #{label}
          </span>
        ))}
      </div>

      <div className="skeuo-card p-6 space-y-6">
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400">
              <TrendingUp size={14} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Analisis Psikologis</h3>
          </div>
          <div className="prose prose-slate dark:prose-invert prose-sm max-w-none text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            <ReactMarkdown>{analysis.reasoning}</ReactMarkdown>
          </div>
        </section>

        <section className="pt-6 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400">
              <ArrowRight size={14} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Prediksi Masa Depan</h3>
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            {analysis.futureImpact}
          </p>
        </section>
      </div>

      <div 
        id="action-plan-section"
        className={cn(
        "skeuo-card p-6 sm:p-10 border-2 transition-all relative overflow-hidden group",
        isRed ? "border-rose-500/30 bg-white dark:bg-slate-900 shadow-2xl shadow-rose-500/5" : 
        isYellow ? "border-amber-500/30 bg-white dark:bg-slate-900 shadow-2xl shadow-amber-500/5" : 
        "border-emerald-500/30 bg-white dark:bg-slate-900 shadow-2xl shadow-emerald-500/5"
      )}>
        <div className="absolute -top-12 -right-12 w-48 h-48 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity rotate-12">
          {config.icon}
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="space-y-1">
            <div className={cn(
              "inline-flex px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-sm",
              isRed ? "bg-rose-500 shadow-rose-500/20" : isYellow ? "bg-amber-500 shadow-amber-500/20" : "bg-emerald-500 shadow-emerald-500/20"
            )}>
              Strategic Advice
            </div>
            <h3 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Action Plan Buat Lo
            </h3>
          </div>
          
          <div className="hidden sm:block h-px flex-1 bg-slate-100 dark:bg-white/5 mx-4" />
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-white/5">
            <span className={cn(
              "w-1.5 h-1.5 rounded-full animate-pulse",
              analysis.priority === 'CRITICAL' ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" :
              analysis.priority === 'HIGH' ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" :
              analysis.priority === 'MEDIUM' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" :
              "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
            )} />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
              {analysis.priority ? `Priority: ${analysis.priority}` : "Priority 01"}
            </span>
          </div>
        </div>
        
        <div className="prose prose-slate dark:prose-invert prose-base sm:prose-lg max-w-none 
          text-slate-800 dark:text-slate-200
          prose-headings:text-slate-900 dark:prose-headings:text-white
          prose-p:text-slate-800 dark:prose-p:text-slate-300 prose-p:font-medium prose-p:leading-relaxed
          prose-li:text-slate-800 dark:prose-li:text-slate-300 prose-li:font-medium
          prose-strong:text-rose-600 dark:prose-strong:text-rose-400
          prose-ol:space-y-4 prose-ul:space-y-4
          selection:bg-rose-500/20">
          <ReactMarkdown>{analysis.actionPlan}</ReactMarkdown>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800" />
            <span>Update curhat kalau keadaan berubah!</span>
          </div>
          
          <div className="flex -space-x-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
