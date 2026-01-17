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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.3s_ease-out]">
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
            <div className="w-full max-w-sm bg-white dark:bg-primary-dark border border-maroon/20 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 relative overflow-hidden animate-[scaleIn_0.4s_cubic-bezier(0.16,1,0.3,1)]">
                {/* Decorative background element */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-tan/20 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-maroon/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex justify-end">
                    <button onClick={handleDismiss} className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-white/10 rounded-full text-primary/60 hover:text-primary dark:text-white/60 dark:hover:text-white transition-colors">
                        <span className="material-symbols-rounded text-lg">close</span>
                    </button>
                </div>

                <div className="flex flex-col items-center text-center -mt-2">
                    <div className="w-20 h-20 bg-primary dark:bg-white/10 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20 mb-4 relative group">
                        <img src="/pwa-192.png" alt="App Icon" className="w-full h-full object-cover rounded-2xl" onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }} />
                        <span className="material-symbols-rounded absolute text-3xl opacity-0 group-[.image-error]:opacity-100">install_mobile</span>
                    </div>

                    <h3 className="text-xl font-black text-primary dark:text-white mb-1">Instalar App</h3>
                    <p className="text-sm opacity-70 dark:text-gray-300 px-4">Instale o FitLife Pro para acessar seus treinos offline e receber notificações.</p>
                </div>

                {isIOS ? (
                    <div className="bg-background-light dark:bg-white/5 rounded-2xl p-4 text-sm text-primary dark:text-white/90 leading-relaxed text-left">
                        <p className="flex items-center gap-3 mb-3 font-bold border-b border-black/5 dark:border-white/5 pb-2">
                            <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">1</span>
                            Toque em <span className="material-symbols-rounded text-base text-blue-500">ios_share</span> Compartilhar
                        </p>
                        <p className="flex items-center gap-3 font-bold">
                            <span className="w-6 h-6 rounded-full bg-gray-500 text-white flex items-center justify-center text-xs">2</span>
                            Toque em <span className="material-symbols-rounded text-base">add_box</span> Tela de Início
                        </p>
                    </div>
                ) : (
                    <button
                        onClick={handleInstallClick}
                        className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:brightness-110"
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
