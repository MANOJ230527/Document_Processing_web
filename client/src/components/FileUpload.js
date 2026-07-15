import React, { useState, useRef } from 'react';
import { uploadFile } from '../services/fileService';
import './FileUpload.css';

const ALLOWED = ['application/pdf','image/jpeg','image/jpg','image/png','text/plain'];
const MAX     = 10 * 1024 * 1024;
const fmtSize = b => b < 1024*1024 ? `${(b/1024).toFixed(0)} KB` : `${(b/(1024*1024)).toFixed(1)} MB`;
const getType = m => m==='application/pdf' ? 'pdf' : m?.startsWith('image/') ? 'img' : 'txt';
const getEmoji= m => m==='application/pdf' ? '📄' : m?.startsWith('image/') ? '🖼️' : '📝';

export default function FileUpload({ onJobCreated }) {
  const [dragging, setDragging]   = useState(false);
  const [file, setFile]           = useState(null);
  const [pct, setPct]             = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState('');
  const inputRef = useRef();

  const validate = f => {
    if (!ALLOWED.includes(f.type)) return 'Only PDF, JPG, PNG, or TXT files are allowed.';
    if (f.size > MAX)              return 'File too large — maximum size is 10 MB.';
    return null;
  };

  const choose = f => {
    setError('');
    const e = validate(f);
    if (e) { setError(e); return; }
    setFile(f);
  };

  const onDrop = e => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) choose(f);
  };

  const onInput = e => { if (e.target.files[0]) choose(e.target.files[0]); e.target.value=''; };

  const doUpload = async () => {
    if (!file || uploading) return;
    setUploading(true); setPct(0); setError('');
    try {
      const data = await uploadFile(file, setPct);
      setFile(null); setPct(0);
      onJobCreated && onJobCreated(data);
    } catch(err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally { setUploading(false); }
  };

  const t = getType(file?.type);

  return (
    <div className="upload-card">
      <div className="upload-card-header">
        <div className="upload-card-title">
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none" style={{color:'var(--primary)'}}>
            <path d="M10 14V4M10 4L7 7M10 4l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 16h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          Upload File
        </div>
        <div className="upload-card-sub">Drag &amp; drop or click to browse</div>
      </div>

      <div className="upload-card-body">
        {/* Drop zone */}
        <div
          className={`drop-zone ${dragging ? 'drag-over' : ''} ${file ? 'file-chosen' : ''}`}
          onDragOver={e=>{e.preventDefault();setDragging(true);}}
          onDragLeave={()=>setDragging(false)}
          onDrop={onDrop}
          onClick={()=>{ if(!file && !uploading) inputRef.current?.click(); }}
        >
          <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.txt"
            style={{display:'none'}} onChange={onInput}/>

          {!file ? (
            <>
              <div className="dz-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M7 16a4 4 0 0 1-.88-7.903A5 5 0 1 1 15.9 6L16 6a5 5 0 0 1 1 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="dz-title">Drop your file here, or <span>browse</span></p>
              <p className="dz-hint">Supports PDF, JPG, PNG, TXT — up to 10 MB</p>
            </>
          ) : (
            <div className="file-chip">
              <div className={`file-chip-icon t-${t}`}>{getEmoji(file.type)}</div>
              <div className="file-chip-info">
                <div className="file-chip-name">{file.name}</div>
                <div className="file-chip-size">{fmtSize(file.size)}</div>
              </div>
              {!uploading && (
                <button className="file-chip-remove"
                  onClick={e=>{e.stopPropagation();setFile(null);setError('');}}>
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="upload-err">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{flexShrink:0,marginTop:1}}>
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 5v3M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}

        {/* Upload progress */}
        {uploading && (
          <div className="upload-prog">
            <div className="upload-prog-row"><span>Uploading…</span><span>{pct}%</span></div>
            <div className="upload-prog-track">
              <div className="upload-prog-fill" style={{width:`${pct}%`}}/>
            </div>
          </div>
        )}

        {/* Upload button */}
        <button className="upload-btn" onClick={doUpload} disabled={!file||uploading}>
          {uploading
            ? <><span className="mini-spinner"/>Uploading…</>
            : <>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 11V3M8 3L5 6M8 3l3 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 13h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Upload &amp; Process
              </>}
        </button>

        {/* Supported types */}
        <div className="type-tags">
          <span className="type-tag pdf">📄 PDF → page count JSON</span>
          <span className="type-tag img">🖼️ Image → resized file</span>
          <span className="type-tag txt">📝 Text → word analysis</span>
        </div>
      </div>
    </div>
  );
}
