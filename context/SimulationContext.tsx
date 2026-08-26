'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SimulationContextType {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  speed: number;
  setSpeed: (speed: number) => void;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  totalSteps: number;
  setTotalSteps: (steps: number) => void;
  togglePlay: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  resetSimulation: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [totalSteps, setTotalSteps] = useState<number>(4);

  const togglePlay = () => setIsPlaying(prev => !prev);

  const stepForward = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
  };

  const stepBackward = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const resetSimulation = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  return (
    <SimulationContext.Provider
      value={{
        isPlaying,
        setIsPlaying,
        speed,
        setSpeed,
        currentStep,
        setCurrentStep,
        totalSteps,
        setTotalSteps,
        togglePlay,
        stepForward,
        stepBackward,
        resetSimulation,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
