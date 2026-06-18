import React, { useState, useRef } from 'react';
import { useHealth } from '../context/HealthContext';
import { Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const ReportExport: React.FC = () => {
  const { medications, intakeLogs, vitalLogs } = useHealth();
  const [patientName, setPatientName] = useState('John Doe');
  const [dateRange, setDateRange] = useState<'7' | '30' | 'all'>('7');
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Filter logs by date range
  const getFilteredData = () => {
    const rangeDays = dateRange === '7' ? 7 : dateRange === '30' ? 30 : 9999;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - rangeDays);

    const filteredIntakes = intakeLogs.filter((log) => new Date(log.timestamp) >= cutoffDate);
    const filteredVitals = vitalLogs.filter((log) => new Date(log.timestamp) >= cutoffDate);

    return { filteredIntakes, filteredVitals };
  };

  const { filteredIntakes, filteredVitals } = getFilteredData();

  // Statistics
  const totalDoses = filteredIntakes.length;
  const takenDoses = filteredIntakes.filter((l) => l.status === 'taken').length;
  const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

  // Generate PDF
  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);

    try {
      const element = reportRef.current;
      
      // Ensure element styles are fully captured (force white background, layout widths for pdf)
      const canvas = await html2canvas(element, {
        scale: 2, // Enhances text resolution in the PDF
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Setup PDF document (A4 size: 210mm x 297mm)
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // Width of A4 in mm
      const pageHeight = 297; // Height of A4 in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Handle multi-page PDFs if content is long
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Health_Report_${patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF Generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex-column" style={{ gap: '24px' }}>
      {/* Configuration Header */}
      <div className="flex-between">
        <div>
          <h2>Export Medical Reports</h2>
          <p className="text-muted">Compile schedules, logs, and vital metrics into a clean PDF summary for your doctor.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleExportPDF}
          disabled={isExporting}
          style={{ opacity: isExporting ? 0.7 : 1 }}
        >
          {isExporting ? (
            <>Generating...</>
          ) : (
            <>
              <Download size={20} /> Export PDF
            </>
          )}
        </button>
      </div>

      <div className="grid-3" style={{ gap: '24px', alignItems: 'start' }}>
        {/* Parameters Input Widget */}
        <div className="card flex-column" style={{ gap: '16px', gridColumn: 'span 1' }}>
          <h3>Report Settings</h3>
          
          <div className="form-group">
            <label className="form-label">Patient Name</label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="form-input"
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Date Range</label>
            <select
              value={dateRange}
              onChange={(e: any) => setDateRange(e.target.value)}
              className="form-select"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="all">Full History</option>
            </select>
          </div>

          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-app)',
              fontSize: 'var(--font-xs)',
              textAlign: 'left',
            }}
          >
            <strong style={{ display: 'block', marginBottom: '4px' }}>Medical Notice:</strong>
            <span className="text-muted">
              This report compiles self-recorded client logs and metrics. Always consult a certified healthcare professional before altering medication plans.
            </span>
          </div>
        </div>

        {/* Live PDF Report Preview Page */}
        <div className="card flex-column" style={{ gridColumn: 'span 2', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--font-sm)', fontWeight: 700 }} className="text-muted">
              Report Document Preview (Print Area)
            </span>
            <span className="badge badge-success">
              Live Preview
            </span>
          </div>

          {/* Styled Report Canvas Area */}
          <div
            ref={reportRef}
            style={{
              padding: '40px',
              backgroundColor: '#ffffff',
              color: '#000000',
              fontFamily: 'system-ui, sans-serif',
              textAlign: 'left',
              width: '100%',
              minHeight: '297mm', // A4 aspect-ratio
            }}
          >
            {/* Report Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #0f172a', paddingBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '28px', color: '#0f172a', margin: 0, fontWeight: 800 }}>MEDREMIND HEALTH REPORT</h1>
                <p style={{ margin: '4px 0 0', color: '#475569', fontSize: '14px' }}>Patient-Logged Care Summary</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ display: 'block', fontSize: '15px' }}>Patient Name: {patientName}</strong>
                <span style={{ fontSize: '13px', color: '#475569' }}>
                  Generated: {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Scope info */}
            <div style={{ display: 'flex', gap: '16px', margin: '24px 0', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Report Interval</span>
                <strong style={{ fontSize: '16px' }}>
                  {dateRange === '7' ? 'Last 7 Days' : dateRange === '30' ? 'Last 30 Days' : 'All Recorded History'}
                </strong>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Adherence Rate</span>
                <strong style={{ fontSize: '16px', color: adherenceRate >= 85 ? '#10b981' : '#f59e0b' }}>
                  {adherenceRate}% Compliance
                </strong>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Vitals Logged</span>
                <strong style={{ fontSize: '16px' }}>{filteredVitals.length} records</strong>
              </div>
            </div>

            {/* Configured Medications */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px', color: '#0f172a' }}>
                Configured Medication Regimen
              </h3>
              {medications.length === 0 ? (
                <p style={{ fontStyle: 'italic', color: '#64748b' }}>No medications listed in schedule.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', color: '#475569', fontSize: '13px' }}>
                      <th style={{ padding: '8px 0' }}>Medication Name</th>
                      <th style={{ padding: '8px 0' }}>Dosage</th>
                      <th style={{ padding: '8px 0' }}>Frequency</th>
                      <th style={{ padding: '8px 0' }}>Timings</th>
                      <th style={{ padding: '8px 0' }}>Meal Relation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medications.map((med) => (
                      <tr key={med.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                        <td style={{ padding: '10px 0', fontWeight: 600 }}>{med.name}</td>
                        <td style={{ padding: '10px 0' }}>{med.dosage}</td>
                        <td style={{ padding: '10px 0' }}>
                          <span style={{ textTransform: 'capitalize' }}>{med.frequency}</span>
                        </td>
                        <td style={{ padding: '10px 0' }}>{med.times.length > 0 ? med.times.join(', ') : 'As needed'}</td>
                        <td style={{ padding: '10px 0' }}>
                          {med.foodRelation !== 'none' ? `Take ${med.foodRelation} meals` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Vitals History Log */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px', color: '#0f172a' }}>
                Recorded Vitals Readings
              </h3>
              {filteredVitals.length === 0 ? (
                <p style={{ fontStyle: 'italic', color: '#64748b' }}>No vital signs recorded in this interval.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', color: '#475569', fontSize: '13px' }}>
                      <th style={{ padding: '8px 0' }}>Date & Time</th>
                      <th style={{ padding: '8px 0' }}>BP (mmHg)</th>
                      <th style={{ padding: '8px 0' }}>Glucose (mg/dL)</th>
                      <th style={{ padding: '8px 0' }}>Heart Rate</th>
                      <th style={{ padding: '8px 0' }}>Weight / Temp</th>
                      <th style={{ padding: '8px 0' }}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVitals.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                        <td style={{ padding: '8px 0' }}>
                          {new Date(log.timestamp).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td style={{ padding: '8px 0' }}>
                          {log.systolic && log.diastolic ? `${log.systolic}/${log.diastolic}` : '-'}
                        </td>
                        <td style={{ padding: '8px 0' }}>
                          {log.bloodGlucose ? `${log.bloodGlucose} (${log.glucoseType})` : '-'}
                        </td>
                        <td style={{ padding: '8px 0' }}>{log.heartRate ? `${log.heartRate} BPM` : '-'}</td>
                        <td style={{ padding: '8px 0' }}>
                          {log.weight ? `${log.weight}kg` : ''}
                          {log.temperature ? ` • ${log.temperature}°C` : ''}
                          {!log.weight && !log.temperature ? '-' : ''}
                        </td>
                        <td style={{ padding: '8px 0', fontStyle: 'italic', color: '#475569', fontSize: '13px' }}>
                          {log.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Adherence Details */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px', color: '#0f172a' }}>
                Medication Compliance Summary
              </h3>
              {filteredIntakes.length === 0 ? (
                <p style={{ fontStyle: 'italic', color: '#64748b' }}>No intake log history recorded in this interval.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', color: '#475569', fontSize: '13px' }}>
                      <th style={{ padding: '8px 0' }}>Intake Time</th>
                      <th style={{ padding: '8px 0' }}>Medication</th>
                      <th style={{ padding: '8px 0' }}>Dose</th>
                      <th style={{ padding: '8px 0' }}>Logged Scheduled Time</th>
                      <th style={{ padding: '8px 0' }}>Compliance Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIntakes.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                        <td style={{ padding: '8px 0' }}>
                          {new Date(log.timestamp).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td style={{ padding: '8px 0', fontWeight: 600 }}>{log.medicationName}</td>
                        <td style={{ padding: '8px 0' }}>{log.dosage}</td>
                        <td style={{ padding: '8px 0' }}>{log.scheduledTime}</td>
                        <td style={{ padding: '8px 0' }}>
                          <span
                            style={{
                              color: log.status === 'taken' ? '#10b981' : '#ef4444',
                              fontWeight: 700,
                            }}
                          >
                            {log.status === 'taken' ? 'TAKEN' : 'MISSED'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Disclaimer */}
            <div style={{ marginTop: '50px', borderTop: '1px solid #cbd5e1', paddingTop: '16px', fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
              Disclaimer: MedRemind compiles records input directly by users. This document is a report of self-recorded symptoms and logs and should not replace clinical diagnostics.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
