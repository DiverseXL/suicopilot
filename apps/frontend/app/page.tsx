'use client';

import { useState, useEffect } from 'react';
import {
  Activity,
  ArrowRight,
  Bell,
  Bot,
  ChevronDown,
  Copy,
  Database,
  ExternalLink,
  Eye,
  LockKeyhole,
  Send,
  ShieldCheck,
  Zap,
  Wallet,
} from 'lucide-react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { WalletAuth } from '@/components/wallet/wallet-auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const navItems = ['Features', 'How it works', 'Research', 'FAQ'];

const trustItems = [
  { label: 'Immutable audit trail', Icon: ShieldCheck },
  { label: 'Parallel execution', Icon: Zap },
  { label: 'Private key protected', Icon: LockKeyhole },
];

const tokens = [
  { symbol: '$BONK', action: 'Bought', value: '$1.2K', tone: 'green' },
  { symbol: '$WIF', action: 'Bought', value: '$3.4K', tone: 'green' },
  { symbol: '$BOME', action: 'Sold', value: '$2.1K', tone: 'red' },
];

const agentActions = [
  { label: 'Track', Icon: Eye },
  { label: 'Copy strategy', Icon: Copy },
  { label: 'Alert next trade', Icon: Bell },
];

const featureCards = [
  {
    eyebrow: '01',
    title: 'Prompt-to-Strategy (NLP Layer)',
    body: 'Describe your trading intent in English. GPT-4o-mini parses it into structured rules. Daily limits enforced automatically. Strategy published immutably to Walrus.',
    metric: 'PROMPT → WALRUS BLOB',
    tone: 'purple',
    Icon: Bot,
  },
  {
    eyebrow: '02',
    title: 'Parallel Scheduler (Execution Layer)',
    body: 'Every 60 seconds, all agents run in parallel via Promise.allSettled(). Each agent has a 30-second timeout. One failure never blocks others.',
    metric: 'ISOLATION + TIMEOUT',
    tone: 'yellow',
    Icon: Zap,
  },
  {
    eyebrow: '03',
    title: 'Immutable Audit Trail (Verification Layer)',
    body: 'Every run, pause, and resume logged to Walrus. Balance snapshots recorded. Users prove what their agent did via public blob IDs.',
    metric: 'WALRUS BLOBS + SQLITE',
    tone: 'green',
    Icon: ShieldCheck,
  },
];

const howItWorksSteps = [
  {
    eyebrow: '01',
    title: 'Deploy from a prompt',
    body: 'Connect your Sui wallet and describe your trading strategy in English. Set a daily spend limit. SuiCopilot parses intent and publishes immutable rules to Walrus.',
    detail: 'PROMPT → WALRUS',
    tone: 'purple',
    Icon: Wallet,
  },
  {
    eyebrow: '02',
    title: 'Run scheduled checks',
    body: 'Every 60 seconds, your agent checks your SUI balance via Tatum (rate-limited 2 RPS). All agents run in parallel with 30-second timeouts to prevent cascading failures.',
    detail: 'PARALLEL → ISOLATED',
    tone: 'yellow',
    Icon: Database,
  },
  {
    eyebrow: '03',
    title: 'Verify audit trail',
    body: 'Every action (deploy, pause, resume, balance check) is logged to Walrus. You can prove what your agent did when via public blob IDs. SQLite persists state across restarts.',
    detail: 'WALRUS + SQLITE',
    tone: 'green',
    Icon: Activity,
  },
];

