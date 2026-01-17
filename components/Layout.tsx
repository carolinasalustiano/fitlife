import React, { ReactNode } from 'react';
import Navigation from '../components/Navigation';
import { ViewState } from '@/types';
import { useApp } from '../context/AppContext';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { currentView, navigate, openLog, openMyProfile } = useApp();

    // Determine if we should show navigation
    const showNavigation = currentView !== ViewState.USER_PROFILE
        && currentView !== ViewState.FRIENDS
        && currentView !== ViewState.CHALLENGES;

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans transition-colors duration-300">
            <div className="max-w-md mx-auto bg-background-light dark:bg-background-dark min-h-screen relative shadow-2xl overflow-hidden pb-safe">

                {/* Main Content Area */}
                <div className="min-h-screen">
                    {children}
                </div>

                {/* Unified Bottom Navigation */}
                {showNavigation && (
                    <Navigation
                        currentView={currentView}
                        onNavigate={(view) => {
                            if (view === ViewState.USER_PROFILE) {
                                openMyProfile();
                            } else {
                                navigate(view);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                        }}
                        onOpenLog={openLog}
                    />
                )}
            </div>
        </div>
    );
};

export default Layout;
