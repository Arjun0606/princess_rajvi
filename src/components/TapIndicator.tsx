type Props = {
  x: number;
  y: number;
  nonce: number;
};

// Small Stardew-style ring that briefly appears where the user tapped to
// walk. Disappears after the animation finishes.
export const TapIndicator = ({ x, y, nonce }: Props) => {
  return (
    <div
      key={nonce}
      style={{
        position: 'fixed',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 8,
        animation: 'tap-ring 0.55s ease-out forwards',
      }}
    >
      <svg viewBox="0 0 16 16" width="40" height="40" shapeRendering="crispEdges">
        <g fill="none" stroke="#fff5dc" strokeWidth="1">
          <rect x="2" y="6" width="12" height="4" />
        </g>
        <g fill="#fff5dc">
          <rect x="6" y="6" width="1" height="1" />
          <rect x="9" y="6" width="1" height="1" />
          <rect x="6" y="9" width="1" height="1" />
          <rect x="9" y="9" width="1" height="1" />
        </g>
      </svg>
    </div>
  );
};
