const fs = require('fs');

let content = fs.readFileSync('src/components/Dashboard/CompetitieDashboard.tsx', 'utf-8');
content = content.replace("import { saveDatabase, addMatch, resetMatch, updateRulesCMS, rsvpCalendarEvent, draftPlayer, resetDraftState, setDraftStatus } from '../../utils/index';", "");
content = content.replace("import { saveDatabase } from '../../utils/index';", "");

fs.writeFileSync('src/components/Dashboard/CompetitieDashboard.tsx', content);
