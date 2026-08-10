const fs = require('fs');

let content = fs.readFileSync('src/components/Dashboard/Header.tsx', 'utf-8');

// Replace standard props and inner state with useHockeyDatabase hook for roles
content = content.replace(
    /interface HeaderProps \{[\s\S]*?\}/,
    `interface HeaderProps {
    // legacy props ignored, overridden by context
}`
);

content = content.replace(
    /export const Header: React\.FC<HeaderProps> = \(\{[\s\S]*?\}\) => \{/,
    `export const Header: React.FC<HeaderProps> = () => {
    const { state, setRole } = useHockeyDatabase();
    const currentUserRole = state.role;
    const db = null;
    const isOffline = false;
    const isDevMode = false;
    const theme = 'dark';
    const currentUser = { personId: '1' };
    const switchUserRole = setRole;
`
);

content = content.replace(/import \{ motion, AnimatePresence \} from 'motion\/react';/, "import { motion, AnimatePresence } from 'framer-motion';")

fs.writeFileSync('src/components/Dashboard/Header.tsx', content);
