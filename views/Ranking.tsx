import React, { useState } from 'react';
import { RankingUser, RankingLevel } from '@/types';

interface RankingProps {
  data: RankingUser[];
  onUserClick: (user: RankingUser) => void;
  onBack?: () => void;
}

const Ranking: React.FC<RankingProps> = ({ data, onUserClick, onBack }) => {
  const [currentLevel, setCurrentLevel] = useState<RankingLevel>('Fácil');

  // Filter users by selected level
  const filteredData = data.filter(user => user.leagueLevel === currentLevel);

  // Sort by points desc
  const sortedData = [...filteredData].sort((a, b) => b.points - a.points);

  // Assign rank within this filtered list
  const rankedData = sortedData.map((user, index) => ({ ...user, rank: index + 1 }));

  const topThree = rankedData.slice(0, 3);
  const others = rankedData.slice(3);

  // Helper to reorder for visual pyramid (2, 1, 3)
  const podiumOrder = topThree.length >= 3
    ? [topThree[1], topThree[0], topThree[2]]
    : topThree.length === 2
      ? [topThree[1], topThree[0]]
      : topThree;

  return (
    <div className="min-h-screen pb-32 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-start text-primary dark:text-white">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <div className="text-center">
          <h1 className="text-xl font-bold tracking-tight dark:text-white">Ranking Semanal</h1>
          <p className="text-[10px] uppercase font-bold text-maroon opacity-80">Nível {currentLevel}</p>
        </div>
        <div className="w-10 h-10"></div> {/* Place holder to keep alignment center */}
      </header>

      <main className="px-6">
        {/* League Tabs */}
        <div className="flex bg-white/50 dark:bg-white/5 p-1 rounded-full mb-8 overflow-x-auto hide-scrollbar">
          {(['Fácil', 'Intermediário', 'Avançado'] as RankingLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => setCurrentLevel(level)}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-full whitespace-nowrap transition-all
                  ${currentLevel === level
                  ? 'bg-primary dark:bg-maroon text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-white/20'}`}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Promotion Info */}
        <div className="text-center mb-6">
          <p className="text-xs font-bold text-primary/60 dark:text-white/60">
            {currentLevel === 'Avançado'
              ? 'Mantenha-se no Top 3 para ganhar o troféu Elite!'
              : 'Chegue ao Top 3 para avançar de nível!'}
          </p>
        </div>

        {/* Podium */}
        <div className="flex items-end justify-center gap-3 mb-10 mt-4 h-48">
          {podiumOrder.map((user) => {
            if (!user) return null;
            const isFirst = user.rank === 1;
            return (
              <button
                key={user.id}
                onClick={() => onUserClick(user)}
                className={`flex flex-col items-center ${isFirst ? '-mt-8 z-10' : ''} transition-transform active:scale-95`}
              >
                <div className="relative mb-3 group cursor-pointer">
                  {isFirst && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-maroon animate-bounce">
                      <span className="material-symbols-outlined text-3xl">trophy</span>
                    </div>
                  )}
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className={`
                      rounded-full object-cover transition-transform group-hover:scale-105
                      ${isFirst ? 'w-24 h-24 border-4 border-maroon' : 'w-16 h-16 border-4 border-tan opacity-90'}
                    `}
                  />
                  <div className={`
                    absolute -bottom-2 right-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-background-light dark:border-background-dark
                    ${isFirst ? 'bg-maroon text-white w-8 h-8 text-sm right-1' : 'bg-tan text-white'}
                  `}>
                    {user.rank}
                  </div>
                </div>
                <span className={`font-bold mb-1 dark:text-white ${isFirst ? 'text-lg' : 'text-xs'}`}>{user.name}</span>
                <div className={`
                  px-3 py-0.5 rounded-full
                  ${isFirst ? 'bg-maroon text-white shadow-lg shadow-maroon/30' : 'bg-tan/20 text-tan dark:text-tan'}
                `}>
                  <span className="text-[10px] font-bold uppercase tracking-wider">{user.points} pts</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* List */}
        <div className="space-y-3 pb-24">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-bold opacity-40 uppercase">Classificação</span>
            <span className="text-xs font-bold opacity-40 uppercase">Zona de {currentLevel === 'Avançado' ? 'Elite' : 'Promoção'}</span>
          </div>

          {/* Promotion Line Visual */}
          <div className="w-full h-px bg-maroon/20 relative my-2">
            <span className="absolute right-0 -top-2 bg-background-light dark:bg-background-dark text-maroon text-[9px] font-black px-1 uppercase">Top 3 sobem</span>
          </div>

          {others.map((user) => (
            <button
              key={user.id}
              onClick={() => onUserClick(user)}
              className={`
                w-full flex items-center p-4 rounded-2xl shadow-sm border text-left transition-transform active:scale-[0.98] relative overflow-hidden
                ${user.isCurrentUser
                  ? 'bg-maroon border-maroon text-white shadow-xl shadow-maroon/20'
                  : 'bg-white dark:bg-white/5 border-transparent dark:border-white/5'}
              `}
            >
              {/* Relegation indicator if user is in bottom 3 and list is long enough */}
              {rankedData.length > 5 && user.rank >= rankedData.length - 2 && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
              )}

              <span className={`w-6 text-sm font-bold ${user.isCurrentUser ? 'text-white/70' : 'text-gray-400'}`}>{user.rank}</span>
              <img src={user.avatar} alt={user.name} className={`w-10 h-10 rounded-full object-cover mr-4 ${user.isCurrentUser ? 'border-2 border-white/30' : ''}`} />
              <div className="flex-1">
                <div className="flex items-center">
                  <h4 className={`text-sm font-bold ${user.isCurrentUser ? 'text-white' : 'dark:text-white'}`}>{user.name}</h4>
                  {user.isCurrentUser && <span className="ml-2 bg-white/20 text-[8px] font-black px-1.5 py-0.5 rounded text-white uppercase tracking-widest">Você</span>}
                </div>
                <p className={`text-[10px] font-bold uppercase tracking-tight ${user.isCurrentUser ? 'text-tan' : 'text-tan'}`}>
                  {user.stats}
                </p>
              </div>
              <div className="text-right">
                <span className={`text-sm font-black ${user.isCurrentUser ? 'text-white' : 'text-primary dark:text-white'}`}>{user.points}</span>
                <p className={`text-[10px] font-bold uppercase ${user.isCurrentUser ? 'text-white/70' : 'text-gray-400'}`}>pts</p>
              </div>
            </button>
          ))}

          {rankedData.length > 5 && (
            <p className="text-center text-[10px] font-bold text-red-500 mt-4 opacity-70">
              Vermelho indica zona de rebaixamento
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Ranking;