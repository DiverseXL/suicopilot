'use client';

import { useSSE } from '@/hooks/useSSE';
import { SSE_URL } from '@/lib/api';
import { Activity, Zap, ExternalLink } from 'lucide-react';

function eventTitle(type: string, data: any): string {
  if (type === 'agent_deployed') return 'Agent deployed';
  if (type === 'agent_health') {
    const health = data.health ?? 'unknown';
    return `Health check — ${health}`;
  }
  if (data.decision === 'execute_dca' || data.decision === 'dca_swap') {
    return 'DCA execution';
  }
  return 'Execution check';
}

function eventBlobId(data: any): string | undefined {
  return data.blobId ?? data.strategyBlobId;
}

export function LiveFeed() {
  const { events, connected } = useSSE(SSE_URL);

  return (
    <div
      style={{
        background: 'rgba(13,13,20,0.8)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={14} style={{ color: '#9945FF' }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Live Activity</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: connected ? '#14F195' : '#FF4444',
              boxShadow: connected ? '0 0 6px #14F195' : 'none',
              animation: connected ? 'pulse 2s infinite' : 'none',
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontFamily: 'monospace',
              color: connected ? '#14F195' : '#FF4444',
            }}
          >
            {connected ? 'live' : 'offline'}
          </span>
        </div>
      </div>

      <div style={{ maxHeight: 320, overflowY: 'auto' }}>
        {events.length === 0 ? (
          <div
            style={{
              padding: '32px 16px',
              textAlign: 'center',
              fontSize: 12,
              color: 'rgba(96,96,112,1)',
            }}
          >
            Waiting for activity...
          </div>
        ) : (
          events.map((event, i) => {
            const blobId = eventBlobId(event.data);
            const isDeploy = event.type === 'agent_deployed';
            const isHealth = event.type === 'agent_health';

            return (
              <div
                key={`${event.timestamp}-${i}`}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  animation: i === 0 ? 'flashIn 0.5s ease-out' : 'none',
                  background: i === 0 ? 'rgba(153,69,255,0.05)' : 'transparent',
                  transition: 'background 0.5s',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    flexShrink: 0,
                    background: isDeploy
                      ? 'rgba(20,241,149,0.1)'
                      : isHealth
                        ? 'rgba(255,184,0,0.1)'
                        : 'rgba(153,69,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 1,
                  }}
                >
                  <Zap
                    size={13}
                    style={{
                      color: isDeploy
                        ? '#14F195'
                        : isHealth
                          ? '#FFB800'
                          : '#B97BFF',
                    }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#fff',
                      marginBottom: 3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {eventTitle(event.type, event.data)}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'rgba(96,96,112,1)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {event.data.intent ?? event.data.message ?? event.data.reason ?? '—'}
                  </div>
                  {blobId && (
                    <a
                      href={`https://aggregator.walrus-testnet.walrus.space/v1/${blobId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        fontSize: 10,
                        color: '#B97BFF',
                        textDecoration: 'none',
                        marginTop: 3,
                        fontFamily: 'monospace',
                      }}
                    >
                      <ExternalLink size={9} />
                      {blobId.slice(0, 16)}...
                    </a>
                  )}
                </div>

                <div
                  style={{
                    fontSize: 10,
                    color: 'rgba(96,96,112,1)',
                    fontFamily: 'monospace',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        @keyframes flashIn {
          0% { background: rgba(153,69,255,0.2); }
          100% { background: rgba(153,69,255,0.05); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
