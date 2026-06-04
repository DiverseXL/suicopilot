'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  useConnectWallet,
  useCurrentAccount,
  useDisconnectWallet,
  useWallets,
} from '@mysten/dapp-kit';
import { formatAddress } from '@mysten/sui/utils';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  ChevronDown,
  Copy,
  ExternalLink,
  LogOut,
  Shield,
  Wallet,
  X,
} from 'lucide-react';
import './wallet-auth.css';

const PREFERRED = ['Sui Wallet', 'OKX Wallet', 'Nightly', 'Slush'];

type Wallet = ReturnType<typeof useWallets>[number];

type WalletAuthProps = {
  variant?: 'topbar' | 'landing' | 'default';
  className?: string;
  connectLabel?: ReactNode;
};

function sortWallets(wallets: Wallet[]) {
  return [...wallets].sort((a, b) => {
    const ai = PREFERRED.indexOf(a.name);
    const bi = PREFERRED.indexOf(b.name);
    const aRank = ai === -1 ? 99 : ai;
    const bRank = bi === -1 ? 99 : bi;
    return aRank - bRank;
  });
}

function WalletAuthModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const wallets = sortWallets(useWallets());
  const { mutate: connect, isError } = useConnectWallet();
  const [connecting, setConnecting] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const handleConnect = useCallback(
    (wallet: Wallet) => {
      setConnecting(wallet.name);
      connect(
        { wallet },
        {
          onSuccess: () => onClose(),
          onSettled: () => setConnecting(null),
        }
      );
    },
    [connect, onClose]
  );

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="wallet-auth-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wallet-auth-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="wallet-auth-modal">
        <div className="wallet-auth-glow" aria-hidden />
        <button
          type="button"
          className="wallet-auth-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="wallet-auth-header">
          <div className="wallet-auth-brand">
            <div className="wallet-auth-logo" aria-hidden>
              ◈
            </div>
            <div>
              <h2 id="wallet-auth-title" className="wallet-auth-title">
                Connect to SuiCopilot
              </h2>
              <p className="wallet-auth-subtitle">
                Authenticate with your Sui wallet to deploy agents and sign
                strategies on-chain.
              </p>
            </div>
          </div>
        </div>

        <div className="wallet-auth-body">
          <div className="wallet-auth-section-label">Choose wallet</div>
          {wallets.length === 0 ? (
            <div className="wallet-auth-empty">
              No Sui wallets detected. Install{' '}
              <a
                href="https://suiwallet.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#B97BFF' }}
              >
                Sui Wallet
              </a>{' '}
              and refresh.
            </div>
          ) : (
            <div className="wallet-auth-wallet-list">
              {wallets.map((wallet) => {
                const isConnecting = connecting === wallet.name;
                return (
                  <button
                    key={wallet.name}
                    type="button"
                    className={`wallet-auth-wallet-btn${isConnecting ? ' is-connecting' : ''}`}
                    disabled={!!connecting}
                    onClick={() => handleConnect(wallet)}
                  >
                    {wallet.icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={wallet.icon as string}
                        alt=""
                        className="wallet-auth-wallet-icon"
                      />
                    ) : (
                      <div className="wallet-auth-wallet-icon" />
                    )}
                    <span className="wallet-auth-wallet-name">{wallet.name}</span>
                    {isConnecting ? (
                      <span className="wallet-auth-spinner" />
                    ) : (
                      <ArrowRight size={16} style={{ color: 'rgba(160,160,176,1)' }} />
                    )}
                  </button>
                );
              })}
            </div>
          )}
          {isError && (
            <p style={{ color: '#FF4444', fontSize: 13, marginTop: 12, padding: '0 8px' }}>
              Connection failed. Try again or pick another wallet.
            </p>
          )}
        </div>

        <div className="wallet-auth-footer">
          <Shield size={14} />
          <span>
            Your keys never leave your wallet. SuiCopilot only requests connection
            to verify ownership.
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}

function WalletAccountMenu() {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!account) return null;

  const short = formatAddress(account.address);
  const explorer = `https://suiscan.xyz/mainnet/account/${account.address}`;

  const copyAddress = () => {
    navigator.clipboard.writeText(account.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="wallet-auth-connected" ref={ref}>
      <button
        type="button"
        className="wallet-auth-connected-btn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="wallet-auth-dot" />
        {account.label ?? short}
        <ChevronDown size={14} style={{ opacity: 0.7 }} />
      </button>

      {open && (
        <div className="wallet-auth-dropdown">
          <button type="button" className="wallet-auth-dropdown-item" onClick={copyAddress}>
            <Copy size={14} />
            {copied ? 'Copied!' : 'Copy address'}
          </button>
          <a
            href={explorer}
            target="_blank"
            rel="noopener noreferrer"
            className="wallet-auth-dropdown-item"
            style={{ textDecoration: 'none' }}
            onClick={() => setOpen(false)}
          >
            <ExternalLink size={14} />
            View on Suiscan
          </a>
          <div className="wallet-auth-dropdown-divider" />
          <button
            type="button"
            className="wallet-auth-dropdown-item danger"
            onClick={() => {
              disconnect();
              setOpen(false);
            }}
          >
            <LogOut size={14} />
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}

export function WalletAuth({
  variant = 'default',
  className = '',
  connectLabel,
}: WalletAuthProps) {
  const account = useCurrentAccount();
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (account) {
    return <WalletAccountMenu />;
  }

  const openModal = () => setModalOpen(true);

  let trigger: ReactNode;

  if (variant === 'landing') {
    trigger = (
      <button
        type="button"
        className={`landing-primary landing-wallet-button ${className}`.trim()}
        onClick={openModal}
      >
        {connectLabel ?? (
          <span className="landing-button-content">
            <Wallet aria-hidden size={18} />
            Connect Sui wallet
            <ArrowRight aria-hidden size={18} />
          </span>
        )}
      </button>
    );
  } else if (variant === 'topbar') {
    trigger = (
      <button
        type="button"
        className={`wallet-auth-trigger-topbar ${className}`.trim()}
        onClick={openModal}
      >
        <Wallet size={15} />
        Connect wallet
      </button>
    );
  } else {
    trigger = (
      <button
        type="button"
        className={`wallet-auth-trigger-topbar ${className}`.trim()}
        onClick={openModal}
      >
        <Wallet size={15} />
        {connectLabel ?? 'Connect wallet'}
      </button>
    );
  }

  return (
    <>
      {trigger}
      <WalletAuthModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