const faqItems = [
  {
    question: 'How do I deploy an agent?',
    answer: 'Connect your Sui wallet, describe your trading strategy in English (e.g., "Buy $10 SUI daily if price < $5"), set a daily spend limit, and deploy. SuiCopilot parses your intent and publishes it to Walrus as an immutable blob.',
  },
  {
    question: 'Is my private key safe?',
    answer: 'Yes. Your private key stays on your wallet. SuiCopilot generates a separate agent wallet for autonomous execution. Agent keys are stored in encrypted SQLite, never exposed to the frontend, and never sent to Walrus.',
  },
  {
    question: 'How often does the scheduler run?',
    answer: 'Every 60 seconds, the scheduler checks all active agents in parallel. Each agent has a 30-second timeout to prevent RPC hangs from cascading. One agent\'s failure never blocks others.',
  },
  {
    question: 'Can I verify my agent\'s history?',
    answer: 'Absolutely. Every run, pause, and resume action is published to Walrus as immutable JSON blobs. You can audit your agent\'s complete history via public blob IDs shown in the dashboard.',
  },
  {
    question: 'What if the server crashes?',
    answer: 'SQLite persists all agent state and logs to disk. When the server restarts, all agents reload from the database with their complete history intact. No data is lost.',
  },
  {
    question: 'How are balance checks rate-limited?',
    answer: 'SuiCopilot uses Tatum\'s Sui RPC gateway with a 2 RPS rate limit (safe under the 3 RPS free tier). If limit is exceeded, the scheduler gracefully backs off.',
  },
  {
    question: 'Can I modify or pause my agent?',
    answer: 'Yes. You can pause/resume agents instantly from the dashboard, and modifications are logged to Walrus. All changes appear in the audit trail with timestamps.',
  },
  {
    question: 'What data is published to Walrus?',
    answer: 'Only your strategy rules and execution logs. Your private keys, wallet address, and personal data never leave your SQLite database. Walrus only stores immutable strategy & audit records.',
  },
];

