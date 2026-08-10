import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import {
  Game,
  Team,
  Player,
  GoalEvent,
  ShotEvent,
  Penalty,
  GamePlayer,
  Standing
} from '../types/database';
import { calculateTeamStats, calculatePlayerStats } from '../utils/calculations';
import { v4 as uuidv4 } from 'uuid';

export type UserRole = 'League Manager' | 'Team Manager' | 'Scorekeeper' | 'Coach' | 'Fan/Guest';

interface HockeyState {
  role: UserRole;
  games: Game[];
  teams: Team[];
  players: Player[];
  goalEvents: GoalEvent[];
  shotEvents: ShotEvent[];
  penalties: Penalty[];
  gamePlayers: GamePlayer[];
}

interface HockeyContextProps {
  state: HockeyState;
  setRole: (role: UserRole) => void;
  addGoal: (goal: Omit<GoalEvent, 'id'>) => void;
  addShot: (shot: Omit<ShotEvent, 'id'>) => void;
  addPenalty: (penalty: Omit<Penalty, 'id'>) => void;
  updateGameScore: (gameId: string, homeScore: number, awayScore: number) => void;
  undoLastAction: (gameId: string) => void; // basic undo
  getComputedTeams: () => Team[];
  getComputedPlayers: () => Player[];
  saveGameState: (gameId: string) => void; // for DB sync simulation
}

const defaultState: HockeyState = {
  role: 'League Manager',
  games: [],
  teams: [
    { id: 't1', name: 'Blackout Bombers', short_name: 'BOM' },
    { id: 't2', name: 'Ice Eagles', short_name: 'EAG' }
  ],
  players: [
    { id: 'p1', person_id: 'per1', current_team_id: 't1', position: 'F', jersey_number: 9 },
    { id: 'p2', person_id: 'per2', current_team_id: 't2', position: 'D', jersey_number: 44 }
  ],
  goalEvents: [],
  shotEvents: [],
  penalties: [],
  gamePlayers: []
};

const HockeyContext = createContext<HockeyContextProps | undefined>(undefined);

export const HockeyProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<HockeyState>(defaultState);

  // Track action history for simple undo per game
  // In a real app this might be more robust
  const [actionHistory, setActionHistory] = useState<{type: 'goal'|'shot'|'penalty', id: string, gameId: string}[]>([]);

  const setRole = (role: UserRole) => setState(prev => ({ ...prev, role }));

  const addGoal = (goal: Omit<GoalEvent, 'id'>) => {
    const id = uuidv4();
    const newGoal = { ...goal, id };
    setState(prev => ({ ...prev, goalEvents: [...prev.goalEvents, newGoal] }));
    setActionHistory(prev => [...prev, { type: 'goal', id, gameId: goal.game_id }]);
  };

  const addShot = (shot: Omit<ShotEvent, 'id'>) => {
    const id = uuidv4();
    const newShot = { ...shot, id };
    setState(prev => ({ ...prev, shotEvents: [...prev.shotEvents, newShot] }));
    setActionHistory(prev => [...prev, { type: 'shot', id, gameId: shot.game_id }]);
  };

  const addPenalty = (penalty: Omit<Penalty, 'id'>) => {
    const id = uuidv4();
    const newPenalty = { ...penalty, id };
    setState(prev => ({ ...prev, penalties: [...prev.penalties, newPenalty] }));
    setActionHistory(prev => [...prev, { type: 'penalty', id, gameId: penalty.game_id }]);
  };

  const updateGameScore = (gameId: string, homeScore: number, awayScore: number) => {
    setState(prev => ({
      ...prev,
      games: prev.games.map(g => g.id === gameId ? { ...g, home_score: homeScore, away_score: awayScore } : g)
    }));
  };

  const undoLastAction = (gameId: string) => {
    const lastAction = [...actionHistory].reverse().find(a => a.gameId === gameId);
    if (!lastAction) return;

    if (lastAction.type === 'goal') {
      setState(prev => ({ ...prev, goalEvents: prev.goalEvents.filter(g => g.id !== lastAction.id) }));
    } else if (lastAction.type === 'shot') {
      setState(prev => ({ ...prev, shotEvents: prev.shotEvents.filter(s => s.id !== lastAction.id) }));
    } else if (lastAction.type === 'penalty') {
      setState(prev => ({ ...prev, penalties: prev.penalties.filter(p => p.id !== lastAction.id) }));
    }

    setActionHistory(prev => prev.filter(a => a.id !== lastAction.id));
  };

  const getComputedTeams = useCallback(() => {
    return state.teams.map(team => calculateTeamStats(team, state.games, state.goalEvents));
  }, [state.teams, state.games, state.goalEvents]);

  const getComputedPlayers = useCallback(() => {
    return state.players.map(player => calculatePlayerStats(player, state.gamePlayers, state.games, state.goalEvents, state.penalties));
  }, [state.players, state.gamePlayers, state.games, state.goalEvents, state.penalties]);

  const saveGameState = (gameId: string) => {
    const game = state.games.find(g => g.id === gameId);
    const gameGoals = state.goalEvents.filter(g => g.game_id === gameId);
    const gameShots = state.shotEvents.filter(s => s.game_id === gameId);
    const gamePenalties = state.penalties.filter(p => p.game_id === gameId);

    const payload = {
        game,
        goals: gameGoals,
        shots: gameShots,
        penalties: gamePenalties
    };

    console.log("Saving to GAS/localStorage:", payload);
    localStorage.setItem(`game_sync_${gameId}`, JSON.stringify(payload));

    setState(prev => ({
        ...prev,
        games: prev.games.map(g => g.id === gameId ? { ...g, is_final: true, status: 'FINAL' } : g)
    }));
  };

  return (
    <HockeyContext.Provider value={{
      state,
      setRole,
      addGoal,
      addShot,
      addPenalty,
      updateGameScore,
      undoLastAction,
      getComputedTeams,
      getComputedPlayers,
      saveGameState
    }}>
      {children}
    </HockeyContext.Provider>
  );
};

export const useHockeyDatabase = () => {
  const context = useContext(HockeyContext);
  if (context === undefined) {
    throw new Error('useHockeyDatabase must be used within a HockeyProvider');
  }
  return context;
};
