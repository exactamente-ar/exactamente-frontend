interface Props {
  size?: number;
  className?: string;
  gradient?: boolean;
}

const IconDocument: React.FC<Props> = ({ size = 30, className = 'fill-foreground', gradient = false }) => {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24'>
      {gradient && (
        <defs>
          <linearGradient id='icon-doc-grad' x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' stopColor='#6b46c1' />
            <stop offset='33%' stopColor='#b83280' />
            <stop offset='66%' stopColor='#f6e05e' />
            <stop offset='100%' stopColor='#38b2ac' />
          </linearGradient>
        </defs>
      )}
      <path
        fill={gradient ? 'url(#icon-doc-grad)' : undefined}
        className={gradient ? undefined : className}
        d='M4 4a2 2 0 0 1 2-2h8a1 1 0 0 1 .707.293l5 5A1 1 0 0 1 20 8v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm13.586 4L14 4.414V8zM12 4H6v16h12V10h-5a1 1 0 0 1-1-1zm-4 9a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1m0 4a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1'
      />
    </svg>
  );
};

export default IconDocument;
