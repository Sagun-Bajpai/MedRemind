import React, { useState } from 'react';
import { useHealth, type Medication } from '../context/HealthContext';
import { Check, X, Clock, Activity, AlertCircle, Heart, Pill } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    medications,
    intakeLogs,
    vitalLogs,
    logIntake,
    addVitalReading,
  } = useHealth();

  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [glucose, setGlucose] = useState('');
  const [glucoseType, setGlucoseType] = useState<'fasting' | 'post-prandial' | 'random'>('random');
  const [heartRate, setHeartRate] = useState('');
  const [vitalSuccess, setVitalSuccess] = useState(false);

  // Get current date string in local time (YYYY-MM-DD)
  const getLocalDateString = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60 * 1000);
    return local.toISOString().split('T')[0];
  };

  const todayStr = getLocalDateString();

  // Filter today's logged intakes
  const todayLogs = intakeLogs.filter((log) => log.timestamp.startsWith(todayStr));

  // Generate scheduled doses for today
  const getTodayDoses = () => {
    const list: { med: Medication; time: string; status: 'taken' | 'missed' | 'pending'; logId?: string }[] = [];

    medications.forEach((med) => {
      if (!med.active) return;
      
      // Daily & Weekly are scheduled
      if (med.frequency === 'daily' || med.frequency === 'weekly') {
        med.times.forEach((time) => {
          // Find if this dose is logged today
          const logged = todayLogs.find((l) => l.medicationId === med.id && l.scheduledTime === time);
          
          list.push({
            med,
            time,
            status: logged ? logged.status : 'pending',
            logId: logged?.id,
          });
        });
      }
    });

    // Sort by scheduled time
    return list.sort((a, b) => a.time.localeCompare(b.time));
  };

  const todayDoses = getTodayDoses();

  // As Needed medications
  const asNeededMeds = medications.filter((med) => med.active && med.frequency === 'as-needed');

  // Adherence percentage
  const scheduledCount = todayDoses.length;
  const takenCount = todayDoses.filter((d) => d.status === 'taken').length;
  const adherenceRate = scheduledCount > 0 ? Math.round((takenCount / scheduledCount) * 100) : 100;

  // Handle Vital Submission
  const handleLogVitals = (e: React.FormEvent) => {
    e.preventDefault();
    if (!systolic && !diastolic && !glucose && !heartRate) return;

    addVitalReading({
      systolic: systolic ? parseInt(systolic) : undefined,
      diastolic: diastolic ? parseInt(diastolic) : undefined,
      bloodGlucose: glucose ? parseInt(glucose) : undefined,
      glucoseType: glucose ? glucoseType : undefined,
      heartRate: heartRate ? parseInt(heartRate) : undefined,
    });

    setSystolic('');
    setDiastolic('');
    setGlucose('');
    setHeartRate('');
    setVitalSuccess(true);
    setTimeout(() => setVitalSuccess(false), 3000);
  };

  // Vital Status Evaluators
  const getBpStatus = (sys?: number, dia?: number) => {
    if (!sys || !dia) return null;
    if (sys >= 140 || dia >= 90) return { label: 'High BP (Hypertension)', class: 'badge-danger' };
    if (sys < 90 || dia < 60) return { label: 'Low BP', class: 'badge-warning' };
    return { label: 'Normal BP', class: 'badge-success' };
  };

  const getGlucoseStatus = (gl?: number, type?: string) => {
    if (!gl) return null;
    if (type === 'fasting') {
      if (gl >= 126) return { label: 'High Glucose (Fasting)', class: 'badge-danger' };
      if (gl < 70) return { label: 'Low Glucose (Hypoglycemia)', class: 'badge-danger' };
      return { label: 'Normal Fasting', class: 'badge-success' };
    }
    // Post-prandial / Random
    if (gl >= 200) return { label: 'High Glucose', class: 'badge-danger' };
    if (gl < 70) return { label: 'Low Glucose', class: 'badge-danger' };
    return { label: 'Normal Glucose', class: 'badge-success' };
  };

  const latestReading = vitalLogs[0];
  const bpAlert = latestReading ? getBpStatus(latestReading.systolic, latestReading.diastolic) : null;
  const glucoseAlert = latestReading ? getGlucoseStatus(latestReading.bloodGlucose, latestReading.glucoseType) : null;

  return (
    <div className="flex-column" style={{ gap: '24px' }}>
      {/* Header Greeting */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Today's Health Overview</h2>
          <p className="text-muted">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        
        {/* Adherence Widget */}
        <div
          className="flex-align-center"
          style={{
            gap: '16px',
            backgroundColor: 'var(--primary-light)',
            padding: '12px 24px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--primary)',
          }}
        >
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--primary)' }}>
              Daily Adherence
            </span>
            <h3 style={{ color: 'var(--primary)', fontWeight: 800 }}>{adherenceRate}%</h3>
          </div>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: `conic-gradient(var(--primary) ${adherenceRate}%, var(--border-color) 0)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--font-xs)',
                fontWeight: 700,
              }}
            >
              💊
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid-2">
        {/* Left Column: Medications Schedule */}
        <div className="card flex-column" style={{ gap: '20px' }}>
          <div className="flex-between">
            <h3 className="flex-align-center" style={{ gap: '10px' }}>
              <Clock size={24} className="text-success" />
              Medication Schedule
            </h3>
            <span className="text-muted">
              {takenCount}/{scheduledCount} Taken
            </span>
          </div>

          {scheduledCount === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Pill size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <p className="text-muted">No scheduled medications for today.</p>
              <p className="text-muted" style={{ fontSize: 'var(--font-xs)' }}>
                Add medications in the 'Medications' tab to start tracking.
              </p>
            </div>
          ) : (
            <div className="flex-column" style={{ gap: '12px' }}>
              {todayDoses.map(({ med, time, status }, idx) => (
                <div
                  key={`${med.id}-${time}-${idx}`}
                  className="flex-between"
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor:
                      status === 'taken'
                        ? 'var(--success-light)'
                        : status === 'missed'
                        ? 'var(--danger-light)'
                        : 'var(--bg-card)',
                    opacity: status !== 'pending' ? 0.85 : 1,
                    transition: 'var(--transition-smooth)',
                  }}
                >
                  <div className="flex-align-center" style={{ gap: '16px' }}>
                    <div
                      style={{
                        padding: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--bg-app)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <Clock size={20} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <strong style={{ fontSize: 'var(--font-base)', display: 'block' }}>
                        {med.name}
                      </strong>
                      <span className="text-muted" style={{ fontSize: 'var(--font-sm)' }}>
                        {med.dosage} • {time} • {med.foodRelation !== 'none' ? `${med.foodRelation} food` : 'no food constraints'}
                      </span>
                    </div>
                  </div>

                  <div className="flex-gap-1">
                    {status === 'pending' ? (
                      <>
                        <button
                          onClick={() => logIntake(med.id, time, 'taken')}
                          className="btn btn-primary"
                          style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}
                          aria-label={`Mark ${med.name} at ${time} as taken`}
                        >
                          <Check size={16} /> Taken
                        </button>
                        <button
                          onClick={() => logIntake(med.id, time, 'missed')}
                          className="btn btn-secondary"
                          style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}
                          aria-label={`Mark ${med.name} at ${time} as missed`}
                        >
                          <X size={16} /> Missed
                        </button>
                      </>
                    ) : (
                      <span className={`badge ${status === 'taken' ? 'badge-success' : 'badge-danger'}`}>
                        {status === 'taken' ? 'Taken' : 'Missed'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* As Needed Section */}
          {asNeededMeds.length > 0 && (
            <div className="flex-column" style={{ gap: '12px', marginTop: '12px' }}>
              <h4 style={{ textAlign: 'left', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                As Needed Medications (PRN)
              </h4>
              <div className="flex-column" style={{ gap: '8px' }}>
                {asNeededMeds.map((med) => (
                  <div
                    key={med.id}
                    className="flex-between"
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <strong>{med.name}</strong>
                      <span className="text-muted" style={{ display: 'block', fontSize: 'var(--font-sm)' }}>
                        Dosage: {med.dosage} {med.notes ? `• ${med.notes}` : ''}
                      </span>
                    </div>
                    <button
                      onClick={() => logIntake(med.id, 'PRN', 'taken')}
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: 'var(--font-xs)' }}
                    >
                      <Check size={14} /> Log Dose
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Vitals Quick Log & Smart Insights */}
        <div className="flex-column" style={{ gap: '24px' }}>
          {/* Quick Log Vitals Form */}
          <div className="card flex-column" style={{ gap: '16px' }}>
            <h3 className="flex-align-center" style={{ gap: '10px' }}>
              <Heart size={24} className="text-danger" />
              Log Current Vitals
            </h3>
            
            <form onSubmit={handleLogVitals} className="flex-column" style={{ gap: '16px' }}>
              {/* BP Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Systolic (mmHg)</label>
                  <input
                    type="number"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    placeholder="e.g. 120"
                    className="form-input"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Diastolic (mmHg)</label>
                  <input
                    type="number"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    placeholder="e.g. 80"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Glucose Input */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Blood Glucose (mg/dL)</label>
                  <input
                    type="number"
                    value={glucose}
                    onChange={(e) => setGlucose(e.target.value)}
                    placeholder="e.g. 95"
                    className="form-input"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Glucose Context</label>
                  <select
                    value={glucoseType}
                    onChange={(e: any) => setGlucoseType(e.target.value)}
                    className="form-select"
                  >
                    <option value="random">Random/Anytime</option>
                    <option value="fasting">Fasting</option>
                    <option value="post-prandial">Post-Meal</option>
                  </select>
                </div>
              </div>

              {/* Heart Rate Input */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Heart Rate (BPM)</label>
                <input
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  placeholder="e.g. 72"
                  className="form-input"
                />
              </div>

              {vitalSuccess && (
                <div
                  style={{
                    backgroundColor: 'var(--success-light)',
                    color: 'var(--success)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--font-sm)',
                    textAlign: 'center',
                  }}
                >
                  Vitals logged successfully!
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Activity size={18} /> Save Vital Log
              </button>
            </form>
          </div>

          {/* Vitals Summary Alert Banner */}
          {latestReading && (
            <div className="card flex-column" style={{ gap: '16px', borderLeft: '5px solid var(--primary)' }}>
              <h3 className="flex-align-center" style={{ gap: '10px' }}>
                <AlertCircle size={24} className="text-success" />
                Latest Vital Readings
              </h3>
              
              <div className="grid-2" style={{ gap: '12px' }}>
                {latestReading.systolic && latestReading.diastolic && (
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-app)',
                      textAlign: 'left',
                    }}
                  >
                    <span className="text-muted" style={{ display: 'block', fontSize: 'var(--font-xs)' }}>
                      Blood Pressure
                    </span>
                    <strong style={{ fontSize: 'var(--font-lg)' }}>
                      {latestReading.systolic}/{latestReading.diastolic} <span style={{ fontSize: 'var(--font-xs)', fontWeight: 500 }}>mmHg</span>
                    </strong>
                    {bpAlert && (
                      <span className={`badge ${bpAlert.class}`} style={{ display: 'block', width: 'fit-content', marginTop: '6px' }}>
                        {bpAlert.label}
                      </span>
                    )}
                  </div>
                )}

                {latestReading.bloodGlucose && (
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-app)',
                      textAlign: 'left',
                    }}
                  >
                    <span className="text-muted" style={{ display: 'block', fontSize: 'var(--font-xs)' }}>
                      Blood Glucose
                    </span>
                    <strong style={{ fontSize: 'var(--font-lg)' }}>
                      {latestReading.bloodGlucose} <span style={{ fontSize: 'var(--font-xs)', fontWeight: 500 }}>mg/dL</span>
                    </strong>
                    {glucoseAlert && (
                      <span className={`badge ${glucoseAlert.class}`} style={{ display: 'block', width: 'fit-content', marginTop: '6px' }}>
                        {glucoseAlert.label} ({latestReading.glucoseType})
                      </span>
                    )}
                  </div>
                )}

                {latestReading.heartRate && (
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-app)',
                      textAlign: 'left',
                    }}
                  >
                    <span className="text-muted" style={{ display: 'block', fontSize: 'var(--font-xs)' }}>
                      Heart Rate
                    </span>
                    <strong style={{ fontSize: 'var(--font-lg)' }}>
                      {latestReading.heartRate} <span style={{ fontSize: 'var(--font-xs)', fontWeight: 500 }}>BPM</span>
                    </strong>
                  </div>
                )}
              </div>

              <div className="text-muted" style={{ fontSize: 'var(--font-xs)', textAlign: 'right' }}>
                Logged at: {new Date(latestReading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
