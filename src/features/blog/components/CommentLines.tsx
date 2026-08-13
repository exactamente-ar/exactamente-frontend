import { getLineColor, getLineStyle } from '../constants/comments';

interface Props {
  isActive: boolean;
  isDownwardLineActive: boolean;
  isLast: boolean;
  isRoot: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export default function CommentLines({
  isActive,
  isDownwardLineActive,
  isLast,
  isRoot,
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
        className={`absolute -left-[29px] top-0 w-[29px] ${curveHeight} border-b-2 border-l-2 rounded-bl-2xl cursor-pointer transition-all ${getLineColor(isActive)}`}
        style={getLineStyle(isActive)}
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
          className={`absolute -left-[29px] top-0 border-l-2 cursor-pointer transition-all ${getLineColor(isDownwardLineActive)} ${isRoot ? '-bottom-1' : '-bottom-3'}`}
          style={getLineStyle(isDownwardLineActive)}
        />
      )}
    </>
  );
}
