interface Props {
  url: string;
  className?: string;
  target?: string;
  rel?: string;
  children: React.ReactNode;
}

const ContainerLink: React.FC<Props> = ({ url, rel, className = '', target, children }) => {
  return (
    <a
      id='link'
      target={target}
      href={url}
      rel={rel}
      className={`rounded-xl hover:scale-105 transition-all duration-200 px-5 py-3 text-sm shadow-sm cursor-pointer ${className}`}
    >
      {children}
    </a>
  );
};

export default ContainerLink;
