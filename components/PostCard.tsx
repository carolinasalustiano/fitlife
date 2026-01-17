import React, { useState, useRef, useEffect } from 'react';
import { Post, Comment } from '@/types';
import { IMAGES } from '@/constants';

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string, text: string) => void;
  onDelete?: (postId: string) => void;
  onEdit?: (post: Post) => void;
  currentUserAvatar?: string;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onComment, onDelete, onEdit, currentUserAvatar }) => {
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLike = () => {
    if (onLike) onLike(post.id);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'FitLife Pro',
      text: `Confira o treino de ${post.user.name}: ${post.title}`,
      url: window.location.href, // In a real app, this would be a deep link
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback
      alert('Link copiado para a área de transferência!');
      navigator.clipboard.writeText(`Confira o treino de ${post.user.name}: ${post.title}`);
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim() && onComment) {
      onComment(post.id, commentText);
      setCommentText('');
    }
  };

  return (
    <article className={`bg-white dark:bg-primary-dark/40 rounded-[2rem] overflow-visible shadow-sm border border-black/5 dark:border-white/5 p-1 transition-all relative ${isMenuOpen ? 'z-40' : 'z-0'}`}>
      {/* Header - Added z-20 to keep menu above content */}
      <div className="p-3 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-3">
          <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full object-cover border-2 border-tan" />
          <div>
            <h3 className="font-bold text-sm dark:text-white">{post.user.name}</h3>
            <p className="text-[11px] opacity-60 dark:text-gray-300">{post.user.isCurrentUser ? 'Você' : post.user.name} • {post.timeAgo}</p>
          </div>
        </div>

        {/* Only show menu if current user */}
        {post.user.isCurrentUser && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-primary/40 dark:text-white/40 transition-colors"
            >
              <span className="material-symbols-rounded">more_horiz</span>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-primary-dark border border-black/5 dark:border-white/10 rounded-xl shadow-xl z-50 min-w-[140px] overflow-hidden animate-[fadeIn_0.1s_ease-out]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    if (onEdit) onEdit(post);
                  }}
                  className="w-full text-left px-4 py-3 text-xs font-bold text-primary dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2"
                >
                  <span className="material-symbols-rounded text-sm">edit</span>
                  Editar
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    if (onDelete) onDelete(post.id);
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
      </div>

      {post.image && (
        <div className="relative px-3 z-10">
          <div className="relative rounded-2xl overflow-hidden aspect-video group">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
              <span className="bg-maroon text-white text-[10px] font-bold px-2 py-0.5 rounded w-fit mb-2">{post.type}</span>
              <h4 className="text-white font-bold text-lg">{post.title}</h4>
            </div>
          </div>
        </div>
      )}

      {post.stats && (
        <div className="grid grid-cols-3 gap-2 px-3 py-4 z-10 relative">
          {post.stats.map((stat, idx) => (
            <div key={idx} className={`${idx === 0 ? 'bg-light-blue/20' : idx === 1 ? 'bg-tan/20' : 'bg-maroon/10'} p-3 rounded-2xl text-center`}>
              <p className={`text-[10px] font-bold uppercase opacity-60 dark:text-white mb-1`}>{stat.label}</p>
              {stat.label === 'Intensidade' ? (
                <div className="flex justify-center gap-0.5 mt-1">
                  <div className="w-1.5 h-3 bg-maroon rounded-full"></div>
                  <div className="w-1.5 h-3 bg-maroon rounded-full"></div>
                  <div className={`w-1.5 h-3 ${stat.value === 'Alta' ? 'bg-maroon' : 'bg-maroon/30'} rounded-full`}></div>
                  <div className="w-1.5 h-3 bg-maroon/30 rounded-full"></div>
                </div>
              ) : (
                <p className="text-lg font-extrabold text-primary dark:text-white">{stat.value}<span className="text-xs ml-0.5 font-normal">{stat.unit}</span></p>
              )}
            </div>
          ))}
          {!post.stats.some(s => s.label === 'Intensidade') && (
            <div className="bg-maroon/10 p-3 rounded-2xl text-center">
              <p className="text-[10px] font-bold uppercase opacity-60 dark:text-white mb-1">Intensidade</p>
              <div className="flex justify-center gap-0.5 mt-1">
                <div className="w-1.5 h-3 bg-maroon rounded-full"></div>
                <div className="w-1.5 h-3 bg-maroon rounded-full"></div>
                <div className="w-1.5 h-3 bg-maroon rounded-full"></div>
                <div className="w-1.5 h-3 bg-maroon/30 rounded-full"></div>
              </div>
            </div>
          )}
        </div>
      )}

      {post.workoutDetails && (
        <div className="px-3 z-10 relative">
          <div className="mt-1 flex items-center gap-4 bg-background-light dark:bg-background-dark/50 p-3 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-tan flex items-center justify-center shrink-0">
              <span className="material-symbols-rounded text-primary">fitness_center</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold dark:text-white">{post.workoutDetails.name}</span>
                    {post.xp && (
                      <span className="bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">+{post.xp} XP</span>
                    )}
                  </div>

                  {/* Only show details if they exist */}
                  {(post.workoutDetails.weight || post.workoutDetails.sets) && (
                    <div className="flex gap-3">
                      {post.workoutDetails.weight && (
                        <span className="text-[10px] font-bold dark:text-white opacity-80">{post.workoutDetails.weight}</span>
                      )}
                      {post.workoutDetails.sets && (
                        <span className="text-[10px] font-bold dark:text-white opacity-80">{post.workoutDetails.sets}</span>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-bold opacity-60 dark:text-gray-300 whitespace-nowrap mt-0.5">{post.workoutDetails.date}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="px-6 pb-6 pt-4 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-6">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 group transition-colors ${post.isLiked ? 'text-maroon' : 'text-primary dark:text-white'}`}
          >
            <span className={`material-symbols-rounded transition-transform group-active:scale-125 ${post.isLiked ? 'font-variation-fill' : ''}`}>
              {post.isLiked ? 'favorite' : 'favorite'}
            </span>
            <span className="text-xs font-bold">{post.likes} <span className="font-normal opacity-60">Curtir</span></span>
          </button>

          <button
            onClick={() => setIsCommentOpen(!isCommentOpen)}
            className="flex items-center gap-1.5 text-primary dark:text-white"
          >
            <span className="material-symbols-rounded opacity-40">chat_bubble</span>
            <span className="text-xs font-bold">{post.comments.length} <span className="font-normal opacity-60">Comentar</span></span>
          </button>
        </div>

        <button onClick={handleShare} className="text-primary/40 dark:text-white/40 active:scale-95 transition-transform">
          <span className="material-symbols-rounded">share</span>
        </button>
      </div>

      {/* Comment Section */}
      {isCommentOpen && (
        <div className="px-3 pb-3 animate-[fadeIn_0.2s_ease-out] z-10 relative">
          <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
          <div className="bg-background-light dark:bg-white/5 rounded-2xl p-3">
            {/* Comment List */}
            {post.comments.length > 0 && (
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto hide-scrollbar px-1">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2.5 items-start">
                    <img src={comment.user.avatar} alt={comment.user.name} className="w-6 h-6 rounded-full object-cover shrink-0 mt-1" />
                    <div className="flex-1 bg-white dark:bg-white/10 p-2 rounded-r-xl rounded-bl-xl text-xs">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-bold dark:text-white">{comment.user.name}</span>
                        <span className="opacity-40 text-[10px] dark:text-gray-400">{comment.createdAt}</span>
                      </div>
                      <p className="dark:text-gray-200">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSubmitComment} className="flex gap-2 items-center">
              <img src={currentUserAvatar || IMAGES.currentUser} className="w-8 h-8 rounded-full border border-tan object-cover" />
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Escreva um comentário..."
                  className="w-full bg-white dark:bg-white/10 rounded-full pl-4 pr-10 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white border-none"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-rounded text-sm">send</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </article>
  );
};

export default PostCard;