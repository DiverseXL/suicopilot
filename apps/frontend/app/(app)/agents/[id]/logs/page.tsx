'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useParams } from 'next/navigation';
import { CheckCircle, Clock, Zap, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const ACTION_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  scheduled_check:    { label: 'Scheduled Check',      color: '#3B9EFF', bg: 'rgba(59,158,255,0.1)', icon: Clock },
  paused:             { label: 'Agent Paused',          color: '#FFB800', bg: 'rgba(255,184,0,0.1)',  icon: AlertCircle },
  resumed:            { label: 'Agent Resumed',         color: '#14F195', bg: 'rgba(20,241,149,0.1)', icon: CheckCircle },
  swap:               { label: 'Swap Executed',         color: '#9945FF', bg: 'rgba(153,69,255,0.1)', icon: Zap },
  dca_buy:            { label: 'DCA Buy',               color: '#14F195', bg: 'rgba(20,241,149,0.1)',  icon: Zap },
  dca_swap:           { label: 'DCA Swap',              color: '#14F195', bg: 'rgba(20,241,149,0.1)',  icon: Zap },
  dca_swap_manual:    { label: 'Manual DCA Swap',       color: '#9945FF', bg: 'rgba(153,69,255,0.1)', icon: Zap },
  health_check:       { label: 'Health Check',          color: '#3B9EFF', bg: 'rgba(59,158,255,0.1)', icon: CheckCircle },
  performance_report: { label: 'Performance Report',    color: '#FFB800', bg: 'rgba(255,184,0,0.1)',  icon: RefreshCw },
  monitor:            { label: 'Monitoring',            color: '#606070', bg: 'rgba(96,96,112,0.1)',  icon: Clock },
};

export default function LogsPage() {
  const params = useParams();
  const id = params.id as string;
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadLogs() {
    try {
      const res = await api.get(`/api/agents/${id}/logs`);
      setLogs([...res.data.logs].reverse());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 30000);
    return () => clearInterval(interval);
  }, [id]);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <Link href={`/agents/${id}`} style={{
            fontSize: 12, color: 'rgba(96,96,112,1)', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 10
          }}>
            ← Back to agent
          </Link>
          <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, marginBottom: 6 }}>
            Execution Log
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(120,120,136,1)', margin: 0 }}>
            Every entry is an immutable blob stored on Walrus
          </p>
        </div>
        <button onClick={() => { setRefreshing(true); loadLogs(); }} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '9px 16px', borderRadius: 9, cursor: 'pointer',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(160,160,176,1)', fontSize: 13
        }}>
          <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Entries', value: logs.length, color: '#9945FF' },
          { label: 'Successful', value: logs.filter(l => l.status === 'checked' || l.status === 'ok').length, color: '#14F195' },
          { label: 'Walrus Blobs', value: logs.filter(l => l.blobId).length, color: '#3B9EFF' },
        ].map((s, i) => (
          <div key={i} style={{
            padding: '16px 20px', borderRadius: 12,
            background: 'rgba(13,13,20,0.8)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'monospace',
              color: s.color, marginBottom: 4 }}>
              {loading ? '...' : s.value}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(96,96,112,1)',
              textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'monospace' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Log entries */}
      <div style={{
        background: 'rgba(13,13,20,0.8)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16, overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'grid', gridTemplateColumns: '1fr 1fr auto',
          fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.15em',
          textTransform: 'uppercase', color: 'rgba(96,96,112,1)'
        }}>
          <span>Action</span>
          <span>Timestamp</span>
          <span>Proof</span>
        </div>

        {loading ? (
          <div style={{ padding: 20 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ height: 64, borderRadius: 10, marginBottom: 8,
                background: 'rgba(255,255,255,0.03)', animation: 'shimmer 1.5s infinite' }} />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <Clock size={32} style={{ color: 'rgba(96,96,112,1)', marginBottom: 12 }} />
            <div style={{ fontSize: 14, color: 'rgba(96,96,112,1)' }}>
              No logs yet — entries appear every minute when the agent runs
            </div>
          </div>
        ) : (
          <div>
            {logs.map((log, i) => {
              const cfg = ACTION_CONFIG[log.action] ?? {
                label: log.action ?? 'unknown',
                color: '#9945FF',
                bg: 'rgba(153,69,255,0.1)',
                icon: Zap
              };
              const Icon = cfg.icon;
              return (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr auto',
                  padding: '16px 24px', alignItems: 'center', gap: 16,
                  borderBottom: i < logs.length - 1
                    ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  transition: 'background 0.15s'
                }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}>

                  {/* Action */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                      background: cfg.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Icon size={16} style={{ color: cfg.color }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 3 }}>
                        {cfg.label}
                      </div>
                      <span style={{
                        fontSize: 10, padding: '2px 7px', borderRadius: 5,
                        background: log.status === 'ok' || log.status === 'checked'
                          ? 'rgba(20,241,149,0.1)' : 'rgba(255,68,68,0.1)',
                        color: log.status === 'ok' || log.status === 'checked'
                          ? '#14F195' : '#FF4444',
                        fontFamily: 'monospace', textTransform: 'uppercase',
                        letterSpacing: '0.08em'
                      }}>
                        {log.status ?? 'unknown'}
                      </span>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div>
                    <div style={{ fontSize: 13, color: '#fff', marginBottom: 3 }}>
                      {log.timestamp 
                        ? new Date(log.timestamp).toLocaleTimeString()
                        : 'No time'}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(96,96,112,1)' }}>
                      {log.timestamp
                        ? new Date(log.timestamp).toLocaleDateString()
                        : 'No date'}
                    </div>
                  </div>

                  {/* Walrus proof */}
                  {log.blobId ? (
                    <a href={`https://aggregator.walrus-testnet.walrus.space/v1/${log.blobId}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '7px 12px', borderRadius: 8,
                        background: 'rgba(185,123,255,0.1)',
                        border: '1px solid rgba(185,123,255,0.2)',
                        color: '#B97BFF', textDecoration: 'none',
                        fontSize: 11, fontFamily: 'monospace',
                        whiteSpace: 'nowrap'
                      }}>
                      <ExternalLink size={11} />
                      {log.blobId.slice(0, 10)}...
                    </a>
                  ) : (
                    <span style={{ fontSize: 11, color: 'rgba(96,96,112,1)' }}>No blob</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
