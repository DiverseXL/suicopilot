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
          <div className="sidebar__logo-mark">S</div>
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
