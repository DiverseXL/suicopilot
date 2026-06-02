import type { ThemeVars } from '@mysten/dapp-kit';

/** Dark theme for any remaining @mysten/dapp-kit UI surfaces */
export const suicopilotWalletTheme: ThemeVars = {
  blurs: {
    modalOverlay: 'blur(8px)',
  },
  backgroundColors: {
    primaryButton: 'rgba(153, 69, 255, 0.25)',
    primaryButtonHover: 'rgba(153, 69, 255, 0.4)',
    outlineButtonHover: 'rgba(255, 255, 255, 0.06)',
    modalOverlay: 'rgba(5, 5, 10, 0.75)',
    modalPrimary: '#0D0D14',
    modalSecondary: '#13131E',
    iconButton: 'transparent',
    iconButtonHover: 'rgba(255, 255, 255, 0.08)',
    dropdownMenu: '#13131E',
    dropdownMenuSeparator: 'rgba(255, 255, 255, 0.08)',
    walletItemSelected: 'rgba(153, 69, 255, 0.15)',
    walletItemHover: 'rgba(153, 69, 255, 0.08)',
  },
  borderColors: {
    outlineButton: 'rgba(255, 255, 255, 0.1)',
  },
  colors: {
    primaryButton: '#FAFAFA',
    outlineButton: '#B97BFF',
    iconButton: '#FAFAFA',
    body: '#FAFAFA',
    bodyMuted: '#A0A0B0',
    bodyDanger: '#FF4444',
  },
  radii: {
    small: '8px',
    medium: '10px',
    large: '14px',
    xlarge: '18px',
  },
  shadows: {
    primaryButton: '0 8px 32px rgba(153, 69, 255, 0.35)',
    walletItemSelected: '0 0 0 1px rgba(153, 69, 255, 0.4)',
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    bold: '600',
  },
  fontSizes: {
    small: '13px',
    medium: '15px',
    large: '17px',
    xlarge: '20px',
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
    fontStyle: 'normal',
    lineHeight: '1.4',
    letterSpacing: '0',
  },
};
