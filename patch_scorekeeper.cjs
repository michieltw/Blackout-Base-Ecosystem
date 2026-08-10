const fs = require('fs');

let content = fs.readFileSync('src/components/ScorekeeperScreen.tsx', 'utf-8');

// Insert useHockeyDatabase import
content = content.replace(
    "import { SettingsContract } from '../settingsContract';",
    "import { SettingsContract } from '../settingsContract';\nimport { useHockeyDatabase } from '../contexts/HockeyContext';"
);

// We'll leave most of the local GameState intact for real-time tracking (clock, active penalties),
// but we will sync goals, shots, and penalties to context.
// Let's hook into addEvent
const addEventReplacement = `
  const { addGoal, addShot, addPenalty, updateGameScore } = useHockeyDatabase();

  const addEvent = (event: Omit<GameEvent, 'id' | 'timestamp'>) => {
    const newEvent: GameEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    // Sync to context
    const gameId = 'game-1'; // Mock current game
    const teamId = event.team === 'home' ? gameState.homeTeam.name : gameState.awayTeam.name;

    if (event.type === 'goal') {
       addGoal({
           game_id: gameId,
           team_id: teamId,
           scorer_player_id: event.player || 'unknown',
           assist_player_id: event.assist1,
           assist2_player_id: event.assist2,
           period: gameState.period,
           time: Math.floor(gameState.timeRemaining / 60) + ':' + (gameState.timeRemaining % 60).toString().padStart(2, '0')
       });

       const newHomeScore = gameState.homeScore + (event.team === 'home' ? 1 : 0);
       const newAwayScore = gameState.awayScore + (event.team === 'away' ? 1 : 0);
       updateGameScore(gameId, newHomeScore, newAwayScore);
    } else if (event.type === 'shot') {
       addShot({
           game_id: gameId,
           team_id: teamId,
           player_id: event.player || 'unknown',
           period: gameState.period,
           time: Math.floor(gameState.timeRemaining / 60) + ':' + (gameState.timeRemaining % 60).toString().padStart(2, '0'),
           x_coordinate: event.x || 0,
           y_coordinate: event.y || 0,
           result: 'shot'
       });
    } else if (event.type === 'penalty') {
       addPenalty({
           game_id: gameId,
           team_id: teamId,
           player_id: event.player || 'unknown',
           penalty_type: event.penaltyType || 'Minor',
           duration: event.duration || 120,
           period: gameState.period
       });
    }

    setGameState(prev => {`;

content = content.replace(/const addEvent = \(event: Omit<GameEvent, 'id' \| 'timestamp'>\) => \{\n\s+const newEvent: GameEvent = \{/m, addEventReplacement + `\n      ...prev,\n      events: [newEvent, ...prev.events],`);
content = content.replace("events: [newEvent, ...prev.events],", "events: [newEvent, ...prev.events]"); // fix duplicate from replace

fs.writeFileSync('src/components/ScorekeeperScreen.tsx', content);
