const fs = require('fs');

let content = fs.readFileSync('src/components/DatabaseScreen.tsx', 'utf-8');

// Ensure useHockeyDatabase isn't broken or missing context
content = content.replace("import { SettingsContract } from '../settingsContract';", "import { SettingsContract } from '../settingsContract';\nimport { useHockeyDatabase } from '../contexts/HockeyContext';");
fs.writeFileSync('src/components/DatabaseScreen.tsx', content);
