import { ActionKind } from '../game/state';
import { Draggable } from './Draggable';
import { PixelItem } from './PixelItem';

type Props = {
  onAction: (kind: ActionKind) => void;
};

type PixelKind = 'coke' | 'jager' | 'joint' | 'sunflower';

const BUTTONS: {
  kind: ActionKind;
  pixelKind: PixelKind;
  label: string;
}[] = [
  { kind: 'coke',  pixelKind: 'coke',      label: 'coke' },
  { kind: 'water', pixelKind: 'sunflower', label: 'sunflower' },
  { kind: 'jager', pixelKind: 'jager',     label: 'jäger' },
  { kind: 'weed',  pixelKind: 'joint',     label: 'joint' },
];

export const ActionTray = ({ onAction }: Props) => {
  const handleDropOn = (kind: ActionKind) => (target: string) => {
    if (target === 'princess' || target === 'garden' || target === 'floor') {
      onAction(kind);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 'calc(env(safe-area-inset-bottom, 0) + 14px)',
        left: 0,
        right: 0,
        padding: '0 12px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8,
        zIndex: 10,
      }}
    >
      {BUTTONS.map((b) => (
        <Draggable
          key={b.kind}
          ariaLabel={b.label}
          onTap={() => onAction(b.kind)}
          onDropOn={handleDropOn(b.kind)}
          dragGhost={
            <div style={{ width: 60, height: 78 }}>
              <PixelItem kind={b.pixelKind} size={5} />
            </div>
          }
        >
          <ButtonBody label={b.label} pixelKind={b.pixelKind} />
        </Draggable>
      ))}
    </div>
  );
};

const ButtonBody = ({ label, pixelKind }: { label: string; pixelKind: PixelKind }) => (
  <div
    className="stardew-button"
    style={{
      width: '100%',
      borderRadius: 4,
      padding: '8px 4px 6px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      pointerEvents: 'none',
    }}
  >
    <div
      style={{
        width: 36,
        height: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <PixelItem kind={pixelKind} size={3} />
    </div>
    <span
      style={{
        fontSize: 18,
        fontWeight: 400,
        lineHeight: 1,
        letterSpacing: 0.5,
        marginTop: 2,
      }}
    >
      {label}
    </span>
  </div>
);
