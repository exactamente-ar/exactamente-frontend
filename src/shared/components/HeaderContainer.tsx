interface Props {
  urlImg: string;
  children: React.ReactNode;
}

const Header: React.FC<Props> = ({ urlImg, children }) => {
  return (
    <header
      className='rounded-xl overflow-hidden mt-6 relative gradient-border
       border'
      style={{
        backgroundImage: `url('${urlImg}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'right',
      }}
    >
      <div className='z-40 bg-primary-foreground/70 w-full h-full p-6 m-[1px] rounded-2xl'>{children}</div>
    </header>
  );
};

export default Header;
