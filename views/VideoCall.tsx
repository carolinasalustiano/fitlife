import React from 'react';

interface VideoCallProps {
  room: string;
  onLeave: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({ room, onLeave }) => {
  // We use Jitsi Meet's public web service. For production, you could host your own.
  const jitsiUrl = `https://meet.jit.si/${room}`;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Absolute Close button overlapping the iframe slightly if needed, but we can just use a top bar */}
      <header className="bg-black text-white p-4 flex justify-between items-center shadow-lg relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-maroon flex items-center justify-center animate-pulse shadow-[0_0_15px_rgba(151,35,57,0.8)]">
            <span className="material-symbols-rounded">video_camera_front</span>
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight">Consulta FitLife</h2>
            <p className="text-xs text-white/60">Ambiente Seguro</p>
          </div>
        </div>
        <button 
          onClick={onLeave}
          className="bg-white/10 hover:bg-red-500/80 active:scale-95 transition-all text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md"
        >
          Sair da Sala
        </button>
      </header>

      {/* Jitsi iframe */}
      <div className="flex-1 w-full h-full bg-[#1e1e1e]">
        <iframe
          src={jitsiUrl}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          className="w-full h-full border-0"
          title="Jitsi Video Call"
        />
      </div>
    </div>
  );
};

export default VideoCall;
