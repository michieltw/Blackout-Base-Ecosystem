export type Screen = 'splash' | 'main-menu' | 'settings' | 'scorekeeper' | 'database';

export interface Player {
  id: string;
  number: string;
  name: string;
  position?: string;
}

export interface ScheduledGame {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  location?: string;
  competition?: string;
  matchType?: string;
  homeRoster?: Player[];
  awayRoster?: Player[];
}

export interface GameSettings {
  periodLength: number; // in seconds
  trackIcing: boolean;
  trackOffside: boolean;
  trackSOG: boolean;

  officialGame: boolean;
  gameType: string;
  attendance: number;
  ticketsSold: number;

  liveGame: boolean;
  teamSelection: string;
  allowFillInPlayers: boolean;

  gameClock: boolean;
  clockPauseBehavior: string;
  autoStopAtPeriodEnd: string;
  periodFormat: string;
  shootout: boolean;
  soRules: string;

  trackSOGLocation: boolean;
  trackFOW: boolean;
  faceoffLocation: boolean;
  goalscorer: boolean;
  assists: string;

  trackPenalties: boolean;
  penaltyClock: string;
  durationTypes: string;

  officialsMode: string;
  linesmenMode: string;
  venueMode: string;
  capacity: number;
  avgPrice: number;

  haptics: boolean;
  stayAwake: boolean;
  autosave: boolean;
  localStorageEnabled: boolean;
  autogenerateCSV: boolean;
}

export interface GameConfig {
  homeTeam: string;
  awayTeam: string;
  homeColor?: string;
  awayColor?: string;
  homeLogo?: string;
  awayLogo?: string;
  homeRoster?: Player[];
  awayRoster?: Player[];
  date?: string;
  time?: string;
  location?: string;
  competition?: string;
  matchType?: string;
  officials?: string[];
  linesmen?: string[];
  initialScoreHome?: number;
  initialScoreAway?: number;
  initialSogHome?: number;
  initialSogAway?: number;
  initialPeriod?: number;
  settings: GameSettings;
}

export type EventType = 'shot' | 'goal' | 'penalty' | 'faceoff' | 'icing' | 'offside';

export interface GameEvent {
  id: string;
  type: EventType;
  team: string;
  time: string;
  text: string;
  x?: number;
  y?: number;
  isHistorical?: boolean;
  isUndone?: boolean;
  scorer?: string;
  assist1?: string;
  assist2?: string;
  penaltyReason?: string;
  penaltyMinutes?: number;
}

export interface ActivePenalty {
  id: string;
  eventId?: string;
  team: string;
  player: string;
  reason: string;
  minutes: number;
  secondsRemaining: number;
}

export interface GameState {
  isRunning: boolean;
  period: number;
  timeRemaining: number;
  stoppageTime: number;
  sogHome: number;
  sogAway: number;
  scoreHome: number;
  scoreAway: number;
  events: GameEvent[];
  activePenalties?: ActivePenalty[];
}
