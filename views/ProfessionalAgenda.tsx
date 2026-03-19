import React from 'react';
import { RankingUser } from '@/types';

interface ProfessionalAgendaProps {
  user: RankingUser;
  onJoinVideoCall: (room: string) => void;
  onBack?: () => void;
}

const MOCK_APPOINTMENTS = [
  { id: 1, student: "João Silva", time: "14:00", status: "Confirmado" },
  { id: 2, student: "Maria Gabriela", time: "15:30", status: "Pendente" },
  { id: 3, student: "Carlos Eduardo", time: "18:00", status: "Confirmado" },
];

const ProfessionalAgenda: React.FC<ProfessionalAgendaProps> = ({ user, onJoinVideoCall, onBack }) => {
  const roomName = `FitLife-Consulta-${user.name.replace(/\s+/g, '-')}`;

  return (
    <div className="min-h-screen pb-32 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-maroon text-white px-6 pt-12 pb-6 rounded-b-[2.5rem] shadow-lg flex items-center gap-4">
        {onBack && (
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors active:scale-95">
            <span className="material-symbols-rounded">arrow_back</span>
          </button>
        )}
        <h1 className="text-2xl font-extrabold tracking-tight">Painel do Personal</h1>
      </header>

      <main className="px-5 py-6 space-y-6">
        {/* Virtual Office Area */}
        <section className="bg-primary text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-rounded text-3xl text-tan">video_camera_front</span>
            <h2 className="text-xl font-bold">Consultório Virtual</h2>
          </div>
          
          <p className="text-sm text-white/80 mb-6 font-medium leading-relaxed">
            Esta é a sua sala fixa de atendimentos. Acesse para realizar suas consultas em vídeo com seus alunos.
          </p>
          
          <button
            onClick={() => onJoinVideoCall(roomName)}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-green-500/30"
          >
            <span className="material-symbols-rounded">meeting_room</span>
            Abrir Minha Sala Agora
          </button>
        </section>

        {/* Appointments */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-primary dark:text-white text-lg">Consultas de Hoje</h3>
            <span className="bg-maroon/10 text-maroon text-xs font-bold px-2 py-1 rounded-lg">3 Agendamentos</span>
          </div>

          <div className="space-y-3">
            {MOCK_APPOINTMENTS.map((apt) => (
              <div key={apt.id} className="bg-white dark:bg-white/5 p-4 rounded-2xl shadow-sm border border-black/5 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary dark:text-tan font-bold">
                    {apt.student.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-primary dark:text-white text-md">{apt.student}</p>
                    <p className="text-xs font-bold text-maroon mt-0.5">{apt.time}</p>
                  </div>
                </div>
                <div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${apt.status === 'Confirmado' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'}`}>
                    {apt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProfessionalAgenda;
