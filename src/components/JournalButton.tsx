type Props = {
  count: number;
  unread: boolean;
  onClick: () => void;
};

export const JournalButton = ({ count, unread, onClick }: Props) => (
  <button
    onClick={onClick}
    style={{
      position: 'absolute',
      top: 'calc(env(safe-area-inset-top, 0) + 14px)',
      right: 16,
      width: 56,
      height: 56,
      borderRadius: 18,
      border: 'none',
      background: 'rgba(255, 245, 232, 0.82)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
      cursor: 'pointer',
      padding: 0,
      zIndex: 11,
      transition: 'transform 0.15s ease',
    }}
  >
    <img
      src="/art/ui-journal.png"
      alt="journal"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = 'none';
      }}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        padding: 4,
      }}
    />
    <span
      style={{
        position: 'absolute',
        inset: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 30,
        zIndex: -1,
      }}
    >
      📖
    </span>
    {count > 0 && (
      <span
        style={{
          position: 'absolute',
          top: -4,
          right: -4,
          minWidth: 22,
          height: 22,
          padding: '0 6px',
          borderRadius: 11,
          background: unread ? '#ff5d8f' : '#3a1a1a',
          color: '#fff',
          fontSize: 11,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        }}
      >
        {count}
      </span>
    )}
  </button>
);
