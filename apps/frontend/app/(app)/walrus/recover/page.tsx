'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  Database,
  Plus,
  Trash2,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export default function WalrusRecoverPage() {
  const router = useRouter();
  const [blobIds, setBlobIds] = useState<string[]>(['']);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<{ agentsInMemory: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const addRow = () => setBlobIds(prev => [...prev, '']);
  const removeRow = (i: number) => setBlobIds(prev => prev.filter((_, idx) => idx !== i));
  const updateRow = (i: number, val: string) =>
    setBlobIds(prev => prev.map((v, idx) => (idx === i ? val : v)));

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const ids = pasted
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(Boolean);
    if (ids.length > 0) {
      setBlobIds(prev => {
        const merged = [...prev.filter(Boolean), ...ids];
        return merged.length > 0 ? merged : [''];
      });
    }
  };

  const handleSubmit = async () => {
    const ids = blobIds.map(s => s.trim()).filter(Boolean);
    if (ids.length === 0) return;
    setStatus('loading');
    setErrorMsg('');
    setResult(null);
    try {
      const res = await api.post('/api/agents/recover', { blobIds: ids });
      setResult(res.data);
      setStatus('success');
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.message ?? e?.message ?? 'Unknown error');
      setStatus('error');
    }
  };

  const validIds = blobIds.filter(s => s.trim().length > 0);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>

      {/* Back link */}
      <Link
        href="/walrus"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 13, color: 'rgba(120,120,136,1)',
          textDecoration: 'none', marginBottom: 28,
          transition: 'color 0.15s',
        }}
        onMouseOver={e => (e.currentTarget.style.color = '#B97BFF')}
        onMouseOut={e => (e.currentTarget.style.color = 'rgba(120,120,136,1)')}
      >
        <ArrowLeft size={14} />
        Back to Walrus Blobs
      </Link>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'rgba(96,96,112,1)', marginBottom: 8,
        }}>
          Walrus Recovery
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, marginBottom: 8 }}>
          Recover Agents
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(120,120,136,1)', margin: 0, lineHeight: 1.6 }}>
          Paste your Walrus strategy blob IDs to restore agents from decentralized storage.
          Each blob ID references an immutable strategy stored on Walrus.
        </p>
      </div>

      {/* Info card */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 14,
        padding: '16px 20px', borderRadius: 12, marginBottom: 28,
        background: 'rgba(153,69,255,0.06)',
        border: '1px solid rgba(153,69,255,0.18)',
      }}>
        <Shield size={18} style={{ color: '#9945FF', flexShrink: 0, marginTop: 1 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#B97BFF', marginBottom: 4 }}>
            How recovery works
          </div>
          <div style={{ fontSize: 13, color: 'rgba(160,160,176,1)', lineHeight: 1.6 }}>
            Each blob ID is fetched from Walrus, validated, and the agent strategy is restored into memory.
            You can find blob IDs in your agent logs, the Walrus Blobs page, or from a previous export.
          </div>
        </div>
      </div>

      {/* Input section */}
      <div style={{
        background: 'rgba(13,13,20,0.8)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16, overflow: 'hidden',
        marginBottom: 20,
      }}>
        {/* Section header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Database size={15} style={{ color: '#9945FF' }} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Blob IDs</span>
            {validIds.length > 0 && (
              <span style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 6,
                background: 'rgba(153,69,255,0.12)',
                border: '1px solid rgba(153,69,255,0.2)',
                color: '#B97BFF', fontFamily: 'monospace',
              }}>
                {validIds.length} entered
              </span>
            )}
          </div>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(96,96,112,1)' }}>
            ONE PER ROW
          </span>
        </div>

        {/* Blob ID rows */}
        <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {blobIds.map((val, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                fontSize: 11, fontFamily: 'monospace', color: 'rgba(96,96,112,1)',
                minWidth: 24, textAlign: 'right', flexShrink: 0,
              }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <input
                value={val}
                onChange={e => updateRow(i, e.target.value)}
                placeholder="e.g. Fa3mT9p2eXkqLrQzJn..."
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: 9,
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${val.trim() ? 'rgba(153,69,255,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  color: val.trim() ? '#B97BFF' : 'rgba(160,160,176,1)',
                  fontFamily: 'monospace', fontSize: 13,
                  outline: 'none',
                  transition: 'border-color 0.15s, color 0.15s',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(153,69,255,0.5)')}
                onBlur={e => (e.currentTarget.style.borderColor = val.trim() ? 'rgba(153,69,255,0.3)' : 'rgba(255,255,255,0.07)')}
              />
              <button
                onClick={() => removeRow(i)}
                disabled={blobIds.length === 1}
                style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: blobIds.length === 1 ? 'rgba(60,60,76,1)' : 'rgba(120,120,136,1)',
                  cursor: blobIds.length === 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseOver={e => {
                  if (blobIds.length > 1) {
                    e.currentTarget.style.background = 'rgba(255,68,68,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255,68,68,0.25)';
                    e.currentTarget.style.color = '#ff4444';
                  }
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.color = blobIds.length === 1 ? 'rgba(60,60,76,1)' : 'rgba(120,120,136,1)';
                }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}

          {/* Bulk paste hint + add button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 12, color: 'rgba(96,96,112,1)' }}>
              💡 Paste comma-separated or newline-separated IDs to bulk-import
            </span>
            <button
              onClick={addRow}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
                background: 'rgba(153,69,255,0.08)',
                border: '1px solid rgba(153,69,255,0.2)',
                color: '#B97BFF', fontSize: 12, fontWeight: 500,
                transition: 'all 0.15s',
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'rgba(153,69,255,0.15)';
                e.currentTarget.style.borderColor = 'rgba(153,69,255,0.35)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'rgba(153,69,255,0.08)';
                e.currentTarget.style.borderColor = 'rgba(153,69,255,0.2)';
              }}
            >
              <Plus size={13} /> Add Row
            </button>
          </div>

          {/* Hidden textarea for bulk paste */}
          <textarea
            rows={1}
            placeholder="Or paste all blob IDs here (comma or newline separated)..."
            onPaste={handlePaste}
            onChange={() => {}} // controlled but paste handled separately
            style={{
              resize: 'none', width: '100%', padding: '10px 14px',
              borderRadius: 9, marginTop: 8,
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed rgba(255,255,255,0.08)',
              color: 'rgba(160,160,176,0.6)',
              fontFamily: 'monospace', fontSize: 12,
              outline: 'none',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(153,69,255,0.3)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
          />
        </div>
      </div>

      {/* Status: success */}
      {status === 'success' && result && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 14,
          padding: '16px 20px', borderRadius: 12, marginBottom: 20,
          background: 'rgba(20,241,149,0.06)',
          border: '1px solid rgba(20,241,149,0.2)',
        }}>
          <CheckCircle size={18} style={{ color: '#14F195', flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#14F195', marginBottom: 4 }}>
              Recovery successful!
            </div>
            <div style={{ fontSize: 13, color: 'rgba(160,160,176,1)', lineHeight: 1.6 }}>
              {result.agentsInMemory} agent{result.agentsInMemory !== 1 ? 's' : ''} restored into memory.
              {' '}
              <Link href="/agents" style={{ color: '#14F195', fontWeight: 600, textDecoration: 'underline' }}>
                View your agents →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Status: error */}
      {status === 'error' && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 14,
          padding: '16px 20px', borderRadius: 12, marginBottom: 20,
          background: 'rgba(255,68,68,0.06)',
          border: '1px solid rgba(255,68,68,0.2)',
        }}>
          <AlertCircle size={18} style={{ color: '#ff4444', flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#ff4444', marginBottom: 4 }}>
              Recovery failed
            </div>
            <div style={{ fontSize: 13, color: 'rgba(160,160,176,1)' }}>{errorMsg}</div>
          </div>
        </div>
      )}

      {/* Submit button */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          onClick={handleSubmit}
          disabled={validIds.length === 0 || status === 'loading'}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 28px', borderRadius: 10, cursor: validIds.length === 0 || status === 'loading' ? 'not-allowed' : 'pointer',
            background: validIds.length === 0 ? 'rgba(153,69,255,0.3)' : 'rgba(153,69,255,1)',
            border: 'none', color: '#fff',
            fontSize: 14, fontWeight: 600,
            boxShadow: validIds.length > 0 ? '0 0 24px rgba(153,69,255,0.35)' : 'none',
            opacity: validIds.length === 0 || status === 'loading' ? 0.6 : 1,
            transition: 'all 0.2s',
          }}
        >
          {status === 'loading' ? (
            <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Recovering…</>
          ) : (
            <><RefreshCw size={15} /> Recover {validIds.length > 0 ? `${validIds.length} Blob${validIds.length > 1 ? 's' : ''}` : 'Agents'}</>
          )}
        </button>

        <Link
          href="/walrus"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '12px 20px', borderRadius: 10,
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(160,160,176,1)',
            textDecoration: 'none', fontSize: 14,
            transition: 'all 0.15s',
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'rgba(160,160,176,1)';
          }}
        >
          Cancel
        </Link>

        <a
          href="https://aggregator.walrus-testnet.walrus.space"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            marginLeft: 'auto',
            fontSize: 12, color: 'rgba(96,96,112,1)',
            textDecoration: 'none',
            transition: 'color 0.15s',
          }}
          onMouseOver={e => (e.currentTarget.style.color = '#B97BFF')}
          onMouseOut={e => (e.currentTarget.style.color = 'rgba(96,96,112,1)')}
        >
          <ExternalLink size={11} /> Walrus Explorer
        </a>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
