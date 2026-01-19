import React, { useState, useEffect } from 'react';

const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // More robust iOS detection (including iPadOS 13+)
        const userAgent = navigator.userAgent;
        const isIPad = /iPad/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const isIPhone = /iPhone|iPod/.test(userAgent);
        const ios = isIPad || isIPhone;
        setIsIOS(ios);

        // Check if already installed (standalone mode)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone || document.referrer.includes('android-app://');

        if (isStandalone) {
            return; // Don't show if already installed
        }

        // Android/Desktop prompt capture
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);

            // Allow prompt to show again per session
            const hasDismissedSession = sessionStorage.getItem('pwa_prompt_dismissed');
            if (!hasDismissedSession) {
                setIsOpen(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Show for iOS if not standalone (and not dismissed this session)
        if (ios) {
            const hasDismissedSession = sessionStorage.getItem('pwa_prompt_dismissed');
            if (!hasDismissedSession) {
                // Small delay to ensure render
                setTimeout(() => setIsOpen(true), 1000);
            }
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);

            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                setIsOpen(false);
            }
            // If dismissed by system dialog, we keep deferredPrompt or clear it? 
            // Usually good to keep it null so we don't spam, but for this custom UI we close it.
        }
    };

    const handleDismiss = () => {
        setIsOpen(false);
        // Use sessionStorage so it re-appears next visit/tab open, but not immediately after refreshing if we wanted persistent.
        // User asked for "correction" that it didn't appear. sessionStorage is safer than localStorage for "lost" prompts.
        sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none p-4 sm:p-6">
            {/* Backdrop - only clickable part to dismiss if desired, though we have a button */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity opacity-0 animate-[fadeIn_0.3s_forwards] pointer-events-auto" onClick={handleDismiss} />

            <style>{`
                @keyframes fadeIn { to { opacity: 1; } }
                @keyframes slideUp { 
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>

            <div className={`
                w-full max-w-md bg-white dark:bg-[#1E1E1E] border border-stone-200 dark:border-white/10 
                rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl 
                flex flex-col gap-5 relative overflow-hidden 
                pointer-events-auto
                ${isIOS ? 'animate-[slideUp_0.4s_cubic-bezier(0.16,1,0.3,1)]' : 'animate-[scaleIn_0.4s_cubic-bezier(0.16,1,0.3,1)]'}
            `}>
                {/* Close Button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-stone-100 dark:bg-white/10 rounded-full text-stone-500 hover:text-stone-800 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                    <span className="material-symbols-rounded text-xl">close</span>
                </button>

                <div className="flex flex-col items-center text-center pt-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark dark:from-primary dark:to-black rounded-2xl flex items-center justify-center text-white shadow-lg mb-4">
                        <span className="material-symbols-rounded text-3xl">download_for_offline</span>
                    </div>

                    <h3 className="text-xl font-bold text-stone-800 dark:text-white mb-2">
                        {isIOS ? 'Instalar no iPhone' : 'Instalar Aplicativo'}
                    </h3>

                    <p className="text-sm text-stone-500 dark:text-stone-400 px-2 leading-relaxed">
                        {isIOS
                            ? 'Instale este aplicativo na sua tela inicial para uma melhor experiência.'
                            : 'Instale o FitLife Pro para acesso rápido e funcionamento offline.'}
                    </p>
                </div>

                {isIOS ? (
                    <div className="flex flex-col gap-3 mt-2">
                        <div className="text-xs text-red-500/80 dark:text-red-400/80 font-medium bg-red-50 dark:bg-red-900/10 px-3 py-2 rounded-lg mb-1">
                            A Apple não permite instalação automática. Siga os passos abaixo:
                        </div>
                        <div className="flex items-center gap-3 bg-stone-50 dark:bg-white/5 p-3 rounded-xl">
                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center shrink-0">
                                <span className="material-symbols-rounded text-lg">ios_share</span>
                            </span>
                            <div className="text-left text-sm text-stone-700 dark:text-stone-300">
                                1. Toque no botão <span className="font-semibold">Compartilhar</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-stone-50 dark:bg-white/5 p-3 rounded-xl">
                            <span className="w-8 h-8 rounded-full bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300 flex items-center justify-center shrink-0">
                                <span className="material-symbols-rounded text-lg">add_box</span>
                            </span>
                            <div className="text-left text-sm text-stone-700 dark:text-stone-300">
                                2. Selecione <span className="font-semibold">Adicionar à Tela de Início</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={handleInstallClick}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-rounded">download</span>
                        Instalar Agora
                    </button>
                )}

                <div className="text-xs text-center text-stone-400 dark:text-stone-500 mt-1">
                    Funciona offline • Atualizações automáticas
                </div>
            </div>
        </div>
    );
};

export default PWAInstallPrompt;
