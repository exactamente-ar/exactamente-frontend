import { HOVER_DURATION_MS, ENABLE_LINE_GLOW } from '../constants/comments';

interface Props {
  isActive: boolean;
  isDownwardLineActive: boolean;
  isLast: boolean;
  isRoot: boolean;
  depth: number;
  onClick: (e: React.MouseEvent) => void;
}

function lineColor(active: boolean): string {
  return active ? 'border-zinc-300 z-10' : 'border-zinc-600 z-0';
}

function lineStyle(active: boolean, depth: number): React.CSSProperties {
  // Animamos con un delay progresivo basado en la profundidad
  const delay = active ? depth * 40 : 0; // Se enciende de arriba hacia abajo, se apaga de golpe (o podes dejar delay en ambos)

  return {
    transitionDuration: `${HOVER_DURATION_MS}ms`,
    transitionDelay: `${delay}ms`,
    ...(active && ENABLE_LINE_GLOW
      ? { filter: 'drop-shadow(0 0 3px rgba(228, 228, 231, 0.6))' }
      : {}),
  };
}

export default function CommentLines({
  isActive,
  isDownwardLineActive,
  isLast,
  isRoot,
  depth,
  onClick,
}: Props) {
  // La curva debe apuntar hacia el centro del avatar o el puntaje.
  // Ajustamos la altura de la curva desde arriba (top-0) hasta donde sea necesario.
  // top-0 asegura que siempre conecte con el elemento anterior.
  const curveHeight = 'h-[46px]'; // equivalente a top-7 (28px) + h-[18px]

  return (
    <>
      {/* Curva conectora al comentario */}
      <div
        onClick={onClick}
        role='button'
        tabIndex={-1}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(e as unknown as React.MouseEvent);
          }
        }}
        className={`absolute -left-[29px] top-0 w-[29px] ${curveHeight} border-b-2 border-l-2 rounded-bl-2xl cursor-pointer transition-all ${lineColor(isActive)}`}
        style={lineStyle(isActive, depth)}
      />

      {/* Línea recta que sigue hacia abajo para conectar con el SIGUIENTE hermano */}
      {!isLast && (
        <div
          onClick={onClick}
          role='button'
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick(e as unknown as React.MouseEvent);
            }
          }}
          className={`absolute -left-[29px] top-0 border-l-2 cursor-pointer transition-all ${lineColor(isDownwardLineActive)} ${isRoot ? '-bottom-1' : '-bottom-3'}`}
          style={lineStyle(isDownwardLineActive, depth)}
        />
      )}
    </>
  );
}
