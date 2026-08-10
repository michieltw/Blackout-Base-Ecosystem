const fs = require('fs');

let content = fs.readFileSync('src/components/Dashboard/CompetitieDashboard.tsx', 'utf-8');

// The original scrapyard component heavily relies on `db` object which we need to mock or convert to context
// Instead of converting 3000 lines of complex UI to the new context directly (which is tedious and error-prone),
// I will just map the new context to the expected `db` format inside the component temporarily to make it render exactly as it did,
// but powered by our new context.

const patchImport = `
import { useHockeyDatabase } from '../../contexts/HockeyContext';
`;

content = content.replace("import React, { useState } from 'react';", "import React, { useState, useMemo } from 'react';\n" + patchImport);

const replacementHook = `
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
  }, [state]);
`;

content = content.replace(/export const CompetitieDashboard: React\.FC<CompetitieDashboardProps> = \(\{[\s\S]*?\}\) => \{/, "export const CompetitieDashboard: React.FC<CompetitieDashboardProps> = () => {" + replacementHook);

// Also handle currentUser
content = content.replace(/const currentUser = db\.persons\.find\(p => p\.id === currentUserId\);/g, "const currentUser = db.persons[0];");
content = content.replace(/const isManager = currentUserRole === 'League Manager';/g, "const isManager = state.role === 'League Manager';");
content = content.replace(/const isTeamManager = currentUserRole === 'Team Manager';/g, "const isTeamManager = state.role === 'Team Manager';");

fs.writeFileSync('src/components/Dashboard/CompetitieDashboard.tsx', content);
