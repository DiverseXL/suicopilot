'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Bot, Zap, Activity, TrendingUp, ExternalLink, Clock, Plus } from 'lucide-react';
import Link from 'next/link';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { LiveFeed } from '@/components/ui/live-feed';

export default function DashboardPage() {
  const account = useCurrentAccount();
  const [agents, setAgents] = useState<any[]>([]);
  const [suiPrice, setSuiPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [agentsRes, priceRes] = await Promise.all([
          api.get('/api/agents', {
            params: { wallet: account?.address }
          }),
          api.get('/api/agents/meta/price').catch(() => ({ data: { price: 0 } })),
        ]);
        setAgents(agentsRes.data);
        setSuiPrice(priceRes.data.price);
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [account]);

  const active = agents.filter(a => !a.paused).length;
  const totalLogs = agents.reduce((sum, a) => sum + (a.logs?.length ?? 0), 0);
  const totalLimit = agents.reduce((sum, a) => sum + (a.dailyLimit ?? 0), 0);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'rgba(96,96,112,1)', marginBottom: 8 }}>
          Overview
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, marginBottom: 6 }}>
          Dashboard
        </h1>
        {account && (
          <p style={{ fontSize: 13, color: 'rgba(96,96,112,1)', fontFamily: 'monospace', margin: 0 }}>
            {account.address.slice(0, 10)}...{account.address.slice(-8)}
          </p>
        )}
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Total Agents', value: agents.length, icon: Bot, color: '#9945FF', sub: 'deployed' },
          { label: 'Active Now', value: active, icon: Activity, color: '#14F195', sub: 'running' },
          { label: 'Executions', value: totalLogs, icon: Zap, color: '#3B9EFF', sub: 'total logs' },
          { label: 'SUI Price', value: suiPrice > 0 ? `$${suiPrice.toFixed(3)}` : '...', icon: TrendingUp, color: '#14F195', sub: 'live via Tatum' },
        ].map((stat, i) => (
          <div key={i} style={{
            padding: '20px', borderRadius: 14,
            background: 'rgba(13,13,20,0.8)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.15em',
                textTransform: 'uppercase', color: 'rgba(96,96,112,1)' }}>
                {stat.label}
              </span>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: stat.color + '15',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <stat.icon size={15} style={{ color: stat.color }} />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'monospace',
              color: '#fff', marginBottom: 4 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(96,96,112,1)' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Two column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>

        {/* Recent agents */}
        <div style={{
          background: 'rgba(13,13,20,0.8)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16, overflow: 'hidden'
        }}>
          <div style={{
            padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Recent Agents</div>
            <Link href="/agents" style={{ fontSize: 12, color: '#B97BFF', textDecoration: 'none' }}>
              View all →
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: 20 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ height: 60, borderRadius: 10, marginBottom: 8,
                  background: 'rgba(255,255,255,0.03)', animation: 'shimmer 1.5s infinite' }} />
              ))}
            </div>
          ) : agents.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <Bot size={32} style={{ color: 'rgba(96,96,112,1)', marginBottom: 12 }} />
              <div style={{ fontSize: 14, color: 'rgba(96,96,112,1)', marginBottom: 16 }}>
                No agents yet
              </div>
              <Link href="/deploy" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 8,
                background: 'rgba(153,69,255,0.15)',
                border: '1px solid rgba(153,69,255,0.25)',
                color: '#B97BFF', textDecoration: 'none', fontSize: 13
              }}>
                <Plus size={13} /> Deploy first agent
              </Link>
            </div>
          ) : (
            <div>
              {agents.slice(0, 5).map((agent, i) => (
                <Link key={agent.id} href={`/agents/${agent.id}`} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 20px', textDecoration: 'none',
                  borderBottom: i < agents.slice(0,5).length - 1
                    ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  transition: 'background 0.15s'
                }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                    background: agent.paused ? 'rgba(255,184,0,0.1)' : 'rgba(20,241,149,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Bot size={16} style={{ color: agent.paused ? '#FFB800' : '#14F195' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#fff',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      marginBottom: 3 }}>
                      {agent.intent}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(96,96,112,1)', display: 'flex', gap: 10 }}>
                      <span>${agent.dailyLimit}/day</span>
                      <span>·</span>
                      <span>{agent.logs?.length ?? 0} logs</span>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 10, padding: '3px 8px', borderRadius: 6,
                    background: agent.paused ? 'rgba(255,184,0,0.1)' : 'rgba(20,241,149,0.1)',
                    color: agent.paused ? '#FFB800' : '#14F195',
                    fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em'
                  }}>
                    {agent.paused ? 'Paused' : 'Active'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Quick deploy */}
          <div style={{
            padding: '20px', borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(153,69,255,0.15), rgba(20,241,149,0.05))',
            border: '1px solid rgba(153,69,255,0.2)'
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Deploy an agent</div>
            <div style={{ fontSize: 12, color: 'rgba(120,120,136,1)', marginBottom: 16, lineHeight: 1.5 }}>
              Describe your strategy in plain English. Stored on Walrus.
            </div>
            <Link href="/deploy" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px', borderRadius: 9,
              background: 'rgba(153,69,255,1)', color: '#fff',
              textDecoration: 'none', fontSize: 13, fontWeight: 600
            }}>
              <Plus size={13} /> New Agent
            </Link>
          </div>

          {/* Latest Walrus blobs */}
          <div style={{
            background: 'rgba(13,13,20,0.8)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14, overflow: 'hidden'
          }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)',
              fontSize: 13, fontWeight: 600 }}>
              Latest Walrus Blobs
            </div>
            {agents.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center',
                fontSize: 12, color: 'rgba(96,96,112,1)' }}>
                No blobs yet
              </div>
            ) : (
              <div>
                {agents.slice(0, 4).map((agent, i) => agent.logBlobId && (
                  <a key={agent.id}
                    href={`https://aggregator.walrus-testnet.walrus.space/v1/${agent.logBlobId}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '12px 16px', textDecoration: 'none',
                      borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none'
                    }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                      background: 'rgba(185,123,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <ExternalLink size={12} style={{ color: '#B97BFF' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontFamily: 'monospace',
                        color: '#B97BFF', overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap' }}>
                        {agent.logBlobId?.slice(0, 22)}...
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(96,96,112,1)', marginTop: 2 }}>
                        log blob
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          <LiveFeed />

          {/* Network status */}
          <div style={{
            padding: '16px', borderRadius: 14,
            background: 'rgba(13,13,20,0.8)',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Network Status</div>
            {[
              { label: 'Sui Testnet', status: 'online', color: '#14F195' },
              { label: 'Walrus Storage', status: 'online', color: '#14F195' },
              { label: 'Tatum RPC', status: 'online', color: '#14F195' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none'
              }}>
                <span style={{ fontSize: 12, color: 'rgba(160,160,176,1)' }}>{item.label}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 11, color: item.color, fontFamily: 'monospace' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%',
                    background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
