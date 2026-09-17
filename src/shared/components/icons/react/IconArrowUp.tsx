interface Props {
  size?: number;
  className?: string;
}

const IconArrowUp: React.FC<Props> = ({ size = 20, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <path d='M12 19V5M7.5 9.5L12 5l4.5 4.5' />
    </svg>
  );
};

export default IconArrowUp;
