export type UserRole = 'Guest' | 'StandardUser' | 'Manager' | 'LeagueOfficer' | 'MultiLeagueOfficer' | 'Admin';

export type PersonRoleType =
  | 'User'
  | 'Player'
  | 'Manager'
  | 'Referee'
  | 'Volunteer'
  | 'LeagueOfficer'
  | 'MultiLeagueOfficer'
  | 'Administrator';

export interface Equipment {
  id: string;
  type: 'stick' | 'skates' | 'helmet' | 'gloves';
  brand: string; // Merk
  model: string; // Model
  specifications: { // Specificaties
    flex?: number; // for sticks
    curve?: string; // for sticks
    size?: number; // for skates
    color?: string;
  };
  condition: number; // 0-100%
  playerId?: string; // Gebruikt door spelers
}

export interface PlayerStats {
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  penaltyMinutes: number;
  rating: number; // Overall rating out of 100
  speed: number; // 0-100
  shooting: number; // 0-100
  passing: number; // 0-100
  defense: number; // 0-100
  physical: number; // 0-100
}

export interface Person {
  id: string;
  name: string;
  avatar: string;
  birthdate: string;
  nationality: string;
  bio: string;
  roles: PersonRoleType[]; // e.g. ['Player'], ['Manager'], etc.

  // Player specific fields (only relevant if roles contains 'Player')
  equipment?: Equipment[];
  stats?: PlayerStats;
  goalieStats?: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    gaa: number;
    sv: number;
    shutouts: number;
  };
  playerPool?: 'None' | 'Leenspelers' | 'Vrije Agenten' | 'Draft';
  teamIds?: string[]; // Player can belong to multiple teams/competitions

  // Manager specific fields (only relevant if roles contains 'Manager')
  managedTeamId?: string;
}

export interface Team {
  id: string;
  name: string;
  city: string;
  stadium: string;
  logo: string; // Image URL or fallback text/emoji
  primaryColor: string;
  secondaryColor: string;
  managerId: string | null; // Person ID
  playerIds: string[]; // Person IDs with role 'Player'
  tactics: {
    style: 'Aanvallend' | 'Neutraal' | 'Verdedigend';
    powerplayFocus: 'Fysiek' | 'Snelheid' | 'Techniek';
    aggression: number; // 0-100
  };
  leagueIds: string[]; // Team can be in multiple leagues
}

// Sub-components of Match (Wedstrijd)
export interface MatchEvent {
  type: 'Goal' | 'Penalty';
  time: string; // e.g., "12:34"
  period: number; // 1, 2, 3
  personId: string; // Player who scored or got penalty
  assistPersonId?: string; // Player who assisted
}

export interface MatchStats {
  shotsOnGoal: { home: number; away: number };
  faceoffWins: { home: number; away: number };
  powerplays: { home: { opportunities: number; goals: number }; away: { opportunities: number; goals: number } };
}

export interface MatchOfficial {
  personId: string;
  role: 'Referee' | 'Linesman' | 'Scorekeeper';
}

export interface Match {
  id: string;
  leagueId: string;
  seasonId?: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number;
  awayScore?: number;
  status: 'Gepland' | 'Bezig' | 'Afgerond' | 'Verwerkt' | 'Geannuleerd'; // Wedstrijden
  isActive?: boolean;
  date: string;
  time?: string;
  endTime?: string;
  location?: string;
  round?: string;
  seasonPhaseId?: string;
  seasonPhaseName?: string;
  ruleset?: string;
  events?: MatchEvent[]; // Live Events / Scores
  referees?: string[];
  stats?: MatchStats; // Statistieken
  officials?: MatchOfficial[]; // Officials (Scheidsrechters)
  mediaUrls?: string[]; // Media
}

// Sub-components of League (Competitie)
export interface SeasonPhase {
  id: string;
  seasonId: string;
  name: 'Pre-Season' | 'Regular Season' | 'Playoffs' | 'Tournament';
  startDate: string;
  endDate: string;
  description?: string;
}

export interface Season { // Seizoenen
  id: string;
  leagueId?: string;
  name: string;
  years?: string; // e.g., "2026-2027"
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCurrent?: boolean;
  phases?: SeasonPhase[];
}

export interface Division { // Divisies
  id: string;
  name: string;
  playLevel: 'Pro' | 'Semi-Pro' | 'Amateur' | 'Recreational'; // Spelniveau
}

export interface Pool { // Poules
  id: string;
  divisionId: string;
  name: string;
  teamIds: string[];
}

export interface StandingRow { // Standen
  teamId: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  overtimeLosses: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
}

export interface Standing { // Standen
  leagueId: string;
  seasonId: string;
  rows: StandingRow[];
}

export interface League {
  id: string;
  name: string;
  season: string; // references a Season name or ID
  region: string;
  officerId: string | null; // Person ID of the League Officer
  teamIds: string[];
}

