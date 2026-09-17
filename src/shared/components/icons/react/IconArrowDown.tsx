interface Props {
  size?: number;
  className?: string;
}

const IconArrowDown: React.FC<Props> = ({ size = 20, className = '' }) => {
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
      <path d='M12 5v14M7.5 14.5L12 19l4.5-4.5' />
    </svg>
  );
};

export default IconArrowDown;
