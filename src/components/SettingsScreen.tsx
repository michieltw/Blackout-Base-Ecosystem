import { useState, useEffect } from 'react';
import { Play, Users, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { GameConfig, Player } from '../types/scrapyard_types';
import RosterModal from './Scorekeeper/RosterModal';

// 1. HET CONTRACT (Hierin staan alle definities en beginwaarden)
export interface SettingsContract {
  // Standaard beginwaarden
  defaultHomeTeam: string;
  defaultAwayTeam: string;
  defaultHomeColor: string;
  defaultAwayColor: string;
  defaultHomeLogo: string;
  defaultAwayLogo: string;
  defaultHomeRoster: Player[];
  defaultAwayRoster: Player[];

  defaultInitialScoreHome: number;
  defaultInitialScoreAway: number;
  defaultInitialSogHome: number;
  defaultInitialSogAway: number;
  defaultInitialPeriod: number;

  defaultPeriodLength: number;
  defaultTrackIcing: boolean;
  defaultTrackOffside: boolean;
  defaultTrackSOG: boolean;

  defaultOfficialGame: boolean;
  defaultAttendance: number;
  defaultTicketsSold: number;

  defaultGameClock: boolean;
  defaultClockPauseBehavior: string;
  defaultAutoStopAtPeriodEnd: string;
  defaultPeriodFormat: string;
  defaultShootout: boolean;
  defaultSoRules: string;

  defaultTrackSOGLocation: boolean;
  defaultTrackFOW: boolean;
  defaultFaceoffLocation: boolean;
  defaultGoalscorer: boolean;
  defaultAssists: string;

  defaultTrackPenalties: boolean;
  defaultPenaltyClock: string;
  defaultDurationTypes: string;

  defaultOfficialsMode: string;
  defaultLinesmenMode: string;
  defaultVenueMode: string;
  defaultCustomVenue: string;
  defaultCustomOfficials: string;
  defaultCustomLinesmen: string;

  defaultCapacity: number;
  defaultAvgPrice: number;
  defaultLocalBackup: boolean;

  // Logica sleutels
  customOfficialsMode: string;
  customLinesmenMode: string;
  customVenueMode: string;
  customTeamSelectionMode: string;
  fallbackHomeTeamCustom: string;
  fallbackHomeTeamList: string;
  fallbackAwayTeamCustom: string;
  fallbackAwayTeamList: string;
  defaultTime: string;

  // Optielijsten (Dropdowns & Mappen)
  teamSelectionOptions: string[];
  homeTeamOptions: string[];
  awayTeamOptions: string[];
  initialPeriodOptions: string[];
  clockBehaviorOptions: string[];
  yesNoOptions: string[];
  periodFormatOptions: string[];
  soRulesOptions: string[];
  assistOptions: string[];
  penaltyClockOptions: string[];
  durationOptions: string[];

  // Periodes en Straffen
  periodBlocks: { id: string; label: string; defaultTime: string }[];
  minorPenaltyTime: string;
  majorPenaltyTime: string;
}

interface SettingsScreenProps {
  scheduledGameData?: {
    homeTeam: string;
    awayTeam: string;
    homeRoster?: Player[];
    awayRoster?: Player[];
    date?: string;
    time?: string;
    location?: string;
    competition?: string;
    matchType?: string;
    officials?: string[];
    linesmen?: string[];
  } | null;
  contract: SettingsContract; // <-- Het component is nu 100% afhankelijk van dit contract
  onStart: () => void;
  onBack: () => void;
}

const Section = ({ title, children, defaultExpanded = true }: { title: string, children: React.ReactNode, defaultExpanded?: boolean }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <section className="flex flex-col gap-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full hover:opacity-80 transition-opacity"
      >
        <h2 className="font-mono text-[12px] font-bold text-tertiary tracking-widest uppercase">{title}</h2>
        {expanded ? <ChevronUp className="w-4 h-4 text-tertiary" /> : <ChevronDown className="w-4 h-4 text-tertiary" />}
      </button>
      {expanded && (
        <div className="bg-card-gradient metallic-border rounded-lg p-4 inner-glow flex flex-col gap-4 mt-2">
          {children}
        </div>
      )}
    </section>
  );
};

