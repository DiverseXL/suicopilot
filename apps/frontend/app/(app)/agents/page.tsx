'use client';
import { useEffect, useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { api } from '@/lib/api';
import { Bot, Plus, ExternalLink, Activity, Clock, Pause, Play, Zap, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function AgentsPage() {
  const account = useCurrentAccount();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAgents() {
    if (!account) return;
    try {
      const res = await api.get('/api/agents', {
        params: { wallet: account.address }
      });
      setAgents(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAgents();
    const interval = setInterval(loadAgents, 30000);
    return () => clearInterval(interval);
  }, [account]);


  const active = agents.filter(a => !a.paused).length;
  const paused = agents.filter(a => a.paused).length;

  if (!account) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>🔐</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
          Connect your wallet
        </div>
        <div style={{ fontSize: 14, color: 'rgba(120,120,136,1)' }}>
          Connect your Sui wallet to view your agents
        </div>
      </div>
    );
  }

  return (
    <div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.18em',
            textTransform: 'uppercase', color: 'rgba(96,96,112,1)', marginBottom: 8 }}>
            Autonomous Agents
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, marginBottom: 6 }}>
            Your Agents
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(120,120,136,1)', margin: 0 }}>
            Every strategy is stored trustlessly on Walrus
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/walrus/recover" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 16px', borderRadius: 10,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(160,160,176,1)',
            textDecoration: 'none',
            fontSize: 13, cursor: 'pointer',
            transition: 'all 0.15s',
          }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'rgba(153,69,255,0.08)';
              e.currentTarget.style.borderColor = 'rgba(153,69,255,0.25)';
              e.currentTarget.style.color = '#B97BFF';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = 'rgba(160,160,176,1)';
            }}
          >
            <RefreshCw size={14} /> Recover from Walrus
          </Link>
          <Link href="/deploy" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10,
            background: 'rgba(153,69,255,1)', color: '#fff',
            textDecoration: 'none', fontSize: 14, fontWeight: 600,
            boxShadow: '0 0 20px rgba(153,69,255,0.3)'
          }}>
            <Plus size={15} />
            Deploy Agent
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Total Agents', value: agents.length, icon: Bot, color: '#9945FF' },
          { label: 'Active', value: active, icon: Activity, color: '#14F195' },
          { label: 'Paused', value: paused, icon: Pause, color: '#FFB800' },
        ].map((stat, i) => (
          <div key={i} style={{
            padding: '18px 20px', borderRadius: 14,
            background: 'rgba(13,13,20,0.8)',
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: 14
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: stat.color + '15',
              border: `1px solid ${stat.color}25`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <stat.icon size={18} style={{ color: stat.color }} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(96,96,112,1)', textTransform: 'uppercase',
                letterSpacing: '0.1em', fontFamily: 'monospace' }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Agent list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{
              height: 100, borderRadius: 14,
              background: 'rgba(13,13,20,0.6)',
              border: '1px solid rgba(255,255,255,0.05)',
              animation: 'shimmer 1.5s ease-in-out infinite'
            }} />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div style={{
          padding: '80px 40px', textAlign: 'center',
          background: 'rgba(13,13,20,0.6)',
          border: '1px dashed rgba(255,255,255,0.08)',
          borderRadius: 16
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(153,69,255,0.1)',
            border: '1px solid rgba(153,69,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <Bot size={28} style={{ color: '#B97BFF' }} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No agents deployed yet</div>
          <div style={{ fontSize: 14, color: 'rgba(120,120,136,1)', marginBottom: 24 }}>
            Deploy your first agent to start automating your Sui strategy
          </div>
          <Link href="/deploy" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 24px', borderRadius: 10,
            background: 'rgba(153,69,255,1)', color: '#fff',
            textDecoration: 'none', fontSize: 14, fontWeight: 600
          }}>
            <Plus size={14} /> Deploy your first agent
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {agents.map(agent => (
            <AgentRow key={agent.id} agent={agent} onRefresh={loadAgents} />
          ))}
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

function AgentRow({ agent, onRefresh }: { agent: any; onRefresh: () => void }) {
  const [pausing, setPausing] = useState(false);

  async function togglePause() {
    setPausing(true);
    try {
      await api.post(`/api/agents/${agent.id}/pause`);
      onRefresh();
    } finally {
      setPausing(false);
    }
  }

  return (
    <div style={{
      padding: '20px 24px',
      background: 'rgba(13,13,20,0.8)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 14,
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: 16,
      alignItems: 'center',
      transition: 'border-color 0.15s'
    }}
      onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(153,69,255,0.2)'}
      onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
        {/* Status dot */}
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: agent.paused ? 'rgba(255,184,0,0.1)' : 'rgba(20,241,149,0.1)',
          border: `1px solid ${agent.paused ? 'rgba(255,184,0,0.2)' : 'rgba(20,241,149,0.2)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Bot size={20} style={{ color: agent.paused ? '#FFB800' : '#14F195' }} />
        </div>

        <div style={{ minWidth: 0 }}>
          {/* Status + intent */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 8px', borderRadius: 6,
              background: agent.paused ? 'rgba(255,184,0,0.1)' : 'rgba(20,241,149,0.1)',
              border: `1px solid ${agent.paused ? 'rgba(255,184,0,0.2)' : 'rgba(20,241,149,0.2)'}`,
              fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: agent.paused ? '#FFB800' : '#14F195'
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: agent.paused ? '#FFB800' : '#14F195'
              }} />
              {agent.paused ? 'Paused' : 'Active'}
            </span>
            <span style={{ fontSize: 13, color: 'rgba(96,96,112,1)', fontFamily: 'monospace' }}>
              ${agent.dailyLimit}/day limit
            </span>
          </div>

          <div style={{ fontSize: 15, fontWeight: 500, color: '#fff',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {agent.intent}
          </div>

          {/* Walrus blob */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Zap size={11} style={{ color: 'rgba(96,96,112,1)' }} />
              <span style={{ fontSize: 11, color: 'rgba(96,96,112,1)' }}>
                {agent.logs?.length ?? 0} executions
              </span>
            </div>
            {agent.strategyBlobId && (
              <a href={`https://aggregator.walrus-testnet.walrus.space/v1/${agent.strategyBlobId}`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 11, color: '#B97BFF', textDecoration: 'none' }}>
                <ExternalLink size={10} />
                Walrus blob
              </a>
            )}
            {agent.lastRun && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Clock size={11} style={{ color: 'rgba(96,96,112,1)' }} />
                <span style={{ fontSize: 11, color: 'rgba(96,96,112,1)' }}>
                  {new Date(agent.lastRun).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={togglePause} disabled={pausing} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(160,160,176,1)', fontSize: 12, fontWeight: 500,
          transition: 'all 0.15s'
        }}>
          {agent.paused ? <Play size={13} /> : <Pause size={13} />}
          {pausing ? '...' : agent.paused ? 'Resume' : 'Pause'}
        </button>

        <Link href={`/agents/${agent.id}`} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 8,
          background: 'rgba(153,69,255,0.15)',
          border: '1px solid rgba(153,69,255,0.25)',
          color: '#B97BFF', fontSize: 12, fontWeight: 500,
          textDecoration: 'none', transition: 'all 0.15s'
        }}>
          View →
        </Link>
      </div>
    </div>
  );
}
