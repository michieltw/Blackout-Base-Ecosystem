import {
    Game,
    Team,
    Player,
    GoalEvent,
    ShotEvent,
    Penalty,
    GamePlayer
} from '../types/database';

export const calculateTeamStats = (team: Team, games: Game[], goalEvents: GoalEvent[]) => {
    let wins = 0, losses = 0, ties = 0, otLosses = 0, soLosses = 0;
    let goalsFor = 0, goalsAgainst = 0;
    let gamesPlayed = 0;

    games.forEach(game => {
        if (!game.is_final) return;

        const isHome = game.home_team_id === team.id;
        const isAway = game.away_team_id === team.id;

        if (!isHome && !isAway) return;

        gamesPlayed++;

        const teamScore = isHome ? (game.home_score || 0) : (game.away_score || 0);
        const oppScore = isHome ? (game.away_score || 0) : (game.home_score || 0);

        goalsFor += teamScore;
        goalsAgainst += oppScore;

        if (teamScore > oppScore) {
            wins++;
        } else if (teamScore < oppScore) {
            if (game.is_shootout) {
                soLosses++;
            } else if (game.is_overtime) {
                otLosses++;
            } else {
                losses++;
            }
        } else {
            ties++;
        }
    });

    const points = (wins * 2) + (otLosses * 1) + (soLosses * 1) + (ties * 1); // Typical hockey points

    return {
        ...team,
        GamesPlayedTeam: gamesPlayed,
        TeamWins: wins,
        TeamLosses: losses,
        TeamTies: ties,
        TeamOTL: otLosses,
        TeamSOL: soLosses,
        GoalsFor: goalsFor,
        GoalsAgainst: goalsAgainst,
        GoalDifference: goalsFor - goalsAgainst,
        StandingsPoints: points,
        WinPercentage: gamesPlayed > 0 ? (wins / gamesPlayed) * 100 : 0
    };
};

export const calculatePlayerStats = (player: Player, gamePlayers: GamePlayer[], games: Game[], goalEvents: GoalEvent[], penalties: Penalty[]) => {
    // Basic stats over a set of games/events
    const playerGamePlayers = gamePlayers.filter(gp => gp.player_id === player.id);
    let gamesPlayed = 0;
    playerGamePlayers.forEach(gp => {
        const game = games.find(g => g.id === gp.game_id);
        if (game && game.is_final) {
            gamesPlayed++;
        }
    });

    let goals = 0;
    let assists = 0;

    goalEvents.forEach(event => {
        if (event.scorer_player_id === player.id) goals++;
        if (event.assist_player_id === player.id || event.assist2_player_id === player.id) assists++;
    });

    const points = goals + assists;

    return {
        ...player,
        GamesPlayed: gamesPlayed,
        Goals: goals,
        Assists: assists,
        Points: points,
        GoalsPerGame: gamesPlayed > 0 ? goals / gamesPlayed : 0,
        AssistsPerGame: gamesPlayed > 0 ? assists / gamesPlayed : 0,
        PointsPerGame: gamesPlayed > 0 ? points / gamesPlayed : 0,
    };
};
