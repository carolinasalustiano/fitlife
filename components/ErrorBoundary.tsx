import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorStr: string;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorStr: ""
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorStr: error.toString() };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 text-red-900 flex flex-col items-center justify-center p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-rounded text-3xl text-red-600">error</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Desculpe, algo deu errado!</h1>
            <p className="text-center text-red-700/80 mb-6 max-w-sm">O aplicativo encontrou um erro inesperado e precisa ser recarregado.</p>
            <div className="bg-white/50 p-4 rounded-xl text-xs font-mono text-red-800 break-words w-full max-w-lg mb-6 shadow-sm border border-red-200">
                {this.state.errorStr}
            </div>
            <button 
                onClick={() => window.location.reload()} 
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-colors"
            >
                Recarregar Página
            </button>
        </div>
      );
    }

    return (this.props as any).children;
  }
}

export default ErrorBoundary;
