'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Bot,
  Rocket,
  BarChart2,
  ChevronRight,
  Activity,
  Layers,
  ExternalLink,
  Database,
  PanelLeftClose,
  PanelLeftOpen,
  TrendingUp,
} from 'lucide-react';
import { api } from '@/lib/api';
import './sidebar.css';

const STORAGE_KEY = 'suicopilot-sidebar-collapsed';

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/agents', icon: Bot, label: 'Agents' },
  { href: '/deploy', icon: Rocket, label: 'Deploy' },
  { href: '/portfolio', icon: BarChart2, label: 'Portfolio' },
  { href: '/walrus', icon: Database, label: 'Walrus Blobs' },
  { href: '/marketplace', icon: TrendingUp, label: 'Marketplace' },
];

export function Sidebar() {
  const path = usePathname();
  const [suiPrice, setSuiPrice] = useState<number>(0);
  const [agentCount, setAgentCount] = useState<number>(0);
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') setCollapsed(true);
    setHydrated(true);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  useEffect(() => {
    api
      .get('/api/agents/meta/price')
      .then((r) => setSuiPrice(r.data.price))
      .catch(() => {});
    api
      .get('/api/agents')
      .then((r) => setAgentCount(r.data.length))
      .catch(() => {});
  }, []);

  const sidebarClass = [
    'sidebar',
    collapsed ? 'sidebar--collapsed' : '',
    !hydrated ? 'sidebar--no-transition' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <aside className={sidebarClass}>
      <div className="sidebar__glow" aria-hidden />

      <div className="sidebar__header">
        <Link href="/" className="sidebar__logo-link" title="SuiCopilot home">
          <div className="sidebar__logo-mark">
            <svg width="22" height="28" viewBox="0 0 300 383.5" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M240.1,159.9c15.6,19.6,25,44.5,25,71.5s-9.6,52.6-25.7,72.4l-1.4,1.7l-0.4-2.2c-0.3-1.8-0.7-3.7-1.1-5.6 c-8-35.3-34.2-65.6-77.4-90.2c-29.1-16.5-45.8-36.4-50.2-59c-2.8-14.6-0.7-29.3,3.3-41.9c4.1-12.6,10.1-23.1,15.2-29.4l16.8-20.5 c2.9-3.6,8.5-3.6,11.4,0L240.1,159.9L240.1,159.9z M266.6,139.4L154.2,2c-2.1-2.6-6.2-2.6-8.3,0L33.4,139.4l-0.4,0.5 C12.4,165.6,0,198.2,0,233.7c0,82.7,67.2,149.8,150,149.8c82.8,0,150-67.1,150-149.8c0-35.5-12.4-68.1-33.1-93.8L266.6,139.4 L266.6,139.4z M60.3,159.5l10-12.3l0.3,2.3c0.2,1.8,0.5,3.6,0.9,5.4c6.5,34.1,29.8,62.6,68.6,84.6c33.8,19.2,53.4,41.3,59.1,65.6 c2.4,10.1,2.8,20.1,1.8,28.8l-0.1,0.5l-0.5,0.2c-15.2,7.4-32.4,11.6-50.5,11.6c-63.5,0-115-51.4-115-114.8 C34.9,204.2,44.4,179.1,60.3,159.5L60.3,159.5z" fill="#ffffff" />
            </svg>
          </div>
          <div className="sidebar__label-fade">
            <div className="sidebar__brand-title">SuiCopilot</div>
            <div className="sidebar__brand-sub">Walrus · Tatum</div>
          </div>
        </Link>
        <button
          type="button"
          className="sidebar__toggle"
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {agentCount > 0 && (
        <div className="sidebar__badge-wrap">
          <div className="sidebar__badge">
            <Activity size={14} style={{ color: '#14F195', flexShrink: 0 }} />
            <span>
              <span style={{ color: '#14F195' }}>{agentCount}</span> agent
              {agentCount !== 1 ? 's' : ''} active
            </span>
          </div>
        </div>
      )}

      <nav className="sidebar__nav">
        <div className="sidebar__section-title">Navigation</div>

        {NAV.map(({ href, icon: Icon, label }) => {
          const active =
            path === href ||
            (href !== '/dashboard' && path.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar__link${active ? ' sidebar__link--active' : ''}`}
              title={collapsed ? label : undefined}
            >
              <div className="sidebar__link-icon">
                <Icon
                  size={18}
                  strokeWidth={2.25}
                  style={{ color: active ? '#B97BFF' : 'rgba(110,110,130,1)' }}
                />
              </div>
              <span className="sidebar__link-label">{label}</span>
              {active && (
                <ChevronRight
                  size={14}
                  className="sidebar__link-chevron"
                  style={{ color: 'rgba(153,69,255,0.65)' }}
                />
              )}
              {collapsed && <span className="sidebar__tooltip">{label}</span>}
            </Link>
          );
        })}

        <div className="sidebar__divider" />

        <a
          href="https://aggregator.walrus-testnet.walrus.space"
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar__link"
          title={collapsed ? 'Walrus Explorer' : undefined}
        >
          <div className="sidebar__link-icon">
            <Layers size={18} strokeWidth={2.25} style={{ color: 'rgba(110,110,130,1)' }} />
          </div>
          <span className="sidebar__link-label">Walrus Explorer</span>
          <ExternalLink size={12} className="sidebar__link-chevron" />
          {collapsed && <span className="sidebar__tooltip">Walrus Explorer</span>}
        </a>
      </nav>

      <div className="sidebar__bottom-cards">
        {suiPrice > 0 && (
          <div className="sidebar__card sidebar__card--price">
            <div className="sidebar__card-label">SUI / USD</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span className="sidebar__price">${suiPrice.toFixed(3)}</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'rgba(20,241,149,0.7)',
                  textTransform: 'uppercase',
                }}
              >
                live
              </span>
            </div>
          </div>
        )}

        <div className="sidebar__card sidebar__card--network">
          <div className="sidebar__card-label">Network</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span
              className="sidebar__pulse"
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#14F195',
                boxShadow: '0 0 8px #14F195',
              }}
            />
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: '#14F195',
              }}
            >
              Sui Testnet
            </span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(110,110,130,1)' }}>
            Walrus · Tatum RPC
          </div>
        </div>
      </div>

      <style>{`
        .sidebar--no-transition {
          transition: none !important;
        }
        .sidebar--no-transition * {
          transition: none !important;
        }
      `}</style>
    </aside>
  );
}
