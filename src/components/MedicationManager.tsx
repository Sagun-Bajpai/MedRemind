import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { Plus, Trash2, ShieldAlert, ToggleLeft, ToggleRight, X, Clock } from 'lucide-react';

export const MedicationManager: React.FC = () => {
  const { medications, addMedication, deleteMedication, updateMedication } = useHealth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form States
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'as-needed'>('daily');
  const [foodRelation, setFoodRelation] = useState<'before' | 'after' | 'with' | 'none'>('none');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  
  // Custom list of times
  const [timeInputs, setTimeInputs] = useState<string[]>(['08:00']);

  const handleAddTimeInput = () => {
    setTimeInputs([...timeInputs, '12:00']);
  };

  const handleRemoveTimeInput = (index: number) => {
    if (timeInputs.length === 1) return; // Must have at least 1 time
    setTimeInputs(timeInputs.filter((_, idx) => idx !== index));
  };

  const handleTimeChange = (index: number, val: string) => {
    const updated = [...timeInputs];
    updated[index] = val;
    setTimeInputs(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dosage) return;

    addMedication({
      name,
      dosage,
      frequency,
      times: frequency === 'as-needed' ? [] : timeInputs,
      foodRelation,
      startDate,
      notes: notes || undefined,
    });

    // Reset Form
    setName('');
    setDosage('');
    setFrequency('daily');
    setFoodRelation('none');
    setNotes('');
    setTimeInputs(['08:00']);
    setIsModalOpen(false);
  };

  return (
    <div className="flex-column" style={{ gap: '24px' }}>
      {/* Header and Add Button */}
      <div className="flex-between">
        <div>
          <h2>Manage Medications</h2>
          <p className="text-muted">Maintain your active prescriptions and intake schedules.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Add Medication
        </button>
      </div>

      {/* Medication List */}
      {medications.length === 0 ? (
        <div className="card" style={{ padding: '60px 0', textAlign: 'center' }}>
          <ShieldAlert size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3>No Medications Added</h3>
          <p className="text-muted" style={{ maxWidth: '400px', margin: '8px auto' }}>
            Click the "Add Medication" button above to add your first medicine and configure its intake times.
          </p>
        </div>
      ) : (
        <div className="grid-2">
          {medications.map((med) => (
            <div
              key={med.id}
              className="card flex-column"
              style={{
                gap: '16px',
                borderLeft: `5px solid ${med.active ? 'var(--primary)' : 'var(--text-muted)'}`,
                opacity: med.active ? 1 : 0.6,
              }}
            >
              <div className="flex-between">
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ textDecoration: med.active ? 'none' : 'line-through' }}>{med.name}</h3>
                  <span className="badge badge-success" style={{ marginTop: '6px' }}>
                    {med.frequency}
                  </span>
                </div>
                
                {/* Active/Inactive Toggle and Trash */}
                <div className="flex-gap-1">
                  <button
                    className="btn btn-secondary btn-icon-only"
                    onClick={() => updateMedication(med.id, { active: !med.active })}
                    title={med.active ? 'Deactivate medication' : 'Activate medication'}
                  >
                    {med.active ? (
                      <ToggleRight size={22} className="text-success" />
                    ) : (
                      <ToggleLeft size={22} className="text-muted" />
                    )}
                  </button>
                  <button
                    className="btn btn-secondary btn-icon-only text-danger"
                    onClick={() => deleteMedication(med.id)}
                    title="Delete medication"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {/* Details grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: 'var(--font-sm)', textAlign: 'left' }}>
                <div>
                  <strong className="text-muted" style={{ display: 'block' }}>Dosage:</strong>
                  <span>{med.dosage}</span>
                </div>
                <div>
                  <strong className="text-muted" style={{ display: 'block' }}>Food Constraint:</strong>
                  <span>{med.foodRelation !== 'none' ? `Take ${med.foodRelation} meals` : 'No constraints'}</span>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <strong className="text-muted" style={{ display: 'block' }}>Starting Date:</strong>
                  <span>{new Date(med.startDate).toLocaleDateString()}</span>
                </div>
                
                {med.times.length > 0 && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <strong className="text-muted" style={{ display: 'block', marginBottom: '4px' }}>Scheduled Times:</strong>
                    <div className="flex-gap-1" style={{ flexWrap: 'wrap' }}>
                      {med.times.map((time, i) => (
                        <span
                          key={i}
                          className="flex-align-center"
                          style={{
                            gap: '4px',
                            backgroundColor: 'var(--bg-app)',
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-color)',
                          }}
                        >
                          <Clock size={12} /> {time}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {med.notes && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <strong className="text-muted" style={{ display: 'block' }}>Notes:</strong>
                    <span style={{ fontStyle: 'italic' }}>{med.notes}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Medication Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Medication</h3>
              <button className="btn btn-secondary btn-icon-only" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body flex-column" style={{ gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Medication Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Metformin, Lisinopril"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Dosage *</label>
                  <input
                    type="text"
                    required
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g. 500mg, 1 tablet"
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Frequency</label>
                    <select
                      value={frequency}
                      onChange={(e: any) => setFrequency(e.target.value)}
                      className="form-select"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="as-needed">As Needed (PRN)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Food Relation</label>
                    <select
                      value={foodRelation}
                      onChange={(e: any) => setFoodRelation(e.target.value)}
                      className="form-select"
                    >
                      <option value="none">No constraint</option>
                      <option value="before">Before meals</option>
                      <option value="after">After meals</option>
                      <option value="with">With meals</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="form-input"
                  />
                </div>

                {/* Dose Times input (if not PRN) */}
                {frequency !== 'as-needed' && (
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
                      <span>Intake Times</span>
                      <button
                        type="button"
                        onClick={handleAddTimeInput}
                        className="btn btn-secondary"
                        style={{ padding: '2px 8px', fontSize: 'var(--font-xs)', marginLeft: 'auto' }}
                      >
                        + Add Time
                      </button>
                    </label>
                    
                    <div className="flex-column" style={{ gap: '8px', marginTop: '8px' }}>
                      {timeInputs.map((time, idx) => (
                        <div key={idx} className="flex-align-center" style={{ gap: '8px' }}>
                          <input
                            type="time"
                            value={time}
                            onChange={(e) => handleTimeChange(idx, e.target.value)}
                            className="form-input"
                            style={{ flex: 1 }}
                          />
                          <button
                            type="button"
                            disabled={timeInputs.length === 1}
                            onClick={() => handleRemoveTimeInput(idx)}
                            className="btn btn-secondary text-danger"
                            style={{ padding: '8px' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Doctor says take with full glass of water."
                    rows={3}
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
