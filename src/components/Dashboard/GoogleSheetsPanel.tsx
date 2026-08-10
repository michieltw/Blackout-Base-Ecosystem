import React, { useState, useEffect } from 'react';
import { AppDatabase } from '../../types/frontend_types';
import { signInWithGoogleSheets, signOutGoogle, getGoogleAccessToken, createGoogleSpreadsheet, exportDbToGoogleSheet, importDbFromGoogleSheet, initGoogleAuth } from '../../utils/index/GoogleSheetsService';
import { Database, FileSpreadsheet, Lock, CheckCircle2, AlertCircle, RefreshCw, LogIn, LogOut, ArrowUpRight, ShieldCheck } from 'lucide-react';

interface GoogleSheetsPanelProps {
  db: AppDatabase;
  onUpdateDb: (updatedDb: AppDatabase) => void;
}

export const GoogleSheetsPanel: React.FC<GoogleSheetsPanelProps> = ({ db, onUpdateDb }) => {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string>(localStorage.getItem('ghl_sheets_id') || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user, token) => {
        setIsSignedIn(true);
        setUserEmail(user.email);
      },
      () => {
        setIsSignedIn(false);
        setUserEmail(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setMessage(null);
      const res = await signInWithGoogleSheets();
      setIsSignedIn(true);
      setUserEmail(res.user.email);
      setMessage({ text: 'Succesvol ingelogd met Google & Sheets rechten!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Inloggen mislukt', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutGoogle();
    setIsSignedIn(false);
    setUserEmail(null);
    setMessage({ text: 'Uitgelogd bij Google.', type: 'info' });
  };

  const handleCreateSheet = async () => {
    const token = getGoogleAccessToken();
    if (!token) {
      setMessage({ text: 'Niet ingelogd met Google.', type: 'error' });
      return;
    }
    try {
      setLoading(true);
      setMessage(null);
      const newId = await createGoogleSpreadsheet(token, 'GIJS Groningen House League Database');
      setSpreadsheetId(newId);
      localStorage.setItem('ghl_sheets_id', newId);
      setMessage({ text: 'Nieuwe Google Spreadsheet succesvol aangemaakt!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Aanmaken spreadsheet mislukt', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    const token = getGoogleAccessToken();
    if (!token || !spreadsheetId.trim()) {
      setMessage({ text: 'Voer een Spreadsheet ID in en zorg dat je ingelogd bent.', type: 'error' });
      return;
    }
    try {
      setLoading(true);
      setMessage(null);
      localStorage.setItem('ghl_sheets_id', spreadsheetId.trim());
      await exportDbToGoogleSheet(token, spreadsheetId.trim(), db);
      setMessage({ text: 'Gegevens succesvol geëxporteerd naar Google Sheets!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Exporteren mislukt', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    const token = getGoogleAccessToken();
    if (!token || !spreadsheetId.trim()) {
      setMessage({ text: 'Voer een Spreadsheet ID in en zorg dat je ingelogd bent.', type: 'error' });
      return;
    }
    try {
      setLoading(true);
      setMessage(null);
      localStorage.setItem('ghl_sheets_id', spreadsheetId.trim());
      const updated = await importDbFromGoogleSheet(token, spreadsheetId.trim(), db);
      onUpdateDb(updated);
      setMessage({ text: 'Gegevens succesvol geladen vanuit Google Sheets!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Importeren mislukt', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-950">Google Sheets Database Koppeling</h3>
            <p className="text-xs text-slate-500">Gebruik Google Sheets als centrale database voor teams, spelers en wedstrijden</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
            isSignedIn ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isSignedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            {isSignedIn ? 'Google Verbonden' : 'Niet Verbonden'}
          </span>
        </div>
      </div>

      {/* Privacy Guarantee Box */}
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-black text-sky-950 uppercase tracking-wider">Volledige Privacy &amp; Afscherming</h4>
          <p className="text-xs text-sky-800 leading-relaxed">
            Uw persoonlijke e-mailadres is en blijft volledig privé. Het wordt <strong>nooit</strong> openbaar weergegeven in de applicatie of gedeeld met andere gebruikers. U kunt desgewenst verbinden via een aparte Google-account of anonieme beheerder.
          </p>
        </div>
      </div>

      {/* Authentication Section */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">1. Google Account Authenticatie</h4>
        {!isSignedIn ? (
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>Verbind met Google Account</span>
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Verbonden als: <strong className="text-slate-900">{userEmail || 'Privé Account'}</strong> (E-mail afgeschermd voor gebruikers)</span>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Ontkoppel</span>
            </button>
          </div>
        )}
      </div>

      {/* Spreadsheet Configuration */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">2. Google Spreadsheet Selectie</h4>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Plak Google Spreadsheet ID (bijv. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms)"
              value={spreadsheetId}
              onChange={(e) => {
                setSpreadsheetId(e.target.value);
                localStorage.setItem('ghl_sheets_id', e.target.value);
              }}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <button
            onClick={handleCreateSheet}
            disabled={!isSignedIn || loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Maak Nieuwe Sheet aan</span>
          </button>
        </div>
        <p className="text-[11px] text-slate-500">
          Tip: U kunt de ID van een bestaande Google Spreadsheet uit de URL kopiëren (het lange stuk tekst tussen <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">/d/</code> en <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">/edit</code>).
        </p>
      </div>

      {/* Sync Actions */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">3. Databasestroom &amp; Synchronisatie</h4>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            disabled={!isSignedIn || !spreadsheetId.trim() || loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Exporteer app-data naar Google Sheets</span>
          </button>
          <button
            onClick={handleImport}
            disabled={!isSignedIn || !spreadsheetId.trim() || loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Database className="w-4 h-4 text-slate-700" />
            <span>Laad data vanuit Google Sheets</span>
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' :
          message.type === 'error' ? 'bg-red-50 text-red-900 border-red-200' :
          'bg-slate-50 text-slate-900 border-slate-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}
    </div>
  );
};
