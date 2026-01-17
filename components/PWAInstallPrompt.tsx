import React, { useState, useEffect } from 'react';

const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if iOS
        const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(ios);

        // Check if already installed (standalone mode)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

        // Android/Desktop prompt capture
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Only show if not already installed
            if (!isStandalone) {
                setIsOpen(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Show for iOS if not standalone
        if (ios && !isStandalone) {
            // Delay slightly to not annoy immediately or check local storage if user dismissed
            const hasDismissed = localStorage.getItem('pwa_prompt_dismissed');
            // Refresh dismissal every 3 days for example, but for now simple check
            if (!hasDismissed) {
                setTimeout(() => setIsOpen(true), 3000);
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
            setDeferredPrompt(null);
            setIsOpen(false);
        }
    };

    const handleDismiss = () => {
        setIsOpen(false);
        localStorage.setItem('pwa_prompt_dismissed', 'true');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-[slideUp_0.5s_ease-out]">
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
            <div className="bg-white dark:bg-primary-dark border border-maroon/20 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-tan/10 rounded-bl-full -z-0"></div>

                <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary dark:bg-white/10 rounded-xl flex items-center justify-center text-white shrink-0">
                            <img src="/pwa-192.png" alt="App Icon" className="w-full h-full object-cover rounded-xl" onError={(e) => {
                                // Fallback if image not loaded yet during dev
                                (e.target as HTMLImageElement).style.display = 'none';
                            }} />
                            {/* Fallback Icon if image fails or loading */}
                            <span className="material-symbols-rounded absolute">install_mobile</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-primary dark:text-white">Instalar FitLife Pro</h3>
                            <p className="text-xs opacity-70 dark:text-gray-300">Adicione à tela inicial para melhor experiência.</p>
                        </div>
                    </div>
                    <button onClick={handleDismiss} className="text-primary/40 hover:text-primary dark:text-white/40 dark:hover:text-white">
                        <span className="material-symbols-rounded text-lg">close</span>
                    </button>
                </div>

                {isIOS ? (
                    <div className="bg-background-light dark:bg-white/5 rounded-xl p-3 text-xs text-primary dark:text-white/80 leading-relaxed">
                        <p className="flex items-center gap-2">
                            1. Toque no botão <span className="material-symbols-rounded text-sm text-blue-500">ios_share</span> <strong>Compartilhar</strong>
                        </p>
                        <p className="flex items-center gap-2 mt-1">
                            2. Selecione <span className="material-symbols-rounded text-sm">add_box</span> <strong>Adicionar à Tela de Início</strong>
                        </p>
                    </div>
                ) : (
                    <button
                        onClick={handleInstallClick}
                        className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-rounded">download</span>
                        Instalar Agora
                    </button>
                )}
            </div>
        </div>
    );
};

export default PWAInstallPrompt;
