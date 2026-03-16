import React, { useState, useRef, useCallback } from 'react';
import {
  UploadCloud, FileText, Clipboard, Download, X, CheckCircle,
  ChevronRight, Loader2, Zap, AlertCircle, FileDown, Table2
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

const API = process.env.REACT_APP_BACKEND_URL;

// ─────────────────────── Utility ───────────────────────

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Badge({ children, variant = 'default' }) {
  const styles = {
    default: 'bg-primary/10 text-primary border border-primary/20',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    muted: 'bg-subtle text-muted-foreground border border-border',
  };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', styles[variant])}>
      {children}
    </span>
  );
}

// ─────────────────────── Export Utils ───────────────────────

function exportCSV(actionItems, summary) {
  const headers = ['Assignee', 'Assigner', 'Action', 'Due Date'];
  const rows = actionItems.map(i => [
    `"${i.assignee}"`, `"${i.assigner}"`, `"${i.action}"`, `"${i.due_date}"`
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `meetflow-action-items-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportPDF(actionItems, summary, keyDecisions) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(2, 8, 23);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(99, 102, 241);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('MeetFlow', 15, 25);
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 15, 34);

  let y = 55;

  // Summary
  if (summary) {
    doc.setTextColor(241, 245, 249);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Meeting Summary', 15, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    const summaryLines = doc.splitTextToSize(summary, pageWidth - 30);
    doc.text(summaryLines, 15, y);
    y += summaryLines.length * 5 + 12;
  }

  // Key Decisions
  if (keyDecisions && keyDecisions.length > 0) {
    doc.setTextColor(241, 245, 249);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Decisions', 15, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    keyDecisions.forEach((d, i) => {
      const lines = doc.splitTextToSize(`${i + 1}. ${d}`, pageWidth - 30);
      doc.text(lines, 15, y);
      y += lines.length * 5 + 3;
    });
    y += 8;
  }

  // Action Items Table
  if (actionItems && actionItems.length > 0) {
    doc.setTextColor(241, 245, 249);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Action Items', 15, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [['Assignee', 'Assigner', 'Action', 'Due Date']],
      body: actionItems.map(i => [i.assignee, i.assigner, i.action, i.due_date]),
      headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fillColor: [15, 23, 42], textColor: [148, 163, 184], fontSize: 9 },
      alternateRowStyles: { fillColor: [30, 41, 59] },
      styles: { lineColor: [30, 41, 59], lineWidth: 0.1 },
      margin: { left: 15, right: 15 },
    });
  }

  doc.save(`meetflow-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ─────────────────────── Components ───────────────────────

function ProgressBar({ progress }) {
  return (
    <div className="w-full h-1.5 bg-subtle rounded-full overflow-hidden">
      <div
        className="progress-bar h-full"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card p-6 space-y-4 animate-fade-in">
      <div className="skeleton h-5 w-1/3" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-4/5" />
      <div className="skeleton h-4 w-3/5" />
    </div>
  );
}

function SummaryCard({ summary }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card glow-hover p-6 animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-heading font-semibold text-foreground">Meeting Summary</h3>
        </div>
        <button
          data-testid="copy-summary-btn"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-primary/10"
        >
          {copied ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <Clipboard className="h-3.5 w-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
    </div>
  );
}

function ActionItemsTable({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="glass-card p-8 text-center animate-fade-up-delay-1">
        <div className="p-3 rounded-full bg-muted inline-block mb-3">
          <Table2 className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm">No action items detected in the transcript.</p>
      </div>
    );
  }

  return (
    <div className="glass-card glow-hover animate-fade-up-delay-1 overflow-hidden">
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-accent/10">
            <Zap className="h-4 w-4 text-accent" />
          </div>
          <h3 className="font-heading font-semibold">Action Items</h3>
          <Badge variant="default">{items.length}</Badge>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full data-table" data-testid="action-items-table">
          <thead>
            <tr>
              <th className="text-left">Assignee</th>
              <th className="text-left">Assigner</th>
              <th className="text-left">Action</th>
              <th className="text-left">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                      {item.assignee?.[0]?.toUpperCase() || '?'}
                    </span>
                    <span className="text-foreground font-medium">{item.assignee || 'Unknown'}</span>
                  </span>
                </td>
                <td className="text-muted-foreground">{item.assigner || 'Meeting'}</td>
                <td className="text-muted-foreground max-w-xs">{item.action}</td>
                <td>
                  <Badge variant="warning">{item.due_date}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KeyDecisionsCard({ decisions }) {
  if (!decisions || decisions.length === 0) return null;

  return (
    <div className="glass-card glow-hover p-6 animate-fade-up-delay-2">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-emerald-500/10">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
        </div>
        <h3 className="font-heading font-semibold">Key Decisions</h3>
        <Badge variant="success">{decisions.length}</Badge>
      </div>
      <ul className="space-y-3">
        {decisions.map((d, i) => (
          <li key={i} className="flex items-start gap-3">
            <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span className="text-sm text-muted-foreground leading-relaxed">{d}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExportBar({ result }) {
  return (
    <div className="flex flex-wrap gap-3 animate-fade-up-delay-3">
      <button
        data-testid="export-csv-btn"
        onClick={() => exportCSV(result.action_items, result.summary)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-subtle hover:bg-primary/10 text-muted-foreground hover:text-primary border border-border hover:border-primary/30 text-sm font-medium transition-colors"
      >
        <Download className="h-4 w-4" />
        Export CSV
      </button>
      <button
        data-testid="export-pdf-btn"
        onClick={() => exportPDF(result.action_items, result.summary, result.key_decisions)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-subtle hover:bg-accent/10 text-muted-foreground hover:text-accent border border-border hover:border-accent/30 text-sm font-medium transition-colors"
      >
        <FileDown className="h-4 w-4" />
        Export PDF
      </button>
    </div>
  );
}

// ─────────────────────── Upload Zone ───────────────────────

function UploadZone({ onTextLoaded }) {
  const [activeTab, setActiveTab] = useState('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [transcript, setTranscript] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    const validTypes = ['.vtt', '.txt', '.text', '.srt'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!validTypes.includes(ext)) {
      setError('Please upload a .vtt or .txt file');
      return;
    }
    setError('');
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      setTranscript(text);
    };
    reader.readAsText(file);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, []);

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);

  const handleProcess = async () => {
    const content = activeTab === 'upload' ? transcript : pastedText;
    if (!content || !content.trim()) {
      setError('Please provide transcript content');
      return;
    }
    setError('');
    setResult(null);
    setIsProcessing(true);
    setProgress(0);

    // Animate progress
    const interval = setInterval(() => {
      setProgress(p => p < 85 ? p + Math.random() * 8 : p);
    }, 800);

    try {
      const inputType = uploadedFile?.name?.endsWith('.vtt') ? 'vtt' : 'txt';
      const res = await fetch(`${API}/api/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          input_type: activeTab === 'upload' ? inputType : 'text',
          custom_instructions: customInstructions,
        }),
      });
      clearInterval(interval);
      setProgress(100);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error: ${res.status}`);
      }
      const data = await res.json();
      setTimeout(() => {
        setResult(data);
        setIsProcessing(false);
        setProgress(0);
      }, 400);
    } catch (e) {
      clearInterval(interval);
      setError(e.message || 'Processing failed. Please try again.');
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleClear = () => {
    setUploadedFile(null);
    setTranscript('');
    setPastedText('');
    setResult(null);
    setError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="space-y-8">
      {/* Input Card */}
      <div className="glass-card p-6 space-y-5">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-subtle rounded-lg w-fit">
          {['upload', 'paste'].map(tab => (
            <button
              key={tab}
              data-testid={`tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
                activeTab === tab
                  ? 'bg-paper text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab === 'upload' ? 'Upload File' : 'Paste Text'}
            </button>
          ))}
        </div>

        {/* Upload Zone */}
        {activeTab === 'upload' && (
          <div>
            <input
              ref={fileRef}
              type="file"
              accept=".vtt,.txt,.text,.srt"
              className="hidden"
              data-testid="file-input"
              onChange={e => handleFile(e.target.files?.[0])}
            />
            <div
              className={cn('upload-zone rounded-xl p-10 text-center cursor-pointer', isDragging && 'dragging')}
              onClick={() => fileRef.current?.click()}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              data-testid="upload-zone"
            >
              {uploadedFile ? (
                <div className="space-y-2">
                  <div className="p-3 bg-primary/10 rounded-full inline-block">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <p className="font-medium text-foreground">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                  <Badge variant="success">Ready to process</Badge>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-primary/10 rounded-full inline-block">
                    <UploadCloud className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Drop your file here</p>
                    <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Badge variant="muted">.vtt</Badge>
                    <Badge variant="muted">.txt</Badge>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Paste Zone */}
        {activeTab === 'paste' && (
          <textarea
            data-testid="paste-textarea"
            className="w-full h-48 bg-subtle/50 border border-border rounded-xl p-4 text-sm text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
            placeholder="Paste your meeting transcript here..."
            value={pastedText}
            onChange={e => setPastedText(e.target.value)}
          />
        )}

        {/* Custom instructions */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Custom Instructions (optional)</label>
          <input
            data-testid="custom-instructions-input"
            className="w-full bg-subtle/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            placeholder="e.g., Focus on technical decisions, formal tone..."
            value={customInstructions}
            onChange={e => setCustomInstructions(e.target.value)}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2" data-testid="error-message">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Progress */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Processing transcript with BART model...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <ProgressBar progress={progress} />
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            data-testid="process-btn"
            onClick={handleProcess}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-6 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium text-sm shadow-glow disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
              : <><Zap className="h-4 w-4" /> Generate Minutes</>
            }
          </button>
          {(uploadedFile || pastedText || result) && (
            <button
              data-testid="clear-btn"
              onClick={handleClear}
              className="px-4 py-2.5 rounded-lg bg-subtle hover:bg-muted border border-border text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {isProcessing && !result && (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {result && (
        <div className="space-y-5">
          <ExportBar result={result} />
          <SummaryCard summary={result.summary} />
          <ActionItemsTable items={result.action_items} />
          <KeyDecisionsCard decisions={result.key_decisions} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────── Main App ───────────────────────

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.12)_0%,_transparent_70%)] blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.08)_0%,_transparent_70%)] blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative border-b border-border/50 bg-paper/50 backdrop-blur-sm no-print" data-testid="app-header">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-heading font-bold text-lg tracking-tight">MeetFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default">BART Model</Badge>
            <span className="text-xs text-muted-foreground hidden sm:block">Powered by HuggingFace</span>
          </div>
        </div>
      </header>

      <main className="relative max-w-4xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12 space-y-4 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-2">
            <Zap className="h-3 w-3" />
            BART Meeting Summarizer
          </div>
          <h1 className="font-heading font-bold text-4xl sm:text-5xl text-foreground leading-tight">
            Turn meetings into<br />
            <span className="text-primary">actionable insights</span>
          </h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Upload your meeting transcript (.vtt or .txt) and get an AI-generated summary,
            action items with deadlines, and key decisions — instantly.
          </p>
        </div>

        {/* Upload + Results */}
        <UploadZone />
      </main>

      {/* Footer */}
      <footer className="relative border-t border-border/50 py-6 mt-12 no-print">
        <p className="text-center text-xs text-muted-foreground">
          Made with ♥ by Shreyskar Shukla &nbsp;·&nbsp; Powered by BART + HuggingFace
        </p>
      </footer>
    </div>
  );
}
