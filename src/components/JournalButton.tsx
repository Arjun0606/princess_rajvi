type Props = {
  count: number;
  unread: boolean;
  onClick: () => void;
};

export const JournalButton = ({ count, unread, onClick }: Props) => (
  <button
    onClick={onClick}
    aria-label="journal"
    className="stardew-button"
    style={{
      position: 'absolute',
      top: 'calc(env(safe-area-inset-top, 0) + 14px)',
      right: 14,
      width: 56,
      height: 56,
      padding: 0,
      cursor: 'pointer',
      zIndex: 11,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <span style={{ fontSize: 28, lineHeight: 1, filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.2))' }}>📖</span>
    {count > 0 && (
      <span
        style={{
          position: 'absolute',
          top: -6,
          right: -6,
          minWidth: 22,
          height: 22,
          padding: '0 6px',
          background: unread ? '#ff5d8f' : '#4a2710',
          color: '#fff5dc',
          fontSize: 14,
          fontFamily: 'var(--pixel-font)',
          fontWeight: 400,
          letterSpacing: 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #4a2710',
          boxShadow: '1px 1px 0 0 rgba(0,0,0,0.4)',
        }}
      >
        {count}
      </span>
    )}
  </button>
);
