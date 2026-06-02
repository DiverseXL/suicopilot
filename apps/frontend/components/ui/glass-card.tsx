import { CSSProperties, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  onClick?: () => void;
}

export function GlassCard({ children, style, className, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'rgba(13,13,20,0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        ...style
      }}
      className={className}
    >
      {children}
    </div>
  );
}
