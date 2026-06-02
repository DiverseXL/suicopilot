'use client';
import { WalletAuth } from '@/components/wallet/wallet-auth';
import { Bell } from 'lucide-react';

export function Topbar() {
  return (
    <header style={{
      height: 60, borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
      background: 'rgba(5,5,10,0.8)',
      backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 30
    }}>
      <div style={{ fontSize: 13, color: 'rgba(96,96,112,1)', fontFamily: 'monospace' }}>
        SuiCopilot
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'rgba(13,13,20,1)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'rgba(96,96,112,1)'
        }}>
          <Bell size={15} />
        </button>
        <WalletAuth variant="topbar" />
      </div>
    </header>
  );
}
