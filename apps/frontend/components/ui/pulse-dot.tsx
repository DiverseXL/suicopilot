type Color = 'green' | 'purple' | 'yellow' | 'red';

const COLORS: Record<Color, string> = {
  green: '#14F195',
  purple: '#9945FF',
  yellow: '#FFB800',
  red: '#FF4444',
};

export function PulseDot({ color = 'green', size = 6 }: { color?: Color; size?: number }) {
  const c = COLORS[color];
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: size, height: size }}>
      <span style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: c, opacity: 0.4,
        animation: 'pulse-ring 2s ease-out infinite'
      }} />
      <span style={{
        position: 'relative', width: size, height: size,
        borderRadius: '50%', background: c,
        boxShadow: `0 0 6px ${c}`
      }} />
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </span>
  );
}