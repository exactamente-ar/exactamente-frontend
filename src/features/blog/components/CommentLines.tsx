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
  const curveHeight = 'h-[46px]';

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
        className={`absolute -left-[29px] top-0 w-[29px] ${curveHeight} border-b-[1.5px] border-l-[1.5px] rounded-bl-3xl cursor-pointer transition-all ${getLineColor(isActive)} after:content-[''] after:absolute after:-left-[15px] after:-right-[15px] after:-top-[15px] after:-bottom-[15px]`}
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
          className={`absolute -left-[29px] top-0 border-l-[1.5px] cursor-pointer transition-all ${getLineColor(isDownwardLineActive)} ${isRoot ? '-bottom-1' : '-bottom-3'} after:content-[''] after:absolute after:-left-[15px] after:-right-[15px] after:-top-[5px] after:-bottom-[5px]`}
          style={getLineStyle(isDownwardLineActive)}
        />
      )}
    </>
  );
}
