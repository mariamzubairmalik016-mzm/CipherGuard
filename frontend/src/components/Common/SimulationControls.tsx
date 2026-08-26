import React from 'react';
import { useKeyVault } from '../../context/KeyVaultContext';
import { Play, Pause, SkipForward, RotateCcw, FastForward } from 'lucide-react';

interface SimulationControlsProps {
  onStep?: () => void;
  onReset?: () => void;
  title?: string;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({ onStep, onReset, title = 'Simulation Controls' }) => {
  const { isPlaying, setIsPlaying, simulationSpeed, setSimulationSpeed } = useKeyVault();

  const speeds = [0.5, 1, 2, 4];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow-lg">
      <div className="flex items-center space-x-2">
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{title}</span>
      </div>

      <div className="flex items-center space-x-2">
        {/* Play/Pause Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-all ${
            isPlaying
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isPlaying ? 'Pause' : 'Play'}</span>
        </button>

        {/* Step Forward Button */}
        {onStep && (
          <button
            onClick={onStep}
            disabled={isPlaying}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Step</span>
          </button>
        )}

        {/* Reset Button */}
        {onReset && (
          <button
            onClick={onReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Speed Selector */}
      <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
        <FastForward className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
        {speeds.map(speed => (
          <button
            key={speed}
            onClick={() => setSimulationSpeed(speed)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
              simulationSpeed === speed
                ? 'bg-cyan-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {speed}x
          </button>
        ))}
      </div>
    </div>
  );
};
