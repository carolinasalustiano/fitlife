import React, { useState } from 'react';
import { IMAGES } from '@/constants';
import { Post, RankingUser, Challenge } from '@/types';
import PostCard from '../components/PostCard';

interface UserProfileProps {
    user: RankingUser;
    posts: Post[];
    challenges?: Challenge[];
    onBack: () => void;
    onLike: (postId: string) => void;
    onComment: (postId: string, text: string) => void;
    onDelete: (postId: string) => void;
    onEdit: (post: Post) => void;
    onUpdateName?: (newName: string) => void;
    onLogout?: () => void;
    onLeaveChallenge?: (challengeId: string) => void;
    // Friend Management
    onAddFriend?: (userId: string) => void;
    onAcceptFriend?: (userId: string) => void;
    onRemoveFriend?: (userId: string) => void;
    friendsIds?: string[];
    incomingRequests?: string[];
    outgoingRequests?: string[];
}

const UserProfile: React.FC<UserProfileProps> = ({
    user,
    posts,
    challenges = [],
    onBack,
    onLike,
    onComment,
    onDelete,
    onEdit,
    onUpdateName,
    onLogout,
    onLeaveChallenge,
    onAddFriend,
    onAcceptFriend,
    onRemoveFriend,
    friendsIds,
    incomingRequests,
    outgoingRequests
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(user.name);

    // Filter challenges where user is participating
    const myChallenges = challenges.filter(c =>
        c.participants?.some(p => String(p.id) === String(user.id))
    );

    const handleSaveName = () => {
        if (tempName.trim() && onUpdateName) {
            onUpdateName(tempName);
            setIsEditingName(false);
        }
    };

    return (
        <div className="min-h-screen pb-32 bg-background-light dark:bg-background-dark">
            {/* Profile Header */}
            <div className="bg-primary text-white pb-12 rounded-b-[3rem] shadow-xl relative transition-all duration-300">
                {/* Background Pattern - Wrapped to clip only this */}
                <div className="absolute inset-0 overflow-hidden rounded-b-[3rem]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                </div>

                {/* Nav */}
                <div className="px-6 py-4 pt-8 flex items-center justify-between relative z-50">
                    <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>

                    {user.isCurrentUser && (
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all"
                            >
                                <span className="material-symbols-outlined">settings</span>
                            </button>

                            {isMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 bg-white text-primary rounded-xl shadow-xl overflow-hidden min-w-[120px] animate-[fadeIn_0.1s_ease-out]">
                                    <button
                                        onClick={() => {
                                            if (onLogout) onLogout();
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm font-bold hover:bg-red-50 text-red-600 flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-lg">logout</span>
                                        Sair
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* User Info */}
                <div className="flex flex-col items-center justify-center mt-2 relative z-10 px-6">
                    <div className="relative mb-4">
                        <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover border-4 border-tan shadow-lg" />
                        <div className="absolute -bottom-2 -right-2 bg-tan text-primary text-xs font-black px-2 py-1 rounded-lg border-2 border-primary">
                            RANK #{user.rank}
                        </div>
                    </div>

                    {/* Editable Name */}
                    {isEditingName ? (
                        <div className="flex items-center gap-2 mb-1">
                            <input
                                type="text"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                className="bg-white/10 text-white border-b border-white/30 text-center font-bold text-xl w-40 focus:outline-none focus:border-white"
                                autoFocus
                            />
                            <button onClick={handleSaveName} className="bg-white text-primary rounded-full p-1">
                                <span className="material-symbols-outlined text-sm">check</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold">{user.name}</h1>
                            {user.isCurrentUser && (
                                <button onClick={() => setIsEditingName(true)} className="opacity-50 hover:opacity-100">
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                </button>
                            )}
                        </div>
                    )}

                    <p className="text-white/60 text-xs uppercase tracking-widest font-bold mt-1">
                        Membro {user.leagueLevel === 'Avançado' ? 'Elite' : 'Ativo'}
                    </p>

                    {/* Stats */}
                    <div className="flex gap-8 mt-6 w-full justify-center">
                        <div className="text-center">
                            <p className="text-xl font-black">{user.points}</p>
                            <p className="text-[10px] uppercase font-bold text-white/50">Pontos</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-black">{user.stats.split(' ')[0]}</p>
                            <p className="text-[10px] uppercase font-bold text-white/50">Treinos</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-black">{user.photos}</p>
                            <p className="text-[10px] uppercase font-bold text-white/50">Fotos</p>
                        </div>
                    </div>

                    {/* Friend Action Button */}
                    {!user.isCurrentUser && (
                        <div className="mt-6 w-full max-w-[200px]">
                            {(() => {
                                const isFriend = friendsIds?.includes(user.id);
                                const isIncoming = incomingRequests?.includes(user.id);
                                const isOutgoing = outgoingRequests?.includes(user.id);

                                if (isFriend) {
                                    return (
                                        <button
                                            onClick={() => onRemoveFriend && onRemoveFriend(user.id)}
                                            className="w-full py-2 bg-white/20 text-white rounded-xl text-xs font-bold hover:bg-red-500/20 hover:text-red-200 transition-all flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">person_remove</span>
                                            Remover Amigo
                                        </button>
                                    );
                                } else if (isIncoming) {
                                    return (
                                        <button
                                            onClick={() => onAcceptFriend && onAcceptFriend(user.id)}
                                            className="w-full py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">person_add</span>
                                            Aceitar Solicitação
                                        </button>
                                    );
                                } else if (isOutgoing) {
                                    return (
                                        <button
                                            disabled
                                            className="w-full py-2 bg-white/10 text-white/50 rounded-xl text-xs font-bold cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">send</span>
                                            Solicitação Enviada
                                        </button>
                                    );
                                } else {
                                    return (
                                        <button
                                            onClick={() => onAddFriend && onAddFriend(user.id)}
                                            className="w-full py-2 bg-white text-primary rounded-xl text-xs font-bold hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-lg"
                                        >
                                            <span className="material-symbols-outlined text-sm">person_add</span>
                                            Adicionar Amigo
                                        </button>
                                    );
                                }
                            })()}
                        </div>
                    )}
                </div>
            </div>

            <main className="px-5 -mt-6 space-y-8 relative z-20">

                {/* Ranking Status Card */}
                <section className="bg-white dark:bg-white/5 p-4 rounded-2xl shadow-sm border border-primary/5 dark:border-white/5">
                    <h3 className="text-xs font-bold uppercase opacity-50 mb-3 dark:text-white">Seu Ranking</h3>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-maroon/10 flex items-center justify-center text-maroon">
                                <span className="material-symbols-outlined">leaderboard</span>
                            </div>
                            <div>
                                <p className="font-bold text-sm dark:text-white">Liga {user.leagueLevel}</p>
                                <p className="text-[10px] opacity-60 dark:text-gray-300">Continue treinando para subir!</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black text-primary dark:text-white">#{user.rank}</p>
                            <p className="text-[10px] font-bold uppercase text-green-600">Top 10%</p>
                        </div>
                    </div>
                </section>

                {/* Challenges Section */}
                {myChallenges.length > 0 && (
                    <section>
                        <h3 className="font-bold text-primary dark:text-white mb-3 flex justify-between items-center">
                            Desafios Ativos
                            <span className="text-xs text-primary/50 dark:text-white/50 font-bold bg-primary/5 dark:bg-white/10 px-2 py-1 rounded-full">
                                {myChallenges.length}
                            </span>
                        </h3>
                        <div className="space-y-3">
                            {myChallenges.map(challenge => (
                                <div key={challenge.id} className="bg-white dark:bg-white/5 p-4 rounded-2xl shadow-sm border border-primary/5 dark:border-white/5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-sm dark:text-white">{challenge.title}</h4>
                                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${challenge.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {challenge.status === 'active' ? 'Ativo' : 'Breve'}
                                        </span>
                                    </div>
                                    <p className="text-xs opacity-60 mb-3 dark:text-gray-300">
                                        Termina em {new Date(challenge.endDate).toLocaleDateString()}
                                    </p>

                                    {/* Leave Challenge Button */}
                                    {user.isCurrentUser && challenge.creator.id !== user.id && (
                                        <button
                                            onClick={() => onLeaveChallenge && onLeaveChallenge(challenge.id)}
                                            className="w-full py-2 border border-red-200 text-red-500 rounded-xl text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-sm">logout</span>
                                            Sair do Desafio
                                        </button>
                                    )}
                                    {user.isCurrentUser && challenge.creator.id === user.id && (
                                        <div className="w-full py-2 bg-gray-100 dark:bg-white/10 text-primary/40 dark:text-white/40 rounded-xl text-[10px] font-bold text-center">
                                            Você é o criador
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Workout History */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-primary dark:text-white">Histórico</h3>
                        <span className="text-xs text-primary/50 dark:text-white/50 font-bold">{posts.length} Atividades</span>
                    </div>

                    {posts.length > 0 ? (
                        <div className="space-y-6">
                            {posts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    onLike={onLike}
                                    onComment={onComment}
                                    onDelete={onDelete}
                                    onEdit={onEdit}
                                    currentUserAvatar={IMAGES.currentUser}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 opacity-50 bg-white dark:bg-white/5 rounded-2xl border-dashed border-2 border-gray-200 dark:border-white/10">
                            <span className="material-symbols-outlined text-4xl mb-2">history_edu</span>
                            <p className="text-sm font-bold">Nenhum treino registrado.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default UserProfile;