// components/IconBooks.tsx
interface Props {
  size: number;
  className?: string;
}

export default function IconOpenBook({ size = 25, className = 'fill-white' }: Props) {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' className={className}>
      <path d='m13 16.006l7-.047V5.992l-5.17.007l-1.814 1.814zm-2-8.193L9.179 6.038L4 6.003v9.956l7 .047zm-1-3.77L12 6l2-2l5.997-.008A2 2 0 0 1 22 5.989v9.97a2 2 0 0 1-1.986 2L14 18l-1.996 2L10 18l-6.014-.041a2 2 0 0 1-1.986-2V6.003a2 2 0 0 1 2-2z' />
    </svg>
  );
}
