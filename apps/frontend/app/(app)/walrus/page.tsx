'use client';
import { useEffect, useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { api } from '@/lib/api';
import { Database, ExternalLink, RefreshCw, Shield } from 'lucide-react';

export default function WalrusPage() {
  const account = useCurrentAccount();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!account) { setLoading(false); return; }
    api.get('/api/agents', { params: { wallet: account.address } })
      .then(r => setAgents(r.data))
      .finally(() => setLoading(false));
  }, [account]);

  if (!account) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>🔐</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
          Connect your wallet
        </div>
        <div style={{ fontSize: 14, color: 'rgba(120,120,136,1)' }}>
          Connect your Sui wallet to view your Walrus blobs
        </div>
      </div>
    );
  }


  const allBlobs = agents.flatMap(agent => [
    agent.strategyBlobId && {
      blobId: agent.strategyBlobId,
      type: 'Strategy',
      agentIntent: agent.intent,
      color: '#9945FF',
    },
    agent.logBlobId && {
      blobId: agent.logBlobId,
      type: 'Execution Log',
      agentIntent: agent.intent,
      color: '#14F195',
    },
    ...(agent.logs ?? []).map((log: any) => ({
      blobId: log.blobId,
      type: log.action === 'dca_swap' ? 'DCA Swap' : 'Log Entry',
      agentIntent: agent.intent,
      timestamp: log.timestamp,
      color: log.action === 'dca_swap' ? '#3B9EFF' : '#FFB800',
    })),
  ]).filter(Boolean);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'rgba(96,96,112,1)', marginBottom: 8 }}>
          Decentralized Storage
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, marginBottom: 6 }}>
          Walrus Blobs
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(120,120,136,1)', margin: 0 }}>
          Every agent action is stored immutably on Walrus decentralized storage
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Blobs', value: allBlobs.length, color: '#9945FF' },
          { label: 'Strategy Blobs', value: agents.filter(a => a.strategyBlobId).length, color: '#14F195' },
          { label: 'Execution Blobs', value: allBlobs.filter((b: any) => b.type !== 'Strategy').length, color: '#3B9EFF' },
        ].map((s, i) => (
          <div key={i} style={{
            padding: '20px', borderRadius: 14,
            background: 'rgba(13,13,20,0.8)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'monospace',
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

      {/* Blobs table */}
      <div style={{
        background: 'rgba(13,13,20,0.8)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16, overflow: 'hidden'
      }}>
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield size={16} style={{ color: '#9945FF' }} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>All Walrus Blobs</span>
          </div>
          <span style={{ fontSize: 11, fontFamily: 'monospace',
            color: 'rgba(96,96,112,1)', letterSpacing: '0.1em' }}>
            IMMUTABLE · DECENTRALIZED
          </span>
        </div>

        {loading ? (
          <div style={{ padding: 24 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ height: 56, borderRadius: 10, marginBottom: 8,
                background: 'rgba(255,255,255,0.03)', animation: 'shimmer 1.5s infinite' }} />
            ))}
          </div>
        ) : allBlobs.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <Database size={32} style={{ color: 'rgba(96,96,112,1)', marginBottom: 12 }} />
            <div style={{ fontSize: 14, color: 'rgba(96,96,112,1)' }}>
              No blobs yet — deploy an agent to start storing on Walrus
            </div>
          </div>
        ) : (
          <div>
            {allBlobs.map((blob: any, i: number) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: 'auto 1fr 1fr auto',
                padding: '14px 24px', alignItems: 'center', gap: 16,
                borderBottom: i < allBlobs.length - 1
                  ? '1px solid rgba(255,255,255,0.04)' : 'none',
                transition: 'background 0.15s'
              }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}>

                {/* Type badge */}
                <span style={{
                  fontSize: 10, padding: '3px 10px', borderRadius: 6,
                  background: blob.color + '15',
                  border: `1px solid ${blob.color}30`,
                  color: blob.color,
                  fontFamily: 'monospace', textTransform: 'uppercase',
                  letterSpacing: '0.08em', whiteSpace: 'nowrap'
                }}>
                  {blob.type}
                </span>

                {/* Blob ID */}
                <div style={{ fontFamily: 'monospace', fontSize: 12,
                  color: '#B97BFF', overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {blob.blobId}
                </div>

                {/* Agent intent */}
                <div style={{ fontSize: 12, color: 'rgba(120,120,136,1)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {blob.agentIntent}
                </div>

                {/* View link */}
                <a href={`https://aggregator.walrus-testnet.walrus.space/v1/${blob.blobId}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '6px 12px', borderRadius: 7,
                    background: 'rgba(185,123,255,0.1)',
                    border: '1px solid rgba(185,123,255,0.2)',
                    color: '#B97BFF', textDecoration: 'none',
                    fontSize: 11, whiteSpace: 'nowrap'
                  }}>
                  <ExternalLink size={11} />
                  View
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
      `}</style>
    </div>
  );
}
