import React, { useState } from 'react';
import { HealthProvider, useHealth } from './context/HealthContext';
import { Dashboard } from './components/Dashboard';
import { MedicationManager } from './components/MedicationManager';
import { VitalTracker } from './components/VitalTracker';
import { ReportExport } from './components/ReportExport';
import {
  Activity,
  Heart,
  Pill,
  FileText,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronRight,
  Accessibility,
} from 'lucide-react';
import './App.css';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'medications' | 'vitals' | 'report'>('dashboard');
  const { preferences, updatePreferences, resetAllData, medications, vitalLogs } = useHealth();

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="flex-column" style={{ gap: '24px' }}>
          {/* App Branding */}
          <div className="flex-align-center" style={{ gap: '12px', padding: '8px 0' }}>
            <div
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--text-on-primary)',
                padding: '8px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Heart size={24} fill="currentColor" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <h1 style={{ fontSize: 'var(--font-lg)', margin: 0, letterSpacing: '-0.5px' }}>
                MedRemind
              </h1>
              <span className="text-muted" style={{ fontSize: 'var(--font-xs)', fontWeight: 600 }}>
                Care Dashboard
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="nav-menu">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <Activity size={20} />
              <span>Dashboard</span>
              <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: activeTab === 'dashboard' ? 1 : 0 }} />
            </button>
            
            <button
              onClick={() => setActiveTab('medications')}
              className={`nav-item ${activeTab === 'medications' ? 'active' : ''}`}
            >
              <Pill size={20} />
              <span>Medications</span>
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: '10px',
                  backgroundColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '2px 6px',
                  borderRadius: '10px',
                }}
              >
                {medications.length}
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('vitals')}
              className={`nav-item ${activeTab === 'vitals' ? 'active' : ''}`}
            >
              <Heart size={20} />
              <span>Vital Logs</span>
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: '10px',
                  backgroundColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '2px 6px',
                  borderRadius: '10px',
                }}
              >
                {vitalLogs.length}
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('report')}
              className={`nav-item ${activeTab === 'report' ? 'active' : ''}`}
            >
              <FileText size={20} />
              <span>Reports</span>
              <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: activeTab === 'report' ? 1 : 0 }} />
            </button>
          </nav>
        </div>

        {/* Accessibility Panel (A11y settings) */}
        <div className="flex-column" style={{ gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <div className="flex-align-center" style={{ gap: '8px', color: 'var(--text-secondary)' }}>
            <Accessibility size={18} />
            <strong style={{ fontSize: 'var(--font-sm)' }}>Accessibility</strong>
          </div>

          {/* Elderly Mode Checkbox Preset */}
          <label
            className="flex-between"
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: preferences.elderlyMode ? 'var(--primary-light)' : 'var(--bg-app)',
              border: `1px solid ${preferences.elderlyMode ? 'var(--primary)' : 'var(--border-color)'}`,
              cursor: 'pointer',
              fontSize: 'var(--font-sm)',
              fontWeight: 600,
            }}
          >
            <span className="flex-align-center" style={{ gap: '8px' }}>
              <Sparkles size={16} className={preferences.elderlyMode ? 'text-success' : 'text-muted'} />
              Elderly-Friendly Preset
            </span>
            <input
              type="checkbox"
              checked={preferences.elderlyMode}
              onChange={(e) => updatePreferences({ elderlyMode: e.target.checked })}
              style={{ cursor: 'pointer' }}
            />
          </label>

          {/* Manual Control Grid */}
          {!preferences.elderlyMode && (
            <div className="flex-column" style={{ gap: '10px', fontSize: 'var(--font-xs)' }}>
              {/* Font Scale Selection */}
              <div className="flex-between">
                <span>Text Size:</span>
                <select
                  value={preferences.fontSize}
                  onChange={(e: any) => updatePreferences({ fontSize: e.target.value })}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="normal">Normal</option>
                  <option value="large">Large</option>
                  <option value="extra-large">Extra Large</option>
                </select>
              </div>

              {/* High Contrast Toggle */}
              <div className="flex-between">
                <span>High Contrast:</span>
                <input
                  type="checkbox"
                  checked={preferences.highContrast}
                  onChange={(e) => updatePreferences({ highContrast: e.target.checked })}
                  style={{ cursor: 'pointer' }}
                />
              </div>
            </div>
          )}

          {/* Core Controls: Theme and Sound */}
          <div className="flex-between" style={{ marginTop: '4px' }}>
            {/* Theme Toggle */}
            <button
              className="btn btn-secondary btn-icon-only"
              onClick={() => updatePreferences({ theme: preferences.theme === 'light' ? 'dark' : 'light' })}
              title={preferences.theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {preferences.theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Audio Feedback Toggle */}
            <button
              className="btn btn-secondary btn-icon-only"
              onClick={() => updatePreferences({ audioCues: !preferences.audioCues })}
              title={preferences.audioCues ? 'Mute Intake Sounds' : 'Unmute Intake Sounds'}
            >
              {preferences.audioCues ? (
                <Volume2 size={18} className="text-success" />
              ) : (
                <VolumeX size={18} className="text-muted" />
              )}
            </button>
            
            {/* Reset Logs Hook */}
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete all settings, medications, and health history?')) {
                  resetAllData();
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--danger)',
                fontSize: 'var(--font-xs)',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Clear Logs
            </button>
          </div>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="main-content">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'medications' && <MedicationManager />}
        {activeTab === 'vitals' && <VitalTracker />}
        {activeTab === 'report' && <ReportExport />}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HealthProvider>
      <AppContent />
    </HealthProvider>
  );
};

export default App;
