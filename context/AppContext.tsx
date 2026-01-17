import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { ViewState, Post, RankingUser, Challenge } from '../types';
import { FEED_DATA, IMAGES, RANKING_DATA } from '../constants';
import { WorkoutData } from '../views/LogWorkout';

interface AppContextType {
    // State
    isAuthenticated: boolean;
    currentView: ViewState;
    previousView: ViewState | null;
    posts: Post[];
    ranking: RankingUser[];
    challenges: Challenge[];
    userWrapper: {
        streak: number;
        weight: number;
        initialWeight: number;
        height: number;
        bmi: number;
        selectedUser: RankingUser | null;
        editingPost: Post | null;
        isLogOpen: boolean;
        friendsIds: string[];
        incomingRequests: string[];
        outgoingRequests: string[];
        currentUser: RankingUser;
    };

    // Actions
    login: () => void;
    logout: () => void;
    navigate: (view: ViewState) => void;
    goBack: () => void;
    openLog: () => void;
    closeLog: () => void;
    updateName: (newName: string) => void;
    saveWorkout: (data: WorkoutData) => void;
    deletePost: (postId: string) => void;
    editPost: (post: Post) => void;
    likePost: (postId: string) => void;
    commentPost: (postId: string, text: string) => void;
    createChallenge: (data: any) => void;
    updateChallenge: (challenge: Challenge) => void;
    deleteChallenge: (id: string) => void;
    leaveChallenge: (id: string) => void;
    selectUser: (user: RankingUser) => void;
    openMyProfile: () => void;
    updateWeight: (newWeight: number) => void;
    updateInitialWeight: (newWeight: number) => void;
    addFriend: (friendId: string) => void;
    acceptFriend: (friendId: string) => void;
    removeFriend: (friendId: string) => void;
    currentUserProfile: RankingUser | null;
    isNotificationsEnabled: boolean;
    toggleNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // 1. STATE DEFINITIONS
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUserProfile, setCurrentUserProfile] = useState<RankingUser | null>(null);
    const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
    const [currentView, setCurrentView] = useState<ViewState>(ViewState.FEED);
    const [previousView, setPreviousView] = useState<ViewState | null>(null);
    const [isLogOpen, setIsLogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<RankingUser | null>(null);
    const [editingPost, setEditingPost] = useState<Post | null>(null);

    const [posts, setPosts] = useState<Post[]>([]);
    const [ranking, setRanking] = useState<RankingUser[]>([]);
    const [friendsIds, setFriendsIds] = useState<string[]>([]);
    const [friendRequests, setFriendRequests] = useState<{ sent: string[], received: string[] }>({ sent: [], received: [] });
    const [challenges, setChallenges] = useState<Challenge[]>([]);

    const previousRank = React.useRef<number | null>(null);

    // 2. HELPERS
    const getCurrentUser = (): RankingUser => {
        if (currentUserProfile) {
            return {
                ...currentUserProfile,
                leagueLevel: currentUserProfile.leagueLevel || 'Fácil',
                points: currentUserProfile.points || 1300
            }
        }
        return ranking.find(u => u.isCurrentUser) || {
            id: 'guest',
            name: 'Convidado',
            avatar: IMAGES.currentUser,
            points: 0,
            rank: 0,
            stats: '0 treinos',
            photos: 0,
            leagueLevel: 'Fácil',
            isCurrentUser: true,
            level: 1,
            trend: 'same',
            streak: 0,
            currentWeight: 0,
            initialWeight: 0,
            height: 0,
            bmi: 0
        };
    };

    const calculateStreak = (userPosts: Post[]): number => {
        if (!userPosts.length) return 0;
        const dates = Array.from(new Set(
            userPosts
                .filter(p => p.createdAt)
                .map(p => new Date(p.createdAt!).toISOString().split('T')[0])
        )).sort((a, b) => b.localeCompare(a));

        if (!dates.length) return 0;

        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const yesterdayDate = new Date(now);
        yesterdayDate.setDate(now.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split('T')[0];

        if (dates[0] !== today && dates[0] !== yesterday) {
            return 0;
        }

        let streak = 1;
        let currentDate = new Date(dates[0]);
        for (let i = 1; i < dates.length; i++) {
            const expectedPrevDate = new Date(currentDate);
            expectedPrevDate.setDate(currentDate.getDate() - 1);
            const expectedPrevStr = expectedPrevDate.toISOString().split('T')[0];
            if (dates[i] === expectedPrevStr) {
                streak++;
                currentDate = new Date(dates[i]);
            } else {
                break;
            }
        }
        return streak;
    };

    // 3. DATA FETCHING
    const fetchPosts = async (currentUserId?: string) => {
        try {
            // Need to get user again if currentUserId is not provided, because state might be stale
            // Need to get user again if currentUserId is not provided, because state might be stale
            const targetId = currentUserId || currentUserProfile?.id;

            let query = supabase
                .from('posts')
                .select(`
                    *,
                    profiles:user_id (full_name, avatar_url, id),
                    post_likes (user_id),
                    post_comments (
                        id, text, created_at,
                        profiles:user_id (full_name, avatar_url, id)
                    )
                `)
                .order('created_at', { ascending: false });

            if (targetId) {
                // Fetch friends to filter feed
                const { data: outgoing } = await supabase
                    .from('friendships')
                    .select('friend_id')
                    .eq('user_id', targetId)
                    .eq('status', 'accepted');

                const { data: incoming } = await supabase
                    .from('friendships')
                    .select('user_id')
                    .eq('friend_id', targetId)
                    .eq('status', 'accepted');

                const friendIds = [
                    ...(outgoing?.map(f => f.friend_id) || []),
                    ...(incoming?.map(f => f.user_id) || [])
                ];

                // Filter posts: My posts + Friends posts
                query = query.in('user_id', [targetId, ...friendIds]);
            }

            const { data, error } = await query;

            if (error) throw error;
            if (data) {
                const formattedPosts: Post[] = data.map(dbPost => {
                    const profile = dbPost.profiles || { full_name: 'Desconhecido', avatar_url: IMAGES.currentUser, id: dbPost.user_id };

                    // Check if current user liked this post
                    const isLiked = targetId ? (dbPost.post_likes || []).some((like: any) => like.user_id === targetId) : false;

                    // Map comments
                    const comments = (dbPost.post_comments || []).map((c: any) => ({
                        id: c.id,
                        user: {
                            id: c.profiles?.id,
                            name: c.profiles?.full_name || 'Usuário',
                            avatar: c.profiles?.avatar_url || IMAGES.currentUser
                        },
                        text: c.text,
                        createdAt: new Date(c.created_at).toLocaleDateString()
                    }));

                    return {
                        id: dbPost.id,
                        user: {
                            id: profile.id,
                            name: profile.full_name || 'Desconhecido',
                            avatar: profile.avatar_url || IMAGES.currentUser,
                            isCurrentUser: profile.id === targetId // Visual check
                        },
                        createdAt: dbPost.created_at,
                        timeAgo: new Date(dbPost.created_at).toLocaleDateString(),
                        location: 'Academia',
                        type: dbPost.activity.toUpperCase(),
                        title: `Treino de ${dbPost.activity}`,
                        image: dbPost.image_url || undefined,
                        workoutDetails: {
                            name: `Treino de ${dbPost.activity}`,
                            date: new Date(dbPost.created_at).toLocaleDateString(),
                            weight: dbPost.weight || '',
                            sets: dbPost.sets || ''
                        },
                        stats: [
                            { label: 'Duração', value: dbPost.duration.toString(), unit: 'min' },
                            { label: 'Intensidade', value: dbPost.intensity },
                        ],
                        likes: dbPost.likes_count || 0,
                        isLiked: isLiked,
                        comments: comments,
                        xp: 50
                    };
                });
                setPosts(formattedPosts);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const fetchChallenges = async () => {
        try {
            const { data, error } = await supabase
                .from('challenges')
                .select(`
                    *,
                    creator:profiles!creator_id (id, full_name, avatar_url),
                    challenge_participants (
                        user:profiles (id, full_name, avatar_url)
                    )
                `)
                .order('start_date', { ascending: false });

            if (error) throw error;

            if (data) {
                const formattedChallenges: Challenge[] = data.map(dbChallenge => {
                    const participants = dbChallenge.challenge_participants.map((cp: any) => ({
                        id: cp.user.id,
                        name: cp.user.full_name || 'Usuário',
                        avatar: cp.user.avatar_url || IMAGES.currentUser
                    }));

                    // Determine status based on dates
                    const now = new Date();
                    const start = new Date(dbChallenge.start_date);
                    const end = new Date(dbChallenge.end_date);

                    // Ensure end date covers the full day (set to 23:59:59)
                    end.setHours(23, 59, 59, 999);
                    // Ensure start date is beginning of day
                    start.setHours(0, 0, 0, 0);

                    let status: 'active' | 'upcoming' | 'completed' = 'upcoming';

                    if (now >= start && now <= end) status = 'active';
                    else if (now > end) status = 'completed';

                    return {
                        id: dbChallenge.id,
                        title: dbChallenge.title,
                        description: dbChallenge.description,
                        startDate: dbChallenge.start_date,
                        endDate: dbChallenge.end_date,
                        creator: {
                            id: dbChallenge.creator.id,
                            name: dbChallenge.creator.full_name,
                            avatar: dbChallenge.creator.avatar_url
                        },
                        participants,
                        status
                    };
                });
                setChallenges(formattedChallenges);
            }
        } catch (error) {
            console.error('Error fetching challenges:', error);
        }
    };

    const fetchRanking = async (currentUserId?: string) => {
        try {
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('*');

            if (error) throw error;

            if (profiles) {
                // Determine target ID (either passed or from state)
                const targetId = currentUserId || currentUserProfile?.id;

                const rankingData: RankingUser[] = await Promise.all(profiles.map(async (profile) => {
                    const { count: workoutCount } = await supabase
                        .from('posts')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', profile.id);

                    const { count: photoCount } = await supabase
                        .from('posts')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', profile.id)
                        .not('image_url', 'is', null);

                    const points = (workoutCount || 0) * 50;
                    const level = Math.floor(points / 500) + 1;

                    return {
                        id: profile.id,
                        name: profile.full_name || 'Usuário',
                        avatar: profile.avatar_url || IMAGES.currentUser,
                        points: points,
                        rank: 0,
                        stats: `${workoutCount || 0} treinos`,
                        photos: photoCount || 0,
                        leagueLevel: level > 10 ? 'Avançado' : level > 5 ? 'Intermediário' : 'Fácil',
                        isCurrentUser: profile.id === targetId,
                        level: level,
                        trend: 'up',
                        streak: 0,
                        currentWeight: profile.current_weight || 0,
                        initialWeight: profile.initial_weight || 0,
                        height: profile.height || 175,
                        bmi: profile.current_weight && profile.height ? parseFloat((profile.current_weight / ((profile.height / 100) ** 2)).toFixed(1)) : 24.2,
                    };
                }));

                rankingData.sort((a, b) => b.points - a.points);
                rankingData.forEach((u, i) => u.rank = i + 1);

                setRanking(rankingData);

                // Fetch Friendships (Detailed)
                if (targetId) {
                    // 1. Outgoing (I added someone)
                    const { data: outgoing } = await supabase
                        .from('friendships')
                        .select('friend_id, status')
                        .eq('user_id', targetId);

                    // 2. Incoming (Someone added me)
                    const { data: incoming } = await supabase
                        .from('friendships')
                        .select('user_id, status')
                        .eq('friend_id', targetId);

                    const confirmed: string[] = [];
                    const sent: string[] = [];
                    const received: string[] = [];

                    outgoing?.forEach((f: any) => {
                        if (f.status === 'accepted') confirmed.push(f.friend_id);
                        else if (f.status === 'pending') sent.push(f.friend_id);
                    });

                    incoming?.forEach((f: any) => {
                        if (f.status === 'accepted') confirmed.push(f.user_id);
                        else if (f.status === 'pending') received.push(f.user_id);
                    });

                    setFriendsIds(confirmed);
                    // We need to store requests somewhere. 
                    // Let's extend UserWrapper via setRanking or dedicated state if possible, 
                    // but for now let's use a ref or state exposed via Context?
                    // The prompt implies UI needs this.
                    // Ideally we add `friendRequests` to AppContext state.
                    setFriendRequests({ sent, received });
                }

            }
        } catch (error) {
            console.error('Error fetching ranking:', error);
        }
    };

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (data && !error) {
                // Fetch dynamic stats
                const { count: workoutCount } = await supabase
                    .from('posts')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', userId);

                const { count: photoCount } = await supabase
                    .from('posts')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', userId)
                    .not('image_url', 'is', null);

                // Calculate points (e.g. 50 XP per workout)
                const points = (workoutCount || 0) * 50;

                // Calculate Level based on points (e.g. every 500 points = 1 level)
                const level = Math.floor(points / 500) + 1;

                const userProfile: RankingUser = {
                    id: data.id,
                    name: data.full_name || 'Usuário',
                    avatar: data.avatar_url || IMAGES.currentUser,
                    points: points,
                    rank: 0, // Rank is calculated in the Ranking component usually, or set later
                    stats: `${workoutCount || 0} treinos`,
                    photos: photoCount || 0,
                    leagueLevel: level > 10 ? 'Avançado' : level > 5 ? 'Intermediário' : 'Fácil',
                    isCurrentUser: true,
                    level: level,
                    trend: 'up',
                    streak: 0, // Using calculated streak
                    currentWeight: data.current_weight || 0,
                    initialWeight: data.initial_weight || 0,
                    height: data.height || 175,
                    bmi: data.current_weight && data.height ? parseFloat((data.current_weight / ((data.height / 100) ** 2)).toFixed(1)) : 24.2,
                };
                setCurrentUserProfile(userProfile);

                setRanking(prev => {
                    const exists = prev.some(u => u.id === userId);
                    if (exists) {
                        return prev.map(u => u.id === userId ? { ...u, ...userProfile } : u);
                    } else {
                        return prev.map(u => u.isCurrentUser ? { ...userProfile } : u);
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    // 4. EFFECTS
    useEffect(() => {

        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsAuthenticated(!!session);
            if (session?.user) {
                fetchProfile(session.user.id);
                fetchPosts(session.user.id);
                fetchChallenges();
                fetchRanking(session.user.id);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session);
            if (session?.user) {
                fetchProfile(session.user.id);
                fetchPosts(session.user.id);
                fetchChallenges();
                fetchRanking(session.user.id);
            }
        });

        return () => subscription.unsubscribe();
        // Persistence Effects
        // useEffect(() => { localStorage.setItem('fitlife_posts', JSON.stringify(posts)); }, [posts]);
        // useEffect(() => { localStorage.setItem('fitlife_ranking', JSON.stringify(ranking)); }, [ranking]);
        // useEffect(() => { localStorage.setItem('fitlife_challenges', JSON.stringify(challenges)); }, [challenges]);

    }, []);

    useEffect(() => {
        const currentUser = ranking.find(u => u.isCurrentUser);
        if (!currentUser) return;
        const currentRank = currentUser.rank;

        if (previousRank.current === null) {
            previousRank.current = currentRank;
            return;
        }

        if (isNotificationsEnabled && previousRank.current <= 3 && currentRank > 3) {
            new Notification('Alerta de Ranking', {
                body: 'Atenção! Você saiu do Top 3. Treine agora para recuperar sua posição!',
                icon: IMAGES.currentUser
            });
        }
        previousRank.current = currentRank;
    }, [ranking, isNotificationsEnabled]);

    // 5. ACTIONS
    const toggleNotifications = () => {
        const newState = !isNotificationsEnabled;
        if (newState) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    setIsNotificationsEnabled(true);
                    alert('Notificações ativadas! Avisaremos se você sair do Top 3.');
                } else {
                    alert('Permissão de notificação negada.');
                    setIsNotificationsEnabled(false);
                }
            });
        } else {
            setIsNotificationsEnabled(false);
        }
    };

    const login = () => setIsAuthenticated(true);

    const logout = async () => {
        if (window.confirm('Tem certeza que deseja sair do app?')) {
            await supabase.auth.signOut();
            setIsAuthenticated(false);
            setCurrentView(ViewState.FEED);
        }
    };

    const updateName = (newName: string) => {
        setRanking(prev => prev.map(u => u.isCurrentUser ? { ...u, name: newName } : u));
        setPosts(prev => prev.map(p => p.user.isCurrentUser ? { ...p.user, name: newName } : p));
        const currentUser = getCurrentUser();
        setChallenges(prev => prev.map(c => ({
            ...c,
            creator: c.creator.id === currentUser.id ? { ...c.creator, name: newName } : c.creator,
            participants: c.participants.map(p => p.id === currentUser.id ? { ...p, name: newName } : p)
        })));
        if (selectedUser?.isCurrentUser) setSelectedUser(prev => prev ? { ...prev, name: newName } : null);
    };

    const saveWorkout = async (data: WorkoutData) => {
        if (editingPost) {
            let finalImageUrl = data.photo;
            if (data.photoFile) {
                try {
                    const fileExt = data.photoFile.name.split('.').pop();
                    const fileName = `${Date.now()}.${fileExt}`;
                    const { error: uploadError } = await supabase.storage.from('workouts').upload(fileName, data.photoFile);
                    if (uploadError) throw uploadError;
                    const { data: urlData } = supabase.storage.from('workouts').getPublicUrl(fileName);
                    finalImageUrl = urlData.publicUrl;
                } catch (error) { console.error('Upload error', error); alert('Erro imagem'); }
            }
            try {
                const { error } = await supabase.from('posts').update({
                    activity: data.activity, duration: data.duration, intensity: data.intensity,
                    weight: data.weight, sets: data.sets, image_url: finalImageUrl
                }).eq('id', editingPost.id);
                if (error) throw error;
                fetchPosts();
                fetchRanking();
            } catch (e) { console.error(e); alert('Erro update'); }
            setEditingPost(null);
        } else {
            let finalImageUrl = data.photo;
            if (data.photoFile) {
                try {
                    const fileExt = data.photoFile.name.split('.pop');
                    const fileName = `${Date.now()}.${fileExt}`;
                    const { error: uploadError } = await supabase.storage.from('workouts').upload(fileName, data.photoFile);
                    if (uploadError) throw uploadError;
                    const { data: urlData } = supabase.storage.from('workouts').getPublicUrl(fileName);
                    finalImageUrl = urlData.publicUrl;
                } catch (error) { console.error('Upload error', error); }
            }
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase.from('profiles').upsert({
                        id: user.id, full_name: user.user_metadata.full_name || 'Usuário',
                        avatar_url: user.user_metadata.avatar_url, updated_at: new Date().toISOString()
                    });
                    const { error } = await supabase.from('posts').insert({
                        user_id: user.id, activity: data.activity, duration: data.duration,
                        intensity: data.intensity, weight: data.weight, sets: data.sets,
                        image_url: finalImageUrl, likes_count: 0
                    });
                    if (error) throw error;
                    fetchPosts();
                    fetchRanking();
                    fetchProfile(user.id);
                }
            } catch (e) { console.error(e); alert('Erro save'); }
        }
        setIsLogOpen(false);
        if (!editingPost) {
            setCurrentView(ViewState.FEED);
            setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
        }
    };

    const deletePost = async (postId: string) => {
        if (window.confirm('Excluir treino?')) {
            try {
                const { error } = await supabase.from('posts').delete().eq('id', postId);
                if (error) throw error;
                setPosts(current => current.filter(p => p.id !== postId));
                fetchRanking();
                if (currentUserProfile) fetchProfile(currentUserProfile.id);
            } catch (e) { console.error(e); alert('Erro excluir'); }
        }
    };

    const likePost = async (postId: string) => {
        if (!currentUserProfile) return;
        const post = posts.find(p => p.id === postId);
        if (!post) return;

        // Optimistic update
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.isLiked ? p.likes - 1 : p.likes + 1, isLiked: !p.isLiked } : p));

        try {
            if (post.isLiked) {
                // Unlike
                const { error } = await supabase
                    .from('post_likes')
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', currentUserProfile.id);
                if (error) throw error;
            } else {
                // Like
                const { error } = await supabase
                    .from('post_likes')
                    .insert({ post_id: postId, user_id: currentUserProfile.id });
                if (error) throw error;
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            // Revert on error
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.isLiked ? p.likes - 1 : p.likes + 1, isLiked: !p.isLiked } : p));
        }
    };

    const commentPost = async (postId: string, text: string) => {
        if (!currentUserProfile) return;

        try {
            const { data, error } = await supabase
                .from('post_comments')
                .insert({
                    post_id: postId,
                    user_id: currentUserProfile.id,
                    text: text
                })
                .select()
                .single();

            if (error) throw error;

            // Refresh posts to show new comment (or we could optimistically append)
            fetchPosts();
        } catch (error) {
            console.error('Error commenting:', error);
            alert('Erro ao enviar comentário.');
        }
    };

    // Navigation & Views
    const navigate = (view: ViewState) => {
        if (view === currentView) return;
        setPreviousView(currentView);
        setCurrentView(view);
    };

    const selectUser = (user: RankingUser) => { setSelectedUser(user); setPreviousView(currentView); setCurrentView(ViewState.USER_PROFILE); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const openMyProfile = () => { setSelectedUser(getCurrentUser()); setPreviousView(currentView); setCurrentView(ViewState.USER_PROFILE); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const goBack = () => { if (previousView) setCurrentView(previousView); else setCurrentView(ViewState.FEED); };

    const addFriend = async (id: string) => {
        if (!currentUserProfile) return;
        if (!friendRequests.sent.includes(id) && !friendsIds.includes(id)) {
            // Optimistic Update
            setFriendRequests(prev => ({ ...prev, sent: [...prev.sent, id] }));
            alert('Solicitação de amizade enviada!');

            try {
                const { error } = await supabase.from('friendships').insert({
                    user_id: currentUserProfile.id,
                    friend_id: id,
                    status: 'pending'
                });
                if (error) throw error;
            } catch (e) {
                console.error('Error adding friend', e);
            }
        }
    };

    const acceptFriend = async (requesterId: string) => {
        if (!currentUserProfile) return;
        // Optimistic
        setFriendRequests(prev => ({ ...prev, received: prev.received.filter(id => id !== requesterId) }));
        setFriendsIds(prev => [...prev, requesterId]);

        try {
            // I am the friend_id, requester is user_id
            const { error } = await supabase
                .from('friendships')
                .update({ status: 'accepted' })
                .eq('user_id', requesterId)
                .eq('friend_id', currentUserProfile.id);

            if (error) throw error;
            fetchRanking(); // Refresh to be sure
        } catch (e) {
            console.error('Error accepting friend', e);
            alert('Erro ao aceitar amizade.');
        }
    };

    const removeFriend = async (targetId: string) => {
        if (!currentUserProfile) return;
        if (window.confirm('Remover da lista de amigos?')) {
            // Optimistic
            setFriendsIds(prev => prev.filter(id => id !== targetId));
            setFriendRequests(prev => ({
                sent: prev.sent.filter(id => id !== targetId),
                received: prev.received.filter(id => id !== targetId)
            }));

            try {
                // Try deleting both directions (OR logic not easily done in one simple delete without stored proc or multiple calls or advanced policy)
                // Based on RLS, I can delete where user_id=Me OR friend_id=Me.
                // So I need to find the specific row.

                // Try Acting as Creator
                const { error: err1 } = await supabase.from('friendships').delete().match({ user_id: currentUserProfile.id, friend_id: targetId });

                // Try Acting as Recipient
                const { error: err2 } = await supabase.from('friendships').delete().match({ user_id: targetId, friend_id: currentUserProfile.id });

                // If both failed (no rows affected), fine. One should hit.
            } catch (e) { console.error('Error removing friend', e); }
        }
    };

    const createChallenge = async (data: any) => {
        if (!currentUserProfile) return;

        try {
            // 1. Insert Challenge
            const { data: challengeData, error: challengeError } = await supabase
                .from('challenges')
                .insert({
                    title: data.title,
                    description: data.description,
                    start_date: data.startDate,
                    end_date: data.endDate,
                    creator_id: currentUserProfile.id
                })
                .select()
                .single();

            if (challengeError) throw challengeError;

            // 2. Insert Participants (Creator + Selected Friends)
            // Split to ensure creator is added even if friends fail due to RLS/Policy
            const friendsToInsert = data.participants
                .filter((p: any) => p.id !== currentUserProfile.id)
                .map((p: any) => ({
                    challenge_id: challengeData.id,
                    user_id: p.id
                }));

            // A. Insert Creator (Should always work)
            const { error: creatorError } = await supabase
                .from('challenge_participants')
                .insert([{ challenge_id: challengeData.id, user_id: currentUserProfile.id }]);

            if (creatorError) console.error('Error adding creator:', creatorError);

            // B. Insert Friends
            if (friendsToInsert.length > 0) {
                const { error: friendsError } = await supabase
                    .from('challenge_participants')
                    .insert(friendsToInsert);

                if (friendsError) {
                    console.error('Error adding friends:', friendsError);
                    alert('Desafio criado, mas houve erro ao adicionar participantes. Tente adicioná-los novamente.');
                }
            }

            fetchChallenges(); // Refresh list
            alert('Desafio criado com sucesso!');

        } catch (error) {
            console.error('Error creating challenge:', error);
            alert('Erro ao criar desafio.');
        }
    };

    const updateChallenge = async (c: Challenge) => {
        try {
            // 1. Update Challenge Details
            const { error: updateError } = await supabase
                .from('challenges')
                .update({
                    title: c.title,
                    description: c.description,
                    start_date: c.startDate,
                    end_date: c.endDate
                })
                .eq('id', c.id);

            if (updateError) throw updateError;

            // 2. Sync Participants
            // A. Get current participants from DB to diff
            const { data: currentParticipants, error: fetchError } = await supabase
                .from('challenge_participants')
                .select('user_id')
                .eq('challenge_id', c.id);

            if (fetchError) throw fetchError;

            const currentIds = currentParticipants.map((p: any) => p.user_id);
            const targetIds = c.participants.map(p => p.id);

            // B. Identify Changes
            const toAdd = targetIds.filter(id => !currentIds.includes(id));
            const toRemove = currentIds.filter(id => !targetIds.includes(id) && id !== c.creator.id); // Protect creator

            // C. Execute Updates
            if (toRemove.length > 0) {
                await supabase
                    .from('challenge_participants')
                    .delete()
                    .eq('challenge_id', c.id)
                    .in('user_id', toRemove);
            }

            if (toAdd.length > 0) {
                const rowsToAdd = toAdd.map(uid => ({
                    challenge_id: c.id,
                    user_id: uid
                }));
                const { error: addError } = await supabase.from('challenge_participants').insert(rowsToAdd);
                if (addError) {
                    console.error('Error adding participants on edit:', addError);
                    alert('Erro ao adicionar novos participantes. Verifique se são amigos adicionados.');
                }
            }

            // 3. Update Local State
            setChallenges(prev => prev.map(x => x.id === c.id ? c : x));
            alert('Desafio atualizado!');

        } catch (error) {
            console.error('Error updating challenge:', error);
            alert('Erro ao atualizar desafio.');
        }
    };

    const deleteChallenge = async (id: string) => {
        if (window.confirm('Excluir desafio?')) {
            try {
                const { error } = await supabase.from('challenges').delete().eq('id', id);
                if (error) throw error;
                setChallenges(prev => prev.filter(c => c.id !== id));
            } catch (e) { console.error(e); alert('Erro ao excluir desafio'); }
        }
    };

    const leaveChallenge = async (id: string) => {
        if (window.confirm('Sair do desafio?')) {
            const u = getCurrentUser();
            try {
                const { error } = await supabase
                    .from('challenge_participants')
                    .delete()
                    .eq('challenge_id', id)
                    .eq('user_id', u.id);

                if (error) throw error;

                // Optimistic update
                setChallenges(prev => prev.map(c =>
                    c.id === id
                        ? { ...c, participants: c.participants.filter(p => p.id !== u.id) }
                        : c
                ));

                fetchChallenges(); // Refresh to ensure sync
            } catch (e) { console.error(e); alert('Erro ao sair do desafio'); }
        }
    };

    const updateWeight = async (w: number) => {
        if (!currentUserProfile) return;
        try {
            const { error } = await supabase.from('profiles').update({ current_weight: w }).eq('id', currentUserProfile.id);
            if (error) throw error;
            setCurrentUserProfile(prev => prev ? ({ ...prev, currentWeight: w }) : null);
        } catch (e) { console.error(e); alert('Erro peso'); }
    };
    const updateInitialWeight = async (w: number) => {
        if (!currentUserProfile) return;
        try {
            const { error } = await supabase.from('profiles').update({ initial_weight: w }).eq('id', currentUserProfile.id);
            if (error) throw error;
            setCurrentUserProfile(prev => prev ? ({ ...prev, initialWeight: w }) : null);
        } catch (e) { console.error(e); alert('Erro peso inicial'); }
    };

    const editPostAction = (post: Post) => { setEditingPost(post); setIsLogOpen(true); };

    const userWrapper = {
        streak: calculateStreak(posts.filter(p => p.user.isCurrentUser)),
        weight: currentUserProfile?.currentWeight || 0,
        initialWeight: currentUserProfile?.initialWeight || 0,
        height: currentUserProfile?.height || 175,
        bmi: currentUserProfile?.bmi || 24.2,
        selectedUser, editingPost, isLogOpen, friendsIds,
        incomingRequests: friendRequests.received,
        outgoingRequests: friendRequests.sent,
        currentUser: getCurrentUser()
    };

    return (
        <AppContext.Provider value={{
            isAuthenticated, currentView, previousView, posts, ranking, challenges,
            userWrapper,
            login, logout, navigate, goBack,
            openLog: () => { setEditingPost(null); setIsLogOpen(true); },
            closeLog: () => { setIsLogOpen(false); setEditingPost(null); },
            updateName, saveWorkout, deletePost, editPost: editPostAction,
            likePost, commentPost, createChallenge, updateChallenge, leaveChallenge, deleteChallenge,
            selectUser, openMyProfile, updateWeight, updateInitialWeight, addFriend,
            acceptFriend, removeFriend,
            currentUserProfile, isNotificationsEnabled, toggleNotifications
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
