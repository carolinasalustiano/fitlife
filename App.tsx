import React from 'react';
import Navigation from './components/Navigation';
import Feed from './views/Feed';
import Ranking from './views/Ranking';
import Dashboard from './views/Dashboard';
import LogWorkout from './views/LogWorkout';
import UserProfile from './views/UserProfile';
import Friends from './views/Friends';
import Challenges from './views/Challenges';
import Auth from './views/Auth';
import { ViewState } from './types';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';

const AppContent = () => {
  const {
    isAuthenticated, login, currentView,
    posts, ranking, challenges, userWrapper,
    navigate, openLog, closeLog,
    saveWorkout, deletePost, editPost, likePost, commentPost,
    createChallenge, updateChallenge, leaveChallenge, deleteChallenge,
    selectUser, openMyProfile, updateWeight, updateInitialWeight, updateName, logout, addFriend,
    acceptFriend, removeFriend,
    isNotificationsEnabled, toggleNotifications, goBack
  } = useApp();

  const {
    streak, weight: userWeight, initialWeight, selectedUser, editingPost, isLogOpen, friendsIds, currentUser
  } = userWrapper;

  // Helper to get logic for views
  // Note: We are prop-drilling context values into views as an intermediate step.
  // Ideally views should consume context directly, but to minimize changes in one go,
  // we pass values from context to props.
  // Wait, the Plan said "Update child components to consume data directly".
  // But that requires editing ALL views.
  // For the USER REQUEST "Ensure sidebar/navbar are unique components", 
  // keeping the views receiving props is fine for now, as long as Layout is handling the shell.
  // However, I CANNOT easily pass ALL props if I don't destruct them all.
  // I will pass props for now to ensure compatibility without editing 7 files simultaneously.
  // Later I can refactor views.

  const getFilteredPosts = () => {
    if (!selectedUser) return [];
    return posts.filter(post => post.user.avatar === selectedUser.avatar);
  };

  const getWeeklyWorkouts = () => {
    // Logic to calculate weekly workouts from posts
    const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const counts = days.map(day => ({ day, count: 0 }));

    posts.forEach(post => {
      // Filter by current user
      if (!post.user.isCurrentUser) return;

      let postDate = new Date();
      if (post.createdAt) {
        postDate = new Date(post.createdAt);
      } else if (post.workoutDetails) {
        // Fallback for legacy local posts without createdAt (if any)
        const dateStr = post.workoutDetails.date;
        if (dateStr.toLowerCase().includes('hoje')) {
          postDate = new Date();
        } else if (dateStr.toLowerCase().includes('ontem')) {
          postDate.setDate(now.getDate() - 1);
        } else {
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            postDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          } else {
            return;
          }
        }
      } else {
        return;
      }

      if (postDate >= startOfWeek && postDate <= endOfWeek) {
        const dayIndex = postDate.getDay(); // 0 (Sun) - 6 (Sat)
        counts[dayIndex].count += 1;
      }
    });

    const ordered = [
      counts[1], counts[2], counts[3], counts[4], counts[5], counts[6], counts[0]
    ];

    return ordered;
  };

  const myFriends = ranking.filter(r => friendsIds.includes(r.id));

  const renderView = () => {
    switch (currentView) {
      case ViewState.FEED:
        return <Feed
          posts={posts}
          streak={streak}
          onLike={likePost}
          onComment={commentPost}
          onDelete={deletePost}
          onEdit={editPost}
          onNavigate={navigate}
          onOpenProfile={openMyProfile}
          user={currentUser}
        />;
      case ViewState.RANKING:
        return <Ranking data={ranking} onUserClick={selectUser} onBack={() => navigate(ViewState.FEED)} />;
      case ViewState.USER_PROFILE:
        return selectedUser ? (
          <UserProfile
            user={selectedUser}
            posts={getFilteredPosts()}
            challenges={challenges}
            onBack={goBack}
            onLike={likePost}
            onComment={commentPost}
            onDelete={deletePost}
            onEdit={editPost}
            onUpdateName={updateName}
            onLogout={logout}
            onLeaveChallenge={leaveChallenge}
            onAddFriend={addFriend}
            onAcceptFriend={acceptFriend}
            onRemoveFriend={removeFriend}
            friendsIds={friendsIds}
            incomingRequests={userWrapper.incomingRequests}
            outgoingRequests={userWrapper.outgoingRequests}
          />
        ) : <Ranking data={ranking} onUserClick={selectUser} onBack={goBack} />;
      case ViewState.DASHBOARD:
        return <Dashboard
          currentUserWeight={userWeight}
          initialWeight={initialWeight}
          streak={streak}
          onUpdateWeight={updateWeight}
          onUpdateInitialWeight={updateInitialWeight}
          workoutsThisWeek={getWeeklyWorkouts()}
          currentRank={currentUser}
          onOpenProfile={openMyProfile}
          isNotificationsEnabled={isNotificationsEnabled}
          onToggleNotifications={toggleNotifications}
          onBack={goBack}
        />;
      case ViewState.FRIENDS:
        return <Friends
          friends={myFriends}
          allUsers={ranking}
          onUserClick={selectUser}
          onAddFriend={addFriend}
          onAcceptFriend={acceptFriend}
          onRemoveFriend={removeFriend}
          incomingRequests={userWrapper.incomingRequests}
          outgoingRequests={userWrapper.outgoingRequests}
          onBack={() => navigate(ViewState.FEED)}
        />;
      case ViewState.CHALLENGES:
        return <Challenges
          challenges={challenges}
          friends={myFriends}
          currentUser={currentUser}
          onCreateChallenge={createChallenge}
          onEditChallenge={updateChallenge}
          onDeleteChallenge={deleteChallenge}
          onLeaveChallenge={leaveChallenge}
          onBack={() => navigate(ViewState.FEED)}
          currentUserId={currentUser.id}
          posts={posts}
        />;
      default:
        // Default to Feed
        return <Feed
          posts={posts}
          streak={streak}
          onLike={likePost}
          onComment={commentPost}
          onDelete={deletePost}
          onEdit={editPost}
          onNavigate={navigate}
          onOpenProfile={openMyProfile}
          user={currentUser}
        />;
    }
  };

  const getInitialLogData = () => {
    if (!editingPost) return undefined;
    return {
      activity: editingPost.type ? editingPost.type.replace('SESSÃO ', '').split(' ')[0] : 'Academia',
      duration: parseInt(editingPost.stats?.find(s => s.label === 'Duração')?.value || '45'),
      intensity: editingPost.stats?.find(s => s.label === 'Intensidade')?.value || 'Moderada',
      photo: editingPost.image,
      weight: editingPost.workoutDetails?.weight,
      sets: editingPost.workoutDetails?.sets
    };
  };

  if (!isAuthenticated) {
    return <Auth onLoginSuccess={login} />;
  }

  return (
    <Layout>
      {renderView()}

      {isLogOpen && (
        <LogWorkout
          onClose={closeLog}
          onSave={saveWorkout}
          initialData={getInitialLogData()}
          streak={streak}
        />
      )}
    </Layout>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;