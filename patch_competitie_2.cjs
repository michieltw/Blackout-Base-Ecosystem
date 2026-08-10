const fs = require('fs');

let content = fs.readFileSync('src/components/Dashboard/CompetitieDashboard.tsx', 'utf-8');

// Fix exhaustive deps warning
content = content.replace("}, [state]);", "}, [state, getComputedTeams, getComputedPlayers]);");
fs.writeFileSync('src/components/Dashboard/CompetitieDashboard.tsx', content);

let contextContent = fs.readFileSync('src/contexts/HockeyContext.tsx', 'utf-8');
// Fix missing useCallback
contextContent = contextContent.replace("import React, { createContext, useContext, useState, ReactNode } from 'react';", "import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';");
contextContent = contextContent.replace("const getComputedTeams = () => {", "const getComputedTeams = useCallback(() => {");
contextContent = contextContent.replace("return state.teams.map(team => calculateTeamStats(team, state.games, state.goalEvents));\n  };", "return state.teams.map(team => calculateTeamStats(team, state.games, state.goalEvents));\n  }, [state.teams, state.games, state.goalEvents]);");

contextContent = contextContent.replace("const getComputedPlayers = () => {", "const getComputedPlayers = useCallback(() => {");
contextContent = contextContent.replace("return state.players.map(player => calculatePlayerStats(player, state.gamePlayers, state.games, state.goalEvents, state.penalties));\n  };", "return state.players.map(player => calculatePlayerStats(player, state.gamePlayers, state.games, state.goalEvents, state.penalties));\n  }, [state.players, state.gamePlayers, state.games, state.goalEvents, state.penalties]);");

fs.writeFileSync('src/contexts/HockeyContext.tsx', contextContent);
