import React from 'react';
import { Challenge, Post, RankingUser } from '@/types';
import { IMAGES } from '@/constants';

interface ChallengeDetailsModalProps {
    challenge: Challenge;
    posts: Post[];
    onClose: () => void;
    currentUserId: string;
    onLeave?: () => void;
}

const ChallengeDetailsModal: React.FC<ChallengeDetailsModalProps> = ({ challenge, posts = [], onClose, currentUserId, onLeave }) => {
    // Safety check
    if (!challenge) return null;

    // 1. Filter posts relevant to this challenge
    const challengePosts = (posts || []).filter(post => {
        if (!post || !post.createdAt) return false;
        try {
            const postDate = new Date(post.createdAt);
            const startDate = new Date(challenge.startDate);
            const endDate = new Date(challenge.endDate);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false;

            // Ensure dates are compared correctly (ignoring time might be needed if exact boundaries matter, but usually ISO includes time)
            // Let's allow end date to be inclusive by setting it to end of day if it looks like a plain date, 
            // but our types say ISO string. Assuming standard ISO comparison works for "Start of Start Day" to "End of End Day" logic?
            // Usually challenges run until 23:59:59 of End Date.
            // Let's add a buffer to endDate just in case it's 00:00:00
            const adjustedEndDate = new Date(endDate);
            if (adjustedEndDate.getHours() === 0 && adjustedEndDate.getMinutes() === 0) {
                adjustedEndDate.setHours(23, 59, 59, 999);
            }

            return postDate.getTime() >= startDate.getTime() && postDate.getTime() <= adjustedEndDate.getTime();
        } catch (e) {
            console.warn('Date parsing error', e);
            return false;
        }
    });

    // 2. Calculate Stats per Participant
    const participantsStats = (challenge.participants || []).map(participant => {
        if (!participant) return { id: 'unknown', name: 'Unknown', avatar: '', score: 0 };
        const userPosts = challengePosts.filter(p => p.user && p.user.id === participant.id);
        const workoutCount = userPosts.length;
        // Could add XP or duration if needed
        return {
            ...participant,
            score: workoutCount
        };
    });

    // 3. Sort by Score
    const ranking = participantsStats.sort((a, b) => b.score - a.score);

    const isCompleted = challenge.status === 'completed';
    const winner = isCompleted && ranking.length > 0 ? ranking[0] : null;

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-background-light dark:bg-primary-dark w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-[scaleIn_0.3s_ease-out] flex flex-col max-h-[90vh]">

                {/* Header Image/Gradient */}
                <div className="h-32 bg-maroon relative flex items-center justify-center shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-maroon/80 to-black/50"></div>
                    <h2 className="relative z-10 text-2xl font-black text-white text-center px-8 uppercase italic tracking-wider drop-shadow-md">
                        {challenge.title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full p-1 transition-colors z-20"
                    >
                        <span className="material-symbols-rounded">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="flex justify-between items-center mb-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border
                            ${challenge.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' :
                                challenge.status === 'completed' ? 'bg-gray-100 text-gray-700 border-gray-200' : 'bg-orange-100 text-orange-700 border-orange-200'}
                         `}>
                            {challenge.status === 'active' ? '🔥 Em Andamento' : challenge.status === 'completed' ? '🏆 Concluído' : '⏳ Em Breve'}
                        </span>
                        <span className="text-xs font-medium opacity-60 dark:text-gray-300">
                            {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}
                        </span>
                    </div>

                    {isCompleted && winner && (
                        <div className="mb-8 flex flex-col items-center animate-[bounceIn_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)]">
                            <p className="text-xs font-bold uppercase tracking-widest text-maroon mb-2">Vencedor</p>
                            <div className="relative">
                                <img src={winner.avatar} className="w-24 h-24 rounded-full border-4 border-yellow-400 shadow-xl" />
                                <div className="absolute -top-3 -right-2 bg-yellow-400 text-maroon p-1.5 rounded-full shadow-md rotate-12">
                                    <span className="material-symbols-rounded text-xl">emoji_events</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mt-3 dark:text-white">{winner.name}</h3>
                            <p className="text-sm font-medium opacity-60">{winner.score} Treinos</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase opacity-60 dark:text-gray-400">Classificação</h4>

                        <div className="space-y-2">
                            {ranking.map((user, index) => {
                                const isCurrentUser = user.id === currentUserId;
                                const isRank1 = index === 0;

                                return (
                                    <div key={user.id} className={`flex items-center p-3 rounded-2xl border transition-all
                                        ${isCurrentUser ? 'bg-maroon/5 border-maroon/20' : 'bg-white dark:bg-white/5 border-transparent'}
                                        ${isRank1 && !isCompleted ? 'border-yellow-400/50 bg-yellow-50 dark:bg-yellow-900/10' : ''}
                                    `}>
                                        <div className={`w-8 h-8 flex shrink-0 items-center justify-center rounded-full text-sm font-bold mr-3
                                             ${index === 0 ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-400/30' :
                                                index === 1 ? 'bg-gray-300 text-white' :
                                                    index === 2 ? 'bg-amber-600 text-white' : 'bg-transparent text-primary/40 dark:text-white/40'}
                                        `}>
                                            {index + 1}
                                        </div>

                                        <img src={user.avatar} className="w-10 h-10 rounded-full object-cover border border-black/5 dark:border-white/10" />

                                        <div className="ml-3 flex-1 min-w-0">
                                            <p className={`text-sm font-bold truncate dark:text-white ${isCurrentUser ? 'text-maroon' : ''}`}>
                                                {user.name} {isCurrentUser && '(Você)'}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-lg font-black dark:text-white">{user.score}</p>
                                            <p className="text-[10px] uppercase font-bold opacity-40">Treinos</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 pt-0 mt-auto">
                    {challenge.creator.id !== currentUserId && challenge.participants?.some(p => String(p.id) === String(currentUserId)) && onLeave && (
                        <button
                            onClick={() => {
                                if (window.confirm('Tem certeza que deseja sair deste desafio?')) {
                                    onLeave();
                                    onClose();
                                }
                            }}
                            className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-rounded">logout</span>
                            Sair do Desafio
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChallengeDetailsModal;
