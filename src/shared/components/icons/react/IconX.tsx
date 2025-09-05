interface Props {
  size?: number;
  className?: string;
}

const IconX: React.FC<Props> = ({ size = 30, className = 'fill-foreground' }) => {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' className={className}>
      <path
        fill='none'
        stroke='#000000'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
        d='M18 6L6 18M6 6l12 12'
      />
    </svg>
  );
};

export default IconX;
