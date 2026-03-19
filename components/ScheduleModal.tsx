import React, { useState } from 'react';
import { RankingUser } from '@/types';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainer: RankingUser | null;
  onConfirm: (trainer: RankingUser, dateTime: string) => void;
}

const TIMES = ['08:00', '09:30', '10:00', '14:00', '15:30', '18:00', '19:30'];
const DATES = [
  { label: 'Hoje', offset: 0 },
  { label: 'Amanhã', offset: 1 },
  { label: 'Em 2 dias', offset: 2 },
];

const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose, trainer, onConfirm }) => {
  const [selectedDateOffset, setSelectedDateOffset] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<string>('');

  if (!isOpen || !trainer) return null;

  const handleConfirm = () => {
    if (!selectedTime) return;
    
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const date = new Date();
    date.setDate(date.getDate() + selectedDateOffset);
    date.setHours(hours, minutes, 0, 0);

    onConfirm(trainer, date.toISOString());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-2xl animate-[slideUp_0.3s_ease-out]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-stone-100 dark:bg-white/10 rounded-full text-stone-500 hover:text-stone-800 dark:text-gray-300 transition-colors"
        >
          <span className="material-symbols-rounded text-xl">close</span>
        </button>

        <h2 className="text-xl font-extrabold text-primary dark:text-white mb-1">
          Agendar Consulta
        </h2>
        <p className="text-sm font-medium text-stone-500 mb-6">
          Com {trainer.name}
        </p>

        {/* Date Selection */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
            Escolha o Dia
          </label>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
            {DATES.map(d => (
              <button
                key={d.offset}
                onClick={() => setSelectedDateOffset(d.offset)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  selectedDateOffset === d.offset
                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                    : 'bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div className="mb-8">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
            Horários Disponíveis
          </label>
          <div className="grid grid-cols-3 gap-2">
            {TIMES.map(time => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`py-2.5 rounded-xl font-bold text-sm transition-all border-2 ${
                  selectedTime === time
                    ? 'border-primary bg-primary/5 text-primary dark:text-white dark:border-white shadow-sm'
                    : 'border-transparent bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selectedTime}
          className="w-full bg-maroon hover:bg-red-900 disabled:bg-stone-300 disabled:text-stone-500 text-white font-extrabold py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98]"
        >
          Confirmar Agendamento
        </button>

        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ScheduleModal;
