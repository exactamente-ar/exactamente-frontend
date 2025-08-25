import React from 'react';
import IconDocument from '@/assets/icons/react/IconDocument';
import ContainerLink from '../common/ContainerLink';
import type { ResourceFetch } from '@/types/resource';
import CardResource from './CardResource';
import CardResourceLoading from './CardResourceLoading';

interface Props {
  resources: ResourceFetch[];
  type: string;
  error: string | null;
  loading: boolean;
}

const ListOfResources: React.FC<Props> = ({ resources, type, error, loading = true }) => {
  if (loading) {
    return (
      <div className='grid grid-cols-1 gap-4 mt-4'>
        {Array.from({ length: 3 }).map((_, i) => (
          <CardResourceLoading key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center mt-6 text-center text-red-400'>
        <h2 className='text-xl font-bold mb-2'>Error al cargar los recursos</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-4 mt-4'>
      {resources && resources.length == 0 ? (
        <div className='flex flex-col w-full px-6 py-10 rounded-xl bg-gradient-to-br from-zinc-900/90 to-zinc-950/95 border border-border/60 overflow-hidden hover:border-zinc-700/80 text-center shadow-md'>
          <h2 className='text-xl font-semibold text-zinc-100 mb-2'>Sin resultados</h2>
          <p className='text-zinc-400 mb-4'>No se encontraron {type} disponibles.</p>
          <ContainerLink
            url='/upload'
            className='border border-accent text-foreground w-max mx-auto mt-3 font-bold'
          >
            <div className='flex gap-2 items-center'>
              <IconDocument size={20} />
              <span> Subir {type} </span>
            </div>
          </ContainerLink>
        </div>
      ) : (
        <>
          {(resources ?? []).map((resource, i) => (
            <CardResource
              key={resource.title + i}
              title={resource.title}
              urlDrive={resource.urlDrive}
              type={type}
              mostRecent={i === 0}
            />
          ))}
          <ContainerLink
            url='/upload'
            className='border border-accent text-foreground bg-gradient-to-br from-zinc-900/90 to-zinc-950/95 w-max mx-auto mt-5 font-bold'
          >
            <div className='flex gap-2 items-center px-2 justify-center'>
              <IconDocument size={17} className='fill-foreground' />
              <span> Subir {type} </span>
            </div>
          </ContainerLink>
        </>
      )}
    </div>
  );
};

export default ListOfResources;
