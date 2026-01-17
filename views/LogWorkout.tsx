import React, { useState, useEffect, useRef } from 'react';
import { IMAGES } from '@/constants';

export interface WorkoutData {
  activity: string;
  duration: number;
  intensity: string;
  photo?: string; // Changed to optional string (base64)
  photoFile?: File; // Raw file for upload
  weight?: string;
  sets?: string;
}

interface LogWorkoutProps {
  onClose: () => void;
  onSave: (data: WorkoutData) => void;
  initialData?: WorkoutData | null;
  streak?: number;
}

const LogWorkout: React.FC<LogWorkoutProps> = ({ onClose, onSave, initialData, streak = 0 }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activity, setActivity] = useState('Academia');
  const [duration, setDuration] = useState(45);
  const [intensity, setIntensity] = useState('Moderada');
  const [weight, setWeight] = useState('');
  const [sets, setSets] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setActivity(initialData.activity);
      setDuration(initialData.duration);
      setIntensity(initialData.intensity);
      setWeight(initialData.weight || '');
      setSets(initialData.sets || '');
      // Handle legacy boolean or new string
      if (typeof initialData.photo === 'string') {
        setPhotoPreview(initialData.photo);
      } else if ((initialData as any).hasPhoto) {
        setPhotoPreview(IMAGES.workout1);
      }
    }
  }, [initialData]);

  const activities = [
    { name: 'Academia', icon: 'fitness_center' },
    { name: 'Corrida', icon: 'directions_run' },
    { name: 'Natação', icon: 'pool' },
    { name: 'Yoga', icon: 'self_improvement' },
  ];

  const handleFinish = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    // No validation required for optional fields
    onSave({
      activity,
      duration,
      intensity,
      photo: photoPreview || undefined,
      photoFile,
      weight,
      sets
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background-light dark:bg-background-dark flex flex-col animate-[slideIn_0.3s_ease-out]">
      <style>{`
        @keyframes slideIn {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        /* Custom Slider Styles */
        .slider-input {
          -webkit-appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 9999px;
          background: #d1d5db; /* gray-300 */
          outline: none;
          transition: background 0.3s;
        }
        .dark .slider-input {
          background: #374151; /* gray-700 */
        }

        /* Webkit Thumb (Chrome, Safari, Edge) */
        .slider-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #0F414A; /* Primary Color */
          cursor: pointer;
          border: 4px solid #ffffff;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          transition: transform 0.1s;
        }
        .slider-input:active::-webkit-slider-thumb {
           transform: scale(1.1);
           background: #7F0303; /* Maroon on active */
        }
        
        .dark .slider-input::-webkit-slider-thumb {
            background: #96C0CE; /* Light Blue in Dark Mode */
            border-color: #0A282D;
        }

        /* Firefox Thumb */
        .slider-input::-moz-range-thumb {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #0F414A;
          cursor: pointer;
          border: 4px solid #ffffff;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          transition: transform 0.1s;
        }
        .dark .slider-input::-moz-range-thumb {
            background: #96C0CE;
            border-color: #0A282D;
        }
      `}</style>

      {/* Header */}
      <header className="px-6 pt-8 pb-6 flex justify-between items-center">
        <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/50 dark:bg-white/10 backdrop-blur-md transition-colors hover:bg-white/80">
          <span className="material-symbols-outlined dark:text-white">close</span>
        </button>
        <h1 className="text-xl font-bold tracking-tight dark:text-white">
          {initialData ? 'Editar Treino' : 'Registrar Treino'}
        </h1>
        <div className="w-10 h-10 flex items-center justify-center">
          <span className="material-symbols-outlined text-tan">emoji_events</span>
        </div>
      </header>

      <main className="flex-1 px-6 pb-32 space-y-8 overflow-y-auto hide-scrollbar">
        {/* Activity Type */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider opacity-60 dark:text-gray-300">Tipo de Atividade</h2>
            <span className="text-xs font-medium text-maroon dark:text-tan cursor-pointer">Ver tudo</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {activities.map((act) => (
              <button
                key={act.name}
                onClick={() => setActivity(act.name)}
                className={`aspect-square flex flex-col items-center justify-center gap-2 rounded-2xl transition-all shadow-sm
                  ${activity === act.name
                    ? 'bg-light-blue text-primary scale-105 ring-2 ring-light-blue/50'
                    : 'bg-white dark:bg-white/5 border border-primary/5 dark:border-white/10 text-primary dark:text-white hover:bg-gray-50 dark:hover:bg-white/10'}`}
              >
                <span className={`material-symbols-outlined ${activity !== act.name && 'opacity-60'}`}>{act.icon}</span>
                <span className={`text-[10px] font-bold uppercase ${activity !== act.name && 'opacity-60'}`}>{act.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Sliders & Toggles */}
        <section className="bg-white dark:bg-white/5 rounded-3xl p-6 shadow-sm border border-primary/5 dark:border-white/5">
          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-end mb-4">
                <label className="text-sm font-semibold uppercase tracking-wider opacity-60 dark:text-gray-300">Duração</label>
                <span className="text-2xl font-bold dark:text-white">{duration} <span className="text-sm font-medium opacity-40">min</span></span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold opacity-40 dark:text-gray-400">5m</span>
                <input
                  type="range"
                  min="5"
                  max="120"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="slider-input flex-1"
                />
                <span className="text-[10px] font-bold opacity-40 dark:text-gray-400">120m</span>
              </div>
            </div>

            <hr className="border-primary/5 dark:border-white/5" />

            <div>
              <label className="text-sm font-semibold uppercase tracking-wider opacity-60 block mb-4 dark:text-gray-300">Intensidade</label>
              <div className="flex gap-2">
                {['Leve', 'Moderada', 'Alta'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setIntensity(level)}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase transition-all
                      ${intensity === level
                        ? 'bg-light-blue text-primary ring-2 ring-light-blue/20'
                        : 'bg-primary/5 dark:bg-white/5 text-primary dark:text-white hover:bg-primary/10'}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-primary/5 dark:border-white/5" />

            {/* Specific Details Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold uppercase tracking-wider opacity-100 text-primary dark:text-white block mb-2">Peso (kg)</label>
                <input
                  type="text"
                  placeholder="Ex: 80kg"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-primary/5 dark:bg-white/5 border-2 border-transparent focus:border-light-blue rounded-xl px-4 py-3 text-primary dark:text-white font-bold placeholder:opacity-30 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-semibold uppercase tracking-wider opacity-100 text-primary dark:text-white block mb-2">Séries</label>
                <input
                  type="text"
                  placeholder="Ex: 4x12"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  className="w-full bg-primary/5 dark:bg-white/5 border-2 border-transparent focus:border-light-blue rounded-xl px-4 py-3 text-primary dark:text-white font-bold placeholder:opacity-30 focus:outline-none"
                />
              </div>
            </div>

          </div>
        </section>

        {/* Photo Upload */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider opacity-60 mb-4 dark:text-gray-300">Foto do Treino</h2>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <button
            onClick={triggerFileInput}
            className={`w-full aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-3 group transition-all overflow-hidden relative
              ${photoPreview
                ? 'border-light-blue bg-light-blue/10'
                : 'border-primary/10 dark:border-white/10 bg-white/30 dark:bg-white/5 active:bg-white/50'}`}
          >
            {photoPreview ? (
              <>
                <img src={photoPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                <div className="relative z-10 bg-primary/80 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                  <span className="material-symbols-outlined text-sm">edit</span>
                  <span className="text-xs font-bold">Alterar Foto</span>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-tan/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-maroon">add_a_photo</span>
                </div>
                <p className="text-xs font-medium opacity-60 dark:text-gray-300">Tirar foto ou escolher da galeria</p>
              </>
            )}
          </button>
        </section>

        {/* Streak Info */}
        <div className="flex items-center gap-4 p-4 bg-maroon/5 dark:bg-maroon/20 rounded-2xl border border-maroon/10">
          <div className="w-10 h-10 rounded-full bg-maroon flex items-center justify-center text-white shrink-0">
            <span className="material-symbols-outlined text-sm">trending_up</span>
          </div>
          <div>
            <p className="text-xs font-bold dark:text-white">Meta de Sequência Diária</p>
            <p className="text-[10px] opacity-70 dark:text-gray-300">Registre este treino para atingir {streak + 1} dias seguidos e ganhar 50 XP!</p>
          </div>
        </div>
      </main>

      {/* Footer Action */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-light via-background-light/95 to-transparent dark:from-background-dark dark:via-background-dark/95 z-10">
        <button
          onClick={handleFinish}
          disabled={isSubmitting}
          className={`w-full bg-primary text-background-light py-5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/20 active:scale-[0.98] transition-all hover:brightness-110 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <span>{initialData ? 'Salvar Alterações' : 'Concluir Treino'}</span>
              <span className="material-symbols-outlined text-sm">check_circle</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default LogWorkout;