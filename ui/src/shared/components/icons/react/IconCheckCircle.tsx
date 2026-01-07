interface Props {
  size?: number;
  className?: string;
}

const IconCheckCircle: React.FC<Props> = ({ size = 30, className = 'stroke-foreground' }) => {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' className={className}>
      <g fill='none' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2'>
        <path d='M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0' />
        <path d='m9 12l2 2l4-4' />
      </g>
    </svg>
  );
};

export default IconCheckCircle;
