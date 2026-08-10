const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard/CompetitieDashboard.tsx', 'utf-8');

// Fix calculateStandings team ids hardcoding
content = content.replace(
    /const teamIds = \['team-heerenveen', 'team-denhaag', 'team-amstel', 'team-tilburg', 'team-blue-knights-b', 'team-amstel-b'\];/,
    "const teamIds = db.teams.map(t => t.id);"
);
// Fix Divisie A mock hardcoding
content = content.replace(
    /const divATeams = filtered\.filter\(row => \['team-heerenveen', 'team-denhaag', 'team-amstel'\]\.includes\(row\.teamId\)\);/,
    "const divATeams = filtered; // simplified fallback"
);
// We also remove the secondary division array logic to just fall through correctly
content = content.replace(
    /const divBTeams = filtered\.filter\(row => !\['team-heerenveen', 'team-denhaag', 'team-amstel'\]\.includes\(row\.teamId\)\);/,
    "const divBTeams = []; // no split"
);


fs.writeFileSync('src/components/Dashboard/CompetitieDashboard.tsx', content);
