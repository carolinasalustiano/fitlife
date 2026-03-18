import React from 'react';
import { IMAGES } from '@/constants';

interface AgendaProps {
  onBack?: () => void;
}

const TRAINERS = [
  {
    id: 1,
    name: "Carolina Salustiano",
    specialty: "Hipertrofia & Emagrecimento",
    price: "R$ 150/sessão",
    image: IMAGES.currentUser, // Or a specific URL if preferred
    link: "https://calendly.com/carolsalustiano-prod/30min"
  },
  {
    id: 2,
    name: "Rafael Cardoso",
    specialty: "Crossfit & LPO",
    price: "R$ 180/sessão",
    image: "https://i.pravatar.cc/150?u=rafael",
    link: "https://calendly.com/carolsalustiano-prod/30min" // fallback
  },
  {
    id: 3,
    name: "Juliana Silva",
    specialty: "Pilates & Mobilidade",
    price: "R$ 120/sessão",
    image: "https://i.pravatar.cc/150?u=juliana",
    link: "https://calendly.com/carolsalustiano-prod/30min" // fallback
  }
];

const Agenda: React.FC<AgendaProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen pb-32 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-primary text-white px-6 pt-12 pb-6 rounded-b-[2.5rem] shadow-lg flex items-center gap-4">
        {onBack && (
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors active:scale-95">
            <span className="material-symbols-rounded">arrow_back</span>
          </button>
        )}
        <h1 className="text-2xl font-extrabold tracking-tight">Agenda de Profissionais</h1>
      </header>

      {/* Main Content */}
      <main className="px-5 py-6 space-y-6">
        <p className="text-sm font-medium text-primary/70 dark:text-white/60 mb-2">
          Encontre o personal trainer ideal para atingir seus objetivos e agende sua consulta.
        </p>

        <div className="space-y-4">
          {TRAINERS.map((trainer) => (
            <div key={trainer.id} className="bg-white dark:bg-white/5 rounded-[2rem] p-5 flex items-center gap-4 shadow-xl shadow-black/5 border border-black/5 dark:border-white/10">
              <img src={trainer.image} alt={trainer.name} className="w-16 h-16 rounded-2xl object-cover bg-tan/20 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-extrabold text-primary dark:text-white text-lg">{trainer.name}</h3>
                <p className="text-xs font-bold text-maroon uppercase tracking-wider mt-0.5">{trainer.specialty}</p>
                <p className="text-sm font-bold text-primary/60 dark:text-white/60 mt-2">{trainer.price}</p>
              </div>
              <a
                href={trainer.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-white p-3 rounded-2xl flex items-center justify-center shadow-md shadow-primary/30 hover:bg-primary-dark transition-colors"
                title="Agendar"
              >
                <span className="material-symbols-rounded">calendar_month</span>
              </a>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Agenda;
