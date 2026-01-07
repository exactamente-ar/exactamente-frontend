interface Props {
  size?: number;
  className?: string;
}

const IconLink: React.FC<Props> = ({ size = 30, className = 'fill-foreground' }) => {
  return (
    <svg viewBox='0 0 24 24' width={size} height={size}>
      <g fill='none'>
        <path
          className={className}
          d='M4 4.001h16v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z'
          opacity='.16'
        ></path>
        <path
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          d='M11 4H4v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5M9 15L20 4m-5 0h5v5'
        ></path>
      </g>
    </svg>
  );
};

export default IconLink;
