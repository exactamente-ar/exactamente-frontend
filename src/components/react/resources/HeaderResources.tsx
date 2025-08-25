import React from 'react';
import HeaderContainer from '@/components/react/common/HeaderContainer';

interface Props {
  urlImg: string;
  title: string;
  subject: string;
  cantResource: number;
  children?: React.ReactNode;
  loading: boolean;
}

const HeaderResources: React.FC<Props> = ({
  urlImg,
  title,
  subject,
  cantResource,
  loading,
  children,
}) => {
  return (
    <HeaderContainer urlImg={urlImg}>
      <div className='flex items-center justify-start gap-2'>
        {children}
        <h2 className='text-3xl sm:text-4xl font-bold text-foreground'>{title}</h2>
      </div>
      <h5 className='text-foreground-secondary text-xl mt-2 font-semibold'>{subject}</h5>
      <p className='text-foreground-muted mt-1'>Ingeniería en Sistemas</p>
      {loading ? (
        <p className='w-max  mt-3 text-transparent font-semibold rounded-full px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 animate-pulse'>
          22 recursos disponibles
        </p>
      ) : (
        <p className='w-max mt-3 bg-gradient-to-r from-yellow-500/15 to-yellow-600/15 border border-yellow-500/30 text-yellow-200 font-semibold px-4 py-2 rounded-full'>
          {cantResource} recursos disponibles
        </p>
      )}
    </HeaderContainer>
  );
};

export default HeaderResources;
