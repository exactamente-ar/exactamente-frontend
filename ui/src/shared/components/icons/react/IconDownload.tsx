interface Props {
  size?: number;
  className?: string;
}

const IconDownload: React.FC<Props> = ({ size = 30, className = 'fill-foreground' }) => {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24'>
      <path
        className={className}
        d='m12 16l-5-5l1.4-1.45l2.6 2.6V4h2v8.15l2.6-2.6L17 11zm-6 4q-.825 0-1.412-.587T4 18v-3h2v3h12v-3h2v3q0 .825-.587 1.413T18 20z'
      />
    </svg>
  );
};

export default IconDownload;