const Row = ({ label, children, border = true, disabled = false }: { label: string, children: React.ReactNode, border?: boolean, disabled?: boolean }) => (
  <div className={`flex justify-between items-center py-2 ${border ? 'border-b border-outline-variant/30' : ''} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    <span className="text-[18px] text-on-background">{label}</span>
    {children}
  </div>
);

const Select = ({ options, value, onChange, className = "w-32", disabled = false }: { options: string[], value?: string, onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void, className?: string, disabled?: boolean }) => (
  <select
    className={`bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background text-[16px] outline-none input-focus pr-8 appearance-none ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    value={value}
    onChange={onChange}
    disabled={disabled}
    style={{
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%238e9192' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
      backgroundPosition: 'right 0.5rem center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '1.5em 1.5em'
    }}
  >
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

const Toggle = ({ checked, onChange, disabled = false }: { checked?: boolean, onChange?: () => void, disabled?: boolean }) => (
  <button
    className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${checked && !disabled ? 'bg-tertiary' : 'bg-surface-container-highest border border-outline-variant'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    onClick={disabled ? undefined : onChange}
    disabled={disabled}
  >
    <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${checked && !disabled ? 'right-1 bg-black' : 'left-1 bg-outline'}`}></div>
  </button>
);

export default function SettingsScreen({ scheduledGameData, contract, onStart, onBack }: SettingsScreenProps) {

  // GEHEUGEN: Alles komt nu uit `contract` in plaats van hardcoded waarden
  const [homeTeam, setHomeTeam] = useState(scheduledGameData?.homeTeam || contract.defaultHomeTeam);
  const [awayTeam, setAwayTeam] = useState(scheduledGameData?.awayTeam || contract.defaultAwayTeam);

  const [homeColor, setHomeColor] = useState(contract.defaultHomeColor);
  const [awayColor, setAwayColor] = useState(contract.defaultAwayColor);

  const [homeLogo, setHomeLogo] = useState(contract.defaultHomeLogo);
  const [awayLogo, setAwayLogo] = useState(contract.defaultAwayLogo);

  const [homeRoster, setHomeRoster] = useState<Player[]>(scheduledGameData?.homeRoster || contract.defaultHomeRoster);
  const [awayRoster, setAwayRoster] = useState<Player[]>(scheduledGameData?.awayRoster || contract.defaultAwayRoster);

  const [initialScoreHome, setInitialScoreHome] = useState(contract.defaultInitialScoreHome);
  const [initialScoreAway, setInitialScoreAway] = useState(contract.defaultInitialScoreAway);
  const [initialSogHome, setInitialSogHome] = useState(contract.defaultInitialSogHome);
  const [initialSogAway, setInitialSogAway] = useState(contract.defaultInitialSogAway);
  const [initialPeriod, setInitialPeriod] = useState(contract.defaultInitialPeriod);

  const [activeRosterModal, setActiveRosterModal] = useState<{ isHome: boolean } | null>(null);

  const [periodLength, setPeriodLength] = useState(contract.defaultPeriodLength);
  const [p1Input, setP1Input] = useState(`${contract.defaultPeriodLength.toString().padStart(2, '0')}:00`);
  const [trackIcing, setTrackIcing] = useState(contract.defaultTrackIcing);
  const [trackOffside, setTrackOffside] = useState(contract.defaultTrackOffside);
  const [trackSOG, setTrackSOG] = useState(contract.defaultTrackSOG);

  const [officialGame, setOfficialGame] = useState(contract.defaultOfficialGame);
  const [gameType, setGameType] = useState('League');
  const [attendance, setAttendance] = useState(contract.defaultAttendance);
  const [ticketsSold, setTicketsSold] = useState(contract.defaultTicketsSold);

  const [liveGame, setLiveGame] = useState(true);
  const [teamSelection, setTeamSelection] = useState('Custom');
  const [allowFillInPlayers, setAllowFillInPlayers] = useState(false);

  const [gameClock, setGameClock] = useState(contract.defaultGameClock);
  const [clockPauseBehavior, setClockPauseBehavior] = useState(contract.defaultClockPauseBehavior);
  const [autoStopAtPeriodEnd, setAutoStopAtPeriodEnd] = useState(contract.defaultAutoStopAtPeriodEnd);
  const [periodFormat, setPeriodFormat] = useState(contract.defaultPeriodFormat);
  const [shootout, setShootout] = useState(contract.defaultShootout);
  const [soRules, setSoRules] = useState(contract.defaultSoRules);

  const [trackSOGLocation, setTrackSOGLocation] = useState(contract.defaultTrackSOGLocation);
  const [trackFOW, setTrackFOW] = useState(contract.defaultTrackFOW);
  const [faceoffLocation, setFaceoffLocation] = useState(contract.defaultFaceoffLocation);
  const [goalscorer, setGoalscorer] = useState(contract.defaultGoalscorer);
  const [assists, setAssists] = useState(contract.defaultAssists);

  const [trackPenalties, setTrackPenalties] = useState(contract.defaultTrackPenalties);
  const [penaltyClock, setPenaltyClock] = useState(contract.defaultPenaltyClock);
  const [durationTypes, setDurationTypes] = useState(contract.defaultDurationTypes);

  const [officialsMode, setOfficialsMode] = useState(scheduledGameData?.officials ? contract.customOfficialsMode : contract.defaultOfficialsMode);
  const [linesmenMode, setLinesmenMode] = useState(scheduledGameData?.linesmen ? contract.customLinesmenMode : contract.defaultLinesmenMode);
  const [venueMode, setVenueMode] = useState(scheduledGameData?.location ? contract.customVenueMode : contract.defaultVenueMode);
  const [customVenue, setCustomVenue] = useState(scheduledGameData?.location || contract.defaultCustomVenue);
  const [customOfficials, setCustomOfficials] = useState(scheduledGameData?.officials?.join(', ') || contract.defaultCustomOfficials);
  const [customLinesmen, setCustomLinesmen] = useState(scheduledGameData?.linesmen?.join(', ') || contract.defaultCustomLinesmen);

  const [capacity, setCapacity] = useState(contract.defaultCapacity);
  const [avgPrice, setAvgPrice] = useState(contract.defaultAvgPrice);

  const [localBackup, setLocalBackup] = useState(contract.defaultLocalBackup);

  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('blackout_hockey_current_config');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig) as GameConfig;
        if (parsed.homeTeam !== undefined) setHomeTeam(parsed.homeTeam);
        if (parsed.awayTeam !== undefined) setAwayTeam(parsed.awayTeam);
        if (parsed.homeColor !== undefined) setHomeColor(parsed.homeColor);
        if (parsed.awayColor !== undefined) setAwayColor(parsed.awayColor);
        if (parsed.homeLogo !== undefined) setHomeLogo(parsed.homeLogo);
        if (parsed.awayLogo !== undefined) setAwayLogo(parsed.awayLogo);
        if (parsed.homeRoster !== undefined) setHomeRoster(parsed.homeRoster);
        if (parsed.awayRoster !== undefined) setAwayRoster(parsed.awayRoster);
        if (parsed.initialScoreHome !== undefined) setInitialScoreHome(parsed.initialScoreHome);
        if (parsed.initialScoreAway !== undefined) setInitialScoreAway(parsed.initialScoreAway);
        if (parsed.initialSogHome !== undefined) setInitialSogHome(parsed.initialSogHome);
        if (parsed.initialSogAway !== undefined) setInitialSogAway(parsed.initialSogAway);
        if (parsed.initialPeriod !== undefined) setInitialPeriod(parsed.initialPeriod);

        const defaults = parsed.settings;
        if (defaults) {
          if (defaults.periodLength !== undefined) {
             const mins = Math.round(defaults.periodLength / 60);
             setPeriodLength(mins);
             setP1Input(`${mins.toString().padStart(2, '0')}:00`);
          }
          if (defaults.trackIcing !== undefined) setTrackIcing(defaults.trackIcing);
          if (defaults.trackOffside !== undefined) setTrackOffside(defaults.trackOffside);
          if (defaults.trackSOG !== undefined) setTrackSOG(defaults.trackSOG);
          if (defaults.officialGame !== undefined) setOfficialGame(defaults.officialGame);
          if (defaults.gameType) setGameType(defaults.gameType);
          if (defaults.attendance !== undefined) setAttendance(defaults.attendance);
          if (defaults.ticketsSold !== undefined) setTicketsSold(defaults.ticketsSold);

          if (defaults.liveGame !== undefined) setLiveGame(defaults.liveGame);
          if (defaults.teamSelection) setTeamSelection(defaults.teamSelection);
          if (defaults.allowFillInPlayers !== undefined) setAllowFillInPlayers(defaults.allowFillInPlayers);

          if (defaults.gameClock !== undefined) setGameClock(defaults.gameClock);
          if (defaults.clockPauseBehavior) setClockPauseBehavior(defaults.clockPauseBehavior);
          if (defaults.autoStopAtPeriodEnd) setAutoStopAtPeriodEnd(defaults.autoStopAtPeriodEnd);
          if (defaults.periodFormat) setPeriodFormat(defaults.periodFormat);
          if (defaults.shootout !== undefined) setShootout(defaults.shootout);
          if (defaults.soRules) setSoRules(defaults.soRules);

          if (defaults.trackSOGLocation !== undefined) setTrackSOGLocation(defaults.trackSOGLocation);
          if (defaults.trackFOW !== undefined) setTrackFOW(defaults.trackFOW);
          if (defaults.faceoffLocation !== undefined) setFaceoffLocation(defaults.faceoffLocation);
          if (defaults.goalscorer !== undefined) setGoalscorer(defaults.goalscorer);
          if (defaults.assists) setAssists(defaults.assists);

          if (defaults.trackPenalties !== undefined) setTrackPenalties(defaults.trackPenalties);
          if (defaults.penaltyClock) setPenaltyClock(defaults.penaltyClock);
          if (defaults.durationTypes) setDurationTypes(defaults.durationTypes);

          if (defaults.officialsMode) setOfficialsMode(defaults.officialsMode);
          if (defaults.linesmenMode) setLinesmenMode(defaults.linesmenMode);
          if (defaults.venueMode) setVenueMode(defaults.venueMode);
          if (defaults.capacity !== undefined) setCapacity(defaults.capacity);
          if (defaults.avgPrice !== undefined) setAvgPrice(defaults.avgPrice);
        }
      } else {
        const defaultsStr = localStorage.getItem('blackout_hockey_defaults');
        if (defaultsStr) {
          const defaults = JSON.parse(defaultsStr);
          if (defaults.periodLength !== undefined) {
             setPeriodLength(defaults.periodLength);
             setP1Input(`${defaults.periodLength.toString().padStart(2, '0')}:00`);
          }
          if (defaults.trackIcing !== undefined) setTrackIcing(defaults.trackIcing);
          if (defaults.trackOffside !== undefined) setTrackOffside(defaults.trackOffside);
          if (defaults.trackSOG !== undefined) setTrackSOG(defaults.trackSOG);
          if (defaults.officialGame !== undefined) setOfficialGame(defaults.officialGame);
          if (defaults.gameType) setGameType(defaults.gameType);
          if (defaults.attendance !== undefined) setAttendance(defaults.attendance);
          if (defaults.ticketsSold !== undefined) setTicketsSold(defaults.ticketsSold);

          if (defaults.liveGame !== undefined) setLiveGame(defaults.liveGame);
          if (defaults.teamSelection) setTeamSelection(defaults.teamSelection);
          if (defaults.allowFillInPlayers !== undefined) setAllowFillInPlayers(defaults.allowFillInPlayers);

          if (defaults.gameClock !== undefined) setGameClock(defaults.gameClock);
          if (defaults.clockPauseBehavior) setClockPauseBehavior(defaults.clockPauseBehavior);
          if (defaults.autoStopAtPeriodEnd) setAutoStopAtPeriodEnd(defaults.autoStopAtPeriodEnd);
          if (defaults.periodFormat) setPeriodFormat(defaults.periodFormat);
          if (defaults.shootout !== undefined) setShootout(defaults.shootout);
          if (defaults.soRules) setSoRules(defaults.soRules);

          if (defaults.trackSOGLocation !== undefined) setTrackSOGLocation(defaults.trackSOGLocation);
          if (defaults.trackFOW !== undefined) setTrackFOW(defaults.trackFOW);
          if (defaults.faceoffLocation !== undefined) setFaceoffLocation(defaults.faceoffLocation);
          if (defaults.goalscorer !== undefined) setGoalscorer(defaults.goalscorer);
          if (defaults.assists) setAssists(defaults.assists);

          if (defaults.trackPenalties !== undefined) setTrackPenalties(defaults.trackPenalties);
          if (defaults.penaltyClock) setPenaltyClock(defaults.penaltyClock);
          if (defaults.durationTypes) setDurationTypes(defaults.durationTypes);

          if (defaults.officialsMode) setOfficialsMode(defaults.officialsMode);
          if (defaults.linesmenMode) setLinesmenMode(defaults.linesmenMode);
          if (defaults.venueMode) setVenueMode(defaults.venueMode);
          if (defaults.capacity !== undefined) setCapacity(defaults.capacity);
          if (defaults.avgPrice !== undefined) setAvgPrice(defaults.avgPrice);
        }
      }
    } catch(e) {}
  }, []);

  const handleStart = () => {
    // Dynamische fallback logic op basis van contract
    const finalHome = homeTeam.trim() || (teamSelection === contract.customTeamSelectionMode ? contract.fallbackHomeTeamCustom : contract.fallbackHomeTeamList);
    const finalAway = awayTeam.trim() || (teamSelection === contract.customTeamSelectionMode ? contract.fallbackAwayTeamCustom : contract.fallbackAwayTeamList);

    const config: GameConfig = {
      homeTeam: finalHome,
      awayTeam: finalAway,
      homeColor,
      awayColor,
      homeLogo,
      awayLogo,
      homeRoster,
      awayRoster,
      date: scheduledGameData?.date || new Date().toISOString().split('T')[0],
      time: scheduledGameData?.time || contract.defaultTime,
      location: venueMode === contract.customVenueMode ? customVenue : venueMode,
      competition: scheduledGameData?.competition || contract.defaultCustomVenue, // Lege fallback vanuit contract
      matchType: scheduledGameData?.matchType || contract.defaultCustomVenue,
      officials: officialsMode === contract.customOfficialsMode ? customOfficials.split(',').map(s => s.trim()) : [],
      linesmen: linesmenMode === contract.customLinesmenMode ? customLinesmen.split(',').map(s => s.trim()) : [],
      initialScoreHome,
      initialScoreAway,
      initialSogHome,
      initialSogAway,
      initialPeriod,
      settings: {
        periodLength: periodLength * 60,
        trackIcing,
        trackOffside,
        trackSOG,
        officialGame,
        gameType,
        attendance,
        ticketsSold,
        liveGame,
        teamSelection,
        allowFillInPlayers,
        gameClock,
        clockPauseBehavior,
        autoStopAtPeriodEnd,
        periodFormat,
        shootout,
        soRules,
        trackSOGLocation,
        trackFOW,
        faceoffLocation,
        goalscorer,
        assists,
        trackPenalties,
        penaltyClock,
        durationTypes,
        officialsMode,
        linesmenMode,
        venueMode,
        capacity,
        avgPrice,
        haptics: true,
        stayAwake: true,
        autosave: true,
        localStorageEnabled: true,
        autogenerateCSV: false
      }
    };
    localStorage.setItem('blackout_hockey_current_config', JSON.stringify(config));
    localStorage.removeItem('blackout_hockey_saved_game');
    onStart();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-surface-container-low border-b border-outline-variant w-full top-0 flex items-center justify-between px-4 h-16 z-50 sticky">
        <button
          onClick={onBack}
          className="text-primary hover:bg-surface-container-high transition-colors active:scale-95 duration-100 p-2 rounded flex items-center justify-center"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-display text-[24px] font-bold text-primary tracking-tight">PRE-GAME SETTINGS</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-12 py-6 flex flex-col gap-10">

        {/* Teams & Roster */}
        <Section title="TEAMS & ROSTER">
          <Row label="Team Selection" border={false}><Select options={contract.teamSelectionOptions} value={teamSelection} onChange={(e) => setTeamSelection(e.target.value)} className="w-48" /></Row>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {/* Home Team */}
                <div className="bg-surface-container-low border border-[#2A2A2A] rounded-lg p-4 flex flex-col gap-2">
                  <label className="font-mono text-[12px] font-bold text-on-surface-variant tracking-widest uppercase">HOME TEAM</label>
                  {teamSelection === contract.customTeamSelectionMode ? (
                    <input className="w-full bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background font-display font-bold uppercase outline-none input-focus" value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} />
                  ) : (
                    <Select options={contract.homeTeamOptions} value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} className="w-full font-display font-bold uppercase" />
                  )}
                  <div className="flex gap-2 items-center mt-2">
                    <input type="color" className="w-8 h-8 rounded p-0 border-0 bg-transparent shrink-0 cursor-pointer" value={homeColor} onChange={(e) => setHomeColor(e.target.value)} />
                    <input className="flex-1 bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background text-sm outline-none input-focus" placeholder="Logo URL" type="text" value={homeLogo} onChange={(e) => setHomeLogo(e.target.value)} />
                  </div>
                  <button
                    onClick={() => setActiveRosterModal({ isHome: true })}
                    className="mt-2 w-full bg-surface-container-high border border-outline-variant text-primary py-2 rounded flex items-center justify-between px-3 hover:bg-surface-container-highest transition-colors text-xs font-bold"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" /> Open Roster
                    </span>
                    <span className="bg-blue-500/20 text-blue-300 font-mono text-[10px] px-2 py-0.5 rounded-full">
                      {homeRoster.length} spelers
                    </span>
                  </button>
                </div>

                {/* Away Team */}
                <div className="bg-surface-container-low border border-[#2A2A2A] rounded-lg p-4 flex flex-col gap-2">
                  <label className="font-mono text-[12px] font-bold text-on-surface-variant tracking-widest uppercase">AWAY TEAM</label>
                  {teamSelection === contract.customTeamSelectionMode ? (
                    <input className="w-full bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background font-display font-bold uppercase outline-none input-focus" value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} />
                  ) : (
                    <Select options={contract.awayTeamOptions} value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} className="w-full font-display font-bold uppercase" />
                  )}
                  <div className="flex gap-2 items-center mt-2">
                    <input type="color" className="w-8 h-8 rounded p-0 border-0 bg-transparent shrink-0 cursor-pointer" value={awayColor} onChange={(e) => setAwayColor(e.target.value)} />
                    <input className="flex-1 bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background text-sm outline-none input-focus" placeholder="Logo URL" type="text" value={awayLogo} onChange={(e) => setAwayLogo(e.target.value)} />
                  </div>
                  <button
                    onClick={() => setActiveRosterModal({ isHome: false })}
                    className="mt-2 w-full bg-surface-container-high border border-outline-variant text-primary py-2 rounded flex items-center justify-between px-3 hover:bg-surface-container-highest transition-colors text-xs font-bold"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-red-400" /> Open Roster
                    </span>
                    <span className="bg-red-500/20 text-red-300 font-mono text-[10px] px-2 py-0.5 rounded-full">
                      {awayRoster.length} spelers
                    </span>
                  </button>
                </div>
              </div>
        </Section>

            {/* Match Start State / Beginwaarden */}
            <Section title="BEGINWAARDEN WEDSTRIJD" defaultExpanded={false}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
                {/* Score */}
                <div className="flex flex-col gap-3">
                  <span className="font-mono text-[12px] font-bold text-on-surface-variant tracking-widest uppercase">SCORE BIJ START</span>
                  <div className="flex gap-4 items-center bg-[#050505] border border-[#2A2A2A] rounded-lg p-3 justify-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[11px] text-on-surface-variant font-semibold">HOME</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setInitialScoreHome(prev => Math.max(0, prev - 1))}
                          className="w-8 h-8 rounded bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center font-bold text-lg text-primary transition-colors select-none active:scale-90"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={initialScoreHome}
                          onChange={(e) => setInitialScoreHome(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-12 bg-transparent text-center font-display font-bold text-[20px] text-on-background outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() => setInitialScoreHome(prev => prev + 1)}
                          className="w-8 h-8 rounded bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center font-bold text-lg text-primary transition-colors select-none active:scale-90"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <span className="text-on-surface-variant font-display font-bold text-xl px-1">-</span>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[11px] text-on-surface-variant font-semibold">AWAY</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setInitialScoreAway(prev => Math.max(0, prev - 1))}
                          className="w-8 h-8 rounded bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center font-bold text-lg text-primary transition-colors select-none active:scale-90"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={initialScoreAway}
                          onChange={(e) => setInitialScoreAway(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-12 bg-transparent text-center font-display font-bold text-[20px] text-on-background outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() => setInitialScoreAway(prev => prev + 1)}
                          className="w-8 h-8 rounded bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center font-bold text-lg text-primary transition-colors select-none active:scale-90"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shots on Goal */}
                <div className="flex flex-col gap-3">
                  <span className="font-mono text-[12px] font-bold text-on-surface-variant tracking-widest uppercase">SOG BIJ START</span>
                  <div className="flex gap-4 items-center bg-[#050505] border border-[#2A2A2A] rounded-lg p-3 justify-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[11px] text-on-surface-variant font-semibold">HOME</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setInitialSogHome(prev => Math.max(0, prev - 1))}
                          className="w-8 h-8 rounded bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center font-bold text-lg text-primary transition-colors select-none active:scale-90"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={initialSogHome}
                          onChange={(e) => setInitialSogHome(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-12 bg-transparent text-center font-display font-bold text-[20px] text-on-background outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() => setInitialSogHome(prev => prev + 1)}
                          className="w-8 h-8 rounded bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center font-bold text-lg text-primary transition-colors select-none active:scale-90"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <span className="text-on-surface-variant font-display font-bold text-xl px-1">-</span>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[11px] text-on-surface-variant font-semibold">AWAY</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setInitialSogAway(prev => Math.max(0, prev - 1))}
                          className="w-8 h-8 rounded bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center font-bold text-lg text-primary transition-colors select-none active:scale-90"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={initialSogAway}
                          onChange={(e) => setInitialSogAway(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-12 bg-transparent text-center font-display font-bold text-[20px] text-on-background outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() => setInitialSogAway(prev => prev + 1)}
                          className="w-8 h-8 rounded bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center font-bold text-lg text-primary transition-colors select-none active:scale-90"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Row label="Start Periode" border={false}>
                <Select
                  options={contract.initialPeriodOptions}
                  value={contract.initialPeriodOptions[initialPeriod - 1] || contract.initialPeriodOptions[0]}
                  onChange={(e) => {
                    const selectedIndex = contract.initialPeriodOptions.indexOf(e.target.value);
                    setInitialPeriod(selectedIndex !== -1 ? selectedIndex + 1 : contract.defaultInitialPeriod);
                  }}
                  className="w-48 font-semibold"
                />
              </Row>
            </Section>

            {/* Game Clock */}
            <Section title="GAME CLOCK">
              <Row label="Game Clock"><Toggle checked={gameClock} onChange={() => setGameClock(!gameClock)} /></Row>
              <Row label="Clock Pause Behavior" disabled={!gameClock}><Select disabled={!gameClock} options={contract.clockBehaviorOptions} value={clockPauseBehavior} onChange={(e) => setClockPauseBehavior(e.target.value)} className="w-40" /></Row>
              <Row label="Auto Stop at Period End" border={false} disabled={!gameClock}><Select disabled={!gameClock} options={contract.yesNoOptions} value={autoStopAtPeriodEnd} onChange={(e) => setAutoStopAtPeriodEnd(e.target.value)} className="w-32" /></Row>

              <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 py-2 ${!gameClock ? 'opacity-50 pointer-events-none' : ''}`}>
                {contract.periodBlocks.map((block) => (
                  <div key={block.id} className="flex flex-col gap-1">
                    <label className="font-mono text-[10px] font-bold text-on-surface-variant uppercase">{block.label}</label>
                    {block.id === 'p1' ? (
                      <input
                        className="w-full bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background text-center font-display font-bold text-[24px] input-focus outline-none"
                        type="text"
                        value={p1Input}
                        onChange={(e) => {
                          const val = e.target.value;
                          setP1Input(val);
                          const parts = val.split(':');
                          if (parts.length > 0) {
                            const mins = parseInt(parts[0], 10);
                            if (!isNaN(mins)) {
                              setPeriodLength(mins);
                            }
                          }
                        }}
                      />
                    ) : (
                      <input
                        className="w-full bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background text-center font-display font-bold text-[24px] input-focus outline-none"
                        type="text"
                        defaultValue={block.defaultTime}
                      />
                    )}
                  </div>
                ))}
              </div>
            </Section>

            {/* Tracking & Stats */}
            <Section title="TRACKING & STATS">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                <Row label="Icing"><Toggle checked={trackIcing} onChange={() => setTrackIcing(!trackIcing)} /></Row>
                <Row label="Offside"><Toggle checked={trackOffside} onChange={() => setTrackOffside(!trackOffside)} /></Row>
                <Row label="SOG"><Toggle checked={trackSOG} onChange={() => {
                  const newVal = !trackSOG;
                  setTrackSOG(newVal);
                  if (!newVal) {
                    setTrackSOGLocation(false);
                  }
                }} /></Row>
                <Row label="SOG Location" disabled={!trackSOG}><Toggle disabled={!trackSOG} checked={trackSOGLocation && trackSOG} onChange={() => setTrackSOGLocation(!trackSOGLocation)} /></Row>
                <Row label="FOW"><Toggle checked={trackFOW} onChange={() => {
                  const newVal = !trackFOW;
                  setTrackFOW(newVal);
                  if (!newVal) {
                    setFaceoffLocation(false);
                  }
                }} /></Row>
                <Row label="Faceoff Location" disabled={!trackFOW}><Toggle disabled={!trackFOW} checked={faceoffLocation && trackFOW} onChange={() => setFaceoffLocation(!faceoffLocation)} /></Row>
              </div>
            </Section>

            {/* Penalties */}
            <Section title="PENALTIES">
              <Row label="Penalties"><Toggle checked={trackPenalties} onChange={() => setTrackPenalties(!trackPenalties)} /></Row>
              <Row label="Penalty Clock" border={false} disabled={!trackPenalties || !gameClock}><Select disabled={!trackPenalties || !gameClock} options={contract.penaltyClockOptions} value={penaltyClock} onChange={(e) => setPenaltyClock(e.target.value)} className="w-36" /></Row>
            </Section>

            {/* System */}
            <section className="flex flex-col gap-4">
              <h2 className="font-mono text-[12px] font-bold text-tertiary tracking-widest uppercase">SYSTEM</h2>
              <div className="bg-surface-container-low metallic-border rounded-lg p-4 inner-glow flex flex-col gap-2">
                <Row label="Local Backup" border={false}><Toggle checked={localBackup} onChange={() => setLocalBackup(!localBackup)} /></Row>
              </div>
            </section>

        {/* Start Game Action */}
        <div className="pt-2 pb-8">
          <button
            className="w-full bg-tertiary text-black font-display text-[24px] font-bold py-4 rounded-lg raised-element bg-button-gradient hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(233,196,0,0.3)]"
            onClick={handleStart}
          >
            <Play fill="currentColor" className="w-6 h-6" />
            START GAME
          </button>
        </div>

        {/* Roster Modal */}
        {activeRosterModal && (
          <RosterModal
            isOpen={true}
            teamName={activeRosterModal.isHome ? homeTeam : awayTeam}
            isHome={activeRosterModal.isHome}
            initialRoster={activeRosterModal.isHome ? homeRoster : awayRoster}
            onClose={() => setActiveRosterModal(null)}
            onSave={(updatedRoster) => {
              if (activeRosterModal.isHome) {
                setHomeRoster(updatedRoster);
              } else {
                setAwayRoster(updatedRoster);
              }
            }}
          />
        )}

      </main>
    </div>
  );
}