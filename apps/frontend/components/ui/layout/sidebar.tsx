'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Bot, Rocket, BarChart2, Settings } from 'lucide-react';

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/agents', icon: Bot, label: 'Agents' },
  { href: '/deploy', icon: Rocket, label: 'Deploy' },
  { href: '/portfolio', icon: BarChart2, label: 'Portfolio' },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <aside style={{
      width: 220, minHeight: '100vh', flexShrink: 0,
      borderRight: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(5,5,10,0.8)',
      backdropFilter: 'blur(12px)',
      display: 'flex', flexDirection: 'column',
      padding: '0 0 24px',
      position: 'sticky', top: 0, height: '100vh',
      zIndex: 40
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 20px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, #9945FF, #14F195)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#fff'
          }}>S</div>
          <span style={{
            fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em',
            background: 'linear-gradient(90deg, #fff 0%, #B97BFF 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>SuiCopilot</span>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ padding: '16px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = path.startsWith(href);
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10,
              textDecoration: 'none', fontSize: 14, fontWeight: 500,
              color: active ? '#fff' : 'rgba(160,160,176,1)',
              background: active ? 'rgba(153,69,255,0.15)' : 'transparent',
              border: active ? '1px solid rgba(153,69,255,0.25)' : '1px solid transparent',
              transition: 'all 0.15s'
            }}>
              <Icon size={16} style={{ color: active ? '#B97BFF' : 'rgba(96,96,112,1)' }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '0 10px' }}>
        <div style={{
          padding: '12px', borderRadius: 10,
          background: 'rgba(153,69,255,0.08)',
          border: '1px solid rgba(153,69,255,0.15)'
        }}>
          <div style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.15em',
            textTransform: 'uppercase', color: 'rgba(96,96,112,1)', marginBottom: 6 }}>
            Network
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#14F195', boxShadow: '0 0 6px #14F195'
            }} />
            <span style={{ color: '#14F195', fontFamily: 'monospace' }}>Sui Testnet</span>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(96,96,112,1)', marginTop: 4 }}>
            Walrus · Tatum RPC
          </div>
        </div>
      </div>
    </aside>
  );
}