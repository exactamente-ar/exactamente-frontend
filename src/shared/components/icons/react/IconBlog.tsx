interface Props {
  size: number;
  className?: string;
}

export default function IconBlog({ size = 25, className = 'fill-white' }: Props) {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' className={className}>
      <path d='M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z' />
    </svg>
  );
}
