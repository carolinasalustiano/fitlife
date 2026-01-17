import React, { useState } from 'react';
// Recharts removed due to compatibility issues -> Using Custom CSS Chart
import { IMAGES } from '@/constants';
import { RankingUser } from '@/types';

interface DashboardProps {
  currentUserWeight: number;
  initialWeight: number;
  streak: number;
  onUpdateWeight: (newWeight: number) => void;
  onUpdateInitialWeight: (newWeight: number) => void;
  workoutsThisWeek: { day: string; count: number }[];
  currentRank?: RankingUser;
  onOpenProfile: () => void;
  onBack: () => void;
  isNotificationsEnabled: boolean;
  onToggleNotifications: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  currentUserWeight, initialWeight, streak, onUpdateWeight, onUpdateInitialWeight, workoutsThisWeek, currentRank, onOpenProfile, onBack,
  isNotificationsEnabled, onToggleNotifications
}) => {
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [isEditingInitialWeight, setIsEditingInitialWeight] = useState(false);
  const [tempWeight, setTempWeight] = useState(currentUserWeight.toString());
  const [tempInitialWeight, setTempInitialWeight] = useState(initialWeight.toString());

  // Update temp state when props change
  React.useEffect(() => {
    setTempWeight(currentUserWeight.toString());
  }, [currentUserWeight]);

  React.useEffect(() => {
    setTempInitialWeight(initialWeight.toString());
  }, [initialWeight]);

  const weightLoss = initialWeight - currentUserWeight;

  const handleSaveWeight = () => {
    const w = parseFloat(tempWeight);
    if (!isNaN(w) && w > 0) {
      onUpdateWeight(w);
      setIsEditingWeight(false);
    }
  };

  const handleSaveInitialWeight = () => {
    const w = parseFloat(tempInitialWeight);
    if (!isNaN(w) && w > 0) {
      onUpdateInitialWeight(w);
      setIsEditingInitialWeight(false);
    }
  }

  const totalWorkoutsThisWeek = workoutsThisWeek.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="min-h-screen pb-32 bg-background-light dark:bg-background-dark text-primary dark:text-white">
      {/* Top Bar */}
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/50 dark:bg-white/10 text-primary dark:text-white backdrop-blur-md active:scale-95 transition-all">
            <span className="material-symbols-rounded">arrow_back</span>
          </button>

          <button onClick={onOpenProfile} className="flex items-center gap-4 text-left group">
            <div className="relative">
              <img src={currentRank?.avatar || IMAGES.currentUser} alt="Profile" className="w-14 h-14 rounded-full border-2 border-light-blue object-cover group-active:scale-95 transition-transform" />
              <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-background-light dark:border-background-dark">
                LVL {currentRank?.leagueLevel === 'Fácil' ? 1 : currentRank?.leagueLevel === 'Intermediário' ? 2 : 3}
              </div>
            </div>
            <div>
              <h1 className="text-xs uppercase tracking-widest font-bold text-light-blue opacity-80">Nível {currentRank?.leagueLevel || 'Fácil'}</h1>
              <p className="text-xl font-extrabold tracking-tight group-hover:underline decoration-light-blue underline-offset-4">{currentRank?.name || 'Usuário'}</p>
            </div>
          </button>
        </div>
        <button
          onClick={onToggleNotifications}
          className={`w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-md transition-all active:scale-95 ${isNotificationsEnabled ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white/50 dark:bg-white/10 text-primary dark:text-white'}`}
        >
          <span className={`material-symbols-rounded ${isNotificationsEnabled ? 'fill-current' : ''}`}>
            {isNotificationsEnabled ? 'notifications_active' : 'notifications'}
          </span>
        </button>
      </header>

      <main className="space-y-6 px-6 pt-2">
        {/* Streak & Rank Card */}
        <section className="bg-primary text-background-light p-5 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden min-h-[140px]">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider opacity-80">Sequência</p>
              <h2 className="text-4xl font-black mt-1">{streak} Dias</h2>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wider opacity-80">Posição</p>
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-3xl font-black text-light-blue">#{currentRank?.rank || '-'}</span>
                <span className="material-symbols-rounded text-light-blue text-sm">trending_flat</span>
              </div>
            </div>
          </div>
          <div className="relative z-10 mt-4">
            <span className="bg-light-blue/20 text-[10px] font-bold py-1 px-3 rounded-full uppercase tracking-wider">
              Mantenha o foco para subir!
            </span>
          </div>
          <div className="absolute -bottom-4 -right-4">
            <span className="material-symbols-rounded text-8xl text-light-blue/10">leaderboard</span>
          </div>
        </section>

        {/* Weight Loss Metric */}
        <section className="bg-white dark:bg-primary-dark/40 border border-white/50 dark:border-white/5 p-5 rounded-3xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-maroon/10 p-2 rounded-full text-maroon">
                <span className="material-symbols-rounded">monitor_weight</span>
              </div>
              <div>
                <h3 className="text-sm font-bold">Peso Atual</h3>
                <p className="text-[10px] opacity-60 uppercase font-bold">Toque para editar</p>
              </div>
            </div>

            {isEditingWeight ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={tempWeight}
                  onChange={(e) => setTempWeight(e.target.value)}
                  className="w-20 bg-primary/5 dark:bg-white/10 rounded-lg px-2 py-1 text-lg font-bold text-center outline-none border border-primary/20"
                  autoFocus
                />
                <button onClick={handleSaveWeight} className="bg-primary text-white p-2 rounded-lg">
                  <span className="material-symbols-rounded text-sm">check</span>
                </button>
              </div>
            ) : (
              <button onClick={() => setIsEditingWeight(true)} className="text-3xl font-black tracking-tight flex items-end gap-1">
                {currentUserWeight || '--'} <span className="text-sm font-bold opacity-60 mb-1">kg</span>
                <span className="material-symbols-rounded text-sm opacity-30 mb-2">edit</span>
              </button>
            )}
          </div>

          <div className="bg-background-light dark:bg-white/5 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold opacity-60 uppercase mb-1">Perda Total</p>
              <p className={`text-xl font-black ${weightLoss >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {weightLoss >= 0 ? '-' : '+'}{Math.abs(weightLoss).toFixed(1)} kg
              </p>
            </div>
            <div className="h-10 w-px bg-primary/10 dark:bg-white/10 mx-4"></div>
            <div>
              <p className="text-xs font-bold opacity-60 uppercase mb-1">Peso Inicial</p>
              {isEditingInitialWeight ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={tempInitialWeight}
                    onChange={(e) => setTempInitialWeight(e.target.value)}
                    className="w-16 bg-white rounded px-1 text-sm font-bold outline-none border border-primary/20"
                    autoFocus
                  />
                  <button onClick={handleSaveInitialWeight} className="bg-primary text-white p-1 rounded">
                    <span className="material-symbols-rounded text-xs">check</span>
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsEditingInitialWeight(true)} className="flex items-center gap-1">
                  <p className="text-xl font-black">{initialWeight || '--'} kg</p>
                  <span className="material-symbols-rounded text-xs opacity-30">edit</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Workout Activity Chart */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold">Frequência Semanal</h3>
              <p className="text-xs opacity-60 font-medium">{totalWorkoutsThisWeek} treinos registrados esta semana</p>
            </div>
          </div>
          <div className="bg-white dark:bg-primary-dark/40 border border-white/50 dark:border-white/5 p-5 rounded-3xl shadow-sm">
            <div className="h-40 w-full mb-2 flex items-end justify-between gap-2 px-2">
              {(() => {
                const maxCount = Math.max(...workoutsThisWeek.map(w => w.count), 1); // Avoid div by zero
                return workoutsThisWeek.map((entry, index) => {
                  const heightPercentage = (entry.count / maxCount) * 100;
                  // Ensure a minimum visual height for empty bars if desired, or 0
                  const visualHeight = Math.max(heightPercentage, 4);

                  return (
                    <div key={`chart-bar-${index}`} className="flex flex-col items-center gap-2 flex-1 h-full justify-end group cursor-pointer">
                      <div className="relative w-full flex items-end justify-center h-full">
                        {/* Tooltip on Hover */}
                        <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded-lg pointer-events-none whitespace-nowrap z-10">
                          {entry.count} treinos
                        </div>

                        <div
                          className={`w-full rounded-t-xl transition-all duration-500 ease-out ${entry.count > 0 ? 'bg-primary dark:bg-white' : 'bg-gray-200 dark:bg-white/10'}`}
                          style={{ height: `${entry.count > 0 ? heightPercentage : 4}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 dark:text-white/40 uppercase">{entry.day}</span>
                    </div>
                  );
                });
              })()}
            </div>

            <div className="flex items-center justify-center gap-4 border-t border-black/5 dark:border-white/10 pt-4 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary dark:bg-white"></div>
                <span className="text-[11px] font-medium opacity-70">Média: {(totalWorkoutsThisWeek / 7).toFixed(1)} / dia</span>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Dashboard;