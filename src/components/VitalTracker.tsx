import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { Heart, Activity, Plus, Trash2, Calendar, Clipboard } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';

export const VitalTracker: React.FC = () => {
  const { vitalLogs, addVitalReading, deleteVitalReading } = useHealth();

  // Form States
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [glucose, setGlucose] = useState('');
  const [glucoseType, setGlucoseType] = useState<'fasting' | 'post-prandial' | 'random'>('random');
  const [heartRate, setHeartRate] = useState('');
  const [weight, setWeight] = useState('');
  const [temperature, setTemperature] = useState('');
  const [notes, setNotes] = useState('');
  const [showLogForm, setShowLogForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!systolic && !diastolic && !glucose && !heartRate && !weight && !temperature) return;

    addVitalReading({
      systolic: systolic ? parseInt(systolic) : undefined,
      diastolic: diastolic ? parseInt(diastolic) : undefined,
      bloodGlucose: glucose ? parseInt(glucose) : undefined,
      glucoseType: glucose ? glucoseType : undefined,
      heartRate: heartRate ? parseInt(heartRate) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      temperature: temperature ? parseFloat(temperature) : undefined,
      notes: notes || undefined,
    });

    // Reset fields
    setSystolic('');
    setDiastolic('');
    setGlucose('');
    setHeartRate('');
    setWeight('');
    setTemperature('');
    setNotes('');
    setShowLogForm(false);
  };

  // Format date for chart X-axis
  const formatChartDate = (isoStr: any) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Tooltip formatter
  const formatTooltipDate = (isoStr: any) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Reverse data for chronological chart display (newest is first in array, we want oldest first for charting)
  const chartData = [...vitalLogs].reverse();

  // Filters for vital logs
  const bpData = chartData.filter((r) => r.systolic !== undefined && r.diastolic !== undefined);
  const glucoseData = chartData.filter((r) => r.bloodGlucose !== undefined);
  const hrData = chartData.filter((r) => r.heartRate !== undefined);

  return (
    <div className="flex-column" style={{ gap: '24px' }}>
      {/* Header and Toggle Button */}
      <div className="flex-between">
        <div>
          <h2>Vitals Logs & Trends</h2>
          <p className="text-muted">Track blood pressure, glucose, heart rate, and other biometrics.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowLogForm(!showLogForm)}>
          <Plus size={20} /> {showLogForm ? 'Hide Form' : 'Log Vitals'}
        </button>
      </div>

      {/* Expandable Vitals Log Form */}
      {showLogForm && (
        <form onSubmit={handleSubmit} className="card flex-column" style={{ gap: '20px' }}>
          <h3>New Vitals Record</h3>
          
          <div className="grid-3" style={{ gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Blood Pressure (mmHg)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  placeholder="Sys"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  className="form-input"
                  style={{ flex: 1 }}
                />
                <span style={{ alignSelf: 'center' }}>/</span>
                <input
                  type="number"
                  placeholder="Dia"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  className="form-input"
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Blood Glucose (mg/dL)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  placeholder="e.g. 100"
                  value={glucose}
                  onChange={(e) => setGlucose(e.target.value)}
                  className="form-input"
                  style={{ flex: 1 }}
                />
                <select
                  value={glucoseType}
                  onChange={(e: any) => setGlucoseType(e.target.value)}
                  className="form-select"
                  style={{ width: '100px' }}
                >
                  <option value="random">Rand</option>
                  <option value="fasting">Fast</option>
                  <option value="post-prandial">Post</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Heart Rate (BPM)</label>
              <input
                type="number"
                placeholder="e.g. 72"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Weight (kg / lbs)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Body Temp (°C / °F)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 36.6"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 3' }}>
              <label className="form-label">Notes</label>
              <input
                type="text"
                placeholder="e.g. Felt slightly dizzy after walking."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowLogForm(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Log Reading
            </button>
          </div>
        </form>
      )}

      {/* Vitals Charts Section */}
      {vitalLogs.length === 0 ? (
        <div className="card" style={{ padding: '60px 0', textAlign: 'center' }}>
          <Clipboard size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3>No Health Metrics Found</h3>
          <p className="text-muted">Once you log metrics, interactive graphs of your health trends will appear here.</p>
        </div>
      ) : (
        <div className="flex-column" style={{ gap: '32px' }}>
          
          {/* BP Trends Chart */}
          {bpData.length > 0 && (
            <div className="card flex-column" style={{ gap: '16px' }}>
              <h3 className="flex-align-center" style={{ gap: '8px' }}>
                <Heart size={20} className="text-danger" />
                Blood Pressure Trends (mmHg)
              </h3>
              
              <div style={{ width: '100%', height: '300px', fontSize: 'var(--font-xs)' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bpData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="timestamp" tickFormatter={formatChartDate} stroke="var(--text-muted)" />
                    <YAxis domain={[40, 200]} stroke="var(--text-muted)" />
                    <Tooltip
                      labelFormatter={formatTooltipDate}
                      contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                    <Legend />
                    <ReferenceLine y={120} label="Pre-Hypertension (120 Sys)" stroke="var(--warning)" strokeDasharray="3 3" />
                    <ReferenceLine y={140} label="Hypertension (140 Sys)" stroke="var(--danger)" strokeDasharray="3 3" />
                    <Line
                      type="monotone"
                      dataKey="systolic"
                      name="Systolic (High)"
                      stroke="var(--color-systolic)"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="diastolic"
                      name="Diastolic (Low)"
                      stroke="var(--color-diastolic)"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Glucose & Heart Rate Charts Grid */}
          <div className="grid-2">
            
            {/* Glucose Trend Chart */}
            {glucoseData.length > 0 && (
              <div className="card flex-column" style={{ gap: '16px' }}>
                <h3 className="flex-align-center" style={{ gap: '8px' }}>
                  <Activity size={20} style={{ color: 'var(--color-glucose)' }} />
                  Blood Glucose Trends (mg/dL)
                </h3>
                
                <div style={{ width: '100%', height: '260px', fontSize: 'var(--font-xs)' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={glucoseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                      <XAxis dataKey="timestamp" tickFormatter={formatChartDate} stroke="var(--text-muted)" />
                      <YAxis domain={[50, 250]} stroke="var(--text-muted)" />
                      <Tooltip
                        labelFormatter={formatTooltipDate}
                        contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                      />
                      <Legend />
                      <ReferenceLine y={70} label="Hypoglycemia (<70)" stroke="var(--danger)" strokeDasharray="3 3" />
                      <ReferenceLine y={140} label="Normal Target (<140)" stroke="var(--success)" strokeDasharray="3 3" />
                      <Line
                        type="monotone"
                        dataKey="bloodGlucose"
                        name="Glucose"
                        stroke="var(--color-glucose)"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Heart Rate Trend Chart */}
            {hrData.length > 0 && (
              <div className="card flex-column" style={{ gap: '16px' }}>
                <h3 className="flex-align-center" style={{ gap: '8px' }}>
                  <Activity size={20} style={{ color: 'var(--color-heart)' }} />
                  Heart Rate (BPM)
                </h3>
                
                <div style={{ width: '100%', height: '260px', fontSize: 'var(--font-xs)' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hrData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                      <XAxis dataKey="timestamp" tickFormatter={formatChartDate} stroke="var(--text-muted)" />
                      <YAxis domain={[40, 150]} stroke="var(--text-muted)" />
                      <Tooltip
                        labelFormatter={formatTooltipDate}
                        contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                      />
                      <Legend />
                      <ReferenceLine y={60} label="Normal low (60)" stroke="var(--text-muted)" strokeDasharray="3 3" />
                      <ReferenceLine y={100} label="Tachycardia (100)" stroke="var(--danger)" strokeDasharray="3 3" />
                      <Line
                        type="monotone"
                        dataKey="heartRate"
                        name="Heart Rate"
                        stroke="var(--color-heart)"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Historical Logs List */}
          <div className="card flex-column" style={{ gap: '16px' }}>
            <h3 className="flex-align-center" style={{ gap: '8px' }}>
              <Calendar size={20} className="text-secondary" />
              History of Vital Logs
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px 16px' }}>Date/Time</th>
                    <th style={{ padding: '12px 16px' }}>Blood Pressure</th>
                    <th style={{ padding: '12px 16px' }}>Glucose</th>
                    <th style={{ padding: '12px 16px' }}>HR (BPM)</th>
                    <th style={{ padding: '12px 16px' }}>Weight / Temp</th>
                    <th style={{ padding: '12px 16px' }}>Notes</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vitalLogs.map((log) => (
                    <tr
                      key={log.id}
                      style={{ borderBottom: '1px solid var(--border-color)', transition: 'var(--transition-smooth)' }}
                      className="hover-row"
                    >
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        {new Date(log.timestamp).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {log.systolic && log.diastolic ? `${log.systolic}/${log.diastolic} mmHg` : '-'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {log.bloodGlucose ? `${log.bloodGlucose} mg/dL (${log.glucoseType})` : '-'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>{log.heartRate ? `${log.heartRate} bpm` : '-'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {log.weight ? `${log.weight} kg ` : ''}
                        {log.temperature ? `• ${log.temperature}°C` : ''}
                        {!log.weight && !log.temperature ? '-' : ''}
                      </td>
                      <td style={{ padding: '12px 16px', fontStyle: 'italic', fontSize: 'var(--font-sm)' }}>
                        {log.notes || '-'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-icon-only text-danger"
                          style={{ padding: '6px' }}
                          onClick={() => deleteVitalReading(log.id)}
                          title="Delete record"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
