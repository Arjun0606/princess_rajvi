import { ReactNode, useRef, useState, PointerEvent } from 'react';

type Props = {
  // Fired when this item is released over an element with data-drop-target=name.
  onDropOn: (target: string) => void;
  // Fired on a quick tap (no significant drag).
  onTap?: () => void;
  // Fired when drag starts (so the parent can hide other items / dim background).
  onDragStart?: () => void;
  onDragEnd?: () => void;
  children: ReactNode;
  ariaLabel?: string;
};

const TAP_THRESHOLD_PX = 8;
const TAP_THRESHOLD_MS = 220;

// Pointer-driven draggable. Touch + mouse + pen all flow through pointer events,
// so we don't have to ship two code paths. While dragging, the child renders
// in a fixed-position layer that follows the finger; on release we hit-test
// against any element with a matching data-drop-target attribute.
export const Draggable = ({ onDropOn, onTap, onDragStart, onDragEnd, children, ariaLabel }: Props) => {
  const startRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const finishDrag = (clientX: number, clientY: number) => {
    setPos(null);
    setDragging(false);
    onDragEnd?.();
    const start = startRef.current;
    startRef.current = null;
    const moved = start
      ? Math.hypot(clientX - start.x, clientY - start.y)
      : 0;
    const elapsed = start ? performance.now() - start.t : 0;

    // Tap: little to no movement, short duration → trigger tap.
    if (moved < TAP_THRESHOLD_PX && elapsed < TAP_THRESHOLD_MS) {
      onTap?.();
      return;
    }

    // Drag: hit-test for a drop target under the release point.
    const targets = document.elementsFromPoint(clientX, clientY);
    for (const el of targets) {
      const t = (el as HTMLElement).dataset?.dropTarget;
      if (t) {
        onDropOn(t);
        return;
      }
    }
    // Released over nothing useful — silent snap back.
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    startRef.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const start = startRef.current;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (!dragging && Math.hypot(dx, dy) >= TAP_THRESHOLD_PX) {
      setDragging(true);
      onDragStart?.();
    }
    if (dragging || Math.hypot(dx, dy) >= TAP_THRESHOLD_PX) {
      setPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!startRef.current) return;
    finishDrag(e.clientX, e.clientY);
  };

  const handlePointerCancel = () => {
    startRef.current = null;
    setPos(null);
    setDragging(false);
    onDragEnd?.();
  };

  return (
    <>
      <div
        role="button"
        aria-label={ariaLabel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        style={{
          touchAction: 'none',
          userSelect: 'none',
          opacity: dragging ? 0.35 : 1,
          transition: dragging ? 'none' : 'opacity 0.18s ease',
          width: '100%',
          height: '100%',
        }}
      >
        {children}
      </div>
      {dragging && pos && (
        <div
          style={{
            position: 'fixed',
            left: pos.x,
            top: pos.y,
            transform: 'translate(-50%, -55%) scale(1.4)',
            pointerEvents: 'none',
            zIndex: 100,
            filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.45))',
          }}
        >
          {children}
        </div>
      )}
    </>
  );
};
