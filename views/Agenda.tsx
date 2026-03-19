import React, { useState } from 'react';
import { IMAGES } from '@/constants';
import { useApp } from '@/context/AppContext';
import { RankingUser, Appointment } from '@/types';
import ScheduleModal from '@/components/ScheduleModal';

interface AgendaProps {
  onBack?: () => void;
  onJoinVideoCall?: (room: string) => void;
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
    id: 'user-2', // Ensure correct ID handling
    name: "Gabriel Cardoso",
    specialty: "Crossfit & LPO",
    price: "R$ 180/sessão",
    avatar: "https://i.pravatar.cc/150?u=gabriel",
    isProfessional: true
  },
  {
    id: 'user-3',
    name: "Juliana Silva",
    specialty: "Pilates & Mobilidade",
    price: "R$ 120/sessão",
    avatar: "https://i.pravatar.cc/150?u=juliana",
    isProfessional: true
  },
  {
    id: 'prof-1',
    name: "Rafael Cardoso",
    specialty: "Treinador Funcional",
    price: "R$ 140/sessão",
    avatar: "https://i.pravatar.cc/150?u=rafael",
    isProfessional: true
  }
] as unknown as (RankingUser & { specialty: string, price: string })[];

const Agenda: React.FC<AgendaProps> = ({ onBack, onJoinVideoCall }) => {
  const { appointments, scheduleAppointment } = useApp();
  const [selectedTrainer, setSelectedTrainer] = useState<RankingUser | null>(null);
  
  const isTimeForAppointment = (appt: Appointment) => {
    const now = new Date();
    const aptTime = new Date(appt.dateTime);
    const diffMs = aptTime.getTime() - now.getTime();
    const diffMins = diffMs / 60000;
    // Allow entry between 5 mins before and 60 mins after
    return diffMins <= 5 && diffMins >= -60;
  };

  const myAppointments = appointments.filter(a => a.status === 'scheduled');
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
          {TRAINERS.map((trainer) => {
            const hasAppointment = myAppointments.find(a => a.trainer.id === trainer.id || a.trainer.name === trainer.name);
            const isCallEnabled = hasAppointment ? isTimeForAppointment(hasAppointment) : false;

            return (
            <div key={trainer.id} className="bg-white dark:bg-white/5 rounded-[2rem] p-5 flex items-center gap-4 shadow-xl shadow-black/5 border border-black/5 dark:border-white/10">
              <img src={trainer.avatar} alt={trainer.name} className="w-16 h-16 rounded-2xl object-cover bg-tan/20 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-extrabold text-primary dark:text-white text-lg">{trainer.name}</h3>
                <p className="text-xs font-bold text-maroon uppercase tracking-wider mt-0.5">{trainer.specialty}</p>
                <p className="text-sm font-bold text-primary/60 dark:text-white/60 mt-2">{trainer.price}</p>
              </div>
              <div className="flex gap-2">
                {!hasAppointment ? (
                  <button
                    onClick={() => setSelectedTrainer(trainer)}
                    className="bg-primary text-white px-4 py-3 rounded-2xl font-bold text-sm shadow-md shadow-primary/30 hover:bg-primary-dark transition-colors"
                  >
                    Agendar
                  </button>
                ) : (
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[10px] font-bold bg-primary/10 text-primary dark:bg-white/10 dark:text-white px-2 py-1 rounded-lg whitespace-nowrap">
                      {new Date(hasAppointment.dateTime).toLocaleDateString()} {new Date(hasAppointment.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <button
                      onClick={() => isCallEnabled && onJoinVideoCall && onJoinVideoCall(`FitLife-Consulta-${trainer.name.replace(/\s+/g, '-')}`)}
                      disabled={!isCallEnabled}
                      className={`px-4 py-3 rounded-2xl flex items-center justify-center shadow-md transition-all font-bold text-sm ${
                        isCallEnabled 
                          ? 'bg-green-500 text-white shadow-green-500/30 hover:bg-green-600' 
                          : 'bg-stone-200 text-stone-400 dark:bg-white/10 dark:text-white/30 cursor-not-allowed shadow-none'
                      }`}
                      title={isCallEnabled ? "Entrar na Chamada" : "Aguarde o horário da sessão para entrar"}
                    >
                      <span className="material-symbols-rounded mr-1 text-lg">{isCallEnabled ? 'video_camera_front' : 'lock'}</span>
                      {isCallEnabled ? 'Entrar' : 'Aguarde'}
                    </button>
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>
      </main>

      <ScheduleModal 
        isOpen={selectedTrainer !== null}
        onClose={() => setSelectedTrainer(null)}
        trainer={selectedTrainer}
        onConfirm={scheduleAppointment}
      />
    </div>
  );
};

export default Agenda;