export default function Home() {
  const account = useCurrentAccount();
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="landing-shell">
      <nav className="landing-nav" aria-label="Primary navigation">
        <Link className="landing-brand" href="/">
          <span className="landing-brand-mark" style={{ border: 'none', background: 'none', boxShadow: 'none', width: 'auto', height: 'auto', display: 'inline-flex' }}>
            <svg width="22" height="28" viewBox="0 0 300 383.5" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 8px rgba(155, 69, 255, 0.4))' }}>
              <path fillRule="evenodd" clipRule="evenodd" d="M240.1,159.9c15.6,19.6,25,44.5,25,71.5s-9.6,52.6-25.7,72.4l-1.4,1.7l-0.4-2.2c-0.3-1.8-0.7-3.7-1.1-5.6 c-8-35.3-34.2-65.6-77.4-90.2c-29.1-16.5-45.8-36.4-50.2-59c-2.8-14.6-0.7-29.3,3.3-41.9c4.1-12.6,10.1-23.1,15.2-29.4l16.8-20.5 c2.9-3.6,8.5-3.6,11.4,0L240.1,159.9L240.1,159.9z M266.6,139.4L154.2,2c-2.1-2.6-6.2-2.6-8.3,0L33.4,139.4l-0.4,0.5 C12.4,165.6,0,198.2,0,233.7c0,82.7,67.2,149.8,150,149.8c82.8,0,150-67.1,150-149.8c0-35.5-12.4-68.1-33.1-93.8L266.6,139.4 L266.6,139.4z M60.3,159.5l10-12.3l0.3,2.3c0.2,1.8,0.5,3.6,0.9,5.4c6.5,34.1,29.8,62.6,68.6,84.6c33.8,19.2,53.4,41.3,59.1,65.6 c2.4,10.1,2.8,20.1,1.8,28.8l-0.1,0.5l-0.5,0.2c-15.2,7.4-32.4,11.6-50.5,11.6c-63.5,0-115-51.4-115-114.8 C34.9,204.2,44.4,179.1,60.3,159.5L60.3,159.5z" fill="url(#sui-nav-grad)" />
              <defs>
                <linearGradient id="sui-nav-grad" x1="0" y1="0" x2="300" y2="383.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#9b45ff" />
                  <stop offset="0.5" stopColor="#b44cff" />
                  <stop offset="1" stopColor="#14f195" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          <span>suicopilot</span>
        </Link>

        <div className="landing-nav-links">
          {navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase().replaceAll(' ', '-')}`}>
              {item}
            </a>
          ))}
        </div>

        <div style={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: 16 }}>
          <a
            href="https://x.com/suicopilotlr"
            target="_blank"
            rel="noopener noreferrer"
            title="Follow SuiCopilot on X"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'rgba(238, 234, 247, 0.76)',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = 'rgba(238, 234, 247, 0.76)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>

          <Link className="landing-agent-chip" href="/agents">
            <span className="landing-mini-avatar">S</span>
            <span>
              <strong>@suicopilot_bot</strong>
              <small>AI agent - Sui</small>
            </span>
          </Link>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-copy">
          <div className="landing-status">
            <span />
            MAINNET / LIVE
          </div>

          <h1 className="landing-title">
            Autonomous agents
            <span>from a prompt</span>
          </h1>

          <p className="landing-subtitle">
            Describe your trading strategy in English. SuiCopilot deploys it as an immutable agent on Sui, 
            runs scheduled balance checks via Tatum, and publishes an audit trail to Walrus. 
            No code. No private key exposure. All signed by your wallet.
          </p>

          <div className="landing-cta-row">
            {mounted ? (
              account ? (
                <button className="landing-primary" type="button" onClick={() => router.push('/agents')}>
                  Go to Dashboard
                  <ArrowRight aria-hidden="true" size={18} />
                </button>
              ) : (
                <WalletAuth variant="landing" />
              )
            ) : (
              <button className="landing-primary" type="button" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                <span className="landing-button-content">
                  <Wallet aria-hidden="true" size={18} />
                  Connect Sui wallet
                  <ArrowRight aria-hidden="true" size={18} />
                </span>
              </button>
            )}

            <a className="landing-secondary" href="https://github.com/suicopilot/suicopilot/blob/main/THESIS.md" target="_blank" rel="noopener noreferrer">
              Read the research
              <ExternalLink aria-hidden="true" size={15} />
            </a>
          </div>

          <div className="landing-trust-row" aria-label="Platform assurances">
            {trustItems.map(({ label, Icon }) => (
              <span key={label}>
                <Icon aria-hidden="true" size={14} />
                {label}
              </span>
            ))}
          </div>
        </div>

        <aside className="landing-preview" aria-label="Autonomous agent preview">
          <div className="landing-confirmed">
            <span />
            Tx confirmed - 0.18s
          </div>

          <div className="landing-running">
            <small>ACTIVE AGENTS</small>
            <strong>3 running</strong>
          </div>

          <div className="landing-chat-shell">
            <div className="landing-chat-header">
              <div className="landing-profile">
                <span className="landing-chat-avatar">
                  <Bot aria-hidden="true" size={18} />
                </span>
                <span>
                  <strong>@suicopilot_bot</strong>
                  <small>AI agent - Sui</small>
                </span>
              </div>
              <div className="landing-window-dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </div>

            <div className="landing-message landing-message-user">what is cupsey buying today?</div>

            <div className="landing-message-row">
              <span className="landing-bot-dot">
                <Bot aria-hidden="true" size={17} />
              </span>
              <div className="landing-message landing-message-bot">Pulling his last 4h activity...</div>
            </div>

            <div className="landing-activity-card">
              <div className="landing-card-top">
                <span>
                  <Bot aria-hidden="true" size={15} />
                  Cupsey - last 4h
                </span>
                <code>7M2w...f2p3</code>
              </div>

              <div className="landing-token-grid">
                {tokens.map((token) => (
                  <div className="landing-token-card" key={token.symbol}>
                    <div className="landing-token-head">
                      <span className={`landing-token-icon landing-token-${token.tone}`}>{token.symbol.slice(1, 2)}</span>
                      <strong>{token.symbol}</strong>
                      <i className={`landing-token-dot landing-token-${token.tone}`} />
                    </div>
                    <div className="landing-token-meta">
                      <span>{token.action}</span>
                      <strong>{token.value}</strong>
                    </div>
                    <div className={`landing-sparkline landing-sparkline-${token.tone}`} />
                  </div>
                ))}
              </div>

              <div className="landing-action-row">
                {agentActions.map(({ label, Icon }) => (
                  <button key={label} type="button">
                    <Icon aria-hidden="true" size={13} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="landing-message landing-message-user landing-message-small">
              copy strategy, $20/trade
            </div>

            <div className="landing-agent-live">
              <strong>
                <span />
                Agent live - watching Cupsey
              </strong>
              <p>$20 per trade - max 5/day - rug detection on</p>
              <a href="https://explorer.sui.io" target="_blank" rel="noopener noreferrer">
                sui.io/tx/hQJSQ...3mRx
                <ExternalLink aria-hidden="true" size={12} />
              </a>
            </div>

            <div className="landing-chat-input">
              <span>Type a message...</span>
              <button type="button" aria-label="Send message">
                <Send aria-hidden="true" size={18} />
              </button>
            </div>
          </div>

          <div className="landing-profit">
            <small>P&amp;L TODAY</small>
            <strong>+$42.18</strong>
          </div>
        </aside>
      </section>

      <section className="landing-features" id="features" aria-labelledby="features-title">
        <div className="landing-feature-noise" aria-hidden="true">
          <span className="landing-float-coin landing-float-coin-left">S</span>
          <span className="landing-float-coin landing-float-coin-mid">J</span>
          <span className="landing-float-signal" />
          <span className="landing-float-label landing-float-label-one">[JUP]</span>
          <span className="landing-float-label landing-float-label-two">+</span>
        </div>

        <div className="landing-features-copy">
          <div className="landing-loop-pill">
            <Zap aria-hidden="true" size={13} />
            THE AGENT LOOP
          </div>
          <h2 id="features-title">Deploy Sui agents with verifiable logs</h2>
          <p>
            Suicopilot is a minimal agent stack: deploy an intent, store the strategy and every run log on
            Walrus, and monitor SUI balances via Tatum’s Sui RPC gateway.
          </p>
        </div>

        <div className="landing-feature-grid">
          {featureCards.map(({ eyebrow, title, body, metric, tone, Icon }) => (
            <article className="landing-feature-card" key={title}>
              <div className="landing-feature-card-top">
                <span className="landing-feature-icon">
                  <Icon aria-hidden="true" size={19} />
                </span>
                <code>{eyebrow}</code>
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
              <span className={`landing-feature-metric landing-feature-metric-${tone}`}>
                <i />
                {metric}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-how" id="how-it-works" aria-labelledby="how-title">
        <div className="landing-how-heading">
          <div className="landing-loop-pill">
            <Zap aria-hidden="true" size={13} />
            HOW IT WORKS
          </div>
          <h2 id="how-title">From prompt to monitored Sui agent</h2>
          <p>
            Suicopilot turns one strategy prompt into a tracked agent with Walrus-backed rules,
            scheduled SUI balance checks, and an auditable dashboard.
          </p>
        </div>

        <div className="landing-how-grid">
          {howItWorksSteps.map(({ eyebrow, title, body, detail, tone, Icon }) => (
            <article className="landing-how-card" key={title}>
              <span className={`landing-how-number landing-how-number-${tone}`}>{eyebrow}</span>
              <div className="landing-how-card-top">
                <span className="landing-feature-icon">
                  <Icon aria-hidden="true" size={19} />
                </span>
                <code>{eyebrow}</code>
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
              <span className={`landing-feature-metric landing-feature-metric-${tone}`}>
                <i />
                {detail}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-faq" id="faq" aria-labelledby="faq-title">
        <div className="landing-faq-heading">
          <div className="landing-loop-pill">
            <Zap aria-hidden="true" size={13} />
            QUESTIONS
          </div>
          <h2 id="faq-title">Frequently asked questions</h2>
          <p>Everything you need to know about deploying and monitoring Sui agents with SuiCopilot.</p>
        </div>

        <div className="landing-faq-grid">
          {faqItems.map((item, idx) => (
            <article
              key={idx}
              className="landing-faq-item"
              onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setExpandedFaq(expandedFaq === idx ? null : idx);
                }
              }}
            >
              <div className="landing-faq-question">
                <h3>{item.question}</h3>
                <ChevronDown
                  aria-hidden="true"
                  size={20}
                  className={`landing-faq-chevron ${expandedFaq === idx ? 'expanded' : ''}`}
                />
              </div>
              {expandedFaq === idx && <p className="landing-faq-answer">{item.answer}</p>}
            </article>
          ))}
        </div>
      </section>

      <section className="landing-built-on" id="built-on">
        <div className="landing-built-on-float landing-built-on-float-sui">[SUI]</div>
        <div className="landing-built-on-float landing-built-on-float-cetus">[CETUS]</div>
        <div className="landing-built-on-float landing-built-on-float-deep">[DEEP]</div>
        <div className="landing-built-on-float landing-built-on-float-walrus">[WALRUS]</div>

        <span className="landing-built-on-eyebrow">BUILT ON</span>

        <div className="landing-built-on-brand">
          <svg width="44" height="56" viewBox="0 0 300 383.5" fill="none" xmlns="http://www.w3.org/2000/svg" className="landing-built-on-logo" aria-hidden="true">
            <path fillRule="evenodd" clipRule="evenodd" d="M240.1,159.9c15.6,19.6,25,44.5,25,71.5s-9.6,52.6-25.7,72.4l-1.4,1.7l-0.4-2.2c-0.3-1.8-0.7-3.7-1.1-5.6 c-8-35.3-34.2-65.6-77.4-90.2c-29.1-16.5-45.8-36.4-50.2-59c-2.8-14.6-0.7-29.3,3.3-41.9c4.1-12.6,10.1-23.1,15.2-29.4l16.8-20.5 c2.9-3.6,8.5-3.6,11.4,0L240.1,159.9L240.1,159.9z M266.6,139.4L154.2,2c-2.1-2.6-6.2-2.6-8.3,0L33.4,139.4l-0.4,0.5 C12.4,165.6,0,198.2,0,233.7c0,82.7,67.2,149.8,150,149.8c82.8,0,150-67.1,150-149.8c0-35.5-12.4-68.1-33.1-93.8L266.6,139.4 L266.6,139.4z M60.3,159.5l10-12.3l0.3,2.3c0.2,1.8,0.5,3.6,0.9,5.4c6.5,34.1,29.8,62.6,68.6,84.6c33.8,19.2,53.4,41.3,59.1,65.6 c2.4,10.1,2.8,20.1,1.8,28.8l-0.1,0.5l-0.5,0.2c-15.2,7.4-32.4,11.6-50.5,11.6c-63.5,0-115-51.4-115-114.8 C34.9,204.2,44.4,179.1,60.3,159.5L60.3,159.5z" fill="url(#sui-theme-grad)" />
            <defs>
              <linearGradient id="sui-theme-grad" x1="0" y1="0" x2="300" y2="383.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#9b45ff" />
                <stop offset="0.5" stopColor="#b44cff" />
                <stop offset="1" stopColor="#14f195" />
              </linearGradient>
            </defs>
          </svg>
          <span className="landing-built-on-title">Sui</span>
        </div>

        <p className="landing-built-on-desc">
          Every strategy parsed via NLP. Every execution cycle run in parallel. Every state change verified on Walrus.
        </p>

        <div className="landing-built-on-grid">
          <div className="landing-built-on-card">
            <span className="landing-built-on-card-val">60s</span>
            <span className="landing-built-on-card-lbl">Loop Interval</span>
          </div>
          <div className="landing-built-on-card">
            <span className="landing-built-on-card-val">100%</span>
            <span className="landing-built-on-card-lbl">Walrus Logged</span>
          </div>
          <div className="landing-built-on-card">
            <span className="landing-built-on-card-val">&lt; 30s</span>
            <span className="landing-built-on-card-lbl">Execution Timeout</span>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          {/* Brand column */}
          <div className="landing-footer-brand">
            <div className="landing-footer-logo-row">
              <svg width="28" height="36" viewBox="0 0 300 383.5" fill="none" xmlns="http://www.w3.org/2000/svg" className="landing-footer-logo-svg" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M240.1,159.9c15.6,19.6,25,44.5,25,71.5s-9.6,52.6-25.7,72.4l-1.4,1.7l-0.4-2.2c-0.3-1.8-0.7-3.7-1.1-5.6 c-8-35.3-34.2-65.6-77.4-90.2c-29.1-16.5-45.8-36.4-50.2-59c-2.8-14.6-0.7-29.3,3.3-41.9c4.1-12.6,10.1-23.1,15.2-29.4l16.8-20.5 c2.9-3.6,8.5-3.6,11.4,0L240.1,159.9L240.1,159.9z M266.6,139.4L154.2,2c-2.1-2.6-6.2-2.6-8.3,0L33.4,139.4l-0.4,0.5 C12.4,165.6,0,198.2,0,233.7c0,82.7,67.2,149.8,150,149.8c82.8,0,150-67.1,150-149.8c0-35.5-12.4-68.1-33.1-93.8L266.6,139.4 L266.6,139.4z M60.3,159.5l10-12.3l0.3,2.3c0.2,1.8,0.5,3.6,0.9,5.4c6.5,34.1,29.8,62.6,68.6,84.6c33.8,19.2,53.4,41.3,59.1,65.6 c2.4,10.1,2.8,20.1,1.8,28.8l-0.1,0.5l-0.5,0.2c-15.2,7.4-32.4,11.6-50.5,11.6c-63.5,0-115-51.4-115-114.8 C34.9,204.2,44.4,179.1,60.3,159.5L60.3,159.5z" fill="url(#sui-footer-grad)" />
                <defs>
                  <linearGradient id="sui-footer-grad" x1="0" y1="0" x2="300" y2="383.5" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#9b45ff" />
                    <stop offset="0.5" stopColor="#b44cff" />
                    <stop offset="1" stopColor="#14f195" />
                  </linearGradient>
                </defs>
              </svg>
              <strong className="landing-footer-wordmark">suicopilot</strong>
            </div>
            <p className="landing-footer-tagline">
              Autonomous Sui agents from a single prompt. Strategy on Walrus, execution on-chain.
            </p>
            <div className="landing-footer-badges">
              <span className="landing-footer-badge">
                <span className="landing-footer-badge-dot" />
                MAINNET
              </span>
              <span className="landing-footer-badge landing-footer-badge-green">
                <span className="landing-footer-badge-dot landing-footer-badge-dot-green" />
                LIVE
              </span>
            </div>
          </div>

          {/* Connect Wallet section */}
          <div className="landing-footer-cta">
            <p className="landing-footer-cta-label">Ready to deploy your first agent?</p>
            {mounted ? (
              account ? (
                <button
                  className="landing-footer-wallet-btn"
                  type="button"
                  onClick={() => router.push('/agents')}
                >
                  <span className="landing-footer-wallet-dot" />
                  Go to Dashboard
                  <ArrowRight aria-hidden size={16} />
                </button>
              ) : (
                <WalletAuth variant="landing" connectLabel={
                  <span className="landing-button-content">
                    <Wallet aria-hidden size={17} />
                    Connect Sui Wallet
                    <ArrowRight aria-hidden size={17} />
                  </span>
                } />
              )
            ) : (
              <button className="landing-footer-wallet-btn" type="button" disabled style={{ opacity: 0.5 }}>
                <Wallet aria-hidden size={17} />
                Connect Sui Wallet
              </button>
            )}
            <p className="landing-footer-cta-note">
              Non-custodial · Keys stay in your wallet · Free to start
            </p>
          </div>
        </div>

        <div className="landing-footer-bottom">
          <div className="landing-footer-bottom-inner">
            <span className="landing-footer-copy">
              © 2025 SuiCopilot. Built on Sui Mainnet.
            </span>
            <div className="landing-footer-links">
              <a href="https://x.com/suicopilotlr" target="_blank" rel="noopener noreferrer">Twitter / X</a>
              <a href="https://github.com/suicopilot" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="/THESIS.md" target="_blank" rel="noopener noreferrer">Research</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
