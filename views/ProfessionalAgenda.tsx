import React from 'react';
import { RankingUser, Appointment } from '@/types';
import { useApp } from '@/context/AppContext';

interface ProfessionalAgendaProps {
  user: RankingUser;
  onJoinVideoCall: (room: string) => void;
  onBack?: () => void;
}



const ProfessionalAgenda: React.FC<ProfessionalAgendaProps> = ({ user, onJoinVideoCall, onBack }) => {
  const roomName = `FitLife-Consulta-${user.name.replace(/\s+/g, '-')}`;
  const { appointments } = useApp();

  const myAppointments = appointments
    .filter(a => a.trainer.id === user.id || a.trainer.name === user.name)
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  const now = new Date();
  const activeAppointment = myAppointments.find(a => {
    const aptTime = new Date(a.dateTime);
    const diffMins = (aptTime.getTime() - now.getTime()) / 60000;
    return diffMins <= 10 && diffMins >= -60; // Has appointment starting in 10 mins or ongoing
  });

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
            className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${
              activeAppointment 
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/30 animate-pulse'
                : 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/30'
            }`}
          >
            <span className="material-symbols-rounded">meeting_room</span>
            {activeAppointment ? `Entrar (Consulta com ${activeAppointment.student.name})` : 'Abrir Minha Sala Agora'}
          </button>
        </section>

        {/* Appointments */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-primary dark:text-white text-lg">Suas Consultas Agendadas</h3>
            <span className="bg-maroon/10 text-maroon text-xs font-bold px-2 py-1 rounded-lg">
              {myAppointments.length} {myAppointments.length === 1 ? 'Agendamento' : 'Agendamentos'}
            </span>
          </div>

          <div className="space-y-3">
            {myAppointments.length === 0 ? (
              <p className="text-center text-sm font-bold text-stone-400 py-8 bg-white/50 dark:bg-white/5 rounded-2xl border border-dashed border-stone-200 dark:border-white/10">
                Nenhuma consulta agendada no momento.
              </p>
            ) : (
              myAppointments.map((apt) => (
                <div key={apt.id} className="bg-white dark:bg-white/5 p-4 rounded-2xl shadow-sm border border-black/5 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={apt.student.avatar} alt={apt.student.name} className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center object-cover" />
                    <div>
                      <p className="font-bold text-primary dark:text-white text-md">{apt.student.name}</p>
                      <p className="text-xs font-bold text-maroon mt-0.5">
                        {new Date(apt.dateTime).toLocaleDateString()} às {new Date(apt.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-md bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                      Confirmado
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProfessionalAgenda;
