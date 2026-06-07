'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Wallet, TrendingUp, Bot, ExternalLink, RefreshCw, BarChart2 } from 'lucide-react';

export default function PortfolioPage() {
  const account = useCurrentAccount();
  const [agents, setAgents] = useState<any[]>([]);
  const [suiPrice, setSuiPrice] = useState<number>(0);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const [agentsRes, priceRes] = await Promise.all([
        api.get('/api/agents', { params: { wallet: account?.address } }),
        api.get('/api/agents/meta/price').catch(() => ({ data: { price: 0 } })),
      ]);
      const agentList = agentsRes.data;
      setAgents(agentList);
      setSuiPrice(priceRes.data.price);

      // Fetch balance for each agent wallet
      const balanceMap: Record<string, number> = {};
      await Promise.all(
        agentList.map(async (agent: any) => {
          try {
            const res = await api.get(`/api/agents/${agent.id}`);
            balanceMap[agent.id] = Number(res.data.balance ?? 0) / 1_000_000_000;
          } catch {
            balanceMap[agent.id] = 0;
          }
        })
      );
      setBalances(balanceMap);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, [account]);

  if (!account) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>🔐</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
          Connect your wallet
        </div>
        <div style={{ fontSize: 14, color: 'rgba(120,120,136,1)' }}>
          Connect your Sui wallet to view your portfolio
        </div>
      </div>
    );
  }

  async function refresh() {
    setRefreshing(true);
    await load();
  }

  const totalSui = Object.values(balances).reduce((sum, b) => sum + b, 0);
  const totalUsd = totalSui * suiPrice;

  return (
    <div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.18em',
            textTransform: 'uppercase', color: 'rgba(96,96,112,1)', marginBottom: 8 }}>
            Portfolio
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, marginBottom: 6 }}>
            Your Portfolio
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(120,120,136,1)', margin: 0 }}>
            Balances fetched live via Tatum RPC
          </p>
        </div>
        <button onClick={refresh} disabled={refreshing} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '9px 16px', borderRadius: 9, cursor: 'pointer',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(160,160,176,1)', fontSize: 13,
          transition: 'all 0.15s'
        }}>
          <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Total balance hero */}
      <div style={{
        padding: '32px', borderRadius: 16, marginBottom: 20,
        background: 'linear-gradient(135deg, rgba(153,69,255,0.15) 0%, rgba(20,241,149,0.05) 100%)',
        border: '1px solid rgba(153,69,255,0.2)',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(153,69,255,0.15), transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'rgba(153,69,255,0.8)', marginBottom: 12 }}>
          Total Portfolio Value
        </div>

        {loading ? (
          <div style={{ height: 56, width: 200, borderRadius: 8,
            background: 'rgba(255,255,255,0.06)', animation: 'shimmer 1.5s infinite' }} />
        ) : (
          <>
            <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.04em',
              color: '#fff', fontFamily: 'monospace', marginBottom: 8 }}>
              ${totalUsd.toFixed(2)}
            </div>
            <div style={{ fontSize: 16, color: 'rgba(160,160,176,1)', fontFamily: 'monospace' }}>
              {totalSui.toFixed(4)} SUI
              {suiPrice > 0 && (
                <span style={{ marginLeft: 12, fontSize: 13,
                  color: '#14F195', background: 'rgba(20,241,149,0.1)',
                  padding: '2px 8px', borderRadius: 6 }}>
                  @ ${suiPrice.toFixed(3)}/SUI
                </span>
              )}
            </div>
          </>
        )}

        {account && (
          <div style={{ marginTop: 16, fontSize: 12, fontFamily: 'monospace',
            color: 'rgba(96,96,112,1)' }}>
            Connected: {account.address.slice(0, 12)}...{account.address.slice(-8)}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          {
            label: 'Agent Wallets',
            value: agents.length,
            icon: Bot,
            color: '#9945FF',
            sub: 'total agents'
          },
          {
            label: 'Active Agents',
            value: agents.filter(a => !a.paused).length,
            icon: TrendingUp,
            color: '#14F195',
            sub: 'running now'
          },
          {
            label: 'SUI Price',
            value: suiPrice > 0 ? `$${suiPrice.toFixed(3)}` : '—',
            icon: BarChart2,
            color: '#3B9EFF',
            sub: 'via Tatum API'
          },
        ].map((stat, i) => (
          <div key={i} style={{
            padding: '18px 20px', borderRadius: 14,
            background: 'rgba(13,13,20,0.8)',
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: 14
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10, flexShrink: 0,
              background: stat.color + '15',
              border: `1px solid ${stat.color}25`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <stat.icon size={18} style={{ color: stat.color }} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>
                {loading ? '...' : stat.value}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(96,96,112,1)',
                textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'monospace' }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Agent wallets table */}
      <div style={{
        background: 'rgba(13,13,20,0.8)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16, overflow: 'hidden'
      }}>
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Agent Wallets</div>
          <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(96,96,112,1)',
            letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Powered by Tatum RPC
          </div>
        </div>

        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr auto',
          padding: '10px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.15em',
          textTransform: 'uppercase', color: 'rgba(96,96,112,1)'
        }}>
          <span>Strategy</span>
          <span>Wallet</span>
          <span>Balance (SUI)</span>
          <span>Value (USD)</span>
          <span>Status</span>
        </div>

        {loading ? (
          <div style={{ padding: 20 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{
                height: 56, borderRadius: 10, marginBottom: 8,
                background: 'rgba(255,255,255,0.03)',
                animation: 'shimmer 1.5s infinite'
              }} />
            ))}
          </div>
        ) : agents.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <Wallet size={32} style={{ color: 'rgba(96,96,112,1)', marginBottom: 12 }} />
            <div style={{ fontSize: 14, color: 'rgba(96,96,112,1)' }}>
              No agent wallets yet. Deploy an agent to see portfolio data.
            </div>
          </div>
        ) : (
          <div>
            {agents.map((agent, i) => {
              const bal = balances[agent.id] ?? 0;
              const usd = bal * suiPrice;
              return (
                <div key={agent.id} style={{
                  display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr auto',
                  padding: '16px 24px', alignItems: 'center',
                  borderBottom: i < agents.length - 1
                    ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  transition: 'background 0.15s'
                }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}>

                  {/* Strategy */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#fff',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      marginBottom: 3 }}>
                      {agent.intent}
                    </div>
                    {agent.strategyBlobId && (
                      <a href={`https://aggregator.walrus-testnet.walrus.space/v1/${agent.strategyBlobId}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 10, color: '#B97BFF', textDecoration: 'none',
                          fontFamily: 'monospace' }}>
                        <ExternalLink size={9} />
                        Walrus
                      </a>
                    )}
                  </div>

                  {/* Wallet address */}
                  <a href={`https://suiscan.xyz/testnet/account/${agent.walletAddress}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 11, fontFamily: 'monospace',
                      color: '#B97BFF', textDecoration: 'none' }}>
                    {agent.walletAddress?.slice(0, 6)}...{agent.walletAddress?.slice(-4)}
                  </a>

                  {/* SUI Balance */}
                  <div style={{ fontSize: 14, fontWeight: 600,
                    fontFamily: 'monospace', color: '#fff' }}>
                    {bal.toFixed(4)}
                  </div>

                  {/* USD Value */}
                  <div style={{ fontSize: 14, fontWeight: 600,
                    fontFamily: 'monospace', color: '#14F195' }}>
                    ${usd.toFixed(2)}
                  </div>

                  {/* Status */}
                  <span style={{
                    fontSize: 10, padding: '3px 10px', borderRadius: 6,
                    background: agent.paused ? 'rgba(255,184,0,0.1)' : 'rgba(20,241,149,0.1)',
                    color: agent.paused ? '#FFB800' : '#14F195',
                    fontFamily: 'monospace', textTransform: 'uppercase',
                    letterSpacing: '0.08em', whiteSpace: 'nowrap'
                  }}>
                    {agent.paused ? 'Paused' : 'Active'}
                  </span>
                </div>
              );
            })}

            {/* Total row */}
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr auto',
              padding: '16px 24px', alignItems: 'center',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(153,69,255,0.05)'
            }}>
              <div style={{ fontSize: 12, fontWeight: 600,
                color: 'rgba(160,160,176,1)', textTransform: 'uppercase',
                letterSpacing: '0.1em', fontFamily: 'monospace' }}>
                Total
              </div>
              <div />
              <div style={{ fontSize: 15, fontWeight: 700,
                fontFamily: 'monospace', color: '#fff' }}>
                {totalSui.toFixed(4)}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700,
                fontFamily: 'monospace', color: '#14F195' }}>
                ${totalUsd.toFixed(2)}
              </div>
              <div />
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
