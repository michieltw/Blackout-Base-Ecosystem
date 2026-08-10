const fs = require('fs');

let appContent = `import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HockeyProvider, useHockeyDatabase } from './contexts/HockeyContext';
import { Header } from './components/Dashboard/Header';
import { CompetitieDashboard } from './components/Dashboard/CompetitieDashboard';
import ScorekeeperScreen from './components/ScorekeeperScreen';
import DatabaseScreen from './components/DatabaseScreen';
import MainMenuScreen from './components/MainMenuScreen';
import SettingsScreen from './components/SettingsScreen';
import { defaultSettingsContract } from './settingsContract';
import { motion } from 'framer-motion';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col">
            <Header />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};

const AppContent = () => {
    const { state } = useHockeyDatabase();

    return (
        <Router>
            <Routes>
                <Route path="/" element={
                    <MainLayout>
                       <CompetitieDashboard />
                    </MainLayout>
                } />
                <Route path="/scorekeeper/menu" element={<MainMenuScreen onNavigate={() => {}} dbStatus="idle" onSettings={() => {}} onDatabase={() => {}} onLogin={() => {}} />} />
                <Route path="/scorekeeper/match" element={<ScorekeeperScreen onBack={() => {}} onComplete={() => {}} contract={defaultSettingsContract} />} />
                <Route path="/scorekeeper/settings" element={<SettingsScreen contract={defaultSettingsContract} onSave={() => {}} onBack={() => {}} />} />
                <Route path="/database" element={<DatabaseScreen contract={defaultSettingsContract} onBack={() => {}} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

const App = () => {
    return (
        <HockeyProvider>
            <AppContent />
        </HockeyProvider>
    );
};

export default App;
`;

fs.writeFileSync('src/App.tsx', appContent);
