'use client';
import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Rocket, Zap, ArrowRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { api } from '@/lib/api';

const PROMPTS = [
  'DCA $10 of SUI every day at 10am',
  'Buy SUI when price drops 5%, sell at 8% profit',
  'Watch whale wallet and mirror their SUI trades',
  'Stake idle SUI automatically for yield',
  'Alert and sell 20% when SUI hits $10',
];

export default function DeployPage() {
  const account = useCurrentAccount();
  const [prompt, setPrompt] = useState<string>('');
  const [dailyLimit, setDailyLimit] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<'input' | 'deploying' | 'done'>('input');
  const [forkBlobId, setForkBlobId] = useState<string>('');
  const [forkLoading, setForkLoading] = useState<boolean>(false);

  async function loadFromBlob() {
    if (!forkBlobId) return;
    setForkLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/agents/blob/${forkBlobId.trim()}`);
      if (res.data) {
        setPrompt(res.data.intent ?? '');
        setDailyLimit(res.data.dailyLimit ? String(res.data.dailyLimit) : '');
      } else {
        setError('No data returned for this blob ID');
      }
    } catch (e: any) {
      setError(e.response?.data?.error ?? e.message);
    } finally {
      setForkLoading(false);
    }
  }

  async function deploy() {
    if (!account || !prompt || !dailyLimit) return;
    setStep('deploying');
    setLoading(true);
    try {
      const res = await api.post('/api/agents', {
        intent: prompt,
        dailyLimit: Number(dailyLimit),
        walletAddress: account.address,
      });
      setResult(res.data);
      setStep('done');
    } catch (e: any) {
      setError(e.response?.data?.error ?? e.message);
      setStep('input');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'deploying') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 24 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(153,69,255,0.15)',
          border: '2px solid rgba(153,69,255,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'spin 2s linear infinite'
        }}>
          <Rocket size={28} style={{ color: '#B97BFF' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Deploying agent...</div>
          <div style={{ fontSize: 14, color: 'rgba(160,160,176,1)' }}>Publishing strategy to Walrus</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0,1,2].map(i => (
            <span key={i} className="typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (step === 'done' && result) {
    return (
      <div style={{ maxWidth: 560, margin: '60px auto' }}>
        <GlassCard style={{
          padding: 32, textAlign: 'center',
          border: '1px solid rgba(20,241,149,0.2)'
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(20,241,149,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: 24
          }}>✓</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#14F195' }}>
            Agent deployed
          </div>
          <div style={{ fontSize: 14, color: 'rgba(160,160,176,1)', marginBottom: 24 }}>
            Your strategy is live and stored on Walrus
          </div>

          <div style={{
            background: 'rgba(13,13,20,1)', borderRadius: 12, padding: 16,
            marginBottom: 16, textAlign: 'left'
          }}>
            <div style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.15em',
              textTransform: 'uppercase', color: 'rgba(96,96,112,1)', marginBottom: 6 }}>
              Strategy blob on Walrus
            </div>
            <a href={`https://aggregator.walrus-testnet.walrus.space/v1/${result.strategyBlobId}`}
              target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: 'monospace', fontSize: 11, color: '#B97BFF',
                wordBreak: 'break-all', textDecoration: 'none' }}>
              {result.strategyBlobId}
            </a>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <a href={`/agents/${result.agentId}`} style={{
              flex: 1, textAlign: 'center', padding: '12px',
              background: 'rgba(153,69,255,1)', color: '#fff',
              borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600
            }}>
              View dashboard →
            </a>
            <button onClick={() => { setStep('input'); setResult(null); setPrompt(''); setDailyLimit(''); }}
              style={{
                flex: 1, padding: '12px',
                background: 'rgba(13,13,20,1)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(160,160,176,1)', borderRadius: 10,
                cursor: 'pointer', fontSize: 14
              }}>
              Deploy another
            </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.2em',
          textTransform: 'uppercase', color: 'rgba(96,96,112,1)', marginBottom: 12 }}>
          Deploy · New Agent
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 10 }}>
          What should your agent do?
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(160,160,176,1)', lineHeight: 1.6 }}>
          Describe your strategy in plain English. Your rules are stored immutably on Walrus.
        </p>
      </div>

      {/* Compose from Strategy Blob ID (Fork) */}
      <GlassCard style={{ padding: 20, marginBottom: 16, border: '1px solid rgba(153,69,255,0.15)' }}>
        <div style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.15em',
          textTransform: 'uppercase', color: 'rgba(185,123,255,1)', marginBottom: 12 }}>
          Compose from Strategy
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            value={forkBlobId}
            onChange={e => setForkBlobId(e.target.value)}
            placeholder="Paste Walrus Strategy Blob ID to fork"
            style={{
              flex: 1, background: 'rgba(13,13,20,1)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, padding: '10px 14px',
              color: '#fff', fontSize: 14, outline: 'none'
            }}
          />
          <button
            onClick={loadFromBlob}
            disabled={forkLoading || !forkBlobId}
            style={{
              padding: '10px 20px',
              background: forkLoading || !forkBlobId ? 'rgba(19,19,30,1)' : 'rgba(153,69,255,0.15)',
              border: '1px solid rgba(153,69,255,0.25)',
              color: '#B97BFF', borderRadius: 10,
              cursor: forkLoading || !forkBlobId ? 'not-allowed' : 'pointer',
              fontSize: 14, fontWeight: 600, transition: 'all 0.15s'
            }}
          >
            {forkLoading ? 'Loading...' : 'Load'}
          </button>
        </div>
      </GlassCard>

      {/* Prompt input */}
      <GlassCard style={{ padding: 24, marginBottom: 16 }}>
        <textarea
          value={prompt ?? ''}
          onChange={e => setPrompt(e.target.value)}
          placeholder='e.g. "DCA $10 of SUI every day at 10am, stop if balance drops below $100"'
          rows={4}
          style={{
            width: '100%', background: 'transparent',
            border: 'none', outline: 'none',
            color: '#fff', fontSize: 18, lineHeight: 1.6,
            resize: 'none', fontFamily: 'inherit',
            boxSizing: 'border-box'
          }}
        />
        {prompt && (
          <div style={{
            marginTop: 16, paddingTop: 16,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <span style={{
              fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.15em',
              textTransform: 'uppercase', color: 'rgba(96,96,112,1)'
            }}>Daily limit (USD)</span>
            <input
              type="number"
              value={dailyLimit ?? ''}
              onChange={e => setDailyLimit(e.target.value)}
              placeholder="10"
              style={{
                background: 'rgba(19,19,30,1)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, padding: '6px 12px',
                color: '#fff', fontSize: 14, width: 100,
                outline: 'none', fontFamily: 'monospace'
              }}
            />
            <button
              onClick={deploy}
              disabled={!account || !prompt || !dailyLimit}
              style={{
                marginLeft: 'auto',
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 20px',
                background: !account || !prompt || !dailyLimit
                  ? 'rgba(19,19,30,1)' : 'rgba(153,69,255,1)',
                color: !account || !prompt || !dailyLimit
                  ? 'rgba(96,96,112,1)' : '#fff',
                border: 'none', borderRadius: 10,
                cursor: !account || !prompt || !dailyLimit ? 'not-allowed' : 'pointer',
                fontSize: 14, fontWeight: 600
              }}>
              <Zap size={14} />
              Deploy
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </GlassCard>

      {!account && (
        <div style={{
          padding: '12px 16px', borderRadius: 10,
          background: 'rgba(255,184,0,0.08)',
          border: '1px solid rgba(255,184,0,0.2)',
          fontSize: 13, color: 'rgba(255,184,0,1)', marginBottom: 16
        }}>
          Connect your wallet to deploy an agent
        </div>
      )}

      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: 10,
          background: 'rgba(255,68,68,0.08)',
          border: '1px solid rgba(255,68,68,0.2)',
          fontSize: 13, color: '#FF4444', marginBottom: 16
        }}>{error}</div>
      )}

      {/* Example prompts */}
      <div style={{ marginTop: 32 }}>
        <div style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.15em',
          textTransform: 'uppercase', color: 'rgba(96,96,112,1)', marginBottom: 14 }}>
          Example strategies
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PROMPTS.map((p, i) => (
            <button key={i} onClick={() => setPrompt(p)}
              style={{
                background: 'rgba(13,13,20,0.6)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10, padding: '12px 16px',
                textAlign: 'left', cursor: 'pointer',
                color: 'rgba(160,160,176,1)', fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'all 0.15s'
              }}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = 'rgba(153,69,255,0.3)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.color = 'rgba(160,160,176,1)';
              }}>
              <span>{p}</span>
              <ArrowRight size={14} style={{ flexShrink: 0, marginLeft: 12 }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
