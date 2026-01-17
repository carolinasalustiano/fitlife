import React, { useState } from 'react';
import { RankingUser } from '@/types';

interface FriendsProps {
    friends: RankingUser[];
    allUsers: RankingUser[]; // For "Add Friend" suggestions
    onUserClick: (user: RankingUser) => void;
    onAddFriend: (userId: string) => void;
    onAcceptFriend: (userId: string) => void;
    onRemoveFriend: (userId: string) => void;
    incomingRequests: string[];
    outgoingRequests: string[];
    onBack: () => void;
}

const Friends: React.FC<FriendsProps> = ({ friends, allUsers, onUserClick, onAddFriend, onAcceptFriend, onRemoveFriend, incomingRequests, outgoingRequests, onBack }) => {
    const [activeTab, setActiveTab] = useState<'my_friends' | 'add_friends' | 'requests'>('my_friends');

    // Filter out current user and existing friends for the suggestion list
    const suggestedUsers = allUsers.filter(u =>
        !u.isCurrentUser && !friends.find(f => f.id === u.id)
    );

    const handleShare = async () => {
        const shareData = {
            title: 'FitLife Pro',
            text: 'Venha treinar comigo no FitLife Pro!',
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing', err);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copiado para a área de transferência!');
        }
    };

    return (
        <div className="min-h-screen pb-32 bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="px-6 pt-8 pb-4 flex items-center justify-between bg-background-light/95 dark:bg-background-dark/95 backdrop-blur sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/50 dark:bg-white/10 hover:bg-white/80 transition-all">
                        <span className="material-symbols-rounded text-primary dark:text-white">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-bold dark:text-white">Amigos</h1>
                </div>
                <button onClick={handleShare} className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 active:scale-95 transition-transform">
                    <span className="material-symbols-rounded text-sm">share</span>
                </button>
            </header>

            <main className="px-6">
                {/* Tabs */}
                <div className="flex p-1 bg-white dark:bg-white/5 rounded-2xl mb-6 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('my_friends')}
                        className={`flex-1 py-3 px-2 text-[10px] md:text-xs font-bold uppercase rounded-xl transition-all whitespace-nowrap ${activeTab === 'my_friends' ? 'bg-primary text-white shadow-lg' : 'text-primary/60 dark:text-white/60'}`}
                    >
                        Seus Amigos ({friends.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`flex-1 py-3 px-2 text-[10px] md:text-xs font-bold uppercase rounded-xl transition-all whitespace-nowrap relative ${activeTab === 'requests' ? 'bg-primary text-white shadow-lg' : 'text-primary/60 dark:text-white/60'}`}
                    >
                        Solicitações
                        {incomingRequests?.length > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('add_friends')}
                        className={`flex-1 py-3 px-2 text-[10px] md:text-xs font-bold uppercase rounded-xl transition-all whitespace-nowrap ${activeTab === 'add_friends' ? 'bg-primary text-white shadow-lg' : 'text-primary/60 dark:text-white/60'}`}
                    >
                        Adicionar
                    </button>
                </div>

                {activeTab === 'my_friends' ? (
                    <div className="space-y-4">
                        {friends.length > 0 ? (
                            friends.map(friend => (
                                <div key={friend.id} className="bg-white dark:bg-white/5 p-4 rounded-2xl flex items-center justify-between shadow-sm active:scale-[0.98] transition-transform">
                                    <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => onUserClick(friend)}>
                                        <img src={friend.avatar} className="w-12 h-12 rounded-full border-2 border-tan object-cover" />
                                        <div>
                                            <h3 className="font-bold text-sm dark:text-white">{friend.name}</h3>
                                            <p className="text-[10px] opacity-60 font-bold uppercase dark:text-gray-300">{friend.stats}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onRemoveFriend(friend.id); }}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 transition-colors"
                                    >
                                        <span className="material-symbols-rounded text-sm">close</span>
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 opacity-50">
                                <span className="material-symbols-rounded text-5xl mb-2">sentiment_sad</span>
                                <p className="font-bold text-sm">Você ainda não tem amigos.</p>
                            </div>
                        )}
                    </div>
                ) : activeTab === 'requests' ? (
                    <div className="space-y-4">
                        {incomingRequests?.length > 0 ? (
                            allUsers.filter(u => incomingRequests.includes(u.id)).map(requestUser => (
                                <div key={requestUser.id} className="bg-white dark:bg-white/5 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => onUserClick(requestUser)}>
                                        <img src={requestUser.avatar} className="w-12 h-12 rounded-full border-2 border-primary object-cover" />
                                        <div>
                                            <h3 className="font-bold text-sm dark:text-white">{requestUser.name}</h3>
                                            <p className="text-[10px] text-primary font-bold uppercase">Quer ser seu amigo</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onRemoveFriend(requestUser.id)} // Reject is effectively remove logic if pending
                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20"
                                        >
                                            <span className="material-symbols-rounded text-sm">close</span>
                                        </button>
                                        <button
                                            onClick={() => onAcceptFriend(requestUser.id)}
                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20"
                                        >
                                            <span className="material-symbols-rounded text-sm">check</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 opacity-50">
                                <span className="material-symbols-rounded text-5xl mb-2">mark_email_read</span>
                                <p className="font-bold text-sm">Nenhuma solicitação pendente.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase opacity-50 mb-2 dark:text-white">Sugestões para você</h3>
                        {suggestedUsers.length > 0 ? (
                            suggestedUsers.map(user => {
                                const isSent = outgoingRequests?.includes(user.id);
                                const isReceived = incomingRequests?.includes(user.id);

                                return (
                                    <div key={user.id} className="bg-white dark:bg-white/5 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-3" onClick={() => onUserClick(user)}>
                                            <img src={user.avatar} className="w-12 h-12 rounded-full border-2 border-gray-100 dark:border-white/10 object-cover" />
                                            <div>
                                                <h3 className="font-bold text-sm dark:text-white">{user.name}</h3>
                                                <p className="text-[10px] opacity-60 font-bold uppercase dark:text-gray-300">{user.stats}</p>
                                            </div>
                                        </div>
                                        {isReceived ? (
                                            <button onClick={() => onAcceptFriend(user.id)} className="bg-green-50 text-green-600 px-3 py-1 rounded-lg text-xs font-bold">
                                                Aceitar
                                            </button>
                                        ) : isSent ? (
                                            <span className="bg-gray-100 text-gray-400 dark:bg-white/10 dark:text-white/40 px-3 py-1 rounded-lg text-xs font-bold">
                                                Enviado
                                            </span>
                                        ) : (
                                            <button onClick={() => onAddFriend(user.id)} className="bg-primary/10 text-primary hover:bg-primary hover:text-white p-2 rounded-full transition-colors">
                                                <span className="material-symbols-rounded">person_add</span>
                                            </button>
                                        )}
                                    </div>
                                )
                            })
                        ) : (
                            <div className="text-center py-10 opacity-50">
                                <span className="material-symbols-rounded text-5xl mb-2">group_off</span>
                                <p className="font-bold text-sm">Nenhum outro usuário encontrado.</p>
                                <p className="text-xs mt-2">Convide amigos para baixar o app!</p>
                            </div>
                        )}
                    </div>
                )}
            </main >
        </div >
    );
};

export default Friends;