import React from 'react';
import { ViewState } from '@/types';

interface NavigationProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onOpenLog: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate, onOpenLog }) => {
  const getIconClass = (view: ViewState) =>
    `flex flex-col items-center gap-1 transition-colors ${currentView === view ? 'text-primary dark:text-tan' : 'text-primary/40 dark:text-white/40'}`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-primary-dark/90 backdrop-blur-xl border-t border-black/5 dark:border-white/10 px-6 py-4 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <button className={getIconClass(ViewState.FEED)} onClick={() => onNavigate(ViewState.FEED)}>
          <span className="material-symbols-rounded">home</span>
          <span className="text-[10px] font-bold">Início</span>
        </button>

        <button className={getIconClass(ViewState.RANKING)} onClick={() => onNavigate(ViewState.RANKING)}>
          <span className="material-symbols-rounded">leaderboard</span>
          <span className="text-[10px] font-bold">Ranking</span>
        </button>

        <button
          onClick={onOpenLog}
          className="relative -mt-12 bg-maroon w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl shadow-maroon/40 border-[6px] border-background-light dark:border-background-dark active:scale-95 transition-transform"
        >
          <span className="material-symbols-rounded text-white text-3xl">add</span>
        </button>

        <button className={getIconClass(ViewState.DASHBOARD)} onClick={() => onNavigate(ViewState.DASHBOARD)}>
          <span className="material-symbols-rounded">analytics</span>
          <span className="text-[10px] font-bold">Painel</span>
        </button>

        <button className={getIconClass(ViewState.USER_PROFILE)} onClick={() => onNavigate(ViewState.USER_PROFILE)}>
          <span className="material-symbols-rounded">settings</span>
          <span className="text-[10px] font-bold">Ajustes</span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;