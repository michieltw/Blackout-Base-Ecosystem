// TypeScript types derived from Fixed_Blackout_Base_Ecosystem.xlsx

export interface TournamentGoalEvent {
  id: string;
  game_id: string;
  scorer_player_id: string;
}

export interface Official {
  id: string;
  name: string;
  role: string;
  person_id: string;
}

export interface Organization {
  id: string;
  name: string;
}

export interface League {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  status: string;
}

export interface Division {
  id: string;
  league_id: string;
  name: string;
  level?: number;
}

export interface Competition {
  id: string;
  league_id: string;
  division_id?: string;
  name: string;
  type: string;
}

export interface Season {
  id: string;
  competition_id: string;
  name: string;
  start_date: string;
  end_date?: string;
  status: string;
}

export interface Team {
  id: string;
  name: string;
  short_name: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  TeamWins?: number;
  TeamLosses?: number;
  TeamTies?: number;
  TeamOTL?: number;
  TeamSOL?: number;
  GoalsFor?: number;
  GoalsAgainst?: number;
  GoalDifference?: number;
  GamesPlayedTeam?: number;
  WinPercentage?: number;
  StandingsPoints?: number;
  StandingsRank?: number;
}

export interface Location {
  id: string;
  name: string;
  address?: string;
  city?: string;
}

export interface Game {
  id: string;
  season_id: string;
  home_team_id: string;
  away_team_id: string;
  date: string;
  location_id: string;
  home_score?: number;
  away_score?: number;
  is_final?: boolean;
  is_overtime?: boolean;
  is_shootout?: boolean;
  home_shots?: number;
  away_shots?: number;
  video_url?: string;
  status: string;
  GoalCount?: number;
  GoalsAgainst?: number;
  ShootingPercentage?: number;
  SavePercentage?: number;
  PowerPlayGoals?: number;
  PowerPlayOpportunities?: number;
  PowerPlayPercentage?: number;
  PenaltyKillPercentage?: number;
  FaceoffWinPercentage?: number;
}

export interface Person {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  email?: string;
  phone?: string;
}

export interface Player {
  id: string;
  person_id: string;
  current_team_id?: string;
  position: string;
  jersey_number?: number;
  GamesPlayed?: number;
  Goals?: number;
  Assists?: number;
  Points?: number;
  PlusMinus?: number;
  GoalsPerGame?: number;
  AssistsPerGame?: number;
  PointsPerGame?: number;
}

export interface GamePlayer {
  id: string;
  game_id: string;
  player_id: string;
  team_id: string;
  checked_in?: boolean;
}

export interface GoalEvent {
  id: string;
  game_id: string;
  team_id: string;
  scorer_player_id: string;
  assist_player_id?: string;
  assist2_player_id?: string;
  period?: number;
  time?: string;
  video_timestamp?: string;
}

export interface Penalty {
  id: string;
  game_id: string;
  team_id: string;
  player_id: string;
  penalty_type: string;
  period?: number;
  duration?: number;
  time?: string;
}

export interface GamePeriod {
  id: string;
  game_id: string;
  period_number: number;
  duration_minutes: number;
}

export interface ShotEvent {
  id: string;
  game_id: string;
  team_id: string;
  player_id: string;
  goalie_id?: string;
  period: number;
  time: string;
  x_coordinate: number;
  y_coordinate: number;
  shot_type?: string;
  result: string;
}

export interface Subscription {
  id: string;
  person_id: string;
  type: string;
  start_date: string;
  end_date?: string;
  status: string;
}

export interface PlayerGameStats {
  id: string;
  game_id: string;
  player_id: string;
  goals?: number;
  assists?: number;
  penalty_minutes?: number;
  shots?: number;
  hits?: number;
  Points?: number;
}

export interface TeamSeasonStats {
  id: string;
  team_id: string;
  season_id: string;
  games_played?: number;
  wins?: number;
  losses?: number;
  ties?: number;
  ot_losses?: number;
  goals_for?: number;
  goals_against?: number;
  points?: number;
}

export interface GoalieGameStats {
  id: string;
  game_id: string;
  player_id: string;
  shots_against?: number;
  saves?: number;
  goals_against?: number;
  shutout?: boolean;
  minutes_played?: number;
}

export interface Faceoff {
  id: string;
  game_id: string;
  period: number;
  time: string;
  winner_player_id: string;
  loser_player_id: string;
  zone: string;
}

export interface Shift {
  id: string;
  game_id: string;
  player_id: string;
  period: number;
  start_time: string;
  end_time: string;
}

export interface PlayerSeasonStats {
  id: string;
  player_id: string;
  season_id: string;
  goals?: number;
  assists?: number;
  penalty_minutes?: number;
}

export interface Standing {
  id: string;
  season_id: string;
  team_id: string;
  games_played?: number;
  wins?: number;
  losses?: number;
  ot_losses?: number;
  points?: number;
  goals_for?: number;
  goals_against?: number;
}

export interface Contract {
  id: string;
  player_id: string;
  team_id: string;
  start_date: string;
  end_date?: string;
  salary?: number;
  type: string;
}
