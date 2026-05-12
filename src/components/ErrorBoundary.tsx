import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Uncaught error in ${this.props.name || 'Component'}:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="skeuo-card p-8 text-center flex flex-col items-center gap-4 bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm text-rose-500">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="font-display font-black uppercase tracking-tight text-slate-800 dark:text-white leading-tight">
              Awas, Vibe Error!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-[200px] mx-auto">
              Ada gangguan teknis nih pas nampilin {this.props.name || 'komponen'}. Coba refresh deh.
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10 transition-transform active:scale-95"
          >
            <RefreshCw size={12} />
            Refresh App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
