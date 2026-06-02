'use client';
import { WalletAuth } from '@/components/wallet/wallet-auth';
import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/agents': 'All Agents',
  '/deploy': 'Deploy Agent',
  '/portfolio': 'Portfolio',
};

function getTitle(path: string): string {
  if (path.includes('/agents/') && path.includes('/logs')) return 'Execution Logs';
  if (path.includes('/agents/')) return 'Agent Dashboard';
  return PAGE_TITLES[path] ?? 'SuiCopilot';
}

export function Topbar() {
  const path = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header style={{
      height: 64, borderBottom: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px',
      background: 'rgba(5,5,10,0.9)',
      backdropFilter: 'blur(20px)',
      position: 'sticky', top: 0, zIndex: 30,
      gap: 16
    }}>

      {/* Left — page title */}
      <div>
        <h2 style={{
          fontSize: 16, fontWeight: 600,
          letterSpacing: '-0.01em', color: '#fff', margin: 0
        }}>
          {getTitle(path)}
        </h2>
      </div>

      {/* Right — actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

        {/* Search button */}
        <button style={{
          width: 36, height: 36, borderRadius: 9,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'rgba(96,96,112,1)',
          transition: 'all 0.15s'
        }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(96,96,112,1)'; }}>
          <Search size={14} />
        </button>

        {/* Notifications */}
        <button style={{
          width: 36, height: 36, borderRadius: 9,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'rgba(96,96,112,1)',
          position: 'relative', transition: 'all 0.15s'
        }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(96,96,112,1)'; }}>
          <Bell size={14} />
          {/* notification dot */}
          <span style={{
            position: 'absolute', top: 8, right: 8,
            width: 6, height: 6, borderRadius: '50%',
            background: '#9945FF',
            boxShadow: '0 0 6px #9945FF'
          }} />
        </button>

        {mounted && <WalletAuth variant="topbar" />}
      </div>
    </header>
  );
}
