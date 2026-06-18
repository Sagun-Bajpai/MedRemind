import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Medication {
  id: string;
  name: string;
  dosage: string; // e.g., "1 tablet", "500mg"
  frequency: 'daily' | 'weekly' | 'as-needed';
  times: string[]; // e.g., ["08:00", "20:00"]
  foodRelation: 'before' | 'after' | 'with' | 'none'; // relation to meals
  startDate: string; // YYYY-MM-DD
  active: boolean;
  notes?: string;
}

export interface IntakeLog {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  timestamp: string; // ISO string
  status: 'taken' | 'missed';
  scheduledTime: string; // e.g., "08:00"
}

export interface VitalReading {
  id: string;
  timestamp: string; // ISO string
  systolic?: number; // mmHg
  diastolic?: number; // mmHg
  bloodGlucose?: number; // mg/dL
  glucoseType?: 'fasting' | 'post-prandial' | 'random';
  heartRate?: number; // bpm
  weight?: number; // kg or lbs
  temperature?: number; // °C or °F
  notes?: string;
}

export interface Preferences {
  theme: 'light' | 'dark';
  fontSize: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  elderlyMode: boolean; // Custom preset combining large fonts & high contrast
  audioCues: boolean;
}

interface HealthContextType {
  medications: Medication[];
  intakeLogs: IntakeLog[];
  vitalLogs: VitalReading[];
  preferences: Preferences;
  addMedication: (med: Omit<Medication, 'id' | 'active'>) => void;
  updateMedication: (id: string, updatedMed: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  logIntake: (medId: string, scheduledTime: string, status: 'taken' | 'missed') => void;
  deleteIntakeLog: (id: string) => void;
  addVitalReading: (reading: Omit<VitalReading, 'id' | 'timestamp'>) => void;
  deleteVitalReading: (id: string) => void;
  updatePreferences: (prefs: Partial<Preferences>) => void;
  resetAllData: () => void;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export const HealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states from LocalStorage or use defaults
  const [medications, setMedications] = useState<Medication[]>(() => {
    const saved = localStorage.getItem('medremind_medications');
    return saved ? JSON.parse(saved) : [];
  });

  const [intakeLogs, setIntakeLogs] = useState<IntakeLog[]>(() => {
    const saved = localStorage.getItem('medremind_intakelogs');
    return saved ? JSON.parse(saved) : [];
  });

  const [vitalLogs, setVitalLogs] = useState<VitalReading[]>(() => {
    const saved = localStorage.getItem('medremind_vitallogs');
    return saved ? JSON.parse(saved) : [];
  });

  const [preferences, setPreferences] = useState<Preferences>(() => {
    const saved = localStorage.getItem('medremind_preferences');
    return saved
      ? JSON.parse(saved)
      : {
          theme: 'light',
          fontSize: 'normal',
          highContrast: false,
          elderlyMode: false,
          audioCues: false,
        };
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('medremind_medications', JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem('medremind_intakelogs', JSON.stringify(intakeLogs));
  }, [intakeLogs]);

  useEffect(() => {
    localStorage.setItem('medremind_vitallogs', JSON.stringify(vitalLogs));
  }, [vitalLogs]);

  useEffect(() => {
    localStorage.setItem('medremind_preferences', JSON.stringify(preferences));

    // Apply preference styles to standard HTML root for global styling hooks
    const root = document.documentElement;
    
    // Theme
    if (preferences.theme === 'dark') {
      root.classList.add('dark-theme');
    } else {
      root.classList.remove('dark-theme');
    }

    // High Contrast
    if (preferences.highContrast || preferences.elderlyMode) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Font Size
    root.classList.remove('font-normal', 'font-large', 'font-xlarge');
    if (preferences.elderlyMode || preferences.fontSize === 'extra-large') {
      root.classList.add('font-xlarge');
    } else if (preferences.fontSize === 'large') {
      root.classList.add('font-large');
    } else {
      root.classList.add('font-normal');
    }
  }, [preferences]);

  // Operations
  const addMedication = (med: Omit<Medication, 'id' | 'active'>) => {
    const newMed: Medication = {
      ...med,
      id: crypto.randomUUID(),
      active: true,
    };
    setMedications((prev) => [...prev, newMed]);
  };

  const updateMedication = (id: string, updatedMed: Partial<Medication>) => {
    setMedications((prev) =>
      prev.map((med) => (med.id === id ? { ...med, ...updatedMed } : med))
    );
  };

  const deleteMedication = (id: string) => {
    setMedications((prev) => prev.filter((med) => med.id !== id));
  };

  const logIntake = (medId: string, scheduledTime: string, status: 'taken' | 'missed') => {
    const med = medications.find((m) => m.id === medId);
    if (!med) return;

    const newLog: IntakeLog = {
      id: crypto.randomUUID(),
      medicationId: medId,
      medicationName: med.name,
      dosage: med.dosage,
      timestamp: new Date().toISOString(),
      status,
      scheduledTime,
    };
    setIntakeLogs((prev) => [newLog, ...prev]);

    // Play visual/audio cue if enabled
    if (preferences.audioCues && status === 'taken') {
      playSuccessSound();
    }
  };

  const deleteIntakeLog = (id: string) => {
    setIntakeLogs((prev) => prev.filter((log) => log.id !== id));
  };

  const addVitalReading = (reading: Omit<VitalReading, 'id' | 'timestamp'>) => {
    const newReading: VitalReading = {
      ...reading,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    setVitalLogs((prev) => [newReading, ...prev]);
  };

  const deleteVitalReading = (id: string) => {
    setVitalLogs((prev) => prev.filter((r) => r.id !== id));
  };

  const updatePreferences = (prefs: Partial<Preferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...prefs };
      if (prefs.elderlyMode === true) {
        updated.highContrast = true;
        updated.fontSize = 'extra-large';
        updated.audioCues = true;
      } else if (prefs.elderlyMode === false && prev.elderlyMode === true) {
        updated.highContrast = false;
        updated.fontSize = 'normal';
      }
      return updated;
    });
  };

  const resetAllData = () => {
    setMedications([]);
    setIntakeLogs([]);
    setVitalLogs([]);
    setPreferences({
      theme: 'light',
      fontSize: 'normal',
      highContrast: false,
      elderlyMode: false,
      audioCues: false,
    });
  };

  const playSuccessSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5

      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.45);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn('Audio feedback failed to play', e);
    }
  };

  return (
    <HealthContext.Provider
      value={{
        medications,
        intakeLogs,
        vitalLogs,
        preferences,
        addMedication,
        updateMedication,
        deleteMedication,
        logIntake,
        deleteIntakeLog,
        addVitalReading,
        deleteVitalReading,
        updatePreferences,
        resetAllData,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
};
