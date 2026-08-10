import React, { useState, useMemo } from 'react';

import { useHockeyDatabase } from '../../contexts/HockeyContext';

import { AppDatabase, Match, Team, Person, CalendarEvent, MatchEvent } from '../../types/frontend_types';
import {
  Trophy, Calendar, Users, Award, Shield, Search, Filter, Play,
  MapPin, Check, X, HelpCircle, Edit, Save, Plus, ArrowRight,
  Clock, Trash2, Megaphone, RotateCcw, ListCollapse, ChevronRight,
  ChevronLeft, ChevronDown, Sliders, CalendarRange, Info, Crown, BookOpen,
  Sparkles, MessageSquare, Radio, Volume2, Download, Upload, Globe,
  Zap, Heart, MessageCircle, Hammer, ShoppingCart, Activity, FileText,
  Terminal, Smartphone, XCircle
} from 'lucide-react';
import { TeamLogo } from './TeamLogo';



interface CompetitieDashboardProps {
  db: AppDatabase;
  onUpdateDb: (updatedDb: AppDatabase) => void;
  activeSubTab: string;
  setActiveTab: (tab: string) => void;
}

export const CompetitieDashboard: React.FC<CompetitieDashboardProps> = () => {
  const { state, getComputedTeams, getComputedPlayers } = useHockeyDatabase();
  const db = useMemo(() => {
     // Adapter layer to map Context -> Scrapyard Frontend expected AppDatabase
     const teams = getComputedTeams().map(t => ({
         id: t.id,
         name: t.name,
         shortName: t.short_name,
         logo: t.logo_url || 'https://via.placeholder.com/150',
         primaryColor: '#000',
         secondaryColor: '#fff',
         division: 'Pro',
         captainId: null,
         coachId: null,
         stats: {
            played: t.GamesPlayedTeam || 0,
            wins: t.TeamWins || 0,
            losses: t.TeamLosses || 0,
            draws: t.TeamTies || 0,
            otLosses: t.TeamOTL || 0,
            points: t.StandingsPoints || 0,
            goalsFor: t.GoalsFor || 0,
            goalsAgainst: t.GoalsAgainst || 0,
            penaltyKillPercentage: t.PenaltyKillPercentage || 100,
            powerPlayPercentage: t.PowerPlayPercentage || 0,
            streak: 'W0'
         }
     }));

     const computedPlayers = getComputedPlayers();
     const persons = computedPlayers.map(p => ({
         id: p.id,
         firstName: p.person_id,
         lastName: '',
         roles: ['Player']
     }));

     const players = computedPlayers.map(p => ({
         id: p.id,
         personId: p.id,
         teamId: p.current_team_id,
         jerseyNumber: p.jersey_number || 0,
         position: p.position === 'G' ? 'Goalie' : (p.position === 'D' ? 'Defense' : 'Forward'),
         shoots: 'Left',
         status: 'Active',
         stats: {
             gamesPlayed: p.GamesPlayed || 0,
             goals: p.Goals || 0,
             assists: p.Assists || 0,
             points: p.Points || 0,
             penaltyMinutes: 0,
             plusMinus: p.PlusMinus || 0,
             savePercentage: 0,
             goalsAgainstAverage: 0,
             shutouts: 0
         }
     }));

     return {
         teams,
         persons,
         players,
         matches: [],
         divisions: [{id: 'd1', name: 'Pro'}, {id: 'd2', name: 'Amateur'}],
         leagues: [],
         seasons: [],
         locations: [],
         standings: [],
         rules: { content: 'Geen regels' },
         calendarEvents: [],
         draftStatus: 'closed'
     };
  }, [state, getComputedTeams, getComputedPlayers]);

  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);

  // Navigation helper within competition
  const handleSubTabChange = (sub: string) => {
    setActiveTab(`comp-${sub}`);
  };

  const currentPerson = db.persons.find(p => p.id === db.currentUser.personId);
  const isOfficer = ['LeagueOfficer', 'MultiLeagueOfficer'].includes(db.currentUser.systemRole);

  // States
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'Scheduled' | 'Played'>('all');
  const [selectedMatchId, setSelectedMatchId] = useState<string>(
    db.matches.length > 0 ? db.matches[0].id : ''
  );
  const [showMatchSelector, setShowMatchSelector] = useState(false);
  const [searchMatchDate, setSearchMatchDate] = useState('');

  // Players filters
  const [playerSearch, setPlayerSearch] = useState('');
  const [playerPosFilter, setPlayerPosFilter] = useState<string>('All');
  const [playerTeamFilter, setPlayerTeamFilter] = useState<string>('All');
  const [playerShootFilter, setPlayerShootFilter] = useState<string>('All');
  const [playerDivFilter, setPlayerDivFilter] = useState<string>('All');
  const [playersSeason, setPlayersSeason] = useState<string>('2025 / 2026');

  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  const saveEditedMatch = () => {
    if (!editingMatch) return;
    const updatedMatches = db.matches.map(m => m.id === editingMatch.id ? editingMatch : m);
    onUpdateDb({ ...db, matches: updatedMatches });
    setEditingMatch(null);
  };

  // Calendar filter
  const [calendarTypeFilter, setCalendarTypeFilter] = useState<'All' | 'Training' | 'Toernooi' | 'Vergadering'>('All');

  // --- Redesigned Calendar State ---
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-07-22');

  // Helper to get Monday of any date
  const getMondayOfDate = (date: Date): Date => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const [weekMonday, setWeekMonday] = useState<Date>(() => getMondayOfDate(new Date('2026-07-22')));

  // Calendar filter toggles
  const [calendarShowFilters, setCalendarShowFilters] = useState(false);
  const [filterIncludeMatches, setFilterIncludeMatches] = useState(true);
  const [filterIncludeTrainings, setFilterIncludeTrainings] = useState(true);
  const [filterIncludeMeetings, setFilterIncludeMeetings] = useState(true);
  const [filterIncludeTournaments, setFilterIncludeTournaments] = useState(true);
  const [filterTeamSelected, setFilterTeamSelected] = useState('All');

  // --- Standings View States (matches screenshot) ---
  const [standingsActiveTab, setStandingsActiveTab] = useState<'standings' | 'playoffs' | 'format' | 'tiebreak'>('standings');
  const [standingsViewTab, setStandingsViewTab] = useState<'wildcard' | 'conference' | 'division' | 'league'>('division');
  const [standingsSearchQuery, setStandingsSearchQuery] = useState('');
  const [standingsSeason, setStandingsSeason] = useState('2026/2027');
  const [standingsDate, setStandingsDate] = useState('Jul 17');

  // Days of the active week generator
  const getDaysOfActiveWeek = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekMonday);
      d.setDate(weekMonday.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      days.push({
        date: d,
        dateStr,
        dayNum: d.getDate(),
        dayNameShort: ['ZON', 'MAA', 'DIN', 'WOE', 'DON', 'VRI', 'ZAT'][d.getDay()],
        dayNameFull: ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'][d.getDay()],
        monthNameFull: ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'][d.getMonth()]
      });
    }
    return days;
  };

  // Label for active week range e.g. "20 Jul - 26 Jul 2026"
  const getWeekRangeLabel = () => {
    const start = new Date(weekMonday);
    const end = new Date(weekMonday);
    end.setDate(weekMonday.getDate() + 6);
    const monthNames = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} ${monthNames[start.getMonth()]} ${start.getFullYear()}`;
    } else {
      return `${start.getDate()} ${monthNames[start.getMonth()]} - ${end.getDate()} ${monthNames[end.getMonth()]} ${start.getFullYear()}`;
    }
  };

  // Get items (matches and events) for a specific date
  const getItemsForDate = (dateStr: string) => {
    const matchesForDay = filterIncludeMatches
      ? db.matches.filter(m => {
          const matchDateOnly = m.date.split('T')[0];
          if (matchDateOnly !== dateStr) return false;
          if (filterTeamSelected !== 'All') {
            return m.homeTeamId === filterTeamSelected || m.awayTeamId === filterTeamSelected;
          }
          return true;
        })
      : [];

    const eventsForDay = db.calendarEvents
      ? db.calendarEvents.filter(e => {
          if (e.date !== dateStr) return false;
          if (e.type === 'Training' && !filterIncludeTrainings) return false;
          if (e.type === 'Vergadering' && !filterIncludeMeetings) return false;
          if (e.type === 'Toernooi' && !filterIncludeTournaments) return false;
          if (e.type === 'Evenement' && !filterIncludeTournaments) return false;
          return true;
        })
      : [];

    return {
      matches: matchesForDay,
      events: eventsForDay,
      totalCount: matchesForDay.length + eventsForDay.length
    };
  };

  // Navigation handlers for weeks
  const handlePrevWeek = () => {
    const prev = new Date(weekMonday);
    prev.setDate(weekMonday.getDate() - 7);
    setWeekMonday(prev);
    const year = prev.getFullYear();
    const month = String(prev.getMonth() + 1).padStart(2, '0');
    const day = String(prev.getDate()).padStart(2, '0');
    setSelectedDateStr(`${year}-${month}-${day}`);
  };

  const handleNextWeek = () => {
    const next = new Date(weekMonday);
    next.setDate(weekMonday.getDate() + 7);
    setWeekMonday(next);
    const year = next.getFullYear();
    const month = String(next.getMonth() + 1).padStart(2, '0');
    const day = String(next.getDate()).padStart(2, '0');
    setSelectedDateStr(`${year}-${month}-${day}`);
  };

  // Rules CMS State
  const [isEditingRules, setIsEditingRules] = useState(false);
  const [editedRulesText, setEditedRulesText] = useState(db.rulesCMS || '');
  const [rulesLang, setRulesLang] = useState<'nl' | 'en'>('nl');

  // Teams roster modal state
  const [rosterTeam, setRosterTeam] = useState<Team | null>(null);

  // Draft Simulation State
  const [draftDrafted, setDraftDrafted] = useState<Array<{ playerId: string; teamId: string; round: number; pick: number }>>(() => {
    return db.draftSession?.draftedPlayers || [];
  });
  const [draftRound, setDraftRound] = useState(db.draftSession?.currentRound || 1);
  const [draftPickIndex, setDraftPickIndex] = useState(db.draftSession?.currentPickIndex || 0);
  const [draftStatus, setDraftStatus] = useState<'NotStarted' | 'InProgress' | 'Completed' | 'Paused' | 'Mock'>(
    (db.draftSession?.status as any) || 'NotStarted'
  );

  const [draftOrderType, setDraftOrderType] = useState<'Standard' | 'Snake' | 'Random'>('Snake');
  const [draftPoolFilter, setDraftPoolFilter] = useState<string>('Alle spelers');

  const draftTeams = db.teams;
  // Compute draft order dynamically based on teams. Default is team ids in order.
  const baseOrder = draftTeams.map(t => t.id);
  let draftOrder = [...baseOrder];
  if (draftOrderType === 'Standard') {
    draftOrder = [...baseOrder]; // 1, 2, 3, 4
  } else if (draftOrderType === 'Snake') {
    // We handle snake logic in active team calculation
    draftOrder = [...baseOrder];
  } else if (draftOrderType === 'Random') {
    // Keep it static for this render but typically you'd shuffle and store.
    // We will just use baseOrder but pretend it's random in a real app.
    // For now we'll just reverse it to show a difference
    draftOrder = [...baseOrder].reverse();
  }

  // Active turn logic depending on snake or not
  const getActiveDraftTeamId = () => {
    if (draftStatus === 'Completed') return null;
    let index = draftPickIndex;
    if (draftOrderType === 'Snake') {
      const isReverseRound = draftRound % 2 === 0;
      if (isReverseRound) {
        index = draftOrder.length - 1 - draftPickIndex;
      }
    }
    return draftOrder[index];
  };

  // Available free players for draft (roles contains 'Player')
  const getAvailableDraftPlayers = () => {
    const draftedPlayerIds = draftDrafted.map(d => d.playerId);
    const existingTeamPlayerIds = db.teams.flatMap(t => t.playerIds);

    return db.persons.filter(p => {
      if (!p.roles.includes('Player')) return false;
      if (draftedPlayerIds.includes(p.id)) return false;

      // Filter logic
      if (draftPoolFilter === 'Gevorderd' && !p.roles.includes('Gevorderd')) return false;
      if (draftPoolFilter === 'Gemiddeld' && !p.roles.includes('Gemiddeld')) return false;
      if (draftPoolFilter === 'Beginner' && !p.roles.includes('Beginner')) return false;
      if (draftPoolFilter === 'Divisie A spelers' && p.playerPool !== 'Divisie A') return false;
      if (draftPoolFilter === 'Divisie B spelers' && p.playerPool !== 'Divisie B') return false;
      if (draftPoolFilter === 'Spelers zonder team' && existingTeamPlayerIds.includes(p.id)) return false;

      if (draftPoolFilter === 'Alle spelers') {
        // Show free agents by default if 'Alle spelers' unless they are already in a team
        return p.playerPool === 'Vrije Agenten' || p.playerPool === 'Leenspelers' || !existingTeamPlayerIds.includes(p.id);
      }
      return true;
    });
  };

  // Live Score logging state in Game Center
  const [gameCenterStatsTab, setGameCenterStatsTab] = useState<'team' | 'player' | 'log'>('team');

  const selectedMatch = db.matches.find(m => m.id === selectedMatchId) || db.matches[0];

  // ==================== 1. SPEELSCHEMA HANDLERS ====================
  const filteredMatches = [...db.matches]
    .filter(m => {
      if (scheduleFilter === 'all') return true;
      return m.status === scheduleFilter;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const [newMatchHome, setNewMatchHome] = useState('');
  const [newMatchAway, setNewMatchAway] = useState('');
  const [newMatchDate, setNewMatchDate] = useState('2026-07-25');
  const [newMatchTime, setNewMatchTime] = useState('20:00');
  const [showAddMatch, setShowAddMatch] = useState(false);

  const handleScheduleMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatchHome || !newMatchAway || newMatchHome === newMatchAway) {
      alert('Selecteer twee verschillende teams.');
      return;
    }
    const newMatch: Match = {
      id: `match-${Date.now()}`,
      leagueId: db.leagues[0]?.id || 'league-1',
      homeTeamId: newMatchHome,
      awayTeamId: newMatchAway,
      status: 'Gepland',
      date: `${newMatchDate}T${newMatchTime}:00Z`,
      events: [],
      stats: {
        shotsOnGoal: { home: 0, away: 0 },
        faceoffWins: { home: 0, away: 0 },
        powerplays: { home: { opportunities: 0, goals: 0 }, away: { opportunities: 0, goals: 0 } }
      }
    };
    const newDb = addMatch(newMatch);
    onUpdateDb(newDb);
    setShowAddMatch(false);
  };

  // ==================== 2. STANDEN CALCULATOR & TEAM METADATA ====================
  const getTeamDetails = (teamId: string): { id: string; name: string; city: string; stadium: string; logo: string; primaryColor: string; secondaryColor: string } => {
    const existing = db.teams.find(t => t.id === teamId);
    if (existing) {
      return existing;
    }

    return {
      id: teamId,
      name: teamId,
      city: 'Onbekend',
      stadium: db.association?.locations?.[0]?.name || 'Onbekend',
      logo: '',
      primaryColor: '#94A3B8',
      secondaryColor: '#1E293B'
    };
  };

  // Calculate standings on-the-fly dynamically (Single Source of Truth)
  const calculateStandings = () => {
    const table: Record<string, {
      teamId: string;
      gp: number;
      w: number;
      l: number;
      ot: number;
      pts: number;
      pPct: string;
      rw: number;
      row: number;
      gf: number;
      ga: number;
      gd: number;
      homeW: number;
      homeL: number;
      homeOT: number;
      awayW: number;
      awayL: number;
      awayOT: number;
      soW: number;
      soL: number;
      l10W: number;
      l10L: number;
      l10OT: number;
      streak: string;
    }> = {};

    // Initialize all teams
    const teamIds = db.teams.map(t => t.id);

    teamIds.forEach(id => {
      table[id] = {
        teamId: id,
        gp: 0,
        w: 0,
        l: 0,
        ot: 0,
        pts: 0,
        pPct: '.000',
        rw: 0,
        row: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        homeW: 0,
        homeL: 0,
        homeOT: 0,
        awayW: 0,
        awayL: 0,
        awayOT: 0,
        soW: 0,
        soL: 0,
        l10W: 0,
        l10L: 0,
        l10OT: 0,
        streak: 'W0'
      };
    });

    // Sort matches chronologically to calculate streaks
    const sortedMatches = [...db.matches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Maintain a list of results for each team to compute streak & l10
    const teamResults: Record<string, Array<'W' | 'L' | 'OT'>> = {};
    teamIds.forEach(id => { teamResults[id] = []; });

    sortedMatches.forEach(m => {
      if (m.status === 'Played' && m.homeScore !== undefined && m.awayScore !== undefined) {
        const home = table[m.homeTeamId];
        const away = table[m.awayTeamId];

        if (home && away) {
          home.gp += 1;
          away.gp += 1;
          home.gf += m.homeScore;
          home.ga += m.awayScore;
          away.gf += m.awayScore;
          away.ga += m.homeScore;

          if (m.homeScore > m.awayScore) {
            home.w += 1;
            home.homeW += 1;
            home.rw += 1;
            home.row += 1;
            teamResults[m.homeTeamId].push('W');

            const isOT = m.events?.some(e => e.period > 3);
            if (isOT) {
              away.ot += 1;
              away.awayOT += 1;
              teamResults[m.awayTeamId].push('OT');
            } else {
              away.l += 1;
              away.awayL += 1;
              teamResults[m.awayTeamId].push('L');
            }
          } else if (m.awayScore > m.homeScore) {
            away.w += 1;
            away.awayW += 1;
            away.rw += 1;
            away.row += 1;
            teamResults[m.awayTeamId].push('W');

            const isOT = m.events?.some(e => e.period > 3);
            if (isOT) {
              home.ot += 1;
              home.homeOT += 1;
              teamResults[m.homeTeamId].push('OT');
            } else {
              home.l += 1;
              home.homeL += 1;
              teamResults[m.homeTeamId].push('L');
            }
          } else {
            home.ot += 1;
            home.homeOT += 1;
            teamResults[m.homeTeamId].push('OT');

            away.ot += 1;
            away.awayOT += 1;
            teamResults[m.awayTeamId].push('OT');
          }

          home.gd = home.gf - home.ga;
          away.gd = away.gf - away.ga;
        }
      }
    });

    // Compute derived fields for each team
    teamIds.forEach(id => {
      const team = table[id];
      team.pts = team.w * 2 + team.ot * 1;

      if (team.gp > 0) {
        const pct = team.pts / (team.gp * 2);
        if (pct === 1) {
          team.pPct = '1.000';
        } else {
          team.pPct = pct.toFixed(3).replace(/^0/, ''); // removes leading zero, e.g. "0.500" -> ".500"
        }
      } else {
        team.pPct = '.000';
      }

      const results = teamResults[id] || [];
      const l10 = results.slice(-10);
      team.l10W = l10.filter(r => r === 'W').length;
      team.l10L = l10.filter(r => r === 'L').length;
      team.l10OT = l10.filter(r => r === 'OT').length;

      if (results.length > 0) {
        const lastResult = results[results.length - 1];
        let count = 0;
        for (let i = results.length - 1; i >= 0; i--) {
          if (results[i] === lastResult) {
            count++;
          } else {
            break;
          }
        }
        team.streak = `${lastResult}${count}`;
      } else {
        team.streak = 'W0';
      }
    });

    return Object.values(table);
  };

  // ==================== 3. KALENDER RSVP ACTIONS ====================
  const handleRSVP = (eventId: string, status: 'Aanwezig' | 'Afwezig' | 'Misschien' | 'Twijfel') => {
    if (!currentPerson) {
      alert('Koppel eerst een spelerprofiel via Mijn Profiel om je RSVP door te geven.');
      return;
    }
    const newDb = rsvpCalendarEvent(eventId, currentPerson.id, status as any);
    onUpdateDb(newDb);
  };

  const getCalendarEvents = () => {
    const list = db.calendarEvents || [];
    if (calendarTypeFilter === 'All') return list;
    return list.filter(e => e.type === calendarTypeFilter);
  };

  // ==================== 5. SPELERS REGISTER HANDLERS ====================
  const getFilteredPlayers = () => {
    if (playersSeason !== '2026 / 2027') {
      return [];
    }

    return db.persons.filter(p => {
      if (!p.roles.includes('Player')) return false;

      // search
      if (playerSearch.trim()) {
        const query = playerSearch.toLowerCase();
        if (!p.name.toLowerCase().includes(query)) return false;
      }

      // division
      if (playerDivFilter !== 'All') {
        const allowedTeamIds = db.pools
          .filter(pool => pool.divisionId === playerDivFilter)
          .flatMap(pool => pool.teamIds);

        const hasMatchingTeam = p.teamIds?.some(tid => allowedTeamIds.includes(tid));
        if (!hasMatchingTeam) return false;
      }

      // position
      if (playerPosFilter !== 'All') {
        const isGoalie = p.bio.toLowerCase().includes('doelman') || p.bio.toLowerCase().includes('keeper');
        const isVerdediger = p.bio.toLowerCase().includes('verdediger');
        const isAanvaller = !isGoalie && !isVerdediger;

        if (playerPosFilter === 'Goalie' && !isGoalie) return false;
        if (playerPosFilter === 'Defense' && !isVerdediger) return false;
        if (playerPosFilter === 'Forward' && !isAanvaller) return false;
      }

      // team
      if (playerTeamFilter !== 'All') {
        const team = db.teams.find(t => t.id === playerTeamFilter);
        if (!team || !team.playerIds.includes(p.id)) return false;
      }

      // shoot
      if (playerShootFilter !== 'All') {
        const isLeft = p.bio.toLowerCase().includes('links') || p.id.charCodeAt(0) % 2 === 0;
        if (playerShootFilter === 'L' && !isLeft) return false;
        if (playerShootFilter === 'R' && isLeft) return false;
      }

      return true;
    });
  };

  // Helper to guess player position from bio
  const getPlayerPosLabel = (p: Person) => {
    const bioText = p.bio.toLowerCase();
    if (bioText.includes('doelman') || bioText.includes('keeper')) return 'Doelman';
    if (bioText.includes('verdediger') || bioText.includes('defense')) return 'Verdediger';
    return 'Aanvaller';
  };

  const getPlayerTeam = (playerId: string) => {
    return db.teams.find(t => t.playerIds.includes(playerId));
  };



  const handleResetMatch = (matchId: string) => {
    if (!window.confirm('Weet je zeker dat je deze wedstrijd wilt resetten? Alle gebeurtenissen worden verwijderd.')) return;
    const newDb = resetMatch(matchId);
    onUpdateDb(newDb);
  };

  // ==================== 7. LEADERBOARDS ====================
  const getAllPlayersWithStats = () => {
    return db.persons.filter(p => p.roles.includes('Player') && p.stats);
  };

  const topPoints = [...getAllPlayersWithStats()].sort((a, b) => (b.stats?.points ?? 0) - (a.stats?.points ?? 0)).slice(0, 5);
  const topGoals = [...getAllPlayersWithStats()].sort((a, b) => (b.stats?.goals ?? 0) - (a.stats?.goals ?? 0)).slice(0, 5);
  const topAssists = [...getAllPlayersWithStats()].sort((a, b) => (b.stats?.assists ?? 0) - (a.stats?.assists ?? 0)).slice(0, 5);
  const topPIM = [...getAllPlayersWithStats()].sort((a, b) => (b.stats?.penaltyMinutes ?? 0) - (a.stats?.penaltyMinutes ?? 0)).slice(0, 5);

  // ==================== 8. RULES CMS SAVE ====================
  const handleSaveRules = () => {
    const newDb = updateRulesCMS(editedRulesText);
    onUpdateDb(newDb);
    setIsEditingRules(false);
  };

  // ==================== 9. PLAYER DRAFT SIMULATOR ====================
  const handleDraftPlayer = (playerId: string) => {
    const activeTeamId = getActiveDraftTeamId();
    if (!activeTeamId) return;
    const available = getAvailableDraftPlayers();
    const p = available.find(player => player.id === playerId);
    if (!p) return;

    const pickNo = draftDrafted.length + 1;
    const newDrafted = [
      ...draftDrafted,
      {
        playerId,
        teamId: activeTeamId,
        round: draftRound,
        pick: pickNo
      }
    ];

    let nextPick = draftPickIndex + 1;
    let nextRound = draftRound;
    if (nextPick >= draftOrder.length) {
      nextPick = 0;
      nextRound = draftRound + 1;
    }

    const nextStatus = nextRound > 3 ? 'Completed' : (draftStatus === 'Mock' ? 'Mock' : 'InProgress');

    setDraftDrafted(newDrafted);
    setDraftPickIndex(nextPick);
    setDraftRound(nextRound);
    setDraftStatus(nextStatus);

    if (draftStatus !== 'Mock') {
      // Persist drafted player into the actual team
      db.teams = db.teams.map(t => {
        if (t.id === activeTeamId) {
          return {
            ...t,
            playerIds: [...t.playerIds, playerId]
          };
        }
        return t;
      });

      db.draftSession = {
        id: 'draft-2026',
        status: nextStatus,
        currentRound: nextRound,
        currentPickIndex: nextPick,
        pickOrder: draftOrder,
        draftedPlayers: newDrafted
      };

      // Activity log
      const teamName = db.teams.find(t => t.id === activeTeamId)?.name || 'Team';
      const logAct = {
        id: `act-${Date.now()}`,
        personId: db.currentUser.personId || 'system',
        activityType: 'JoinTeam' as any,
        description: `${teamName} heeft ${p.name} geselecteerd in de Draft (Ronde ${draftRound}, Pick ${pickNo}).`,
        createdAt: new Date().toISOString()
      };
      db.socialActivities = [logAct, ...db.socialActivities];

      const newDb = draftPlayer(playerId, activeTeamId, draftRound, pickNo);
      onUpdateDb(newDb);
    }
  };

  const handleResetDraft = () => {
    if (!window.confirm('Weet je zeker dat je de draft wilt resetten? Alle teams worden leeggemaakt en spelers gaan terug naar de Draft pool.')) return;
    const draftOrder = [...db.teams.map(t => t.id)].sort(() => 0.5 - Math.random());
    const newDb = resetDraftState(draftOrder);
    onUpdateDb(newDb);
  };

  const handleDraftCommand = (command: 'Start' | 'Pauzeer' | 'Verwijder' | 'Mock-Draft') => {
    if (command === 'Start') setDraftStatus('InProgress');
    if (command === 'Pauzeer') setDraftStatus('Paused');
    if (command === 'Mock-Draft') setDraftStatus('Mock');
    if (command === 'Verwijder') {
       handleResetDraft(); // Same as reset but might close draft entirely in real app
    }
  };

  const getActiveDraftTeam = () => {
    const activeTeamId = getActiveDraftTeamId();
    if (!activeTeamId) return null;
    return db.teams.find(t => t.id === activeTeamId);
  };

  return (
<>
<div className="space-y-6" id="competition-dashboard-root">{/* Tab bar header */}
      <div className="flex justify-end mb-4 relative z-30">
<div className="w-full sm:w-64">
<div className="border border-slate-200 rounded-3xl shadow-sm relative z-30">
<button
              onClick={() => setIsNavMenuOpen(!isNavMenuOpen)}
              className="w-full flex items-center justify-between p-3">
<div className="flex items-center gap-2">
<Trophy className="w-4 h-4 text-slate-900" />
                <h2 className="text-sm font-sans font-black uppercase text-slate-900 tracking-wider truncate">{(() => {
                    const tabs = [
                      { id: 'speelschema', label: 'Schema' },
                      { id: 'standen', label: 'Standen' },
                      { id: 'kalender', label: 'Kalender' },
                      { id: 'teams', label: 'Teams' },
                      { id: 'spelers', label: 'Spelers' },
                      { id: 'gamecenter', label: 'Game Center' },
                      { id: 'statistieken', label: 'Stats' },
                      { id: 'reglementen', label: 'Regels' },
                      { id: 'playerdraft', label: 'Draft' },
                      { id: 'indevelopment', label: 'In Development' }
                    ];
                    return tabs.find(t => t.id === activeSubTab)?.label || 'Competitie';
                  })()}
                </h2>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isNavMenuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {isNavMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-full sm:w-64 border border-slate-200 rounded-3xl shadow-sm z-30 flex flex-col p-2 max-h-[80vh] overflow-y-auto hide-scrollbar hide-scrollbar">{[
                { id: 'speelschema', label: 'Schema' },
                { id: 'standen', label: 'Standen' },
                { id: 'kalender', label: 'Kalender' },
                { id: 'teams', label: 'Teams' },
                { id: 'spelers', label: 'Spelers' },
                { id: 'gamecenter', label: 'Game Center' },
                { id: 'statistieken', label: 'Stats' },
                { id: 'reglementen', label: 'Regels' },
                { id: 'playerdraft', label: 'Draft' },
                ...(activeSubTab === 'indevelopment' ? [{ id: 'indevelopment', label: 'In Development' }] : [])
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    handleSubTabChange(tab.id);
                    setIsNavMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                    activeSubTab === tab.id
                      ? 'bg-[#1c2a38] text-white border-slate-800 shadow-sm'
                      : 'text-slate-800 bg-white border-transparent hover:bg-white hover:border-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SPEELSCHEMA VIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'speelschema' && (
        <div className="space-y-6" id="comp-view-speelschema">
<div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 mb-4 gap-4">
<div />

              <div className="flex items-center gap-3">{/* Filter tabs */}
                <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-bold">
<button
                    onClick={() => setScheduleFilter('all')}
                    className={`px-3 py-1.5 border-r border-slate-200 ${scheduleFilter === 'all' ? 'bg-[#1c2a38] text-white' : 'bg-white text-slate-800 hover:bg-white'}`}
                  >
                    Alles
                  </button>
                  <button
                    onClick={() => setScheduleFilter('Scheduled')}
                    className={`px-3 py-1.5 border-r border-slate-200 ${scheduleFilter === 'Scheduled' ? 'bg-[#1c2a38] text-white' : 'bg-white text-slate-800 hover:bg-white'}`}
                  >
                    Scheduled
                  </button>
                  <button
                    onClick={() => setScheduleFilter('Played')}
                    className={`px-3 py-1.5 ${scheduleFilter === 'Played' ? 'bg-[#1c2a38] text-white' : 'bg-white text-slate-800 hover:bg-white'}`}
                  >
                    Gespeeld
                  </button>
                </div>
              </div>
            </div>

            {/* Form to Schedule Match */}
            {showAddMatch && (
              <form onSubmit={handleScheduleMatch} className="bg-white border border-slate-200 rounded-xl p-4 mb-5 shadow-sm space-y-3">
<h4 className="text-xs font-black uppercase text-slate-950 tracking-wider">Nieuwe Wedstrijd Toevoegen</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
<div>
                    <label className="block text-xs uppercase font-bold text-slate-500 mb-1">Thuis Team</label>
                    <select
                      value={newMatchHome}
                      onChange={(e) => setNewMatchHome(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
required
                    >
                      <option value="">Kies team...</option>
                      {db.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-bold text-slate-500 mb-1">Uit Team</label>
                    <select
                      value={newMatchAway}
                      onChange={(e) => setNewMatchAway(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
required
                    >
                      <option value="">Kies team...</option>
                      {db.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-bold text-slate-500 mb-1">Datum</label>
                    <input
                      type="date"
value={newMatchDate}
                      onChange={(e) => setNewMatchDate(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
required
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-bold text-slate-500 mb-1">Tijd</label>
                    <input
                      type="time"
value={newMatchTime}
                      onChange={(e) => setNewMatchTime(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
<button
                    type="button"
onClick={() => setShowAddMatch(false)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-white text-slate-700 font-bold">
                    Annuleren
                  </button>
                  <button
                    type="submit"
className="bg-[#1c2a38] hover:bg-[#111827] text-white font-sans text-xs font-bold px-4 py-1.5 rounded-lg border border-slate-200">
                    Inplannen
                  </button>
                </div>
              </form>
            )}

            {/* List of matches */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{filteredMatches.map((match) => {
                const homeTeam = db.teams.find(t => t.id === match.homeTeamId);
                const awayTeam = db.teams.find(t => t.id === match.awayTeamId);
                if (!homeTeam || !awayTeam) return null;

                const matchDate = new Date(match.date);
                const isPlayed = match.status === 'Played';

                return (
                  <div
                    key={match.id}
                    className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-3 shadow-xl flex flex-col justify-between text-white font-mono space-y-3">{/* Header: Date and Stadium */}
                    <div className="flex justify-between items-center text-[11px] text-slate-400 font-bold tracking-wide">
<span className="flex items-center gap-1 font-mono">
<Calendar className="w-3.5 h-3.5 text-slate-300" />
                        {matchDate.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="flex items-center gap-1">
<MapPin className="w-3 h-3 text-slate-300" />
                        {db.association?.locations?.[0]?.name || match.location || 'Onbekend'}
                      </span>
                    </div>

                    {/* 4-Quadrant Scoreboard Grid (Like Example Image) */}
                    <div className="grid grid-cols-2 gap-2">{/* Top Left: Home Team & Score */}
                      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-2.5 sm:p-3 flex items-center justify-between shadow-inner">
<div className="flex items-center gap-2 min-w-0">
<TeamLogo logo={homeTeam.logo} name={homeTeam.name} size="sm" />
                          {<span className="font-extrabold text-xs sm:text-sm text-slate-100 truncate uppercase tracking-tight">{homeTeam.name}</span>}
                        </div>
                        {<span className="text-2xl sm:text-3xl font-black text-slate-100 font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] ml-2">{isPlayed ? match.homeScore ?? 0 : '-'}
                            </span>
                          }
                          sourceType={isPlayed ? 'database' : 'static'}
                      </div>

                      {/* Top Right: Away Team & Score */}
                      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-2.5 sm:p-3 flex items-center justify-between shadow-inner">
<div className="flex items-center gap-2 min-w-0">
<TeamLogo logo={awayTeam.logo} name={awayTeam.name} size="sm" />
                          {<span className="font-extrabold text-xs sm:text-sm text-slate-100 truncate uppercase tracking-tight">{awayTeam.name}</span>}
                        </div>
                        {<span className="text-2xl sm:text-3xl font-black text-slate-100 font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] ml-2">{isPlayed ? match.awayScore ?? 0 : '-'}
                            </span>
                          }
                          sourceType={isPlayed ? 'database' : 'static'}
                      </div>

                      {/* Bottom Left: Match Stats (SOG, PIM, F/O) */}
                      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-2 sm:p-2.5 flex flex-col justify-center space-y-1 text-[11px] sm:text-xs font-mono font-bold text-slate-200 shadow-inner">
<div className="flex items-center justify-between border-b border-slate-800/80 pb-0.5">
{<span>{match.stats?.shotsOnGoal?.home ?? 0}</span>}
                          <span className="text-[10px] text-slate-400 font-sans uppercase font-extrabold tracking-wider">SOG</span>
                          {<span>{match.stats?.shotsOnGoal?.away ?? 0}</span>}
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-0.5">
{<span>{(() => {
                              if (match.stats?.penalties?.home !== undefined) return match.stats.penalties.home;
                              return match.events?.filter(e => e.type === 'Penalty' && (homeTeam.playerIds.includes(e.personId) || db.persons.find(p => p.id === e.personId)?.teamId === homeTeam.id)).length * 2 || 0;
                            })()}</span>}
                          <span className="text-[10px] text-slate-400 font-sans uppercase font-extrabold tracking-wider">PIM</span>
                          {<span>{(() => {
                              if (match.stats?.penalties?.away !== undefined) return match.stats.penalties.away;
                              return match.events?.filter(e => e.type === 'Penalty' && (awayTeam.playerIds.includes(e.personId) || db.persons.find(p => p.id === e.personId)?.teamId === awayTeam.id)).length * 2 || 0;
                            })()}</span>}
                        </div>
                        <div className="flex items-center justify-between">
{<span>{match.stats?.faceoffWins?.home ?? 0}</span>}
                          <span className="text-[10px] text-slate-400 font-sans uppercase font-extrabold tracking-wider">F/O</span>
                          {<span>{match.stats?.faceoffWins?.away ?? 0}</span>}
                        </div>
                      </div>

                      {/* Bottom Right: Period, Clock & Match Situation */}
                      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-2 sm:p-2.5 flex flex-col items-center justify-center text-center font-mono relative overflow-hidden shadow-inner">
{<span className="text-[10px] sm:text-xs font-black tracking-widest text-slate-300 uppercase">{match.status === 'Played' || match.status === 'Afgerond' ? 'FINAL' : match.status === 'Bezig' ? 'LIVE' : 'SCHEDULED'}
                            </span>}
                        {<span className="text-xl sm:text-2xl font-black text-white tracking-wider my-0.5 drop-shadow">{match.status === 'Played' || match.status === 'Afgerond' ? '00:00' : match.status === 'Bezig' ? 'LIVE' : (match.time || '20:00')}
                            </span>}
                        {<span className="text-[9px] sm:text-[10px] font-bold text-slate-400 tracking-wider uppercase border-t border-slate-800/80 pt-0.5 w-full truncate">{match.status === 'Played' || match.status === 'Afgerond' ? 'MATCH ENDED' : match.status === 'Bezig' ? 'IN PROGRESS' : 'UPCOMING'}
                            </span>}
                      </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center">
<div className="flex gap-1.5">{isPlayed ? (
                          <span className="bg-slate-900 text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700 uppercase font-mono">
                            Final
                          </span>
                        ) : (
                          <span className="bg-slate-900 text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700 uppercase font-mono">
                            Scheduled
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2 items-center">{isOfficer && (
                          <button
                            onClick={() => handleResetMatch(match.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-200 rounded border border-slate-800 hover:bg-slate-900 transition"
title="Reset wedstrijdscores">
<RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedMatchId(match.id);
                            handleSubTabChange('gamecenter');
                          }}
                          className="bg-slate-100 hover:bg-white text-slate-900 font-sans text-xs font-black uppercase px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1 cursor-pointer">
<Play className="w-3 h-3 fill-slate-900" /> Game Center
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredMatches.length === 0 && (
                <div className="col-span-1 md:col-span-2 text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
<p className="text-slate-500 text-xs">Geen wedstrijden gevonden voor dit filter.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. STANDEN VIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'standen' && (
        <div className="space-y-6 animate-fade-in text-slate-900" id="comp-view-standen">{/* Top Sub-navigation (Flat Tabs with under-border) */}
          <div className="border-b border-slate-200">
<div className="flex flex-wrap gap-6 -mb-px">{[
                { id: 'standings', label: 'Standings' },
                { id: 'playoffs', label: 'Playoffs' },
                { id: 'format', label: 'Playoff Format' },
                { id: 'tiebreak', label: 'Playoff Tie-Breaking Procedure' }
              ].map(subTab => (
                <button
                  key={subTab.id}
                  onClick={() => setStandingsActiveTab(subTab.id as any)}
                  className={`pb-3 text-sm font-semibold transition-all border-b-2 ${
                    standingsActiveTab === subTab.id
                      ? 'border-slate-900 text-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {subTab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Heading Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
<div>
              <h2 className="text-3xl font-black text-slate-950 tracking-tight leading-none">Standings</h2>

            </div>

            {/* Dropdown & Pager */}
            <div className="flex items-center gap-3">{/* Season Selector */}
              <div className="relative">
<select
                  value={standingsSeason}
                  onChange={(e) => setStandingsSeason(e.target.value)}
                  className="appearance-none pr-8 pl-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-extrabold text-slate-950 focus:outline-none shadow-[1px_1px_0px_0px_rgba(0,0,0,0.05)] cursor-pointer">
<option value="2026/2027">2026/2027</option>
                  <option value="2025/2026">2025/2026</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-600">
<Sliders className="w-3 h-3 text-slate-400" />
                </div>
              </div>

              {/* Date Pager */}
              <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-[1px_1px_0px_0px_rgba(0,0,0,0.05)] text-xs font-extrabold text-slate-950">
<button
                  onClick={() => setStandingsDate(standingsDate === 'Jul 17' ? 'Jul 10' : 'Jul 17')}
                  className="px-2.5 py-1.5 hover:bg-white border-r border-slate-200 transition-colors">
<ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 py-1.5 font-mono select-none">{standingsDate}</span>
                <button
                  onClick={() => setStandingsDate(standingsDate === 'Jul 17' ? 'Jul 24' : 'Jul 17')}
                  className="px-2.5 py-1.5 hover:bg-white border-l border-slate-200 transition-colors">
<ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Tab Content 1: Standings */}
          {standingsActiveTab === 'standings' && (
            <div className="space-y-6">{/* View options bar (Wild Card, Conference, Division, League) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
<div className="flex items-center gap-6">{[
                    { id: 'wildcard', label: 'Wild Card' },
                    { id: 'conference', label: 'Conference' },
                    { id: 'division', label: 'Division' },
                    { id: 'league', label: 'League' }
                  ].map(viewTab => (
                    <button
                      key={viewTab.id}
                      onClick={() => setStandingsViewTab(viewTab.id as any)}
                      className={`text-sm font-semibold pb-1 transition-all relative ${
                        standingsViewTab === viewTab.id
                          ? 'text-slate-900'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <span>{viewTab.label}</span>
                      {standingsViewTab === viewTab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
<Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
placeholder="Zoek een team..."
                    value={standingsSearchQuery}
                    onChange={(e) => setStandingsSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-slate-950 placeholder-slate-400"
/>
                </div>
              </div>

              {/* Grid / Content depending on viewTab */}
              <div className="space-y-6">{(() => {
                  const calculated = calculateStandings();

                  // Filter based on search query
                  const filtered = calculated.filter(row => {
                    const details = getTeamDetails(row.teamId);
                    return details.name.toLowerCase().includes(standingsSearchQuery.toLowerCase()) ||
                           details.city.toLowerCase().includes(standingsSearchQuery.toLowerCase());
                  });

                  // Teams mappings
                  // Divisie A: team-heerenveen, team-denhaag, team-amstel
                  // Divisie B: team-blue-knights-b, team-tilburg, team-amstel-b
                  const divATeams = filtered; // simplified fallback
                  const divBTeams = filtered.filter(row => ['team-blue-knights-b', 'team-tilburg', 'team-amstel-b'].includes(row.teamId));

                  // Helper function to render a standalone table
                  const renderStandingsTable = (rows: typeof calculated) => {
                    if (rows.length === 0) {
                      return (
                        <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                          Geen teams gevonden die voldoen aan de filters.
                        </div>
                      );
                    }

                    // Sort rows by PTS descending, then GD, then GF
                    const sortedRows = [...rows].sort((a, b) => {
                      if (b.pts !== a.pts) return b.pts - a.pts;
                      const aGD = a.gf - a.ga;
                      const bGD = b.gf - b.ga;
                      if (bGD !== aGD) return bGD - aGD;
                      return b.gf - a.gf;
                    });

                    return (
                      <div className="overflow-x-auto hide-scrollbar hide-scrollbar">
<table className="w-full text-left text-xs border-collapse">
<thead>
                            <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
<th className="py-2.5 px-3 w-10 text-center">RANK</th>
                              <th className="py-2.5 px-3">TEAM</th>
                              <th className="py-2.5 px-3 text-center w-10">GP</th>
                              <th className="py-2.5 px-3 text-center w-10">W</th>
                              <th className="py-2.5 px-3 text-center w-10">L</th>
                              <th className="py-2.5 px-3 text-center w-10">OT</th>
                              <th className="py-2.5 px-3 text-center w-12 text-slate-900 bg-slate-100/20 font-black relative cursor-pointer">
<span className="flex items-center justify-center gap-0.5">
                                  PTS <span className="text-[7px]">▼</span>
                                </span>
                              </th>
                              <th className="py-2.5 px-3 text-center w-14">P%</th>
                              <th className="py-2.5 px-3 text-center w-10">RW</th>
                              <th className="py-2.5 px-3 text-center w-10">ROW</th>
                              <th className="py-2.5 px-3 text-center w-10">GF</th>
                              <th className="py-2.5 px-3 text-center w-10">GA</th>
                              <th className="py-2.5 px-3 text-center w-10">DIFF</th>
                              <th className="py-2.5 px-3 text-center w-14">HOME</th>
                              <th className="py-2.5 px-3 text-center w-14">AWAY</th>
                              <th className="py-2.5 px-3 text-center w-12">S/O</th>
                              <th className="py-2.5 px-3 text-center w-16">L10</th>
                              <th className="py-2.5 px-3 text-center w-12">STRK</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">{sortedRows.map((row, idx) => {
                              const details = getTeamDetails(row.teamId);
                              const isClinched = idx === 0 && row.pts > 0; // Realistic playoff berth marker

                              return (
                                <tr key={row.teamId} className="hover:bg-white/50 transition">{/* Rank */}
                                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-500">{idx + 1}
                                  </td>

                                  {/* Team info */}
                                  <td className="py-3 px-3">
<div className="flex items-center space-x-2.5">
<TeamLogo logo={details.logo} name={details.name} size="sm" />
                                      <span className="font-extrabold text-slate-950 whitespace-nowrap">{details.name}
                                        {isClinched && <span className="ml-1.5 text-[10px] font-mono font-black text-slate-900 bg-slate-100 px-1 rounded">x</span>}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Stats */}
                                  <td className="py-3 px-3 text-center font-mono text-slate-500">{row.gp}</td>
                                  <td className="py-3 px-3 text-center font-mono text-slate-500">{row.w}</td>
                                  <td className="py-3 px-3 text-center font-mono text-slate-500">{row.l}</td>
                                  <td className="py-3 px-3 text-center font-mono text-slate-500">{row.ot}</td>

                                  {/* PTS Highlighted */}
                                  <td className="py-3 px-3 text-center font-mono font-black text-slate-950 bg-slate-100/10 border-x border-slate-200/30 text-[13px]">{row.pts}
                                  </td>

                                  <td className="py-3 px-3 text-center font-mono text-slate-500">{row.pPct}</td>
                                  <td className="py-3 px-3 text-center font-mono text-slate-500">{row.rw}</td>
                                  <td className="py-3 px-3 text-center font-mono text-slate-500">{row.row}</td>
                                  <td className="py-3 px-3 text-center font-mono text-slate-500">{row.gf}</td>
                                  <td className="py-3 px-3 text-center font-mono text-slate-500">{row.ga}</td>
                                  <td className="py-3 px-3 text-center font-mono text-slate-700">{row.gd > 0 ? `+${row.gd}` : row.gd}
                                  </td>

                                  {/* Record strings */}
                                  <td className="py-3 px-3 text-center font-mono text-slate-400 text-xs">{row.homeW}-{row.homeL}-{row.homeOT}
                                  </td>
                                  <td className="py-3 px-3 text-center font-mono text-slate-400 text-xs">{row.awayW}-{row.awayL}-{row.awayOT}
                                  </td>
                                  <td className="py-3 px-3 text-center font-mono text-slate-400 text-xs">{row.soW}-{row.soL}
                                  </td>
                                  <td className="py-3 px-3 text-center font-mono text-slate-400 text-xs">{row.l10W}-{row.l10L}-{row.l10OT}
                                  </td>

                                  {/* Streak Badge */}
                                  <td className="py-3 px-3 text-center font-mono">
<span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                                      row.streak.startsWith('W') && row.streak !== 'W0'
                                        ? 'bg-slate-100 text-slate-900'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}>
                                      {row.streak}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  };

                  // 1. Division layout (default & requested)
                  if (standingsViewTab === 'division') {
                    return (
                      <div className="space-y-6">{/* Division A Card */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
<div>
                            <h3 className="text-lg font-bold text-slate-900">Divisie A</h3>
                            <p className="text-sm text-slate-500 mt-0.5">
                              Gevorderden / Advanced Division
                            </p>
                          </div>
                          {renderStandingsTable(divATeams)}
                        </div>

                        {/* Division B Card */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
<div>
                            <h3 className="text-lg font-bold text-slate-900">Divisie B</h3>
                            <p className="text-sm text-slate-500 mt-0.5">
                              Recreanten / Recreational Division
                            </p>
                          </div>
                          {renderStandingsTable(divBTeams)}
                        </div>
                      </div>
                    );
                  }

                  // 2. League layout (combined)
                  if (standingsViewTab === 'league') {
                    return (
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
<div>
                          <h3 className="text-lg font-bold text-slate-900">Groningen House League - Algehele Stand</h3>
                          <p className="text-sm text-slate-500 mt-0.5">
                            Combined League Table (All Teams)
                          </p>
                        </div>
                        {renderStandingsTable(filtered)}
                      </div>
                    );
                  }

                  // 3. Conference layout (GHL Conference)
                  if (standingsViewTab === 'conference') {
                    return (
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
<div>
                          <h3 className="text-lg font-bold text-slate-900">Groningen Conference</h3>
                          <p className="text-sm text-slate-500 mt-0.5">
                            Unified GHL Conference Standings
                          </p>
                        </div>
                        {renderStandingsTable(filtered)}
                      </div>
                    );
                  }

                  // 4. Wildcard layout
                  if (standingsViewTab === 'wildcard') {
                    return (
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
<div>
                          <h3 className="text-lg font-bold text-slate-900">Wild Card Race</h3>
                          <p className="text-sm text-slate-500 mt-0.5">
                            Top non-division leaders in line for play-off berths
                          </p>
                        </div>
                        {renderStandingsTable(filtered)}
                      </div>
                    );
                  }

                  return null;
                })()}
              </div>

              {/* Bottom Legend and Info Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-t border-slate-200 pt-4 text-xs text-slate-500 font-bold">
<div className="flex flex-wrap gap-4 items-center">
<div className="flex items-center gap-1.5">
<span className="w-3.5 h-3.5 bg-slate-100 border border-slate-200 text-slate-900 font-black text-[10px] flex items-center justify-center rounded">x</span>
                    <span>Clinched Playoff Berth</span>
                  </div>
                  <div className="flex items-center gap-1.5">
<span className="w-3.5 h-3.5 bg-slate-100 border border-slate-200 text-slate-900 font-black text-[10px] flex items-center justify-center rounded">y</span>
                    <span>Clinched Division Title</span>
                  </div>
                  <div className="flex items-center gap-1.5">
<span className="w-3.5 h-3.5 bg-slate-100 border border-slate-200 text-slate-900 font-black text-[10px] flex items-center justify-center rounded">e</span>
                    <span>Eliminated from Playoff Contention</span>
                  </div>
                </div>

                <div className="font-sans text-slate-400 text-right">
                  Punten model: Reguliere winst = 2 pts &bull; Overtime/SO verlies = 1 pt &bull; Regulier verlies = 0 pts
                </div>
              </div>

            </div>
          )}

          {/* Tab Content 2: Playoffs */}
          {standingsActiveTab === 'playoffs' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
<div>
                <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">GHL Playoff Bracket</h3>
                <p className="text-xs text-slate-500 mt-0.5">Visualisatie van de knock-out fase en bokaalstrijd van het Groningen House League seizoen.</p>
              </div>

              {/* Visual Bracket */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center pt-4">{/* Semifinals */}
                <div className="space-y-6">
<h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-1">Halve Finales</h4>

                  {/* Match 1 */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
<div className="flex justify-between text-xs font-bold">
<span className="text-slate-900">Blue Knightmares (A)</span>
                      <span className="font-mono text-slate-500">2</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
<span className="text-slate-400">Green Grizzlies (B)</span>
                      <span className="font-mono text-slate-300">0</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-900 font-bold">Heerenveen wint best-of-3 serie (2-0)</div>
                  </div>

                  {/* Match 2 */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
<div className="flex justify-between text-xs font-bold">
<span className="text-slate-900">Emerald Knights (A)</span>
                      <span className="font-mono text-slate-500">1</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
<span className="text-slate-900">Red Hot Chilli Slappers (A)</span>
                      <span className="font-mono text-slate-500">2</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-900 font-bold">Groningen wint best-of-3 serie (2-1)</div>
                  </div>
                </div>

                {/* Finals */}
                <div className="space-y-6">
<h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-1">GHL Finale</h4>

                  <div className="bg-[#1c2a38] text-white rounded-3xl p-4 space-y-3 shadow-md border border-slate-200">
<div className="flex justify-between text-xs font-extrabold">
<span>Blue Knightmares (A)</span>
                      <span className="font-mono text-slate-900">0</span>
                    </div>
                    <div className="flex justify-between text-xs font-extrabold">
<span>Red Hot Chilli Slappers (A)</span>
                      <span className="font-mono text-slate-900">0</span>
                    </div>
                    <div className="text-[10px] font-sans font-medium text-slate-400">In afwachting van finale-reeks in september.</div>
                  </div>
                </div>

                {/* Champion */}
                <div className="text-center p-6 bg-slate-100 border-2 border-dashed border-slate-200 rounded-3xl space-y-3">
<Trophy className="w-10 h-10 text-slate-900 mx-auto animate-bounce" />
                  <div>
                    <h5 className="text-xs font-black uppercase text-slate-900">GHL Bekerhouder 2026</h5>
                    <p className="text-xs text-slate-900 leading-normal mt-1">Nog te beslissen. De winnaar van de GHL bekerfinale kroont zich tot kampioen van Groningen.</p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Tab Content 3: Format */}
          {standingsActiveTab === 'format' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
<h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">Playoff Format</h3>
              <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed space-y-3 text-xs">
<p>
                  Aan het einde van de reguliere Groningen House League (GHL) competitie kwalificeren de beste teams zich voor de officiële play-offs.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 font-semibold">
<li>De top 2 teams van zowel Divisie A als Divisie B plaatsen zich rechtstreeks voor de halve finales.</li>
                  <li>De halve finales worden gespeeld in een <strong>Best-of-Three (Bo3)</strong> format.</li>
                  <li>De winnaars strijden in de grote GHL finale om de felbegeerde Blackout Wisseltrofee.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab Content 4: Tiebreak */}
          {standingsActiveTab === 'tiebreak' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
<h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">Playoff Tie-Breaking Procedure</h3>
              <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed space-y-3 text-xs">
<p>
                  Indien twee of meer teams aan het einde van het seizoen een gelijk aantal punten (PTS) hebben, wordt de definitieve stand bepaald aan de hand van de volgende tie-breakers (in chronologische volgorde):
                </p>
                <ol className="list-decimal pl-5 space-y-1.5 font-semibold">
<li><strong>Punten (PTS)</strong>: Het totale aantal behaalde wedstrijdpunten.</li>
                  <li><strong>Reguliere Overwinningen (RW)</strong>: Het aantal overwinningen behaald binnen de reguliere speeltijd (zonder verlenging of shootouts).</li>
                  <li><strong>Regulation + Overtime Wins (ROW)</strong>: Het totale aantal winstpartijen exclusief shootouts.</li>
                  <li><strong>Doelsaldo (DIFF)</strong>: Het totale doelsaldo (Doelpunten Voor minus Doelpunten Tegen).</li>
                  <li><strong>Doelpunten Voor (GF)</strong>: Het totale aantal gescoorde doelpunten.</li>
                  <li><strong>Onderling Resultaat</strong>: Het resultaat van de wedstrijden die de betreffende teams tegen elkaar hebben gespeeld.</li>
                </ol>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. KALENDER VIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'kalender' && (
        <div className="space-y-6 animate-fade-in" id="comp-view-kalender">{/* Header row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
<div />

            {/* Filter Toggle Button */}
            <button
              onClick={() => setCalendarShowFilters(!calendarShowFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-slate-200 shadow-sm ${
                calendarShowFilters ? 'bg-slate-100' : 'bg-white hover:bg-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{calendarShowFilters ? 'Verberg Filters' : 'Filter Opties'}</span>
            </button>
          </div>

          {/* Expanded Filters Panel */}
          {calendarShowFilters && (
            <div className="bg-slate-100 border border-slate-200 rounded-3xl p-4 shadow-sm space-y-4">
<h4 className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-1.5">
<Filter className="w-3.5 h-3.5 text-slate-900" />
                <span>Kalender Filters &amp; Opties</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">{/* Content type checkboxes */}
                <div className="space-y-2">
<span className="font-bold text-slate-700 block">Weergeven:</span>
                  <div className="space-y-1.5 font-semibold">
<label className="flex items-center gap-2 cursor-pointer">
<input
                        type="checkbox"
checked={filterIncludeMatches}
                        onChange={(e) => setFilterIncludeMatches(e.target.checked)}
                        className="rounded border-slate-950 text-slate-950 focus:ring-slate-950"
/>
                      <span>Wedstrijden &amp; Scores</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
<input
                        type="checkbox"
checked={filterIncludeTrainings}
                        onChange={(e) => setFilterIncludeTrainings(e.target.checked)}
                        className="rounded border-slate-950 text-slate-950 focus:ring-slate-950"
/>
                      <span>Trainingen</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
<input
                        type="checkbox"
checked={filterIncludeMeetings}
                        onChange={(e) => setFilterIncludeMeetings(e.target.checked)}
                        className="rounded border-slate-950 text-slate-950 focus:ring-slate-950"
/>
                      <span>Overleggen &amp; Vergaderingen</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
<input
                        type="checkbox"
checked={filterIncludeTournaments}
                        onChange={(e) => setFilterIncludeTournaments(e.target.checked)}
                        className="rounded border-slate-950 text-slate-950 focus:ring-slate-950"
/>
                      <span>Toernooien &amp; GHL Events</span>
                    </label>
                  </div>
                </div>

                {/* Team Filter dropdown */}
                <div className="space-y-2">
<span className="font-bold text-slate-700 block">Filteren op club:</span>
                  <select
                    value={filterTeamSelected}
                    onChange={(e) => setFilterTeamSelected(e.target.value)}
                    className="w-full text-xs font-bold p-2 rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none">
<option value="All">Alle Clubs &amp; Teams</option>
                    {db.teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.city})</option>
                    ))}
                  </select>
                </div>

                {/* Quick actions info */}
                <div className="p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-600 leading-relaxed flex flex-col justify-center">
<span className="font-bold text-slate-800">Snelle navigatie tip:</span>
                  <span>Klik op de week-pijlen bovenaan om door de weken van de Groningen House League te bladeren. Selecteer een dag om alle geplande activiteiten direct te zien!</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">{/* Left/Main Column: Calendar Strip + Day items */}
            <div className="lg:col-span-2 space-y-6">{/* Week Selector Panel */}
              <div className="bg-white border border-slate-200 p-4 rounded-3xl flex items-center justify-between shadow-sm">
<button
                  onClick={handlePrevWeek}
                  className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-white hover:shadow-sm transition-all font-bold flex items-center justify-center"
title="Vorige week">
<ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 font-black text-xs md:text-sm text-slate-950 uppercase tracking-wider font-mono">
<CalendarRange className="w-4 h-4 text-slate-900" />
                  <span>{getWeekRangeLabel()}</span>
                </div>

                <button
                  onClick={handleNextWeek}
                  className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-white hover:shadow-sm transition-all font-bold flex items-center justify-center"
title="Volgende week">
<ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* 7-Day Strips Layout (matches mock perfectly) */}
              <div className="grid grid-cols-7 gap-1.5 md:gap-3 overflow-x-auto hide-scrollbar pb-2">{getDaysOfActiveWeek().map((day) => {
                  const dayData = getItemsForDate(day.dateStr);
                  const isSelected = selectedDateStr === day.dateStr;

                  return (
                    <button
                      key={day.dateStr}
                      onClick={() => setSelectedDateStr(day.dateStr)}
                      className={`border border-slate-200 rounded-3xl p-2 md:p-3 flex flex-col items-center justify-between transition-all text-center min-w-[55px] ${
                        isSelected
                          ? 'bg-slate-100 text-slate-950 shadow-sm transform -translate-y-0.5'
                          : 'bg-white hover:bg-white text-slate-800 shadow-sm hover:shadow-sm'
                      }`}
                    >
                      {/* Day Name */}
                      <span className={`text-[10px] md:text-[10px] font-mono tracking-wider font-extrabold ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                        {day.dayNameShort}
                      </span>

                      {/* Day number */}
                      <span className="text-sm md:text-lg font-black tracking-tight mt-0.5">{day.dayNum}
                      </span>

                      {/* Badges count of events + matches */}
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full border mt-1.5 inline-block ${
                        dayData.totalCount > 0
                          ? isSelected
                            ? 'bg-[#1c2a38] text-white border-slate-800'
                            : 'bg-slate-900 text-white border-[#DC2626]'
                          : isSelected
                            ? 'bg-slate-100 text-slate-900 border-slate-200'
                            : 'bg-white text-slate-400 border-slate-200'
                      }`}>
                        {dayData.totalCount}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Date Header */}
              <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
<h4 className="text-sm md:text-base font-black text-slate-950 tracking-tight flex items-center gap-2">
<div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
                  <span>
                    {getDaysOfActiveWeek().find(d => d.dateStr === selectedDateStr)?.dayNameFull || ''},{' '}
                    {getDaysOfActiveWeek().find(d => d.dateStr === selectedDateStr)?.dayNum || ''}{' '}
                    {getDaysOfActiveWeek().find(d => d.dateStr === selectedDateStr)?.monthNameFull || ''}
                  </span>
                </h4>

                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{getItemsForDate(selectedDateStr).totalCount} activiteit(en)
                </span>
              </div>

              {/* Day Items List */}
              <div className="space-y-4">{(() => {
                  const { matches, events } = getItemsForDate(selectedDateStr);

                  if (matches.length === 0 && events.length === 0) {
                    return (
                      <div className="border border-slate-200 rounded-3xl p-8 shadow-sm text-center max-w-2xl mx-auto my-4 space-y-4">
<div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto shadow-sm">
<Info className="w-6 h-6 text-slate-900" />
                        </div>
                        <div>
                          <h5 className="font-extrabold text-slate-950 text-sm">Geen wedstrijden of activiteiten</h5>
                          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                            Er zijn geen wedstrijden of clubactiviteiten gepland of gespeeld op deze dag.
                          </p>
                        </div>
                        {isOfficer && (
                          <button
                            onClick={() => {
                              setActiveTab('comp-speelschema');
                              setShowAddMatch(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-white text-slate-700 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all">
<Plus className="w-3.5 h-3.5" />
                            <span>Plan een wedstrijd</span>
                          </button>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-6">{/* GHL Matches Section */}
                      {matches.length > 0 && (
                        <div className="space-y-3">
<h5 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
<Trophy className="w-3.5 h-3.5" />
                            <span>Competitiewedstrijden (GHL)</span>
                          </h5>

                          <div className="grid grid-cols-1 gap-4">{matches.map((match) => {
                              const homeTeam = db.teams.find(t => t.id === match.homeTeamId);
                              const awayTeam = db.teams.find(t => t.id === match.awayTeamId);
                              if (!homeTeam || !awayTeam) return null;

                              const isPlayed = match.status === 'Played';
                              const matchTimeOnly = match.date.includes('T') ? match.date.split('T')[1].substring(0, 5) : '20:00';

                              return (
                                <div
                                  key={match.id}
                                  className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm transition-all hover:transform hover:-translate-y-0.5 space-y-3">
<div className="flex justify-between items-center text-xs text-slate-400 font-mono font-bold pb-2 border-b border-slate-100">
<span className="flex items-center gap-1">
<Clock className="w-3 h-3 text-slate-400" />
                                      <span>{matchTimeOnly} uur</span>
                                    </span>
                                    <span className={`px-2 py-0.5 rounded border uppercase text-[10px] font-mono ${
                                      isPlayed
                                         ? 'bg-slate-100 border-slate-200 text-slate-900'
                                         : 'bg-slate-100 border-slate-200 text-slate-900'
                                    }`}>
                                      {isPlayed ? 'GESPEELD' : 'GEPLAND'}
                                    </span>
                                  </div>

                                  {/* Teams Matchup layout */}
                                  <div className="grid grid-cols-3 items-center py-2">{/* Home Team */}
                                    <div className="flex flex-col items-center text-center space-y-1">
<TeamLogo logo={homeTeam.logo} name={homeTeam.name} size="md" />
                                      <span className="text-xs font-black text-slate-950 leading-tight block sm:max-w-[100px] truncate">
{<>{homeTeam.name}</>}
                                      </span>
                                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{homeTeam.city}</span>
                                    </div>

                                    {/* Center Scores / VS */}
                                    <div className="flex flex-col items-center justify-center text-center">{isPlayed ? (
                                        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-900 font-mono text-lg font-black shadow-sm">
{<span>{match.homeScore}</span>}
                                          <span className="text-xs text-slate-400">-</span>
                                          {<span>{match.awayScore}</span>}
                                        </div>
                                      ) : (
                                        <div className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-xl text-slate-800 text-xs font-mono font-black">
                                          VS
                                        </div>
                                      )}
                                    </div>

                                    {/* Away Team */}
                                    <div className="flex flex-col items-center text-center space-y-1">
<TeamLogo logo={awayTeam.logo} name={awayTeam.name} size="md" />
                                      <span className="text-xs font-black text-slate-950 leading-tight block sm:max-w-[100px] truncate">
{<>{awayTeam.name}</>}
                                      </span>
                                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{awayTeam.city}</span>
                                    </div>
                                  </div>

                                  {/* Actions / Details footer */}
                                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
{<span className="text-[10px] text-slate-400 font-medium">Locatie: {homeTeam.stadium || db.association?.locations?.[0]?.name || 'Onbekend'}</span>}
                                    <button
                                      onClick={() => {
                                        setSelectedMatchId(match.id);
                                        setActiveTab('comp-gamecenter');
                                      }}
                                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:underline animate-pulse">
<span>Bekijk Game Center</span>
                                      <ChevronRight className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* GHL Club Events & Trainings Section */}
                      {events.length > 0 && (
                        <div className="space-y-3">
<h5 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
<Calendar className="w-3.5 h-3.5" />
                            <span>Trainingen &amp; Activiteiten</span>
                          </h5>

                          <div className="grid grid-cols-1 gap-4">{events.map((evt) => {
                              const myRSVP = currentPerson ? (evt.rsvps?.[currentPerson.id] || 'Geen keuze') : null;

                              // Count stats for RSVPs
                              const rsvpList = Object.values(evt.rsvps || {});
                              const going = rsvpList.filter(v => v === 'Aanwezig').length;
                              const absent = rsvpList.filter(v => v === 'Afwezig').length;
                              const tentative = rsvpList.filter(v => v === 'Twijfel').length;

                              return (
                                <div
                                  key={evt.id}
                                  className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
<div className="flex justify-between items-start">
<div className="space-y-1">
{<span className={`inline-block text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded border ${
                                            evt.type === 'Training' ? 'bg-slate-100 text-slate-900 border-slate-200' :
                                            evt.type === 'Toernooi' ? 'bg-slate-100 text-xsurple-800 border-slate-200' :
                                            evt.type === 'Vergadering' ? 'bg-slate-100 text-slate-900 border-slate-200' :
                                            'bg-white text-slate-800 border-slate-200'
                                          }`}>
                                            {evt.type}
                                          </span>}
                                      <h4 className="text-xs font-black text-slate-950 leading-tight">
{<>{evt.title}</>}
                                      </h4>
                                    </div>
                                    {<span className="text-xs text-slate-500 font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{evt.time}
                                        </span>}
                                  </div>

                                  {<p className="text-xs text-slate-600 font-medium leading-relaxed">{evt.description}</p>}

                                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
<MapPin className="w-3.5 h-3.5 text-slate-900" />
                                    {<span>{evt.location || db.association?.locations?.[0]?.name || 'Onbekend'}</span>}
                                  </div>

                                  {/* Interactive RSVP Area */}
                                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">{currentPerson ? (
                                      <div className="flex items-center gap-1.5">
<span className="text-[10px] text-slate-500 font-bold">Mijn RSVP:</span>
                                        <div className="flex rounded-lg border border-slate-200 overflow-hidden text-[10px] font-black">
<button
                                            onClick={() => handleRSVP(evt.id, 'Aanwezig')}
                                            className={`px-2 py-1 transition-colors ${myRSVP === 'Aanwezig' ? 'bg-slate-900 text-white border-r border-slate-200' : 'bg-white text-slate-700 border-r border-slate-200 hover:bg-white'}`}
                                          >
                                            Aanwezig
                                          </button>
                                          <button
                                            onClick={() => handleRSVP(evt.id, 'Afwezig')}
                                            className={`px-2 py-1 border-r border-slate-200 transition-colors ${myRSVP ==='Afwezig' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-white'}`}
                                          >
                                            Afwezig
                                          </button>
                                          <button
                                            onClick={() => handleRSVP(evt.id, 'Twijfel')}
                                            className={`px-2 py-1 transition-colors ${myRSVP === 'Twijfel' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-white'}`}
                                          >
                                            Twijfel
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-slate-400 italic">Koppel een spelerprofiel via 'Mijn Profiel' om je RSVP door te geven.</span>
                                    )}

                                    {/* Attendance Tracker */}
                                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
<span className="bg-slate-100 text-slate-900 border border-slate-200 px-1.5 py-0.5 rounded font-bold">✓ {going} Aanwezig</span>
                                      <span className="bg-slate-100 text-slate-900 border border-slate-200 px-1.5 py-0.5 rounded font-bold">✗ {absent} Afwezig</span>
                                      <span className="bg-slate-100 text-slate-900 border border-slate-200 px-1.5 py-0.5 rounded font-bold">? {tentative} Twijfel</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>


          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TEAMS VIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'teams' && (
        <div className="space-y-6" id="comp-view-teams">
<div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{db.teams.map((team) => {
                const teamManager = db.persons.find(p => p.id === team.managerId);
                const managerName = teamManager ? teamManager.name : 'Niet aangewezen';

                return (
                  <div
                    key={team.id}
                    className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between">{/* Club header stripe with primary color */}
                    <div
                      className="h-3 w-full"
style={{ backgroundColor: team.primaryColor || '#DC2626' }}
                    />

                    <div className="p-4 space-y-4 flex-grow flex flex-col justify-between">
<div className="space-y-2.5">
<div className="flex items-center space-x-3">
<TeamLogo logo={team.logo} name={team.name} size="md" />
                          <div>
                            <h4 className="text-xs font-black text-slate-950 leading-tight">{team.name}</h4>
                            <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">{team.city}</p>
                          </div>
                        </div>

                        <div className="space-y-1 font-sans text-xs text-slate-600">
<div>
                            <span className="font-bold text-slate-500">Locatie:</span>{' '}
                            {<span>{team.stadium || db.association?.locations?.[0]?.name || 'Onbekend'}</span>}
                          </div>
                          <div>
                            <span className="font-bold text-slate-500">Manager:</span> <span className="font-semibold text-slate-800">{managerName}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-500">Tactische Stijl:</span> {team.tactics?.style || 'Neutraal'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-500">Team XP:</span> <span className="text-slate-900 font-extrabold font-mono">1.250 XP</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
<span className="text-xs font-mono font-bold bg-white text-slate-500 border border-slate-200 px-2 py-0.5 rounded">{team.playerIds?.length || 0} spelers
                        </span>

                        <button
                          onClick={() => setRosterTeam(team)}
                          className="text-xs bg-[#1c2a38] text-white font-black uppercase px-2.5 py-1 rounded hover:bg-slate-800 transition">
                          Roster
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Team Roster Modal / Drawer */}
            {rosterTeam && (
              <div className="fixed inset-0 bg-slate-100/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
<div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">{/* Header */}
                  <div
                    className="p-5 border-b border-slate-200 flex justify-between items-center"
style={{ borderTop: `8px solid ${rosterTeam.primaryColor}` }}
                  >
                    <div className="flex items-center space-x-3">
<TeamLogo logo={rosterTeam.logo} name={rosterTeam.name} size="md" />
                      <div>
                        <h3 className="font-black text-sm text-slate-950">{rosterTeam.name} - Roster</h3>
                        <p className="text-xs text-slate-400 font-mono uppercase">{rosterTeam.city} &bull;{' '}
                          {<span>{rosterTeam.stadium || db.association?.locations?.[0]?.name || 'Onbekend'}</span>}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setRosterTeam(null)}
                      className="p-1 rounded hover:bg-slate-100 border border-slate-300">
<X className="w-5 h-5 text-slate-800" />
                    </button>
                  </div>

                  {/* Players list inside Modal */}
                  <div className="p-5 overflow-y-auto hide-scrollbar space-y-3 flex-grow">
<h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Actieve Spelerslijst</h4>
                    <div className="divide-y divide-slate-100">{rosterTeam.playerIds.map((pid, idx) => {
                        const player = db.persons.find(p => p.id === pid);
                        if (!player) return null;

                        return (
                          <div key={pid} className="py-2.5 flex items-center justify-between text-xs font-sans">
<div className="flex items-center space-x-3">
<img
                                src={player.avatar}
                                alt={player.name}
                                className="w-8 h-8 rounded-full border border-slate-200 object-cover bg-slate-100"
referrerPolicy="no-referrer"
                              />
                              <div>
                                <p className="font-extrabold text-slate-950">{player.name}</p>
                                <p className="text-xs text-slate-400 font-medium font-mono">{getPlayerPosLabel(player)} &bull; Rugnummer #{idx + 12}</p>
                              </div>
                            </div>

                            {/* Minimal stats */}
                            <div className="flex gap-4 font-mono font-bold text-xs text-slate-500 text-right">
<div>
                                <p className="text-slate-400 uppercase text-[10px]">Goals</p>
                                <p className="text-slate-900 font-black">{player.stats?.goals || 0}</p>
                              </div>
                              <div>
                                <p className="text-slate-400 uppercase text-[10px]">Assists</p>
                                <p className="text-slate-900 font-black">{player.stats?.assists || 0}</p>
                              </div>
                              <div>
                                <p className="text-slate-400 uppercase text-[10px]">Points</p>
                                <p className="text-slate-900 font-black">{player.stats?.points || 0}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {rosterTeam.playerIds.length === 0 && (
                        <p className="text-slate-500 text-xs py-4 text-center">Dit team heeft op dit moment nog geen geregistreerde roster-spelers.</p>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-white p-4 border-t border-slate-200 flex justify-end">
<button
                      onClick={() => setRosterTeam(null)}
                      className="bg-[#1c2a38] hover:bg-[#111827] text-white font-sans text-xs font-bold px-4 py-2 rounded-lg">
                      Sluiten
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SPELERS REGISTER VIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'spelers' && (
        <div className="space-y-6" id="comp-view-spelers">
<div className="border border-slate-200 rounded-3xl p-6 shadow-sm">{/* Header / Title block matches mockup */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-5 mb-5 gap-4">
<div className="flex items-center space-x-3.5">
<div className="p-2.5 bg-slate-900 text-white rounded-3xl border border-slate-200 shadow-sm">
<Users className="w-6 h-6" />
                </div>
                <div />
              </div>

              {/* Season Dropdown */}
              <div className="flex items-center space-x-2 border border-slate-200 bg-white px-3 py-1.5 rounded-3xl shadow-sm">
<span className="text-xs font-black uppercase text-slate-400 tracking-wider">Seizoen</span>
                <select
                  value={playersSeason}
                  onChange={(e) => setPlayersSeason(e.target.value)}
                  className="text-xs font-extrabold text-slate-950 focus:outline-none bg-transparent cursor-pointer">
<option value="2025 / 2026">2025 / 2026</option>
                  <option value="2026 / 2027">2026 / 2027</option>
                  <option value="2027 / 2028">2027 / 2028</option>
                </select>
              </div>
            </div>

            {/* Filters Row matches mockup layout */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-white border border-slate-200 rounded-3xl shadow-sm mb-6">{/* Search Bar */}
              <div className="relative w-full">
<input
                  type="text"
placeholder="Zoek speler op naam..."
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500 bg-white text-slate-900 font-medium shadow-sm"
/>
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              </div>

              {/* Divisies dropdown */}
              <select
                value={playerDivFilter}
                onChange={(e) => setPlayerDivFilter(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none bg-white text-slate-900 font-bold cursor-pointer shadow-sm">
<option value="All">Alle Divisies</option>
                {db.divisions.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              {/* Teams dropdown */}
              <select
                value={playerTeamFilter}
                onChange={(e) => setPlayerTeamFilter(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none bg-white text-slate-900 font-bold cursor-pointer shadow-sm">
<option value="All">Alle Teams</option>
                {db.teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              {/* Posities dropdown */}
              <select
                value={playerPosFilter}
                onChange={(e) => setPlayerPosFilter(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none bg-white text-slate-900 font-bold cursor-pointer shadow-sm">
<option value="All">Alle Posities</option>
                <option value="Goalie">Alle Goalies</option>
                <option value="Defense">Alle Verdedigers</option>
                <option value="Forward">Alle Aanvallers</option>
              </select>
            </div>

            {/* Players Area */}
            {getFilteredPlayers().length === 0 ? (
              <div className="border-2 border-slate-200 border-dashed rounded-3xl p-16 bg-white flex flex-col items-center justify-center text-center space-y-4">
<div className="w-16 h-16 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-300">
<HelpCircle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
<h4 className="text-base font-bold text-slate-900">Geen Spelers Gevonden</h4>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Probeer uw zoekopdracht of filters aan te passen voor seizoen {playersSeason}.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{getFilteredPlayers().map((player) => {
                  const team = getPlayerTeam(player.id);
                  const isLeft = player.bio.toLowerCase().includes('links') || player.id.charCodeAt(0) % 2 === 0;
                  const posLabel = getPlayerPosLabel(player);

                  return (
                    <div
                      key={player.id}
                      className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-sm transition-all duration-200 flex space-x-4">{/* Avatar with shirt number badge */}
                      <div className="relative shrink-0">
<img
                          src={player.avatar}
                          alt={player.name}
                          className="w-16 h-16 rounded-3xl border border-slate-200 object-cover bg-slate-100 font-sans text-xs"
referrerPolicy="no-referrer"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-[#1c2a38] text-white font-mono text-[10px] font-black px-1.5 py-0.5 rounded-lg border border-white">
                          #{player.id.charCodeAt(0) % 99 + 1}
                        </div>
                      </div>

                      {/* Text Details */}
                      <div className="flex-grow min-w-0 flex flex-col justify-between">
<div>
                          <h4 className="text-xs font-extrabold text-slate-950 truncate">{player.name}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
<span className="text-xs text-slate-900 font-extrabold uppercase tracking-wide">{posLabel}</span>
                            <span className="text-slate-300 text-xs">&bull;</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase">Grip: {isLeft ? 'Links' : 'Rechts'}</span>
                          </div>
                          {player.nationality && (
                            <p className="text-[10px] text-slate-400 mt-1 font-semibold">{player.nationality}</p>
                          )}
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">{team ? (
                            <div className="flex items-center space-x-1.5 min-w-0">
<TeamLogo logo={team.logo} name={team.name} size="xs" />
                              <span className="text-xs font-black text-slate-700 truncate max-w-[90px]">{team.name}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-900 font-black italic">{player.playerPool || 'Vrije Agent'}</span>
                          )}

                          {/* Stats Pill / Rating Overall */}
                          <div className="bg-white border border-slate-200 font-mono text-xs font-black px-2 py-0.5 rounded-lg text-slate-800 flex items-center gap-1 shrink-0">{player.stats?.rating || 75} <span className="text-[10px] text-slate-400 font-bold uppercase">OVR</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. GAME CENTER VIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'gamecenter' && (
        <div className="space-y-6" id="comp-view-gamecenter">
<div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 mb-4 gap-3">
<div className="flex items-center gap-3">
<div className="relative overflow-hidden rounded-xl h-14 w-40 border border-slate-200 shadow-sm bg-slate-100 flex items-center justify-center p-1">
<img
                    src="https://cdn.shopify.com/s/files/1/1038/7203/7203/files/BOHLive.png?v=1784672505"
alt="Game Center Banner"
className="absolute inset-0 w-full h-full object-contain"
referrerPolicy="no-referrer"
                  />
                </div>
              {/* Match Selection Button */}
              <button
                onClick={() => setShowMatchSelector(true)}
                className="text-xs font-bold px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm border border-slate-800 flex items-center gap-2">
<Calendar className="w-4 h-4" />
                Select Match
              </button>
              </div>
            </div>

            {/* Match Selector Modal */}
            {showMatchSelector && (
              <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
<div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl border border-slate-200">
<div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
<h3 className="font-extrabold uppercase text-sm tracking-wider text-slate-950">Selecteer Wedstrijd</h3>
                    <button onClick={() => setShowMatchSelector(false)} className="text-slate-400 hover:text-slate-700">
<XCircle className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
<div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Zoek op datum</label>
                      <input
                        type="date"
value={searchMatchDate}
                        onChange={(e) => setSearchMatchDate(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
/>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2 pr-2 hide-scrollbar">{db.matches
                        .filter(m => !searchMatchDate || m.date === searchMatchDate)
                        .map(m => {
                          const h = db.teams.find(t => t.id === m.homeTeamId);
                          const a = db.teams.find(t => t.id === m.awayTeamId);
                          return (
                            <button
                              key={m.id}
                              onClick={() => {
                                setSelectedMatchId(m.id);
                                setShowMatchSelector(false);
                              }}
                              className={`w-full text-left p-3 rounded-xl border transition-all ${
                                selectedMatchId === m.id
                                  ? 'bg-slate-950 text-white border-slate-950 shadow-md'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-white'
                              }`}
                            >
                              <div className="flex justify-between items-center mb-1">
<span className="text-[10px] font-mono font-bold opacity-80">{m.date}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${m.status === 'Played' ? (selectedMatchId === m.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500') : (selectedMatchId === m.id ? 'bg-slate-100 text-slate-900' : 'bg-slate-100 text-slate-900')}`}>
                                  {m.status === 'Played' ? 'Final' : 'Scheduled'}
                                </span>
                              </div>
                              <div className="font-bold text-xs">{h?.name} vs {a?.name}
                              </div>
                            </button>
                          );
                        })}
                      {db.matches.filter(m => !searchMatchDate || m.date === searchMatchDate).length === 0 && (
                        <div className="text-center text-xs text-slate-500 py-4 font-semibold">
                          Geen wedstrijden gevonden op deze datum.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedMatch ? (
              (() => {
                const home = db.teams.find(t => t.id === selectedMatch.homeTeamId);
                const away = db.teams.find(t => t.id === selectedMatch.awayTeamId);
                if (!home || !away) return null;

                const eligiblePlayers = db.persons.filter(p => p.roles.includes('Player') && (home.playerIds.includes(p.id) || away.playerIds.includes(p.id)));

                return (
                  <div className="space-y-6">{/* Grand Stadium Scoreboard */}
                    <div className="bg-black rounded-[12px] p-1.5 flex flex-row gap-2 max-w-2xl mx-auto font-sans shadow-2xl border-[2px] border-black mb-6 w-full">{/* Left Column (Teams & Scores) */}
                      <div className="flex-1 flex flex-col relative gap-1 min-w-0">{/* Top Team */}
                        <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 rounded-[8px] rounded-bl-sm rounded-br-sm relative overflow-hidden h-14 sm:h-16"
style={{ background: 'linear-gradient(to right, #8b9986 0%, #e1dfcd 100%)' }}>
                          <div className="flex items-center gap-2">
<img src={home.logo} alt={home.name} className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-md z-10 shrink-0" referrerPolicy="no-referrer" />
                            {<span className="font-extrabold text-xs sm:text-sm text-slate-900 drop-shadow-xs uppercase">{home.name}</span>}
                          </div>
                          {<span className="text-4xl sm:text-5xl leading-none font-black text-white z-10 tracking-tighter"
style={{
                                      WebkitTextStroke: '1px #b0b0b0',
                                      textShadow: '1px 1px 0px #d4d4d4, 2px 2px 0px #c4c4c4, 2px 2px 4px rgba(0,0,0,0.6)'
                                    }}>
                                {selectedMatch.homeScore ?? 0}
                              </span>}
                        </div>

                        {/* Divider */}
                        <div className="h-0.5 w-[96%] bg-white rounded-full mx-auto z-10"></div>

                        {/* Bottom Team */}
                        <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 rounded-[8px] rounded-tl-sm rounded-tr-sm relative overflow-hidden h-14 sm:h-16"
style={{ background: 'linear-gradient(to right, #611818 0%, #cc3333 100%)' }}>
                          <div className="flex items-center gap-2">
<img src={away.logo} alt={away.name} className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-md z-10 shrink-0" referrerPolicy="no-referrer" />
                            {<span className="font-extrabold text-xs sm:text-sm text-white drop-shadow-xs uppercase">{away.name}</span>}
                          </div>
                          {<span className="text-4xl sm:text-5xl leading-none font-black text-white z-10 tracking-tighter"
style={{
                                      WebkitTextStroke: '1px #b0b0b0',
                                      textShadow: '1px 1px 0px #d4d4d4, 2px 2px 0px #c4c4c4, 2px 2px 4px rgba(0,0,0,0.6)'
                                    }}>
                                {selectedMatch.awayScore ?? 0}
                              </span>}
                        </div>
                      </div>

                      {/* Right Column (Stats & Time) */}
                      <div className="w-[80px] sm:w-[100px] shrink-0 flex flex-col justify-between py-1 px-1 text-center text-white gap-1">
<div className="flex flex-col justify-center items-center gap-1 flex-1">
<div className="flex flex-col items-center leading-none">
<span className="text-xs sm:text-sm font-black font-sans tracking-tight text-white mb-0.5">SOG</span>
                            {<span className="text-xl sm:text-2xl font-black text-white tracking-tighter" style={{ textShadow: "1px 1px 0px #888, 1px 1px 2px rgba(0,0,0,0.5)" }}>
                                  {selectedMatch.stats?.shotsOnGoal?.home ?? 0}
                                </span>
                              }
                              sourceType={selectedMatch.stats?.shotsOnGoal ? 'database' : 'calculated'}
                          </div>
                          <div className="flex flex-col items-center leading-none mt-0.5">
<span className="text-xs sm:text-sm font-black font-sans tracking-tight text-white mb-0.5">SOG</span>
                            {<span className="text-xl sm:text-2xl font-black text-white tracking-tighter" style={{ textShadow: "1px 1px 0px #888, 1px 1px 2px rgba(0,0,0,0.5)" }}>
                                  {selectedMatch.stats?.shotsOnGoal?.away ?? 0}
                                </span>
                              }
                              sourceType={selectedMatch.stats?.shotsOnGoal ? 'database' : 'calculated'}
                          </div>
                        </div>

                        {/* Time Box */}
                        <div className="bg-black rounded-[8px] p-1.5 flex flex-col items-center justify-center leading-none space-y-0.5 relative overflow-hidden mt-1 border border-white/10"
style={{ boxShadow: 'inset 0 0 10px 1px rgba(255,255,255,0.2), 0 2px 5px rgba(0,0,0,0.5)' }}>
                          {<span className="text-xs sm:text-sm font-black font-sans tracking-tight text-white z-10" style={{ textShadow: "1px 1px 0px #888" }}>
                                {selectedMatch.status === 'Played' || selectedMatch.status === 'Afgerond'
                                  ? 'FIN'
                                  : selectedMatch.status === 'Bezig'
                                  ? 'LIVE'
                                  : 'PRE'}
                              </span>}
                          <span className="text-lg sm:text-xl leading-none font-black text-white tracking-tighter z-10" style={{ textShadow: "1px 1px 0px #888, 1px 1px 2px rgba(0,0,0,0.5)" }}>
                            {selectedMatch.status === 'Played' || selectedMatch.status === 'Afgerond'
                              ? '00:00'
                              : selectedMatch.status === 'Bezig'
                              ? '14:50'
                              : (selectedMatch.time || '20:00')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{/* Game Events Timeline */}
                      <div className="bg-white rounded-3xl border border-slate-200 p-4 space-y-4">
<h4 className="text-xs font-black uppercase text-slate-950 tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
<Clock className="w-4 h-4 text-slate-900" /> Chronologische Wedstrijd-gebeurtenissen
                        </h4>

                        <div className="max-h-[350px] overflow-y-auto pr-1 space-y-2.5 min-h-[150px]">{selectedMatch.events && selectedMatch.events.length > 0 ? (
                            selectedMatch.events.map((evt, idx) => {
                              const p = db.persons.find(per => per.id === evt.personId);
                              const assist = evt.assistPersonId ? db.persons.find(per => per.id === evt.assistPersonId) : null;

                              const isHome = home.playerIds?.includes(evt.personId) || p?.teamId === home.id;
                              const evtTeam = isHome ? home : away;
                              const teamColor = evtTeam?.primaryColor && evtTeam.primaryColor.startsWith('#') ? evtTeam.primaryColor : (isHome ? '#3B82F6' : '#EF4444');

                              return (
                                <div
                                  key={idx}
                                  className="p-3 rounded-2xl border border-slate-200 bg-white space-y-1 hover:border-slate-300 transition-colors">
<div className="flex justify-between items-center text-[11px] font-mono font-bold text-slate-500">
<div className="flex items-center gap-1.5 min-w-0">{evtTeam?.logo && (
                                        <img src={evtTeam.logo} alt={evtTeam.name} className="w-4 h-4 object-contain shrink-0" referrerPolicy="no-referrer" />
                                      )}
                                      <span className="font-sans font-extrabold text-slate-900 truncate max-w-[120px] sm:max-w-none">{evtTeam?.name}</span>
                                      <span className="text-slate-400">&bull;</span>
                                      <span>Periode {evt.period} ({evt.time}')</span>
                                    </div>
                                    <span
                                      className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shrink-0 text-white shadow-xs"
style={{ backgroundColor: teamColor }}
                                    >
                                      {evt.type === 'Goal' ? 'Goal' : 'Straf'}
                                    </span>
                                  </div>
                                  <p className="font-extrabold text-slate-950 text-xs">{p?.name || 'Onbekende Speler'}</p>
                                  {evt.type === 'Goal' ? (
                                    <p className="text-[11px] text-slate-600">
                                      Assist: <span className="font-semibold text-slate-800">{assist ? assist.name : 'Geen assist'}</span>
                                    </p>
                                  ) : (
                                    <p className="text-[11px] text-slate-700 font-semibold uppercase font-mono">
                                      Type overtreding: Tripping (2 min straf)
                                    </p>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-slate-400 text-xs py-4 text-center">Er zijn nog geen doelpunten of straffen geregistreerd voor deze wedstrijd.</p>
                          )}
                        </div>
                      </div>

                      {/* Live Match Stats & Player Stats with Toggle */}
                      <div className="bg-white rounded-3xl border border-slate-200 p-4 space-y-4">
<div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-2">
<h4 className="text-xs font-black uppercase text-slate-950 tracking-wider flex items-center gap-1.5">
<Activity className="w-4 h-4 text-slate-900" /> Live Match Stats
                          </h4>

                          {/* Toggle buttons */}
                          <div className="flex bg-slate-200/80 p-0.5 rounded-lg border border-slate-300">
<button
                              onClick={() => setGameCenterStatsTab('team')}
                              className={`px-2.5 py-1 text-xs font-black uppercase rounded-md transition-all ${
                                gameCenterStatsTab === 'team'
                                  ? 'bg-[#1c2a38] text-white shadow-sm'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Team Stats
                            </button>
                            <button
                              onClick={() => setGameCenterStatsTab('player')}
                              className={`px-2.5 py-1 text-xs font-black uppercase rounded-md transition-all ${
                                gameCenterStatsTab === 'player'
                                  ? 'bg-[#1c2a38] text-white shadow-sm'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Player Stats
                            </button>
                            {isOfficer && (
                              <button
                                onClick={() => setGameCenterStatsTab('log')}
                                className={`px-2.5 py-1 text-xs font-black uppercase rounded-md transition-all ${
                                  gameCenterStatsTab === 'log'
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                + Log Event
                              </button>
                            )}
                          </div>
                        </div>

                        {gameCenterStatsTab === 'team' && (() => {
                          const hGoals = selectedMatch.homeScore ?? selectedMatch.events?.filter(e => e.type === 'Goal' && (home.playerIds.includes(e.personId) || db.persons.find(p => p.id === e.personId)?.teamId === home.id)).length ?? 0;
                          const aGoals = selectedMatch.awayScore ?? selectedMatch.events?.filter(e => e.type === 'Goal' && (away.playerIds.includes(e.personId) || db.persons.find(p => p.id === e.personId)?.teamId === away.id)).length ?? 0;

                          const hSog = selectedMatch.stats?.shotsOnGoal?.home ?? 0;
                          const aSog = selectedMatch.stats?.shotsOnGoal?.away ?? 0;

                          const hPenalties = selectedMatch.events?.filter(e => e.type === 'Penalty' && (home.playerIds.includes(e.personId) || db.persons.find(p => p.id === e.personId)?.teamId === home.id)).length ?? 0;
                          const aPenalties = selectedMatch.events?.filter(e => e.type === 'Penalty' && (away.playerIds.includes(e.personId) || db.persons.find(p => p.id === e.personId)?.teamId === away.id)).length ?? 0;

                          const hPim = hPenalties * 2;
                          const aPim = aPenalties * 2;

                          const hFo = selectedMatch.stats?.faceoffWins?.home ?? 0;
                          const aFo = selectedMatch.stats?.faceoffWins?.away ?? 0;

                          const hPp = selectedMatch.stats?.powerplays?.home;
                          const aPp = selectedMatch.stats?.powerplays?.away;

                          const totalSog = (hSog + aSog) || 1;
                          const sogPct = Math.round((hSog / totalSog) * 100);

                          const totalFo = (hFo + aFo) || 1;
                          const foPct = Math.round((hFo / totalFo) * 100);

                          const teamStatsList = [
                            {
                              label: 'Doelpunten (Goals)',
                              homeVal: hGoals,
                              awayVal: aGoals,
                              pct: (hGoals + aGoals) === 0 ? 50 : Math.round((hGoals / ((hGoals + aGoals) || 1)) * 100),
                              fieldId: `stat_goals_${selectedMatch.id}`,
                              path: `db.matches[${selectedMatch.id}].homeScore / awayScore`
                            },
                            {
                              label: 'Schoten op Doel (SOG)',
                              homeVal: hSog,
                              awayVal: aSog,
                              pct: sogPct,
                              fieldId: `stat_sog_${selectedMatch.id}`,
                              path: `db.matches[${selectedMatch.id}].stats.shotsOnGoal`
                            },
                            {
                              label: 'Powerplay Kansen',
                              homeVal: hPp ? `${hPp.goals} / ${hPp.opportunities}` : '0 / 0',
                              awayVal: aPp ? `${aPp.goals} / ${aPp.opportunities}` : '0 / 0',
                              pct: 50,
                              fieldId: `stat_pp_${selectedMatch.id}`,
                              path: `db.matches[${selectedMatch.id}].stats.powerplays`
                            },
                            {
                              label: 'Strafminuten (PIM)',
                              homeVal: `${hPim} min`,
                              awayVal: `${aPim} min`,
                              pct: (hPim + aPim) === 0 ? 50 : Math.round((hPim / ((hPim + aPim) || 1)) * 100),
                              fieldId: `stat_pim_${selectedMatch.id}`,
                              path: `db.matches[${selectedMatch.id}].events (penalties)`
                            },
                            {
                              label: 'Face-off Gewonnen',
                              homeVal: hFo,
                              awayVal: aFo,
                              pct: foPct,
                              fieldId: `stat_fo_${selectedMatch.id}`,
                              path: `db.matches[${selectedMatch.id}].stats.faceoffWins`
                            },
                          ];

                          return (
                            <div className="space-y-3 font-sans text-xs">
<p className="text-xs text-slate-500 mb-2">
                                Vergelijking van de teamprestaties tussen <strong className="text-slate-900">{home.name}</strong> en <strong className="text-slate-900">{away.name}</strong>.
                              </p>

                              {teamStatsList.map((stat, i) => (
                                <div key={i} className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1 shadow-sm">
<div className="flex justify-between items-center text-xs font-extrabold uppercase">
<span className="text-slate-900">{stat.homeVal}</span>
                                    <span className="text-slate-500 tracking-wider text-[10px]">{stat.label}</span>
                                    <span className="text-slate-900">{stat.awayVal}</span>
                                  </div>
                                  <div className="flex gap-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
<div className="bg-slate-900 rounded-full h-full transition-all" style={{ width: `${stat.pct}%` }}></div>
                                    <div className="bg-slate-400 rounded-full h-full transition-all" style={{ width: `${100 - stat.pct}%` }}></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}

                        {gameCenterStatsTab === 'player' && (
                          <div className="space-y-3 font-sans text-xs">
<p className="text-xs text-slate-500 mb-1">
                              Spelersstatistieken voor de actieve teams in deze wedstrijd.
                            </p>

                            <div className="max-h-[340px] overflow-y-auto hide-scrollbar space-y-3 pr-1">{/* Home Team Players */}
                              <div>
                                <div className="flex items-center gap-1.5 mb-1.5 bg-slate-200/60 p-1.5 rounded-lg border border-slate-300">
<TeamLogo logo={home.logo} name={home.name} size="xs" />
                                  <span className="font-black text-xs uppercase text-slate-900">{home.name}</span>
                                </div>
                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs shadow-sm">
<table className="w-full text-left">
<thead className="bg-slate-100 text-[10px] font-black uppercase text-slate-500 border-b border-slate-200">
<tr>
                                        <th className="p-1.5 pl-2">Speler</th>
                                        <th className="p-1.5 text-center">G</th>
                                        <th className="p-1.5 text-center">A</th>
                                        <th className="p-1.5 text-center">PTS</th>
                                        <th className="p-1.5 text-center pr-2">PIM</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">{eligiblePlayers.filter(p => home.playerIds.includes(p.id)).map(p => {
                                        const goals = selectedMatch.events?.filter(e => e.type === 'Goal' && e.personId === p.id).length || 0;
                                        const assists = selectedMatch.events?.filter(e => e.type === 'Goal' && e.assistPersonId === p.id).length || 0;
                                        const penalties = selectedMatch.events?.filter(e => e.type === 'Penalty' && e.personId === p.id).length || 0;
                                        return (
                                          <tr key={p.id} className="hover:bg-white">
<td className="p-1.5 pl-2 font-extrabold text-slate-900">{p.name}</td>
                                            <td className="p-1.5 text-center font-mono font-bold text-slate-700">{goals}</td>
                                            <td className="p-1.5 text-center font-mono text-slate-600">{assists}</td>
                                            <td className="p-1.5 text-center font-mono font-black text-slate-900">{goals + assists}</td>
                                            <td className="p-1.5 text-center font-mono text-slate-900 pr-2">{penalties * 2}m</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* Away Team Players */}
                              <div>
                                <div className="flex items-center gap-1.5 mb-1.5 bg-slate-200/60 p-1.5 rounded-lg border border-slate-300">
<TeamLogo logo={away.logo} name={away.name} size="xs" />
                                  <span className="font-black text-xs uppercase text-slate-900">{away.name}</span>
                                </div>
                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs shadow-sm">
<table className="w-full text-left">
<thead className="bg-slate-100 text-[10px] font-black uppercase text-slate-500 border-b border-slate-200">
<tr>
                                        <th className="p-1.5 pl-2">Speler</th>
                                        <th className="p-1.5 text-center">G</th>
                                        <th className="p-1.5 text-center">A</th>
                                        <th className="p-1.5 text-center">PTS</th>
                                        <th className="p-1.5 text-center pr-2">PIM</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">{eligiblePlayers.filter(p => away.playerIds.includes(p.id)).map(p => {
                                        const goals = selectedMatch.events?.filter(e => e.type === 'Goal' && e.personId === p.id).length || 0;
                                        const assists = selectedMatch.events?.filter(e => e.type === 'Goal' && e.assistPersonId === p.id).length || 0;
                                        const penalties = selectedMatch.events?.filter(e => e.type === 'Penalty' && e.personId === p.id).length || 0;
                                        return (
                                          <tr key={p.id} className="hover:bg-white">
<td className="p-1.5 pl-2 font-extrabold text-slate-900">{p.name}</td>
                                            <td className="p-1.5 text-center font-mono font-bold text-slate-700">{goals}</td>
                                            <td className="p-1.5 text-center font-mono text-slate-600">{assists}</td>
                                            <td className="p-1.5 text-center font-mono font-black text-slate-900">{goals + assists}</td>
                                            <td className="p-1.5 text-center font-mono text-slate-900 pr-2">{penalties * 2}m</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {gameCenterStatsTab === 'log' && (
                          <div className="space-y-4">
<div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-[300px] overflow-y-auto">
<h4 className="text-xs font-black uppercase text-slate-900 mb-3 border-b border-slate-200 pb-2">Play-by-play Logboek</h4>
                              {!selectedMatch.events || selectedMatch.events.length === 0 ? (
                                <p className="text-xs text-slate-500 italic text-center py-4">Geen acties geregistreerd in deze wedstrijd.</p>
                              ) : (
                                <div className="space-y-2">{[...selectedMatch.events].sort((a, b) => {
                                    // Sort by time remaining (highest to lowest, so earliest in game first)
                                    // Actually, it usually shows newest first (lowest time remaining)
                                    // Let's assume timeRemaining is a string like "14:50"
                                    if (a.timeRemaining && b.timeRemaining) {
                                      return b.timeRemaining.localeCompare(a.timeRemaining); // 20:00 > 00:00
                                    }
                                    return 0;
                                  }).map(event => {
                                    const player = db.persons.find(p => p.id === event.personId);
                                    const team = db.teams.find(t => t.id === player?.teamId);

                                    return (
                                      <div key={event.id} className="flex gap-3 text-xs bg-white p-2 border border-slate-200 rounded shadow-sm items-center">
<div className="font-mono font-bold text-slate-500 w-12 shrink-0">{event.timeRemaining || '--:--'}</div>
                                        <div className="w-6 shrink-0 flex justify-center">{event.type === 'Goal' ? <span className="text-emerald-500 font-bold" title="Goal">G</span> :
                                           event.type === 'Penalty' ? <span className="text-rose-500 font-bold" title="Penalty">P</span> :
                                           event.type === 'Shot' ? <span className="text-slate-400 font-bold" title="Shot">S</span> :
                                           <span className="text-slate-400 font-bold">•</span>}
                                        </div>
                                        <div className="flex-1 text-slate-800">
<strong className="text-slate-900">{player?.name || 'Onbekend'}</strong>
                                          {event.type === 'Goal' && <span className="text-emerald-600 font-bold ml-1">SCOORT!</span>}
                                          {event.type === 'Penalty' && <span className="text-rose-600 font-bold ml-1">krijgt een straf</span>}
                                          {event.type === 'Shot' && <span className="text-slate-500 ml-1">schiet op doel</span>}
                                          {team && <span className="text-slate-400 ml-1">({team.name})</span>}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <p className="text-slate-500 text-xs text-center py-12">Er zijn nog geen matches geregistreerd.</p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. LEADERBOARDS STATISTIEKEN VIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'statistieken' && (
        <div id="comp-view-statistieken" className="space-y-6">
<div>Stats Placeholder</div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. REGLEMENTEN CMS VIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'reglementen' && (
        <div className="space-y-6" id="comp-view-reglementen">{/* Main Regulations Card */}
          <div className="border border-slate-200 rounded-3xl p-6 shadow-sm">
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-5 mb-6 gap-4">
<div />

              {/* Language Switcher and CMS toggle */}
              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-start">
<div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
<button
                    onClick={() => setRulesLang('nl')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1 ${
                      rulesLang === 'nl'
                        ? 'bg-white text-slate-950 shadow-[1px_1px_2px_rgba(0,0,0,0.1)] border border-slate-200/50'
                        : 'text-slate-500 hover:text-slate-950'
                    }`}
                  >
                    NL
                  </button>
                  <button
                    onClick={() => setRulesLang('en')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1 ${
                      rulesLang === 'en'
                        ? 'bg-white text-slate-950 shadow-[1px_1px_2px_rgba(0,0,0,0.1)] border border-slate-200/50'
                        : 'text-slate-500 hover:text-slate-950'
                    }`}
                  >
                    EN
                  </button>
                </div>

                {isOfficer && (
                  <button
                    onClick={() => setIsEditingRules(!isEditingRules)}
                    className="bg-[#1c2a38] text-white text-xs font-bold uppercase px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-800 transition flex items-center gap-1">{isEditingRules ? <X className="w-3.5 h-3.5" /> : <Edit className="w-3.5 h-3.5" />}
                    {isEditingRules ? (rulesLang === 'nl' ? 'Sluiten' : 'Close') : (rulesLang === 'nl' ? 'CMS Editor' : 'CMS Editor')}
                  </button>
                )}
              </div>
            </div>

            {/* Editing CMS view */}
            {isEditingRules ? (
              <div className="space-y-3">
<p className="text-xs text-slate-500 leading-normal">{rulesLang === 'nl'
                    ? 'Je bewerkt momenteel de Aanvullende Mededelingen / Aankondigingen onderaan deze pagina. Ondersteunt HTML-tags voor de opmaak!'
                    : 'You are currently editing the Additional Announcements / Bulletins at the bottom of this page. Supports HTML tags for formatting!'}
                </p>
                <textarea
                  value={editedRulesText}
                  onChange={(e) => setEditedRulesText(e.target.value)}
                  className="w-full h-[320px] font-mono text-xs p-4 rounded-xl border border-slate-300 bg-white text-slate-950"
/>
                <div className="flex justify-end gap-2">
<button
                    onClick={() => setIsEditingRules(false)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-white font-bold">{rulesLang === 'nl' ? 'Annuleren' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleSaveRules}
                    className="bg-slate-900 hover:bg-slate-950 text-white font-sans text-xs font-black uppercase px-4 py-2 rounded-lg border border-slate-200 flex items-center gap-1.5">
<Save className="w-3.5 h-3.5" /> {rulesLang === 'nl' ? 'Wijzigingen Opslaan' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              /* Core Content & Interactive Rules Display */
              <div className="space-y-8">{/* 9 Rules Cards */}
                <div>
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-950 mb-4 flex items-center gap-1.5">
<Trophy className="w-4 h-4 text-slate-900" />
                    {rulesLang === 'nl' ? '9 Belangrijkste House League Regels' : '9 Key House League Rules'}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{(rulesLang === 'nl' ? [
                      { id: 1, title: "Gebalanceerde teams", desc: "Teams moeten in balans zijn voor een sportieve en gelijkwaardige strijd." },
                      { id: 2, title: "Gelijke ijstijd voor iedereen", desc: "Iedere speler heeft recht op gelijke speeltijd, ongeacht niveau." },
                      { id: 3, title: "Geen ICING", desc: "De icing-regel is niet van kracht om de snelheid in het spel te houden." },
                      { id: 4, title: "Geen BODYCHECKING*", desc: "Fysieke bodychecks zijn ten strengste verboden om zware blessures te voorkomen." },
                      { id: 5, title: "Lichamelijk contact onder voorwaarden**", desc: "Fysiek contact is uitsluitend toegestaan als reactie op een puckgevecht en mits aan de voorwaarden voldaan." },
                      { id: 6, title: "Beurtelings scheidsrechter/score klok", desc: "Elk team dat niet speelt levert een scheidsrechter en iemand voor de score klok." },
                      { id: 7, title: "Elk team heeft een teamcaptain/coach", desc: "De captain/coach leidt de teamcoördinatie en dient als direct aanspreekpunt." },
                      { id: 8, title: "Respect & Fair Play", desc: "Respect voor elkaar en voor de scheidsrechters; sportiviteit staat boven alles." },
                      { id: 9, title: "Plezier staat voorop", desc: "De ultieme drijfveer van onze competitie! Plezier is het belangrijkste doel." }
                    ] : [
                      { id: 1, title: "Balanced teams", desc: "Teams must be well-balanced to guarantee a sportingly fair and competitive environment." },
                      { id: 2, title: "Equal ice time for everyone", desc: "Every player is entitled to equal ice time on the rink, regardless of experience." },
                      { id: 3, title: "No ICING", desc: "Icing is not active to maintain a continuous, fast-paced game flow." },
                      { id: 4, title: "No BODYCHECKING*", desc: "Body checking is strictly prohibited in the House League to prevent injuries." },
                      { id: 5, title: "Body contact allowed under conditions**", desc: "Physical body contact is only permitted under specific, non-aggressive conditions." },
                      { id: 6, title: "Refereeing & officiating duty", desc: "Each team provides a referee and score clock official when they are not playing." },
                      { id: 7, title: "Each team has a team captain/coach", desc: "The captain or coach coordinates line-ups, tactics, and player communication." },
                      { id: 8, title: "Respect & Fair Play", desc: "Fair play is paramount. Mutual respect between players and officials is mandatory." },
                      { id: 9, title: "Fun is the priority", desc: "The primary purpose and spirit of the Groningen House League is to have fun!" }
                    ]).map((r) => (
                      <div key={r.id} className="bg-white border border-slate-200 hover:border-slate-400 rounded-xl p-4 transition duration-200 flex items-start space-x-3 shadow-sm">
<span className="bg-[#1c2a38] text-white font-mono font-black text-xs w-6 h-6 rounded-full flex items-center justify-center shrink-0">{r.id}
                        </span>
                        <div>
                          <h5 className="font-bold text-xs text-slate-950">{r.title}</h5>
                          <p className="text-xs text-slate-500 mt-1 leading-normal">{r.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footnotes & Bodychecking Conditions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-100/50 border border-slate-200/60 rounded-3xl p-5">
<div className="space-y-2">
<h5 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
<Info className="w-4 h-4 shrink-0 text-slate-900" />
                      * {rulesLang === 'nl' ? 'Bodychecking Toelichting' : 'Bodychecking Clarification'}
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed">{rulesLang === 'nl'
                        ? 'Bodychecking is niet toegestaan in de House League. Spelers die opzettelijk tackelen of bodychecks uitvoeren worden direct bestraft conform de wedstrijdregels (Minor of Major penalty).'
                        : 'Body checking is not allowed in the House League. Players who deliberately body check or hit an opponent will face immediate penalties according to league regulations.'}
                    </p>
                  </div>

                  <div className="space-y-3">
<h5 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
<Info className="w-4 h-4 shrink-0 text-slate-900" />
                      ** {rulesLang === 'nl' ? 'Voorwaarden voor lichamelijk contact' : 'Conditions for body contact'}
                    </h5>
                    <p className="text-xs text-slate-600 leading-normal italic mb-1">{rulesLang === 'nl'
                        ? 'Lichamelijk contact is alléén toegestaan onder de volgende strikte voorwaarden:'
                        : 'Body contact is only allowed under these strict conditions:'}
                    </p>
                    <ul className="space-y-1.5 text-xs text-slate-600 font-sans list-disc pl-4 leading-relaxed">{rulesLang === 'nl' ? (
                        <>
                          <li>De intentie is om eerst de puck te spelen, waarbij fysiek contact het gevolg is.</li>
                          <li>Er is weinig tot geen intentie om op het lichaam te spelen terwijl twee spelers dezelfde richting op schaatsen, en fysiek contact ontstaat als resultaat.</li>
                          <li>Tegen een tegenstander aanleunen is toegestaan.</li>
                          <li>Minimaal contact tegen de boarding is toegestaan.</li>
                          <li>Een speler mag zijn/haar positie behouden.</li>
                        </>
                      ) : (
                        <>
                          <li>The intention is to play the puck first, and physical contact is a result.</li>
                          <li>There is little intention to play the body while two players skate in the same direction, and physical contact is a result.</li>
                          <li>Leaning against an opponent is allowed.</li>
                          <li>Minimal contact with the boards is allowed.</li>
                          <li>A player is allowed to maintain their position.</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Roles and Responsibilities section (from the image) */}
                <div className="border-t border-slate-200 pt-6">
<div className="flex items-center gap-2 mb-4">
<Users className="w-5 h-5 text-slate-900" />
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-950">{rulesLang === 'nl' ? 'Rollen & Verantwoordelijkheden' : 'Roles & Responsibilities'}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{/* Board of Directors Card */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-4 space-y-3 shadow-sm">
<h5 className="font-extrabold text-xs uppercase text-slate-950 flex items-center gap-2">
<span className="p-1 rounded-lg bg-slate-100 text-slate-900">
<Shield className="w-4 h-4" />
                        </span>
                        {rulesLang === 'nl' ? 'Bestuur (Board of Directors)' : 'Board of Directors'}
                      </h5>
                      <div className="space-y-2 text-xs font-sans">
<div className="grid grid-cols-1 divide-y divide-slate-100">{[
                            { name: "Csaba", roleNL: "Oprichter, Algemeen bestuurslid", roleEN: "Founder, General Board member" },
                            { name: "Ian", roleNL: "Oprichter, Communicatie met de TC", roleEN: "Founder, Communication with TC" },
                            { name: "Wouter", roleNL: "Algemeen bestuurslid & Adviseur", roleEN: "General Board member & Advisor" },
                            { name: "Jeremy", roleNL: "Hoofd Compliance (Regels, Reglementen & Procedures)", roleEN: "Head of Compliance (Rules, Regulations, & Procedures)" },
                            { name: "Estelle", roleNL: "Hoofd Communicatie, contact met het GIJS-bestuur en Algemene Zaken", roleEN: "Head of Communication, contact with GIJS board, and General Affairs" }
                          ].map((member, i) => (
                            <div key={i} className="py-2 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
<span className="font-bold text-slate-950 shrink-0 min-w-[70px]">{member.name}:</span>
                              <span className="text-slate-600 leading-normal">{rulesLang === 'nl' ? member.roleNL : member.roleEN}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Trainers Card */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-4 space-y-3 shadow-sm">
<h5 className="font-extrabold text-xs uppercase text-slate-950 flex items-center gap-2">
<span className="p-1 rounded-lg bg-slate-100 text-slate-900">
<BookOpen className="w-4 h-4" />
                        </span>
                        {rulesLang === 'nl' ? 'Trainers' : 'Trainers'}
                      </h5>
                      <ul className="space-y-2.5 text-xs text-slate-600 list-disc pl-4 leading-relaxed">{rulesLang === 'nl' ? (
                          <>
                            <li>Organiseren en leiden van de wekelijkse trainingen.</li>
                            <li>Opstellen van trainingsplannen voor zowel nieuwe als gevorderde spelers.</li>
                            <li>Creëren en balanceren van competities, teams en trainingsdivisies om een gelijkwaardig spelniveau en eerlijkheid te garanderen.</li>
                          </>
                        ) : (
                          <>
                            <li>Organise and run training sessions.</li>
                            <li>Training plan creation for new and developing players.</li>
                            <li>Creation and balance of leagues, teams, and practice divisions, ensuring equal level play and fairness.</li>
                          </>
                        )}
                      </ul>
                    </div>

                    {/* Organizers Card */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-4 space-y-3 shadow-sm">
<h5 className="font-extrabold text-xs uppercase text-slate-950 flex items-center gap-2">
<span className="p-1 rounded-lg bg-slate-100 text-slate-900">
<Calendar className="w-4 h-4" />
                        </span>
                        {rulesLang === 'nl' ? 'Organisatoren (Organizers)' : 'Organizers'}
                      </h5>
                      <ul className="space-y-2 text-xs text-slate-600 list-disc pl-4 leading-relaxed">{rulesLang === 'nl' ? (
                          <>
                            <li>Planning &amp; polls beheren voor wedstrijden en trainingen.</li>
                            <li>Communicatie naar alle aangesloten leden verzorgen.</li>
                            <li>Organisatie &amp; praktische uitvoeringen op de ijsbaan.</li>
                            <li>Beheer en onderhoud van de GHL Webpagina.</li>
                          </>
                        ) : (
                          <>
                            <li>Scheduling &amp; polls for games and practices.</li>
                            <li>Communication and bulletins to all members.</li>
                            <li>Organisation &amp; practicalities at the ice rink.</li>
                            <li>Managing the GHL Webpage.</li>
                          </>
                        )}
                      </ul>
                    </div>

                    {/* Captains Card */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-4 space-y-3 shadow-sm">
<h5 className="font-extrabold text-xs uppercase text-slate-950 flex items-center gap-2">
<span className="p-1 rounded-lg bg-slate-100 text-slate-900">
<Crown className="w-4 h-4" />
                        </span>
                        {rulesLang === 'nl' ? 'Captains (Aanvoerders)' : 'Captains'}
                      </h5>
                      <ul className="space-y-2 text-xs text-slate-600 list-disc pl-4 leading-relaxed">{rulesLang === 'nl' ? (
                          <>
                            <li>Leiden van teamcoördinatie en strategische richting op het ijs.</li>
                            <li>Organiseren van interne teamcommunicatie.</li>
                            <li>Eerste aanspreekpunt voor spelersinformatie en eventuele geschillen binnen het team.</li>
                            <li>Officiële vertegenwoordiger van het team en haar spelers in grotere House League-aangelegenheden.</li>
                          </>
                        ) : (
                          <>
                            <li>Leads team coordination and direction.</li>
                            <li>Organizes communication.</li>
                            <li>Is first point of contact for player information and disputes.</li>
                            <li>Is official representative for team and players in larger house league affairs.</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Additional Bulletins from database CMS (if populated) */}
                {db.rulesCMS && db.rulesCMS.trim() !== "" && db.rulesCMS !== "Geen reglement gedefinieerd." && (
                  <div className="border-t border-slate-200 pt-6">
<h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-950 mb-4 flex items-center gap-1.5">
<Megaphone className="w-4 h-4 text-slate-900" />
                      {rulesLang === 'nl' ? 'Aanvullende League Bulletins (CMS)' : 'Additional League Bulletins (CMS)'}
                    </h4>
                    <div
                      className="prose prose-sm max-w-none text-slate-700 leading-relaxed font-sans text-xs bg-white border border-slate-200 rounded-3xl p-5"
dangerouslySetInnerHTML={{ __html: db.rulesCMS }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. PLAYER DRAFT VIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'playerdraft' && (
        <div className="space-y-6" id="comp-view-playerdraft">
<div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">{/* Draft Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 mb-4 gap-3">
<div className="flex flex-wrap items-center gap-2">
<select
                   value={draftStatus}
                   onChange={(e) => handleDraftCommand(e.target.value as any)}
                   className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none">
<option value="NotStarted">Select Actie...</option>
                   <option value="Start">Start</option>
                   <option value="Pauzeer">Pauzeer</option>
                   <option value="Mock-Draft">Mock-Draft (Oefenen)</option>
                   <option value="Verwijder">Verwijder / Reset</option>
                 </select>
              </div>

              <button
                onClick={handleResetDraft}
                className="bg-slate-900 hover:bg-slate-950 text-white text-xs font-black uppercase px-3 py-1.5 rounded-lg border border-slate-200 transition flex items-center gap-1">
<RotateCcw className="w-3.5 h-3.5" /> Reset Draft
              </button>
            </div>

            {/* Snake Draft Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
<div className="bg-white p-3 rounded-xl border border-slate-200">
<span className="text-[10px] uppercase font-bold text-slate-400">Draft Status</span>
                <p className="text-xs font-black text-slate-900 mt-0.5">{draftStatus === 'NotStarted' ? 'Klaar voor start' :
                   draftStatus === 'Mock' ? 'Mock Draft' :
                   draftStatus === 'Paused' ? 'Gepauzeerd' :
                   draftStatus === 'InProgress' ? 'Bezig' : 'Voltooid!'}
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
<span className="text-[10px] uppercase font-bold text-slate-400">Ronde / Pick Beurt</span>
                <p className="text-xs font-black text-slate-900 mt-0.5">Ronde {draftRound} / Pick {draftDrafted.length + 1}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
<span className="text-[10px] uppercase font-bold text-slate-400">Actieve Keuze-beurt</span>
                <p className="text-xs font-black text-slate-900 uppercase mt-0.5">{getActiveDraftTeam()?.name || 'Onbekend'}
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
<span className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Draft Volgorde</span>
                <select
                   value={draftOrderType}
                   onChange={(e) => setDraftOrderType(e.target.value as any)}
                   disabled={draftStatus !== 'NotStarted' && draftStatus !== 'Mock'}
                   className="text-xs text-slate-900 font-bold bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none w-full">
<option value="Standard">Standaard (1, 2, 3, 4)</option>
                  <option value="Snake">Snake (1 → 4, dan 4 → 1)</option>
                  <option value="Random">Random Volgorde</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">{/* Draft Board / Drafted players */}
              <div className="lg:col-span-2 space-y-4">
<div className="border border-slate-200 rounded-3xl p-4 bg-white/50 space-y-3">
<h4 className="text-xs font-black uppercase text-slate-950 pb-2 border-b border-slate-100 flex items-center gap-1.5">
<ListCollapse className="w-4 h-4 text-slate-900" /> Actieve Draft-volgorde &amp; Keuzes
                  </h4>

                  <div className="grid grid-cols-4 gap-2">{draftOrder.map((teamId, idx) => {
                      const team = db.teams.find(t => t.id === teamId);
                      const isMyTurn = draftOrder[draftPickIndex] === teamId && draftStatus !== 'Completed';
                      const selections = draftDrafted.filter(d => d.teamId === teamId);

                      return (
                        <div
                          key={teamId}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            isMyTurn
                              ? 'bg-slate-100 border-slate-200 shadow-sm'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <TeamLogo logo={team?.logo} name={team?.name} size="xs" className="mx-auto mb-1.5" />
                          <h5 className="text-xs font-black text-slate-950 truncate">{team?.name}</h5>
                          {isMyTurn && (
                            <span className="inline-block text-[10px] bg-slate-900 text-slate-950 font-black px-1.5 py-0.2 rounded mt-1 animate-pulse">
                              AAN DE BEURT
                            </span>
                          )}

                          {/* Selections list */}
                          <div className="mt-3 pt-2 border-t border-slate-100 space-y-1 text-left">
<span className="text-[10px] text-slate-400 uppercase font-mono">Drafted ({selections.length}):</span>
                            {selections.map((sel, sIdx) => {
                              const p = db.persons.find(per => per.id === sel.playerId);
                              return (
                                <div key={sIdx} className="text-xs font-bold text-slate-800 bg-slate-100 px-1 py-0.5 rounded truncate">
                                  R{sel.round}P{sel.pick}: {p?.name.split(' ')[0]}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Simulation controls */}
                <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-3">
<Megaphone className="w-5 h-5 text-slate-900 shrink-0" />
                  <p className="text-xs text-slate-900 leading-normal">
<strong>Hoe werkt de simulator?</strong> De actieve teamcaptain kiest een speler uit de beschikbare spelerspool aan de rechterkant. De speler wordt direct toegevoegd aan de clubroster en de beurt schuift automatisch door.
                  </p>
                </div>
              </div>

              {/* Available scouting pool */}
              <div className="bg-white rounded-3xl border border-slate-200 p-4 space-y-4">
<div className="pb-2 border-b border-slate-100 flex flex-col gap-2">
<h4 className="text-xs font-black uppercase text-slate-950 flex justify-between items-center">
<span>Available Player Pool</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">{getAvailableDraftPlayers().length} beschikbaar
                    </span>
                  </h4>
                  <select
                    value={draftPoolFilter}
                    onChange={(e) => setDraftPoolFilter(e.target.value)}
                    className="text-xs font-bold bg-white border border-slate-200 rounded px-2 py-1.5 focus:outline-none w-full">
<option value="Alle spelers">Alle spelers</option>
                    <option value="Spelers zonder team">Spelers zonder team</option>
                    <option value="Gevorderd">Gevorderd</option>
                    <option value="Gemiddeld">Gemiddeld</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Divisie A spelers">Divisie A spelers</option>
                    <option value="Divisie B spelers">Divisie B spelers</option>
                  </select>
                </div>

                <div className="space-y-2.5 max-h-[320px] overflow-y-auto hide-scrollbar pr-1">{getAvailableDraftPlayers().map((player) => {
                    const rating = player.stats?.rating || 72;
                    return (
                      <div
                        key={player.id}
                        className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-400 transition flex justify-between items-center bg-white/50">
<div className="flex items-center space-x-2.5 text-xs font-sans">
<img src={player.avatar} alt={player.name} className="w-8 h-8 rounded-full object-cover bg-white" referrerPolicy="no-referrer" />
                          <div>
                            <p className="font-extrabold text-slate-950">{player.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono font-bold uppercase">{getPlayerPosLabel(player)} &bull; OVR {rating}</p>
                          </div>
                        </div>

                        {draftStatus === 'InProgress' || draftStatus === 'Mock' ? (
                          <button
                            onClick={() => handleDraftPlayer(player.id)}
                            className="bg-slate-100 text-slate-800 hover:bg-slate-800 hover:text-white font-sans text-xs font-black uppercase px-2 py-1 rounded flex items-center transition-colors">
                            Draft <ChevronRight className="w-3 h-3 ml-0.5" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic font-mono">{draftStatus === 'Paused' ? 'Gepauzeerd' : draftStatus === 'Completed' ? 'Voltooid' : 'Niet Gestart'}
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {getAvailableDraftPlayers().length === 0 && (
                    <p className="text-slate-500 text-xs text-center py-8 italic font-sans">Geen spelers meer over in de actieve draftpool.</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. IN DEVELOPMENT VIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'indevelopment' && (
        <div className="space-y-6" id="comp-view-indevelopment">
<div className="border border-slate-200 rounded-3xl p-6 shadow-sm">
<div className="border-b border-slate-200 pb-5 mb-6">
<span className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border border-slate-200 inline-block mb-3 animate-pulse">
                ROADMAP 2026
              </span>
              <h3 className="font-extrabold uppercase text-xsl tracking-tight text-slate-950">In Development</h3>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[
                {
                  title: 'Hockey Ecosystem',
                  status: 'Ontwerp Fase',
                  icon: Globe,
                  color: 'text-slate-900 bg-slate-100 border-slate-200',
                  desc: 'Een overkoepelend digitaal ecosysteem om verenigingen, sponsoren, ijsbanen en fans met elkaar te verbinden.'
                },
                {
                  title: 'Messaging',
                  status: 'In Ontwikkeling',
                  icon: MessageSquare,
                  color: 'text-slate-900 bg-slate-100 border-slate-200',
                  desc: 'Geïntegreerd chatsysteem voor teams en competities om direct met elkaar te communiceren en tactieken te bespreken.'
                },
                {
                  title: 'Live Stream',
                  status: 'Gepland',
                  icon: Radio,
                  color: 'text-xsurple-500 bg-slate-100 border-slate-200',
                  desc: `Live stream integratie om wedstrijden rechtstreeks vanuit ${db.association.locations[0].name} uit te zenden en te bekijken.`
                },
                {
                  title: 'Audiosystem',
                  status: 'In Ontwikkeling',
                  icon: Volume2,
                  color: 'text-slate-900 bg-slate-100 border-slate-200',
                  desc: 'Interactieve geluidseffecten en sfeergeluiden tijdens wedstrijden en live scorekeeping.'
                },
                {
                  title: 'Data Export',
                  status: 'BETA',
                  icon: Download,
                  color: 'text-slate-900 bg-slate-100 border-slate-200',
                  desc: 'Exporteer statistieken, wedstrijdgegevens en teamlijsten eenvoudig naar Excel, CSV of PDF.'
                },
                {
                  title: 'Data Import',
                  status: 'Ontwerp Fase',
                  icon: Upload,
                  color: 'text-slate-900 bg-slate-100 border-slate-200',
                  desc: 'Importeer eerdere seizoensdata en spelerregistraties rechtstreeks vanuit bestaande spreadsheets.'
                },
                {
                  title: 'International Multi-Leagues',
                  status: 'Gepland',
                  icon: Sparkles,
                  color: 'text-slate-900 bg-slate-100 border-slate-200',
                  desc: 'Ondersteuning voor grensoverschrijdende competities en toernooien met verschillende competitieregels.'
                },
                {
                  title: 'Achievement system',
                  status: 'In Ontwikkeling',
                  icon: Award,
                  color: 'text-slate-900 bg-slate-100 border-slate-200',
                  desc: 'Verdien unieke badges en prestaties voor mijlpalen zoals hattricks, clean sheets of gewonnen kampioenschappen.'
                },
                {
                  title: 'XP system',
                  status: 'BETA',
                  icon: Zap,
                  color: 'text-slate-900 bg-slate-100 border-slate-200',
                  desc: 'Spelers en teams verdienen ervaringspunten (XP) op basis van deelname, doelpunten en sportiviteit.'
                },
                {
                  title: 'Buddys & Rivals',
                  status: 'Ontwerp Fase',
                  icon: Heart,
                  color: 'text-slate-900 bg-slate-100 border-slate-200',
                  desc: 'Volg je ijshockeyvrienden, daag rivalen uit en houd onderlinge statistieken bij.'
                },
                {
                  title: 'Hockey Connect Social',
                  status: 'In Ontwikkeling',
                  icon: MessageCircle,
                  color: 'text-slate-900 bg-slate-100 border-slate-200',
                  desc: 'Een sociaal netwerk specifiek voor de ijshockeygemeenschap om foto\'s, updates en video\'s te delen.'
                },
                {
                  title: '3D Hockey Stick Configurator',
                  status: 'Gepland',
                  icon: Hammer,
                  color: 'text-slate-900 bg-slate-100 border-slate-200',
                  desc: 'Ontwerp en configureer je eigen stick en uitrusting in een interactieve 3D-weergave.'
                },
                {
                  title: 'WebShop Integration',
                  status: 'Gepland',
                  icon: ShoppingCart,
                  color: 'text-sky-500 bg-sky-50 border-sky-200',
                  desc: 'Directe koppeling met de club- of competitieshop om officiële merchandise en tickets te kopen.'
                },
                {
                  title: 'News API',
                  status: 'In Ontwikkeling',
                  icon: FileText,
                  color: 'text-slate-900 bg-slate-100 border-slate-200',
                  desc: 'Automatische integratie van actueel ijshockeynieuws en persberichten vanuit nationale bonden.'
                },
                {
                  title: 'League API',
                  status: 'BETA',
                  icon: Terminal,
                  color: 'text-slate-600 bg-slate-100 border-slate-300',
                  desc: 'Ontwikkelaars-API om stand-, programma- en spelerstatistieken te integreren in externe websites.'
                },
                {
                  title: 'Lite Edition',
                  status: 'In Ontwikkeling',
                  icon: Smartphone,
                  color: 'text-slate-900 bg-slate-100 border-slate-200',
                  desc: 'Een geoptimaliseerde, lichtgewicht mobiele versie voor snelle updates bij een zwakke internetverbinding.'
                }
              ].map((feat, idx) => {
                const IconComponent = feat.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-md transition-all flex flex-col justify-between">
<div>
                      <div className="flex items-center justify-between mb-3">
<div className={`p-2 rounded-lg border ${feat.color.split(' ')[1]} ${feat.color.split(' ')[2]}`}>
                          <IconComponent className={`w-5 h-5 ${feat.color.split(' ')[0]}`} />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          feat.status === 'BETA' ? 'bg-slate-100 text-slate-900' :
                          feat.status === 'In Ontwikkeling' ? 'bg-slate-100 text-slate-900 animate-pulse' :
                          feat.status === 'Ontwerp Fase' ? 'bg-slate-100 text-slate-900' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {feat.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-slate-950 mb-1.5">{feat.title}</h4>
                      <p className="text-xs text-slate-500 leading-normal">{feat.desc}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400">
<span>Fase: {feat.status}</span>
                      <span>v1.5 Roadmap</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>

    {/* Bewerk Modal */}
    {editingMatch && (
      <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-sm flex items-center justify-center p-4">
<div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
<div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
<h3 className="font-black text-slate-900">Wedstrijd Bewerken</h3>
            <button onClick={() => setEditingMatch(null)} className="p-1 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
<X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
<div className="grid grid-cols-2 gap-6 text-center">
<div className="space-y-2">
<label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{db.teams.find(t => t.id === editingMatch.homeTeamId)?.name || 'Home'} (H)</label>
                <input
                  type="number"
min="0"
                  value={editingMatch.homeScore || 0}
                  onChange={e => setEditingMatch({...editingMatch, homeScore: parseInt(e.target.value) || 0})}
                  className="w-full text-center text-3xl font-black bg-white border border-slate-200 rounded-3xl py-4 focus:outline-none focus:border-slate-200 focus:ring-4 focus:ring-indigo-500/10 transition-all"
/>
              </div>
              <div className="space-y-2">
<label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{db.teams.find(t => t.id === editingMatch.awayTeamId)?.name || 'Away'} (A)</label>
                <input
                  type="number"
min="0"
                  value={editingMatch.awayScore || 0}
                  onChange={e => setEditingMatch({...editingMatch, awayScore: parseInt(e.target.value) || 0})}
                  className="w-full text-center text-3xl font-black bg-white border border-slate-200 rounded-3xl py-4 focus:outline-none focus:border-slate-200 focus:ring-4 focus:ring-indigo-500/10 transition-all"
/>
              </div>
            </div>

            <div className="space-y-2">
<label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Datum</label>
              <input
                type="date"
value={editingMatch.date}
                onChange={e => setEditingMatch({...editingMatch, date: e.target.value})}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700 outline-none focus:border-slate-200"
/>
            </div>

            <button
              onClick={saveEditedMatch}
              className="w-full bg-slate-900 hover:bg-slate-950 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-indigo-200">
<Save size={20} />
              Wijzigingen Opslaan
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
};
