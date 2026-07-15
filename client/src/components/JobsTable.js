import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getJobs, downloadOriginal, downloadOutput } from '../services/fileService';
import './JobsTable.css';

const STATUSES = {
  UPLOADED:   { label: 'Queued',     cls: 'sp-uploaded'   },
  PROCESSING: { label: 'Processing', cls: 'sp-processing' },
  DONE:       { label: 'Done',       cls: 'sp-done'       },
  FAILED:     { label: 'Failed',     cls: 'sp-failed'     },
};

const mimeShort = m => m==='application/pdf' ? 'PDF' : m?.startsWith('image/') ? m.split('/')[1].toUpperCase() : 'TXT';
const fileType  = m => m==='application/pdf' ? 'pdf' : m?.startsWith('image/') ? 'img' : 'txt';
const fileEmoji = m => m==='application/pdf' ? '📄' : m?.startsWith('image/') ? '🖼️' : '📝';
const fmtSize   = b => !b ? '—' : b < 1024*1024 ? `${(b/1024).toFixed(0)} KB` : `${(b/(1024*1024)).toFixed(1)} MB`;
const fmtDate   = d => !d ? '—' : new Date(d).toLocaleDateString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
const progClass = s => s==='DONE' ? 'pf-done' : s==='FAILED' ? 'pf-failed' : 'pf-active';

export default function JobsTable({ refreshTrigger }) {
  const [jobs, setJobs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const timerRef = useRef(null);

  const load = useCallback(async (silent=false) => {
    try {
      if (!silent) setLoading(true);
      const { jobs: j } = await getJobs();
      setJobs(j || []);
      setError('');
    } catch { setError('Could not load jobs. Please refresh.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    timerRef.current = setInterval(() => load(true), 3000);
    return () => clearInterval(timerRef.current);
  }, [load, refreshTrigger]);

  const hasActive = jobs.some(j => j.status==='UPLOADED' || j.status==='PROCESSING');

  /* ── States ── */
  if (loading) return (
    <div className="jobs-card">
      <div className="jobs-card-header">
        <div className="jobs-card-left"><span className="jobs-card-title">Processing Jobs</span></div>
      </div>
      <div className="jobs-state">
        <div className="jobs-state-icon">
          <div className="spinner" style={{width:20,height:20}}/>
        </div>
        <div className="jobs-state-title">Loading jobs…</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="jobs-card">
      <div className="jobs-card-header">
        <div className="jobs-card-left"><span className="jobs-card-title">Processing Jobs</span></div>
      </div>
      <div className="jobs-err-state">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M8 5v3M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        {error}
      </div>
    </div>
  );

  return (
    <div className="jobs-card">
      {/* Header */}
      <div className="jobs-card-header">
        <div className="jobs-card-left">
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none" style={{color:'var(--gray-500)'}}>
            <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/>
            <path d="M6 7h8M6 10h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <span className="jobs-card-title">Processing Jobs</span>
          {jobs.length > 0 && <span className="jobs-count-badge">{jobs.length}</span>}
          {hasActive && (
            <div className="jobs-live-badge"><span className="live-dot"/>Live</div>
          )}
        </div>
        <button className="jobs-refresh" onClick={() => load()}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M2 8a6 6 0 1 1 1.2 3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M2 12V8h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Empty */}
      {jobs.length === 0 ? (
        <div className="jobs-state">
          <div className="jobs-state-icon">
            <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="6" width="32" height="36" rx="4" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M16 18h16M16 24h10M16 30h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="jobs-state-title">No jobs yet</div>
          <div className="jobs-state-sub">Upload a file above to get started</div>
        </div>
      ) : (
        <div className="jobs-table-wrap">
          <table className="jobs-table">
            <thead>
              <tr>
                <th>File</th>
                <th>Type</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => {
                const f   = job.fileId;
                const st  = STATUSES[job.status] || STATUSES.UPLOADED;
                const ft  = fileType(f?.mimeType);
                return (
                  <tr key={job._id}>
                    {/* File */}
                    <td>
                      <div className="file-cell">
                        <div className={`file-cell-icon fi-${ft}`}>{fileEmoji(f?.mimeType)}</div>
                        <div>
                          <div className="file-cell-name" title={f?.originalName}>{f?.originalName || '—'}</div>
                          <div className="file-cell-meta">{fmtSize(f?.size)}</div>
                        </div>
                      </div>
                    </td>
                    {/* Type */}
                    <td><span className="mono-cell">{mimeShort(f?.mimeType)}</span></td>
                    {/* Status */}
                    <td>
                      <span className={`status-pill ${st.cls}`}>
                        <span className="s-dot"/>
                        {st.label}
                      </span>
                    </td>
                    {/* Progress */}
                    <td className="prog-cell">
                      <div className="prog-wrap">
                        <div className="prog-track">
                          <div className={`prog-fill ${progClass(job.status)}`}
                            style={{width:`${job.progress}%`}}/>
                        </div>
                        <span className="prog-pct">{job.progress}%</span>
                      </div>
                    </td>
                    {/* Date */}
                    <td><span className="mono-cell">{fmtDate(job.createdAt)}</span></td>
                    {/* Actions */}
                    <td>
                      <div className="action-wrap">
                        {job.status==='DONE' && (
                          <button className="btn-dl btn-dl-output"
                            onClick={()=>downloadOutput(job._id)}>
                            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                              <path d="M7 1v8M7 9L4.5 6.5M7 9l2.5-2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 11h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                            </svg>
                            Output
                          </button>
                        )}
                        {f?._id && (
                          <button className="btn-dl btn-dl-original"
                            onClick={()=>downloadOriginal(f._id, f.originalName)}>
                            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                              <path d="M7 1v8M7 9L4.5 6.5M7 9l2.5-2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 11h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                            </svg>
                            Original
                          </button>
                        )}
                        {job.status==='FAILED' && (
                          <span className="err-label" title={job.errorMessage}>
                            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/>
                              <path d="M7 4.5v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                            </svg>
                            {job.errorMessage
                              ? job.errorMessage.length > 35 ? job.errorMessage.slice(0,35)+'…' : job.errorMessage
                              : 'Processing failed'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
