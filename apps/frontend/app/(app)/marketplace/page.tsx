'use client';
import { useEffect, useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { api } from '@/lib/api';
import { TrendingUp, Copy, ExternalLink, Star, CheckCheck, Shield, Zap } from 'lucide-react';
import Link from 'next/link';

export default function MarketplacePage() {
  const account = useCurrentAccount();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    api.get('/api/agents', {
      params: { wallet: account?.address }
    })
      .then(r => setAgents(r.data))
      .finally(() => setLoading(false));
  }, [account]);


  function copyBlobId(blobId: string) {
    navigator.clipboard.writeText(blobId);
    setCopied(blobId);
    setTimeout(() => setCopied(null), 2000);
  }

  const withBlobs = agents.filter(a => a.strategyBlobId);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'rgba(96,96,112,1)', marginBottom: 8,
        }}>
          Strategy Marketplace
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, marginBottom: 6 }}>
          Discover Strategies
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(120,120,136,1)', margin: 0, lineHeight: 1.6 }}>
          Browse and fork strategies stored on Walrus. Each strategy is verifiable by its blob ID.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Public Strategies', value: agents.length, color: '#9945FF', Icon: TrendingUp },
          { label: 'Active Agents', value: agents.filter(a => !a.paused).length, color: '#14F195', Icon: Zap },
          { label: 'Walrus Verified', value: withBlobs.length, color: '#3B9EFF', Icon: Shield },
        ].map((s, i) => (
          <div key={i} style={{
            padding: '18px 20px', borderRadius: 14,
            background: 'rgba(13,13,20,0.8)',
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: s.color + '18',
              border: `1px solid ${s.color}28`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <s.Icon size={18} style={{ color: s.color }} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'monospace', color: s.color, marginBottom: 2 }}>
                {loading ? '...' : s.value}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(96,96,112,1)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'monospace' }}>
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Strategy cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} style={{
              height: 240, borderRadius: 14,
              background: 'rgba(13,13,20,0.6)',
              border: '1px solid rgba(255,255,255,0.05)',
              animation: 'shimmer 1.5s infinite',
            }} />
          ))
        ) : agents.map(agent => (
          <div
            key={agent.id}
            style={{
              background: 'rgba(13,13,20,0.8)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14, padding: 20,
              display: 'flex', flexDirection: 'column', gap: 14,
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onMouseOver={e => {
              e.currentTarget.style.borderColor = 'rgba(153,69,255,0.3)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(153,69,255,0.07)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{
                fontSize: 10, padding: '3px 8px', borderRadius: 6,
                background: agent.paused ? 'rgba(255,184,0,0.1)' : 'rgba(20,241,149,0.1)',
                color: agent.paused ? '#FFB800' : '#14F195',
                border: `1px solid ${agent.paused ? 'rgba(255,184,0,0.2)' : 'rgba(20,241,149,0.2)'}`,
                fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                {agent.paused ? 'Paused' : 'Active'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Star size={12} style={{ color: '#FFB800' }} />
                <span style={{ fontSize: 11, color: 'rgba(160,160,176,1)', fontFamily: 'monospace' }}>
                  {agent.logs?.length ?? 0} runs
                </span>
              </div>
            </div>

            {/* Intent */}
            <div style={{
              fontSize: 14, fontWeight: 500, color: '#fff',
              lineHeight: 1.5, fontStyle: 'italic',
              borderLeft: '2px solid rgba(153,69,255,0.4)',
              paddingLeft: 10,
            }}>
              "{agent.intent}"
            </div>

            {/* Metrics row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Daily Limit', value: `$${agent.dailyLimit}` },
                { label: 'Executions', value: agent.logs?.length ?? 0 },
              ].map((m, i) => (
                <div key={i} style={{
                  padding: '8px 10px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ fontSize: 10, color: 'rgba(96,96,112,1)', fontFamily: 'monospace', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {m.label}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', fontFamily: 'monospace' }}>
                    {m.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Walrus blob */}
            {agent.strategyBlobId && (
              <div style={{
                padding: '10px 12px', borderRadius: 9,
                background: 'rgba(185,123,255,0.07)',
                border: '1px solid rgba(185,123,255,0.14)',
              }}>
                <div style={{ fontSize: 10, color: 'rgba(96,96,112,1)', fontFamily: 'monospace', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Walrus Strategy Blob
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{
                    fontSize: 11, fontFamily: 'monospace', color: '#B97BFF',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    flex: 1,
                  }}>
                    {agent.strategyBlobId.slice(0, 22)}…
                  </span>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => copyBlobId(agent.strategyBlobId)}
                      title="Copy blob ID"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: copied === agent.strategyBlobId ? '#14F195' : '#B97BFF',
                        display: 'flex', alignItems: 'center', padding: 2,
                        transition: 'color 0.15s',
                      }}
                    >
                      {copied === agent.strategyBlobId ? <CheckCheck size={13} /> : <Copy size={13} />}
                    </button>
                    <a
                      href={`https://aggregator.walrus-testnet.walrus.space/v1/${agent.strategyBlobId}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ color: '#B97BFF', display: 'flex', alignItems: 'center' }}
                    >
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
              <Link
                href={`/agents/${agent.id}`}
                style={{
                  flex: 1, textAlign: 'center', padding: '9px',
                  borderRadius: 9, background: 'rgba(153,69,255,0.15)',
                  border: '1px solid rgba(153,69,255,0.25)',
                  color: '#B97BFF', textDecoration: 'none',
                  fontSize: 12, fontWeight: 600,
                  transition: 'all 0.15s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = 'rgba(153,69,255,0.25)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'rgba(153,69,255,0.15)';
                }}
              >
                View Agent →
              </Link>
              <button
                onClick={() => {
                  if (agent.strategyBlobId) {
                    copyBlobId(agent.strategyBlobId);
                  }
                }}
                style={{
                  flex: 1, padding: '9px', borderRadius: 9, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(160,160,176,1)', fontSize: 12, fontWeight: 500,
                  transition: 'all 0.15s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.color = 'rgba(160,160,176,1)';
                }}
              >
                Fork Strategy
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && agents.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '80px 40px',
          background: 'rgba(13,13,20,0.6)',
          border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 16,
        }}>
          <TrendingUp size={32} style={{ color: 'rgba(96,96,112,1)', marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 500, color: '#fff', marginBottom: 8 }}>No strategies yet</div>
          <div style={{ fontSize: 14, color: 'rgba(96,96,112,1)', marginBottom: 20 }}>
            Deploy an agent to add it to the marketplace
          </div>
          <Link href="/deploy" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 24px', borderRadius: 10,
            background: 'rgba(153,69,255,1)', color: '#fff',
            textDecoration: 'none', fontSize: 14, fontWeight: 600,
          }}>
            Deploy Agent
          </Link>
        </div>
      )}

      <style>{`
        @keyframes shimmer { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
      `}</style>
    </div>
  );
}
