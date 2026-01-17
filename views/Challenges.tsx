import React, { useState, useEffect, useRef } from 'react';
import { Challenge, RankingUser, Post } from '@/types';
import ChallengeDetailsModal from '../components/ChallengeDetailsModal';

interface ChallengesProps {
    challenges: Challenge[];
    friends: RankingUser[];
    currentUser: RankingUser;
    onCreateChallenge: (challenge: Omit<Challenge, 'id' | 'creator' | 'status'>) => void;
    onEditChallenge: (challenge: Challenge) => void;
    onDeleteChallenge: (id: string) => void;
    onLeaveChallenge: (id: string) => void;
    onBack: () => void;
    currentUserId: string;
    posts: Post[];
}

const Challenges: React.FC<ChallengesProps> = ({
    challenges,
    friends,
    currentUser,
    onCreateChallenge,
    onEditChallenge,
    onDeleteChallenge,
    onLeaveChallenge,
    onBack,
    currentUserId,
    posts
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

    // Menu State
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenuId(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const openCreateModal = () => {
        setEditingId(null);
        setTitle('');
        setStartDate('');
        setEndDate('');
        setSelectedFriends([]);
        setIsModalOpen(true);
        setActiveMenuId(null);
    };

    const openEditModal = (challenge: Challenge) => {
        setEditingId(challenge.id);
        setTitle(challenge.title);
        // Format dates for input type="date" (YYYY-MM-DD)
        setStartDate(challenge.startDate ? challenge.startDate.split('T')[0] : '');
        setEndDate(challenge.endDate ? challenge.endDate.split('T')[0] : '');

        // Map participants to IDs
        const participantIds = challenge.participants
            .filter(p => p.id !== challenge.creator.id) // Exclude creator from selection list logic
            .map(p => p.id);

        setSelectedFriends(participantIds);
        setIsModalOpen(true);
        setActiveMenuId(null);
    };

    // Helper to create date object at specific time
    const createDateAtTime = (dateString: string, hours: number, minutes: number, seconds: number) => {
        if (!dateString) return new Date();
        const [y, m, d] = dateString.split('-').map(Number);
        return new Date(y, m - 1, d, hours, minutes, seconds);
    };

    const handleSubmit = () => {
        if (!title || !startDate || !endDate) return;

        const participants = friends.filter(f => selectedFriends.includes(f.id));

        // Create start date at 00:00:00 and end date at 23:59:59
        const isoStartDate = createDateAtTime(startDate, 0, 0, 0).toISOString();
        const isoEndDate = createDateAtTime(endDate, 23, 59, 59).toISOString();

        if (editingId) {
            // Find original challenge to keep creator and status
            const original = challenges.find(c => c.id === editingId);
            if (original) {
                onEditChallenge({
                    ...original,
                    title,
                    startDate: isoStartDate,
                    endDate: isoEndDate,
                    participants: [original.creator, ...participants] // Ensure creator stays + new list
                });
            }
        } else {
            onCreateChallenge({
                title,
                startDate: isoStartDate,
                endDate: isoEndDate,
                participants
            });
        }

        setIsModalOpen(false);
    };

    const toggleFriend = (id: string) => {
        if (selectedFriends.includes(id)) {
            setSelectedFriends(selectedFriends.filter(fid => fid !== id));
        } else {
            setSelectedFriends([...selectedFriends, id]);
        }
    };

    return (
        <div className="min-h-screen pb-32 bg-background-light dark:bg-background-dark relative">
            {/* Header */}
            <header className="px-6 pt-8 pb-4 flex items-center justify-between bg-background-light/95 dark:bg-background-dark/95 backdrop-blur sticky top-0 z-30">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/50 dark:bg-white/10 hover:bg-white/80 transition-all">
                        <span className="material-symbols-rounded text-primary dark:text-white">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-bold dark:text-white">Desafios</h1>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-maroon text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg shadow-maroon/30 active:scale-95 transition-transform flex items-center gap-2"
                >
                    <span className="material-symbols-rounded text-sm">add</span>
                    Criar
                </button>
            </header>

            <main className="px-6 space-y-4">
                {challenges.filter(c =>
                    c.creator.id === currentUserId ||
                    c.participants?.some(p => String(p.id) === String(currentUserId))
                ).length > 0 ? (
                    challenges
                        .filter(c => c.creator.id === currentUserId || c.participants?.some(p => String(p.id) === String(currentUserId)))
                        .map(challenge => {
                            const isCreator = challenge.creator.id === currentUserId;
                            const isParticipant = challenge.participants?.some(p => String(p.id) === String(currentUserId));

                            return (
                                <div
                                    key={challenge.id}
                                    onClick={() => setSelectedChallenge(challenge)}
                                    className={`bg-white dark:bg-white/5 p-5 rounded-3xl shadow-sm border border-primary/5 dark:border-white/5 relative overflow-visible transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${activeMenuId === challenge.id ? 'z-40' : 'z-0'}`}
                                >
                                    {/* Header with Status and Menu */}
                                    <div className="flex justify-between items-start mb-2 relative z-20">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide
                            ${challenge.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}
                         `}>
                                            {challenge.status === 'active' ? 'Em andamento' : 'Em breve'}
                                        </span>

                                        {isCreator && (
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenuId(activeMenuId === challenge.id ? null : challenge.id);
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 transition-colors"
                                                >
                                                    <span className="material-symbols-rounded text-primary dark:text-white text-base">more_horiz</span>
                                                </button>

                                                {activeMenuId === challenge.id && (
                                                    <div ref={menuRef} className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-primary-dark border border-black/5 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden animate-[fadeIn_0.1s_ease-out]">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openEditModal(challenge);
                                                            }}
                                                            className="w-full text-left px-4 py-3 text-xs font-bold text-primary dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2"
                                                        >
                                                            <span className="material-symbols-rounded text-sm">edit</span>
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveMenuId(null);
                                                                onDeleteChallenge(challenge.id);
                                                            }}
                                                            className="w-full text-left px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                                        >
                                                            <span className="material-symbols-rounded text-sm">delete</span>
                                                            Excluir
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {!isCreator && isParticipant && (
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenuId(activeMenuId === challenge.id ? null : challenge.id);
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 transition-colors"
                                                >
                                                    <span className="material-symbols-rounded text-primary dark:text-white text-base">more_horiz</span>
                                                </button>

                                                {activeMenuId === challenge.id && (
                                                    <div ref={menuRef} className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-primary-dark border border-black/5 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden animate-[fadeIn_0.1s_ease-out]">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveMenuId(null);
                                                                onLeaveChallenge(challenge.id);
                                                            }}
                                                            className="w-full text-left px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                                        >
                                                            <span className="material-symbols-rounded text-sm">logout</span>
                                                            Sair
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative z-10">
                                        <h3 className="text-lg font-extrabold text-primary dark:text-white mb-1">{challenge.title}</h3>
                                        <p className="text-xs font-medium opacity-60 mb-4 dark:text-gray-300">
                                            {new Date(challenge.startDate).toLocaleDateString('pt-BR')} - {new Date(challenge.endDate).toLocaleDateString('pt-BR')}
                                        </p>

                                        <div className="flex items-center -space-x-2 mb-4">
                                            <img src={challenge.creator.avatar} className="w-8 h-8 rounded-full border-2 border-white dark:border-primary-dark" title={`Criado por ${challenge.creator.name}`} />
                                            {challenge.participants.filter(p => p.id !== challenge.creator.id).map(p => (
                                                <img key={p.id} src={p.avatar} className="w-8 h-8 rounded-full border-2 border-white dark:border-primary-dark" />
                                            ))}
                                        </div>

                                        {/* Progress Calculation */}
                                        {(() => {
                                            const total = new Date(challenge.endDate).getTime() - new Date(challenge.startDate).getTime();
                                            const elapsed = Date.now() - new Date(challenge.startDate).getTime();
                                            const percent = Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));

                                            return (
                                                <>
                                                    <div className="w-full bg-gray-100 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                                                        <div className="bg-maroon h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                                                    </div>
                                                    <div className="flex justify-between mt-1">
                                                        <span className="text-[10px] font-bold opacity-50">Progresso</span>
                                                        <span className="text-[10px] font-bold opacity-50">{percent}%</span>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )
                        })
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
                        <div className="w-20 h-20 bg-gray-200 dark:bg-white/10 rounded-full flex items-center justify-center mb-4">
                            <span className="material-symbols-rounded text-4xl">emoji_events</span>
                        </div>
                        <h3 className="font-bold text-lg dark:text-white">Sem desafios ativos</h3>
                        <p className="text-xs max-w-[200px] mt-2">Crie um desafio para competir com seus amigos!</p>
                    </div>
                )}
            </main>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
                    <div className="bg-background-light dark:bg-primary-dark w-full max-w-md rounded-3xl p-6 shadow-2xl animate-[slideIn_0.3s_ease-out]">
                        <h2 className="text-xl font-bold mb-6 dark:text-white">
                            {editingId ? 'Editar Desafio' : 'Novo Desafio'}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase opacity-60 block mb-2 dark:text-white">Nome do Desafio</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="Ex: Maratona de Junho"
                                    className="w-full bg-white dark:bg-white/10 rounded-xl px-4 py-3 text-sm font-bold border-none focus:ring-2 focus:ring-maroon"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold uppercase opacity-60 block mb-2 dark:text-white">Início</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        className="w-full bg-white dark:bg-white/10 rounded-xl px-4 py-3 text-sm font-bold border-none focus:ring-2 focus:ring-maroon"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase opacity-60 block mb-2 dark:text-white">Fim</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                        className="w-full bg-white dark:bg-white/10 rounded-xl px-4 py-3 text-sm font-bold border-none focus:ring-2 focus:ring-maroon"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase opacity-60 block mb-2 dark:text-white">Participantes</label>
                                <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                                    {/* Locked Creator - Visual Confirmation */}
                                    <div className="flex flex-col items-center gap-1 min-w-[60px] opacity-100">
                                        <div className="relative">
                                            <img src={currentUser.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-primary" />
                                            <div className="absolute -bottom-1 -right-1 bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                                                <span className="material-symbols-rounded text-[10px]">lock</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold truncate w-full text-center dark:text-white">Você</span>
                                    </div>

                                    {/* Friends List */}
                                    {friends.map(friend => (
                                        <button
                                            key={friend.id}
                                            onClick={() => toggleFriend(friend.id)}
                                            className={`flex flex-col items-center gap-1 min-w-[60px] transition-opacity ${selectedFriends.includes(friend.id) ? 'opacity-100' : 'opacity-50 grayscale'}`}
                                        >
                                            <div className={`relative`}>
                                                <img src={friend.avatar} className="w-12 h-12 rounded-full object-cover" />
                                                {selectedFriends.includes(friend.id) && (
                                                    <div className="absolute -bottom-1 -right-1 bg-maroon text-white w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                                                        <span className="material-symbols-rounded text-[10px]">check</span>
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[10px] font-bold truncate w-full text-center dark:text-white">{friend.name.split(' ')[0]}</span>
                                        </button>
                                    ))}
                                </div>
                                {friends.length === 0 && (
                                    <p className="text-xs opacity-50 italic mt-2">Adicione amigos para convidar.</p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold rounded-2xl bg-gray-200 dark:bg-white/10 text-primary dark:text-white">
                                Cancelar
                            </button>
                            <button onClick={handleSubmit} className="flex-1 py-4 font-bold rounded-2xl bg-maroon text-white shadow-xl shadow-maroon/20">
                                {editingId ? 'Salvar' : 'Criar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedChallenge && (
                <ChallengeDetailsModal
                    challenge={selectedChallenge}
                    posts={posts}
                    currentUserId={currentUserId}
                    onClose={() => setSelectedChallenge(null)}
                    onLeave={() => onLeaveChallenge(selectedChallenge.id)}
                />
            )}
        </div>
    );
};

export default Challenges;