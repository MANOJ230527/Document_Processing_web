import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import FileUpload from '../components/FileUpload';
import JobsTable from '../components/JobsTable';
import { useAuth } from '../context/AuthContext';
import { getJobs } from '../services/fileService';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [refreshTick, setRefreshTick] = useState(0);
  const [toast, setToast]             = useState('');
  const [stats, setStats]             = useState({ total:0, processing:0, done:0, failed:0 });

  const loadStats = useCallback(async () => {
    try {
      const { jobs } = await getJobs();
      setStats({
        total:      jobs.length,
        processing: jobs.filter(j=>j.status==='UPLOADED'||j.status==='PROCESSING').length,
        done:       jobs.filter(j=>j.status==='DONE').length,
        failed:     jobs.filter(j=>j.status==='FAILED').length,
      });
    } catch {}
  }, []);

  useEffect(() => { loadStats(); }, [loadStats, refreshTick]);
  useEffect(() => {
    const t = setInterval(loadStats, 3000);
    return () => clearInterval(t);
  }, [loadStats]);

  const onJobCreated = data => {
    setRefreshTick(t => t+1);
    showToast(`"${data.fileName}" uploaded — processing started`);
  };

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const first = user?.name?.split(' ')[0] || '';

  const STAT_CARDS = [
    { key:'total',      icon:'📁', label:'Total jobs',    color:'total'      },
    { key:'processing', icon:'⚙️',  label:'In progress',  color:'processing' },
    { key:'done',       icon:'✅', label:'Completed',     color:'done'       },
    { key:'failed',     icon:'❌', label:'Failed',        color:'failed'     },
  ];

  return (
    <div className="dashboard">
      <Navbar />

      <div className="dashboard-body">
        {/* Title */}
        <div className="dash-title-row">
          <div>
            <div className="dash-title">{greeting}{first ? `, ${first}` : ''}!</div>
            <div className="dash-subtitle">Upload files and track their processing status in real time.</div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-row">
          {STAT_CARDS.map((c,i) => (
            <div className="stat-card" key={c.key} style={{animationDelay:`${i*0.05}s`}}>
              <div className={`stat-icon ${c.color}`}>{c.icon}</div>
              <div>
                <div className="stat-num">{stats[c.key]}</div>
                <div className="stat-label">{c.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="dash-grid">
          {/* Left: upload */}
          <div style={{animationDelay:'0.1s'}} className="fade-up">
            <FileUpload onJobCreated={onJobCreated} />
          </div>

          {/* Right: jobs table */}
          <div style={{animationDelay:'0.15s'}} className="fade-up">
            <JobsTable refreshTrigger={refreshTick} />
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast">
          <span className="toast-icon">✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}
