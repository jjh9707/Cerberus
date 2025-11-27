import { createContext, useContext, type ReactNode } from 'react';
import { useGameState, type GameStateHook } from './gameState';

const GameContext = createContext<GameStateHook | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const gameState = useGameState();
  
  return (
    <GameContext.Provider value={gameState}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
