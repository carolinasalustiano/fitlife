import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AuthProps {
  onLoginSuccess: () => void;
}

// Custom Logo Component - Redesigned to clearly resemble a runner with upright posture
const FitLifeLogo: React.FC<{ className?: string }> = ({ className = "w-32 h-32" }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bodyGradient" x1="0" y1="0" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0F414A" />
        <stop offset="100%" stopColor="#0A282D" />
      </linearGradient>
    </defs>

    {/* Head - More centered (Moved back from 150 to 125) */}
    <circle cx="125" cy="45" r="16" fill="#0F414A" />

    {/* Torso - Less lean, more vertical curve */}
    <path
      d="M125 60 C 115 80, 105 100, 100 125"
      stroke="url(#bodyGradient)"
      strokeWidth="18"
      strokeLinecap="round"
    />

    {/* Back Leg - Kicking back (Light Blue) - Anchored to new waist */}
    <path
      d="M100 120 L 60 115"
      stroke="#96C0CE"
      strokeWidth="14"
      strokeLinecap="round"
    />
    <path
      d="M60 115 L 45 145"
      stroke="#96C0CE"
      strokeWidth="14"
      strokeLinecap="round"
    />

    {/* Front Leg - Driving forward (Midnight Blue) - Anchored to new waist */}
    <path
      d="M100 125 L 125 160"
      stroke="#0F414A"
      strokeWidth="16"
      strokeLinecap="round"
    />
    <path
      d="M125 160 L 155 160"
      stroke="#0F414A"
      strokeWidth="16"
      strokeLinecap="round"
    />

    {/* Back Arm - Swinging back (Maroon) - Anchored to new shoulder */}
    <path
      d="M120 65 L 85 85"
      stroke="#7F0303"
      strokeWidth="12"
      strokeLinecap="round"
    />

    {/* Front Arm - Pumping forward/up (Maroon) - Anchored to new shoulder */}
    <path
      d="M130 65 L 160 55"
      stroke="#7F0303"
      strokeWidth="12"
      strokeLinecap="round"
    />

    {/* Speed/Motion Lines - Adjusted for new position */}
    <path d="M20 170 L 160 170" stroke="#0F414A" strokeWidth="4" strokeLinecap="round" opacity="0.2" />
    <path d="M40 185 L 120 185" stroke="#0F414A" strokeWidth="4" strokeLinecap="round" opacity="0.1" />
    <path d="M160 50 L 180 50" stroke="#96C0CE" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
  </svg>
);

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<'splash' | 'login' | 'signup'>('splash');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Splash Screen Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      // Check session via Supabase in AppContext, but here we just transition UI
      // If we are already authenticated, Parent should have handled it?
      // Actually, AppContext usually checks session on mount.
      // But for this view transition:
      setView('login');
    }, 2500);
    return () => clearTimeout(timer);
  }, [onLoginSuccess]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // onLoginSuccess will be triggered by onAuthStateChange in AppContext ideally, 
      // but we can call it here too or just let the effect handle it.
      // For now, let's call it to be safe or just wait for the prop to change?
      // The parent AppContent conditionally renders Auth. 
      // So if state updates, this component unmounts.
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) throw error;

      alert('Cadastro realizado! Por favor, verifique seu e-mail (se confirmação estiver ativada) ou faça login.');
      setView('login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (view === 'splash') {
    return (
      <div className="min-h-screen bg-background-light flex flex-col items-center justify-center animate-[fadeIn_0.5s_ease-out]">
        <div className="animate-[pulse_2s_infinite]">
          <FitLifeLogo className="w-48 h-48 drop-shadow-2xl" />
        </div>
        <h1 className="text-4xl font-black text-primary mt-6 tracking-tighter">FitLife<span className="text-light-blue">Pro</span></h1>
        <p className="text-maroon font-bold text-xs uppercase tracking-[0.2em] mt-2">Evolua Sempre</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col relative overflow-hidden transition-colors duration-500">
      {/* Decorative Background Elements */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-light-blue/20 rounded-full blur-3xl"></div>
      <div className="absolute top-40 -left-20 w-60 h-60 bg-maroon/10 rounded-full blur-3xl"></div>

      <div className="flex-1 flex flex-col justify-center px-8 relative z-10">
        <div className="flex flex-col items-center mb-10">
          <FitLifeLogo className="w-32 h-32 mb-4" />
          <h2 className="text-3xl font-extrabold text-primary dark:text-white text-center">
            {view === 'login' ? 'Bem-vindo!' : 'Crie sua conta'}
          </h2>
          <p className="text-sm font-medium text-primary/60 dark:text-white/60 mt-2 text-center max-w-[250px]">
            {view === 'login'
              ? 'Pronto para superar seus limites hoje?'
              : 'Junte-se à comunidade que mais cresce.'}
          </p>
        </div>

        <form onSubmit={view === 'login' ? handleLogin : handleSignup} className="space-y-4">

          {view === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-primary/60 dark:text-white/60 ml-1">Nome</label>
              <input
                type="text"
                required
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white dark:bg-white/5 border-none rounded-2xl px-5 py-4 text-primary dark:text-white font-bold placeholder:text-primary/30 focus:ring-2 focus:ring-maroon shadow-sm"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-primary/60 dark:text-white/60 ml-1">E-mail</label>
            <input
              type="email"
              required
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white dark:bg-white/5 border-none rounded-2xl px-5 py-4 text-primary dark:text-white font-bold placeholder:text-primary/30 focus:ring-2 focus:ring-maroon shadow-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-primary/60 dark:text-white/60 ml-1">Senha</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white dark:bg-white/5 border-none rounded-2xl px-5 py-4 text-primary dark:text-white font-bold placeholder:text-primary/30 focus:ring-2 focus:ring-maroon shadow-sm"
            />
          </div>

          {error && (
            <div className="bg-red-100 text-red-600 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
              <span className="material-symbols-rounded text-sm">error</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-bold text-lg py-4 rounded-2xl shadow-xl shadow-primary/20 mt-4 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Carregando...' : (view === 'login' ? 'Entrar' : 'Cadastrar')}
          </button>
        </form>

        <div className="mt-8 text-center">
          {view === 'login' ? (
            <p className="text-sm font-medium text-primary/60 dark:text-white/60">
              Ainda não tem conta?{' '}
              <button
                onClick={() => { setView('signup'); setError(''); }}
                className="text-maroon font-bold hover:underline"
              >
                Cadastre-se
              </button>
            </p>
          ) : (
            <p className="text-sm font-medium text-primary/60 dark:text-white/60">
              Já tem uma conta?{' '}
              <button
                onClick={() => { setView('login'); setError(''); }}
                className="text-maroon font-bold hover:underline"
              >
                Faça Login
              </button>
            </p>
          )}
        </div>
      </div>

      <div className="p-6 text-center">
        <p className="text-[10px] font-bold text-primary/30 dark:text-white/20 uppercase tracking-widest">FitLife Pro v1.0</p>
      </div>
    </div>
  );
};

export default Auth;