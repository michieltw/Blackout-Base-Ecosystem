import { useHockeyDatabase, UserRole } from "../../contexts/HockeyContext";
import React, { useState } from 'react';
import { AppDatabase } from '../../types/frontend_types';
import { Shield, User, RefreshCw, Layers, Users, Menu, X, HelpCircle, Trophy, ChevronDown, ChevronUp, Terminal, LogOut, Sparkles } from 'lucide-react';
import { HouseLeagueLogo } from './HouseLeagueLogo';
import { TeamLogo } from './TeamLogo';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
    // legacy props ignored, overridden by context
}

export const Header: React.FC<HeaderProps> = () => {
    const { state, setRole } = useHockeyDatabase();
    const currentUserRole = state.role;
  const handleRoleChange = (role: UserRole) => setRole(role);
    const db = null;
    const isOffline = false;
    const isDevMode = false;
    const theme = 'dark';
    const currentUser = { personId: '1' };
    const switchUserRole = setRole;

  const [showDevDropdown, setShowDevDropdown] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCompetitieExpanded, setIsCompetitieExpanded] = useState(activeTab.startsWith('comp-'));
  const [isModulesExpanded, setIsModulesExpanded] = useState(activeTab === 'comp-gamecenter');
  const [isOverigeExpanded, setIsOverigeExpanded] = useState(false);
  const [isAddonFeaturesExpanded, setIsAddonFeaturesExpanded] = useState(activeTab === 'comp-playerdraft' || activeTab === 'comp-indevelopment');
  const [selectedBoSection, setSelectedBoSection] = useState<'origins' | 'reveal' | null>(null);



  const currentPerson = db.currentUser?.personId
    ? db.persons.find(p => p.id === db.currentUser?.personId)
    : null;

  const getLinkedTeam = () => {
    if (!currentPerson) return null;
    if (currentPerson.teamIds && currentPerson.teamIds.length > 0) {
      const team = db.teams.find(t => currentPerson.teamIds?.includes(t.id));
      if (team) return team;
    }
    if (currentPerson.managedTeamId) {
      const team = db.teams.find(t => t.id === currentPerson.managedTeamId);
      if (team) return team;
    }
    const teamByPlayer = db.teams.find(t => t.playerIds.includes(currentPerson.id));
    if (teamByPlayer) return teamByPlayer;

    const teamByManager = db.teams.find(t => t.managerId === currentPerson.id);
    if (teamByManager) return teamByManager;

    return null;
  };

  // Available test identities in the initial db
  const identities = [
    { name: 'Admin (System)', role: 'Admin' as UserRole, personId: 'person-admin', desc: 'Systeembeheerder' },
    { name: 'Michiel (Multi-League)', role: 'MultiLeagueOfficer' as UserRole, personId: 'person-michiel', desc: 'Beheert alles & alle competities' },
    { name: 'Anke (League Officer)', role: 'LeagueOfficer' as UserRole, personId: 'person-anke', desc: 'Beheert Groningen House League' },
    { name: 'Sven (Player & Manager)', role: 'Manager' as UserRole, personId: 'person-sven', desc: 'Beheert Green Grizzly' },
    { name: 'Michiel (Manager Only)', role: 'Manager' as UserRole, personId: 'person-michiel', desc: 'Beheert Red Hot Chilli Slappers' },
    { name: 'Dennis (Standard User)', role: 'StandardUser' as UserRole, personId: 'person-danny', desc: 'Standard user gekoppeld aan Danny van de Velde' },
    { name: 'Gastlezer (Guest)', role: 'Guest' as UserRole, personId: null, desc: 'Alleen lezen & stats bekijken' },
  ];

  const currentIdentity = identities.find(
    (id) => id.role === db.currentUser?.systemRole && id.personId === db.currentUser?.personId
  ) || { name: db.currentUser?.username, role: db.currentUser?.systemRole, desc: 'Aangepaste rol' };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return 'bg-slate-100 text-slate-900 border-slate-200';
      case 'MultiLeagueOfficer':
        return 'bg-slate-100 text-xsurple-800 border-slate-200';
      case 'LeagueOfficer':
        return 'bg-slate-100 text-slate-900 border-slate-200';
      case 'Manager':
        return 'bg-slate-100 text-slate-900 border-slate-200';
      case 'StandardUser':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'Admin': return 'Systeembeheerder';
      case 'MultiLeagueOfficer': return 'Multi-League Officer';
      case 'LeagueOfficer': return 'League Officer';
      case 'Manager': return 'Team Manager';
      case 'StandardUser': return 'Standard User / Speler';
      default: return 'Guest / Toeschouwer';
    }
  };

  // Nav links helper to determine which are active based on user roles
  const getNavLinks = () => {
    const links = [
      { id: 'manager', label: 'Team Manager', roleRequired: 'Manager', extraAllowed: 'MultiLeagueOfficer' },
      { id: 'league', label: 'Competitie Manager', roleRequired: 'LeagueOfficer', extraAllowed: 'MultiLeagueOfficer' },
      { id: 'multi-league', label: 'Multi-League Manager', roleRequired: 'MultiLeagueOfficer' },
    ];

    return links.filter(link => {
      if (!link.roleRequired) return true;
      const userRole = db.currentUser?.systemRole;
      return userRole === link.roleRequired || userRole === link.extraAllowed || userRole === 'MultiLeagueOfficer';
    });
  };

  return (
    <>
      {/* Light-theme header utilizing white background, black text, red/yellow accents */}
      <header className="bg-white text-slate-900 border-b border-slate-200 shadow-sm sticky top-0 z-40 shrink-0" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between h-20">

            {/* Left: Prominent House League Logo (triggers sidebar on click) */}
            <div className="flex items-center">
              <button
                id="sidebar-toggle-btn"
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 border border-transparent hover:border-slate-200 p-2 -ml-3 rounded-3xl transition-all duration-200 text-left"
                title="Open House League Menu"
              >
                {/* Large responsive House League Logo */}
                <div className="relative transform group-hover:scale-105 transition-all duration-200 shrink-0">
                  <HouseLeagueLogo size={52} />
                </div>
                <div className="hidden sm:block pr-1">
                  <h1 className="font-display font-extrabold tracking-tight text-base text-slate-950 leading-tight group-hover:text-slate-900 transition-colors">
                    GIJS <span className="text-slate-900">GRONINGEN</span>
                  </h1>
                  <p className="text-[10px] font-mono font-bold text-slate-900 tracking-widest uppercase">
                    House League Manager
                  </p>
                </div>
              </button>
            </div>

            {/* Center: Developer Logo (BO Logo) centered horizontally in the navigation bar */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10">
              <button
                onClick={onBlackoutClick}
                className="focus:outline-none cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center"
                title="Activeer blackout transitie"
              >
                <img
                  src="https://cdn.shopify.com/s/files/1/1038/7203/7203/files/BOLOGOBLACK.png?v=1784323868"
                  alt="BO Logo"
                  className="h-8 sm:h-9 w-auto object-contain transition-all duration-300"
                  style={{ filter: isDarkMode ? 'invert(1)' : 'none' }}
                  referrerPolicy="no-referrer"
                />
              </button>
            </div>

            {/* Right: Developer Mode Button (only available if admin, i.e., MultiLeagueOfficer role, or if already active) */}
            <div className="flex items-center space-x-3">


              {onLogout && (
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-900 text-slate-900 hover:text-white transition text-xs font-black uppercase tracking-wider shadow-sm active:translate-y-0.5 active:shadow-none"
                  title="Uitloggen naar Intro"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Uitloggen</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* MOBILE-FRIENDLY NAVIGATION AND ROLE SWITCHER SIDEBAR */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 cursor-pointer"
            />

            {/* Sidebar drawer panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-80 max-w-[90vw] bg-white border-r border-slate-200 shadow-2xl z-50 flex flex-col text-slate-900"
            >
              {/* Sidebar Header */}
              <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col items-center relative">
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg border border-slate-300 hover:bg-slate-200 hover:border-slate-400 transition"
                >
                  <X className="w-5 h-5 text-slate-800" />
                </button>

                {/* Large House League Logo in Sidebar */}
                <button
                  onClick={() => {
                    setActiveTab('league-overview');
                    setIsSidebarOpen(false);
                  }}
                  className="transform hover:scale-105 transition-all duration-200 mt-2 focus:outline-none cursor-pointer"
                  title="Bekijk League Overzicht"
                >
                  <HouseLeagueLogo size={90} />
                </button>
              </div>

              {/* Sidebar Content (Scrollable links + Simulation) */}
              <div className="flex-1 overflow-y-auto hide-scrollbar hide-scrollbar p-4 flex flex-col gap-5">

                {/* 1. Competitie Accordion Section */}
                <div className="space-y-1">
                  <button
                    onClick={() => setIsCompetitieExpanded(!isCompetitieExpanded)}
                    className={`w-full text-left px-4 py-3 rounded-lg font-bold text-xs uppercase tracking-wider border-2 transition-all flex items-center justify-between ${
                      activeTab.startsWith('comp-')
                        ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                        : 'text-slate-800 bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-slate-900" />
                      Competitie
                    </span>
                    {isCompetitieExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <AnimatePresence>
                    {isCompetitieExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden pl-3 grid grid-cols-2 gap-1.5 mt-1 border-l-2 border-slate-200"
                      >
                        {[
                          { id: 'gamecenter', label: 'Game Center' },
                          { id: 'speelschema', label: 'Speelschema' },
                          { id: 'kalender', label: 'Kalender' },
                          { id: 'reglementen', label: 'Reglementen' },
                          { id: 'teams', label: 'Teams' },
                          { id: 'spelers', label: 'Spelers' },
                          { id: 'standen', label: 'Standen' },
                          { id: 'statistieken', label: 'Statistiek' }
                        ].map((subLink) => {
                          const fullId = `comp-${subLink.id}`;
                          const isSubActive = activeTab === fullId;
                          return (
                            <button
                              key={subLink.id}
                              onClick={() => {
                                setActiveTab(fullId);
                                setIsSidebarOpen(false);
                              }}
                              className={`text-left px-3.5 py-2 rounded-lg font-bold text-xs transition-all border ${
                                isSubActive
                                  ? 'bg-slate-200/60 text-slate-900 border-slate-200/60 font-black shadow-sm'
                                  : 'text-slate-700 bg-transparent border-transparent hover:bg-slate-100/70 hover:text-slate-950'
                              }`}
                            >
                               {subLink.label}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 2. Modules Accordion Section */}
                <div className="space-y-1">
                  <button
                    onClick={() => setIsModulesExpanded(!isModulesExpanded)}
                    className={`w-full text-left px-4 py-3 rounded-lg font-bold text-xs uppercase tracking-wider border-2 transition-all flex items-center justify-between ${
                      activeTab === 'comp-gamecenter' || activeTab === 'comp-playerdraft' || activeTab === 'comp-indevelopment' || activeTab === 'planner'
                        ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                        : 'text-slate-800 bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-slate-900" />
                      Modules
                    </span>
                    {isModulesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <AnimatePresence>
                    {isModulesExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden pl-3 grid grid-cols-2 gap-1.5 mt-1 border-l-2 border-slate-200"
                      >
                        <button
                          onClick={() => {
                            setActiveTab('planner');
                            setIsSidebarOpen(false);
                          }}
                          className={`text-left px-3.5 py-2 rounded-lg font-bold text-xs transition-all border ${
                            activeTab === 'planner'
                              ? 'bg-slate-200/60 text-slate-900 border-slate-200/60 font-black shadow-sm'
                              : 'text-slate-700 bg-transparent border-transparent hover:bg-slate-100/70 hover:text-slate-950'
                          }`}
                        >
                          Planner
                        </button>

                        <button
                          onClick={() => {
                            setActiveTab('beheer');
                            setIsSidebarOpen(false);
                          }}
                          className={`text-left px-3.5 py-2 rounded-lg font-bold text-xs transition-all border ${
                            activeTab === 'beheer'
                              ? 'bg-slate-200/60 text-slate-900 border-slate-200/60 font-black shadow-sm'
                              : 'text-slate-700 bg-transparent border-transparent hover:bg-slate-100/70 hover:text-slate-950'
                          }`}
                        >
                          Beheer
                        </button>

                        {[
                          { id: 'playerdraft', label: 'Player Draft', roles: ['Manager', 'LeagueOfficer', 'MultiLeagueOfficer', 'Admin'] },
                          { id: 'indevelopment', label: 'In Development' }
                        ].filter(link => {
                          if (!link.roles) return true;
                          return link.roles.includes(db.currentUser?.systemRole || 'Guest');
                        }).map((subLink) => {
                          const fullId = `comp-${subLink.id}`;
                          const isSubActive = activeTab === fullId;
                          return (
                            <button
                              key={subLink.id}
                              onClick={() => {
                                setActiveTab(fullId);
                                setIsSidebarOpen(false);
                              }}
                              className={`text-left px-3.5 py-2 rounded-lg font-bold text-xs transition-all border ${
                                isSubActive
                                  ? 'bg-slate-200/60 text-slate-900 border-slate-200/60 font-black shadow-sm'
                                  : 'text-slate-700 bg-transparent border-transparent hover:bg-slate-100/70 hover:text-slate-950'
                              }`}
                            >
                               {subLink.label}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Developer Logo (BO Logo) at the very bottom of the scrollable section */}
                <div className="mt-auto pt-6 flex flex-col items-center justify-center">
                  <img
                    src="https://cdn.shopify.com/s/files/1/1038/7203/7203/files/BOLOGOBLACK.png?v=1784323868"
                    alt="BO Logo"
                    className="h-8 w-auto object-contain transition-all duration-300"
                    style={{ filter: isDarkMode ? 'invert(1)' : 'none' }}
                    referrerPolicy="no-referrer"
                  />
                  {isDarkMode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.5 }}
                      className="mt-3 w-full max-w-[210px] bg-slate-900/40 rounded-xl p-2.5 border border-slate-800/80 text-center relative overflow-hidden group shadow-[0_0_15px_rgba(255,255,255,0.01)]"
                    >
                      {/* Zeer zwak, langzaam pulserend gloeilicht */}
                      <motion.div
                        animate={{
                          opacity: [0.03, 0.14, 0.03],
                          scale: [1, 1.15, 1],
                        }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-red-600 via-amber-400 to-red-600 blur-xl pointer-events-none"
                      />

                      <div className="relative z-10">
                        <div className="flex items-center justify-center gap-3 text-[10px] font-mono tracking-widest text-slate-400">
                          <button
                            onClick={() => setSelectedBoSection('origins')}
                            className="hover:text-slate-200 transition-colors duration-200 font-extrabold focus:outline-none uppercase"
                          >
                            Origins
                          </button>
                          <span className="w-1 h-1 rounded-full bg-slate-700" />
                          <button
                            onClick={() => setSelectedBoSection('reveal')}
                            className="hover:text-slate-200 transition-colors duration-200 font-extrabold focus:outline-none uppercase"
                          >
                            Reveal
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Sidebar Footer with "Mijn profiel" and Profile Info */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 text-slate-900">
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Mijn profiel</span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">Blackout MLM v2.5</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Clickable Profile picture (redirects to 'Mijn profiel' tab) */}
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setIsSidebarOpen(false);
                      }}
                      className="relative shrink-0 focus:outline-none cursor-pointer group"
                      title="Bekijk Mijn Profiel"
                    >
                      <img
                        src={currentPerson?.avatar || 'https://cdn.shopify.com/s/files/1/1038/7203/7203/files/placeholder_profile_male.png?v=1784405792'}
                        alt={currentPerson?.name || 'Gast'}
                        className="w-14 h-14 rounded-full border border-slate-200 object-cover shadow-md bg-white group-hover:scale-105 group-hover:border-[#DC2626] transition-all duration-200"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = 'https://cdn.shopify.com/s/files/1/1038/7203/7203/files/placeholder_profile_male.png?v=1784405792';
                        }}
                      />
                      {/* Small team logo badge if linked to team */}
                      {(() => {
                        const team = getLinkedTeam();
                        if (currentPerson && team) {
                          return (
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-slate-200 shadow-sm flex items-center justify-center">
                              <TeamLogo logo={team.logo} name={team.name} size="xs" className="w-4 h-4" />
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </button>

                    {/* Profile text details */}
                    <div className="min-w-0 flex-grow">
                      <p className="text-xs font-black text-slate-950 truncate leading-tight">
                        {currentPerson?.name || 'Gastlezer'}
                      </p>
                      <p className="text-xs text-slate-500 font-bold truncate leading-tight mt-0.5">
                        {getRoleLabel(db.currentUser.systemRole)}
                      </p>
                      {(() => {
                        const team = getLinkedTeam();
                        if (currentPerson && team) {
                          return (
                            <p className="text-[10px] text-slate-900 font-extrabold truncate mt-0.5 flex items-center gap-1">
                              <span>{team.name}</span>
                            </p>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    {/* Logout Button (as icon on the right) */}
                    {onLogout && (
                      <button
                        onClick={() => {
                          onLogout();
                          setIsSidebarOpen(false);
                        }}
                        className="p-2 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-900 text-slate-900 hover:text-white transition-all shadow-sm active:translate-y-0.5 active:shadow-none shrink-0"
                        title="Uitloggen naar Intro"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-400 text-center font-mono mt-0.5 border-t border-slate-100 pt-1">
                    GIJS Groningen House League © 2026
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Blackout Hockey Modal */}
      <AnimatePresence>
        {selectedBoSection && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full max-w-md bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 text-slate-100 relative overflow-hidden"
            >
              {/* Subtle background glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-b from-[#DC2626]/20 to-transparent blur-3xl rounded-full pointer-events-none" />

              <button
                onClick={() => setSelectedBoSection(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 w-8 h-8 rounded-full flex items-center justify-center transition-all focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative z-10 text-center">
                <img
                  src="https://cdn.shopify.com/s/files/1/1038/7203/7203/files/BOLOGOBLACK.png?v=1784323868"
                  alt="Blackout Hockey"
                  className="h-10 w-auto mx-auto object-contain invert mb-4"
                  referrerPolicy="no-referrer"
                />

                <h3 className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-1">
                  Blackout Hockey
                </h3>
                <h2 className="text-xsl font-extrabold uppercase tracking-widest text-slate-900 mb-4">
                  {selectedBoSection === 'origins' ? 'Origins' : 'Reveal'}
                </h2>

                <p className="text-sm text-slate-300 leading-relaxed font-medium mb-6">
                  {selectedBoSection === 'origins'
                    ? 'Blackout Hockey begon als een ambitieuze droom om premium ijshockeyuitrusting en geavanceerde competitiemanagement-systemen samen te brengen. Geboren uit pure passie voor de sport, streeft Blackout ernaar om de intensiteit, snelheid en cultuur van ijshockey naar het digitale tijdperk te tillen.'
                    : 'Met de introductie van onze vernieuwde multi-league manager game onthullen we een gloednieuwe visuele identiteit en realtime statistiekenmodules. Dit is slechts het begin van onze reis om spelers, managers en bondsofficials te verbinden in een ongeëvenaard online ecosysteem.'}
                </p>

                <button
                  onClick={() => setSelectedBoSection(null)}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-850 text-white font-bold rounded-xl border border-slate-800 hover:border-slate-700 transition uppercase text-xs tracking-wider"
                >
                  Sluiten
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PASSWORD MODAL FOR DEVELOPER MODE */}
      <AnimatePresence>

      </AnimatePresence>
    </>
  );
};
