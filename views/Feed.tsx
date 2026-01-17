import React from 'react';
import { IMAGES } from '@/constants';
import { Post, ViewState } from '@/types';
import PostCard from '../components/PostCard';

interface FeedProps {
  posts: Post[];
  streak: number;
  onLike: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onDelete: (postId: string) => void;
  onEdit: (post: Post) => void;
  onNavigate: (view: ViewState) => void;
  onOpenProfile: () => void;
  user?: { name: string; avatar: string };
}

const Feed: React.FC<FeedProps> = ({ posts, streak, onLike, onComment, onDelete, onEdit, onNavigate, onOpenProfile, user }) => {
  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-primary text-white px-6 pt-12 pb-6 rounded-b-[2.5rem] shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onOpenProfile} className="flex items-center gap-2 group text-left">
            <div className="w-10 h-10 rounded-full bg-tan flex items-center justify-center overflow-hidden border-2 border-tan transition-transform group-active:scale-95">
              <img src={user?.avatar || IMAGES.currentUser} alt="User" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[10px] opacity-70 uppercase tracking-widest font-bold">Bom dia</p>
              <h1 className="text-lg font-extrabold leading-tight group-hover:underline decoration-tan underline-offset-4">{user?.name || 'Alex Rivera'}</h1>
            </div>
          </button>
          <div className="bg-maroon/20 backdrop-blur-md border border-maroon/30 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="material-symbols-rounded text-maroon text-xl">local_fire_department</span>
            <span className="font-extrabold text-sm uppercase tracking-tighter">{streak} Dias</span>
          </div>
        </div>
        <div className="flex gap-4 mt-6 overflow-x-auto hide-scrollbar text-sm font-bold opacity-80 px-1 pb-2">
          <button
            onClick={() => onNavigate(ViewState.FEED)}
            className="border-b-2 border-tan pb-2 text-tan whitespace-nowrap transition-colors"
          >
            Feed de Atividades
          </button>
          <button
            onClick={() => onNavigate(ViewState.RANKING)}
            className="pb-2 whitespace-nowrap opacity-60 hover:opacity-100 transition-opacity"
          >
            Ranking Global
          </button>
          <button
            onClick={() => onNavigate(ViewState.CHALLENGES)}
            className="pb-2 whitespace-nowrap opacity-60 hover:opacity-100 transition-opacity"
          >
            Desafios
          </button>
          <button
            onClick={() => onNavigate(ViewState.FRIENDS)}
            className="pb-2 whitespace-nowrap opacity-60 hover:opacity-100 transition-opacity"
          >
            Amigos
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-5 py-6 space-y-6">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={onLike}
            onComment={onComment}
            onDelete={onDelete}
            onEdit={onEdit}
            currentUserAvatar={user?.avatar || IMAGES.currentUser}
          />
        ))}
      </main>
    </div>
  );
};

export default Feed;