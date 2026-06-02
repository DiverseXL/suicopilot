'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';
import {
  Bot,
  Zap,
  Activity,
  Clock,
  Pause,
  Play,
  ExternalLink,
  ArrowLeft,
  Copy,
  Check,
  ShieldCheck,
  Wallet,
  Terminal,
  AlertCircle
} from 'lucide-react';

export default function AgentDashboard() {
  const params = useParams();
  const id = params.id as string;

  const [agent, setAgent] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pausing, setPausing] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);

  async function fetchAgent() {
    try {
      const res = await api.get(`/api/agents/${id}`);
      setAgent(res.data);
    } catch (e: any) {
      setError(e.response?.data?.error ?? e.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLogs() {
    try {
      const res = await api.get(`/api/agents/${id}/logs`);
      setLogs(res.data.logs ?? []);
    } catch {
      // ignore
    }
  }

  async function togglePause() {
    setPausing(true);
    try {
      const res = await api.post(`/api/agents/${id}/pause`);
      setAgent((prev: any) => ({ ...prev, paused: res.data.paused }));
    } catch (e: any) {
      setError(e.response?.data?.error ?? e.message);
    } finally {
      setPausing(false);
    }
  }

  useEffect(() => {
    fetchAgent();
    fetchLogs();
  }, [id]);

  const copyToClipboard = (text: string, type: 'id' | 'wallet') => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedWallet(true);
      setTimeout(() => setCopiedWallet(false), 2000);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '50vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Bot size={40} style={{ color: '#9945FF', animation: 'pulse 1.5s infinite', marginBottom: 16 }} />
          <p style={{ color: 'rgba(160,160,176,1)', fontSize: 16, fontWeight: 500 }}>Loading agent...</p>
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Link href="/agents" style={{
          fontSize: 12, color: 'rgba(96,96,112,1)', textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 20
        }}>
          <ArrowLeft size={13} /> Back to Agents
        </Link>
        <div style={{
          background: 'rgba(255,68,68,0.06)',
          border: '1px solid rgba(255,68,68,0.15)',
          borderRadius: 14, padding: 20, display: 'flex', alignItems: 'center', gap: 12, color: '#FF4444'
        }}>
          <AlertCircle size={20} />
          <span>Error loading agent: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Back Link */}
      <Link href="/agents" style={{
        fontSize: 12, color: 'rgba(96,96,112,1)', textDecoration: 'none',
        display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24,
        transition: 'color 0.15s'
      }}
        onMouseOver={e => e.currentTarget.style.color = '#fff'}
        onMouseOut={e => e.currentTarget.style.color = 'rgba(96,96,112,1)'}>
        <ArrowLeft size={13} /> Back to Agents
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, gap: 16 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.18em',
            textTransform: 'uppercase', color: 'rgba(96,96,112,1)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={12} style={{ color: '#14F195' }} />
            Immutable Agent Stack
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, marginBottom: 6,
            display: 'flex', alignItems: 'center', gap: 10, color: '#fff' }}>
            <Bot size={28} style={{ color: agent?.paused ? '#FFB800' : '#14F195' }} />
            Agent Dashboard
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'rgba(120,120,136,1)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              ID: {id}
            </span>
            <button
              onClick={() => copyToClipboard(id, 'id')}
              style={{
                background: 'none', border: 'none', padding: 4, cursor: 'pointer',
                color: 'rgba(96,96,112,1)', display: 'inline-flex', alignItems: 'center',
                transition: 'color 0.15s'
              }}
              onMouseOver={e => e.currentTarget.style.color = '#fff'}
              onMouseOut={e => e.currentTarget.style.color = 'rgba(96,96,112,1)'}
              title="Copy Agent ID"
            >
              {copiedId ? <Check size={12} style={{ color: '#14F195' }} /> : <Copy size={12} />}
            </button>
          </div>
        </div>

        {/* Status Badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 16px', borderRadius: 10,
          background: agent?.paused ? 'rgba(255,184,0,0.08)' : 'rgba(20,241,149,0.08)',
          border: `1px solid ${agent?.paused ? 'rgba(255,184,0,0.15)' : 'rgba(20,241,149,0.15)'}`,
          flexShrink: 0
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: agent?.paused ? '#FFB800' : '#14F195',
            boxShadow: `0 0 8px ${agent?.paused ? '#FFB800' : '#14F195'}`,
            animation: 'pulse 2s ease-in-out infinite'
          }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: agent?.paused ? '#FFB800' : '#14F195',
            fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {agent?.paused ? 'Paused' : 'Running'}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Strategy Details Card */}
          <div style={{
            background: 'rgba(13,13,20,0.8)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16, padding: '24px'
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={14} style={{ color: '#9945FF' }} /> Strategy Details
            </h3>
            
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(96,96,112,1)', marginBottom: 6 }}>
                Active Intent
              </div>
              <p style={{ fontSize: 15, color: '#fff', lineHeight: 1.5, margin: 0 }}>
                {agent?.intent}
              </p>
            </div>

            {agent?.strategyBlobId && (
              <div style={{
                padding: '12px 16px', borderRadius: 12,
                background: 'rgba(153,69,255,0.05)',
                border: '1px solid rgba(153,69,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(185,123,255,0.8)', marginBottom: 4 }}>
                    Immutable Walrus Storage Blob
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(160,160,176,1)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {agent.strategyBlobId}
                  </div>
                </div>
                <a
                  href={`https://aggregator.walrus-testnet.walrus.space/v1/${agent.strategyBlobId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 12px', borderRadius: 8,
                    background: 'rgba(153,69,255,0.15)', border: '1px solid rgba(153,69,255,0.25)',
                    color: '#B97BFF', fontSize: 12, fontWeight: 500, textDecoration: 'none',
                    transition: 'all 0.15s', flexShrink: 0
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = 'rgba(153,69,255,0.25)'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'rgba(153,69,255,0.15)'; }}
                >
                  View Blob <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>

          {/* Activity Logs Card */}
          <div style={{
            background: 'rgba(13,13,20,0.8)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16, padding: '24px', flex: 1, display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Terminal size={14} style={{ color: '#14F195' }} /> Activity Logs
              </h3>
              <Link href={`/agents/${id}/logs`} style={{
                fontSize: 12, color: '#B97BFF', textDecoration: 'none', fontWeight: 500
              }}>
                View detailed execution logs →
              </Link>
            </div>

            {logs.length === 0 ? (
              <div style={{
                padding: '40px 20px', textAlign: 'center', borderRadius: 12,
                background: 'rgba(5,5,10,0.4)', border: '1px dashed rgba(255,255,255,0.04)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1
              }}>
                <Terminal size={24} style={{ color: 'rgba(96,96,112,1)', marginBottom: 8 }} />
                <span style={{ fontSize: 13, color: 'rgba(96,96,112,1)' }}>No logs captured yet. Check back in a minute.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 380, overflowY: 'auto', paddingRight: 4 }}>
                {logs.slice(0, 4).map((log: any, i: number) => (
                  <div key={i} style={{
                    padding: '12px 14px', borderRadius: 10,
                    background: 'rgba(5,5,10,0.4)',
                    border: '1px solid rgba(255,255,255,0.03)',
                    fontFamily: 'monospace', fontSize: 12
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{
                        padding: '2px 6px', borderRadius: 4,
                        background: log.status === 'ok' || log.status === 'checked' ? 'rgba(20,241,149,0.1)' : 'rgba(255,68,68,0.1)',
                        color: log.status === 'ok' || log.status === 'checked' ? '#14F195' : '#FF4444',
                        fontWeight: 650, fontSize: 10, textTransform: 'uppercase'
                      }}>
                        {log.status ?? 'run'}
                      </span>
                      <span style={{ color: 'rgba(96,96,112,1)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={10} />
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div style={{ color: '#d7c4ff', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.4 }}>
                      {typeof log === 'object' ? JSON.stringify(log.message ?? log, null, 2) : log}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Financial Stats Card */}
          <div style={{
            background: 'rgba(13,13,20,0.8)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16, padding: '24px'
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={14} style={{ color: '#3B9EFF' }} /> Financial Limits
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ padding: '14px', borderRadius: 12, background: 'rgba(5,5,10,0.4)', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ fontSize: 10, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(96,96,112,1)', marginBottom: 4 }}>
                  Daily Limit
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>
                  ${agent?.dailyLimit}
                </div>
              </div>
              <div style={{ padding: '14px', borderRadius: 12, background: 'rgba(5,5,10,0.4)', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ fontSize: 10, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(96,96,112,1)', marginBottom: 4 }}>
                  Spent Today
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#14F195', fontFamily: 'monospace' }}>
                  ${agent?.spentToday ?? 0}
                </div>
              </div>
            </div>

            <div style={{ padding: '14px', borderRadius: 12, background: 'rgba(5,5,10,0.4)', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: 10, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(96,96,112,1)', marginBottom: 4 }}>
                Wallet Balance (MIST)
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {agent?.balance ?? '0'}
              </div>
            </div>
          </div>

          {/* Wallet Address Card */}
          <div style={{
            background: 'rgba(13,13,20,0.8)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16, padding: '24px'
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Wallet size={14} style={{ color: '#14F195' }} /> Copilot Wallet
            </h3>

            <div style={{
              padding: '12px', borderRadius: 10,
              background: 'rgba(5,5,10,0.4)',
              border: '1px solid rgba(255,255,255,0.03)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10
            }}>
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(160,160,176,1)', wordBreak: 'break-all' }}>
                {agent?.walletAddress}
              </span>
              <button
                onClick={() => copyToClipboard(agent?.walletAddress ?? '', 'wallet')}
                style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 6, padding: 6, cursor: 'pointer',
                  color: 'rgba(160,160,176,1)', display: 'inline-flex', alignItems: 'center',
                  transition: 'all 0.15s', flexShrink: 0
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(160,160,176,1)'; }}
                title="Copy Wallet Address"
              >
                {copiedWallet ? <Check size={12} style={{ color: '#14F195' }} /> : <Copy size={12} />}
              </button>
            </div>
          </div>

          {/* Action Center Card */}
          <div style={{
            background: 'rgba(13,13,20,0.8)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16, padding: '24px',
            display: 'flex', flexDirection: 'column', gap: 10
          }}>
            <button
              onClick={togglePause}
              disabled={pausing}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '12px', borderRadius: 10, border: 'none', fontWeight: 600, fontSize: 14,
                cursor: pausing ? 'not-allowed' : 'pointer',
                background: agent?.paused ? 'rgba(20,241,149,1)' : 'rgba(255,184,0,1)',
                color: '#05050A',
                boxShadow: agent?.paused ? '0 0 20px rgba(20,241,149,0.2)' : '0 0 20px rgba(255,184,0,0.2)',
                transition: 'all 0.15s'
              }}
              onMouseOver={e => {
                if (!pausing) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.opacity = '0.9';
                }
              }}
              onMouseOut={e => {
                if (!pausing) {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.opacity = '1';
                }
              }}
            >
              {pausing ? (
                'Updating...'
              ) : agent?.paused ? (
                <>
                  <Play size={15} fill="#05050A" /> Resume Agent
                </>
              ) : (
                <>
                  <Pause size={15} fill="#05050A" /> Pause Agent
                </>
              )}
            </button>
            
            <Link
              href={`/agents/${id}/logs`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '12px', borderRadius: 10, fontWeight: 600, fontSize: 14,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(220,220,230,1)', textDecoration: 'none',
                transition: 'all 0.15s'
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.color = 'rgba(220,220,230,1)';
              }}
            >
              View detailed logs →
            </Link>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
