const fs = require('fs');
let content = fs.readFileSync('src/components/ScorekeeperScreen.tsx', 'utf-8');

// Insert inside ScorekeeperScreen component
content = content.replace(
    'export default function ScorekeeperScreen({ onBack, onComplete, contract }: ScorekeeperScreenProps) {',
    'export default function ScorekeeperScreen({ onBack, onComplete, contract }: ScorekeeperScreenProps) {\n  const { addGoal, addShot, addPenalty, updateGameScore } = useHockeyDatabase();'
);

content = content.replace(
    '  const { addGoal, addShot, addPenalty, updateGameScore } = useHockeyDatabase();\n  \n  const addEvent',
    '  const addEvent'
);


fs.writeFileSync('src/components/ScorekeeperScreen.tsx', content);
