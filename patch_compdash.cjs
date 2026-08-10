const fs = require('fs');

let content = fs.readFileSync('src/components/Dashboard/CompetitieDashboard.tsx', 'utf-8');
content = content.replace("import { addMatch, resetMatch, updateRulesCMS, rsvpCalendarEvent, draftPlayer, resetDraftState } from '../../utils/index';", "");
content = content.replace("import { StatsSection } from './StatsSection';", "");
content = content.replace(/<StatsSection [\s\S]*?\/>/, "<div>Stats Placeholder</div>");

fs.writeFileSync('src/components/Dashboard/CompetitieDashboard.tsx', content);