// Vereniging (Club / Association)
export interface Club {
  id: string;
  name: string;
  founded: string;
  president: string;
  teamsCount: number;
}

export interface Location { // Locaties
  id: string;
  name: string;
  address: string;
  capacity: number;
  hasRentals: boolean;
}

export interface AssociationMember { // Leden
  id: string;
  personId: string;
  membershipType: 'Active' | 'Supporting' | 'Honorary';
  joinDate: string;
}

export interface Sponsor { // Sponsors
  id: string;
  name: string;
  logoUrl: string;
  tier: 'Gold' | 'Silver' | 'Bronze';
  website: string;
}

export interface Association {
  clubs: Club[];
  locations: Location[];
  members: AssociationMember[];
  sponsors: Sponsor[];
}

// Media
export interface MediaItem {
  id: string;
  title: string;
  type: 'Foto' | 'Video' | 'Livestream' | 'Document';
  url: string;
  uploadedAt: string;
  description?: string;
  relatedMatchId?: string;
  relatedTeamId?: string;
}

// Social & Hub
export interface SocialPost { // Posts
  id: string;
  personId: string; // Author (Person ID)
  content: string;
  image?: string;
  createdAt: string;
  likesCount: number; // Likes
  likesPersonIds: string[];
  comments: SocialComment[]; // Reacties
}

export interface SocialComment { // Reacties
  id: string;
  personId: string;
  content: string;
  createdAt: string;
}

export interface SocialNotification { // Meldingen
  id: string;
  personId: string; // Recipient
  type: 'Like' | 'Comment' | 'MatchScheduled' | 'MatchResult' | 'System';
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface SocialAdvertisement { // Advertenties
  id: string;
  sponsorId?: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  clicks: number;
}

export interface SocialActivity { // Activiteiten
  id: string;
  personId: string;
  activityType: 'Goal' | 'Penalty' | 'EquipmentUpdate' | 'JoinTeam' | 'ScheduleMatch';
  description: string;
  createdAt: string;
}

// Instellingen
export interface AppSettings {
  firstTimeSetup: boolean; // Eerste keer Setup
  generalSettings: { // Algemene Settings
    theme: 'light' | 'dark';
    language: string;
    maintenanceMode: boolean;
  };
  matchSettings: { // Wedstrijd Settings
    periodDurationMinutes: number;
    overtimeEnabled: boolean;
    mercyRuleEnabled: boolean;
  };
  specificSettings: { // Specifieke setting
    allowLoanPlayers: boolean;
    maxPlayersPerTeam: number;
    requireEquipmentSafetyCheck: boolean;
  };
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'Training' | 'Toernooi' | 'Vergadering' | 'Evenement' | 'Seizoen' | 'Speelronde' | 'Overige';
  category?: 'Seizoen' | 'Speelronde' | 'Wedstrijd' | 'Tournooi' | 'Training' | 'Meeting' | 'Overige';
  date: string;
  endDate?: string;
  tussendatums?: string[];
  time: string;
  endTime?: string;
  tussentijden?: string[];
  location: string;
  description: string;
  seasonId?: string;
  seasonPhaseId?: string;
  relatedMatchId?: string;
  relatedLeagueId?: string;
  rsvps: Record<string, 'Aanwezig' | 'Afwezig' | 'Twijfel'>; // personId -> status
}

export interface DraftSession {
  id: string;
  status: 'NotStarted' | 'InProgress' | 'Completed';
  currentRound: number;
  currentPickIndex: number;
  pickOrder: string[]; // list of teamIds
  draftedPlayers: { playerId: string; teamId: string; round: number; pick: number }[];
}

// Global state structure of the App Database
export interface AppDatabase {
  currentUser: {
    id: string;
    username: string;
    email: string;
    systemRole: UserRole; // Guest, Manager, LeagueOfficer, MultiLeagueOfficer
    personId: string | null; // Linked Person profile (if set)
  };
  persons: Person[];
  teams: Team[];
  leagues: League[];
  matches: Match[];

  // Newly introduced models following the exact specification of categories
  draftState?: {
    status: 'Gepland' | 'InProgress' | 'Voltooid' | 'Mock';
    currentRound: number;
    currentPickIndex: number;
    pickOrder: string[];
    draftedPlayers: any[];
  };
  settings: AppSettings;
  association: Association;
  seasons: Season[];
  divisions: Division[];
  pools: Pool[];
  standings: Standing[];
  mediaItems: MediaItem[];
  socialPosts: SocialPost[];
  socialNotifications: SocialNotification[];
  socialAdvertisements: SocialAdvertisement[];
  socialActivities: SocialActivity[];

  // Expanded fields
  calendarEvents?: CalendarEvent[];
  rulesCMS?: string;
  draftSession?: DraftSession;
}
