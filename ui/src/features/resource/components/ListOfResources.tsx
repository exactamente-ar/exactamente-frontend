import React from 'react';
import IconDocument from '@/shared/components/icons/react/IconDocument';
import type { ResourceDTO } from '../../../../../aplication/resource/resource.dto';
import CardResource from './CardResource';
import CardResourceLoading from './CardResourceLoading';

interface Props {
  resources: ResourceDTO[];
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
        <div className='flex flex-col w-full px-6 py-10 rounded-xl bg-linear-to-br from-zinc-900/90 to-zinc-950/95 border gradient-border  overflow-hidden hover:border-zinc-700/80 text-center shadow-md'>
          <h2 className='text-xl font-semibold text-zinc-100 mb-2'>Sin resultados</h2>
          <p className='text-zinc-400 mb-4'>No se encontraron {type} disponibles.</p>
            <a 
            href='/upload'
        className='mx-auto cursor-pointer flex items-center  duration-200 hover:scale-105 rounded-xl  gradient-bg gradient-border  font-bold text-white shadow-sm '

          >
            <div
              className="bg-black/40 m-0.5 relative inset-0 z-0 rounded-2xl gap-2 flex items-center justify-center px-5 py-3">
              <IconDocument size={17} className='fill-foreground' />
              <span> Subir {type} </span>
            </div>
          </a >
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

          <a 
            href='/upload'
            className='mx-auto cursor-pointer flex items-center mt-10 duration-200 hover:scale-105 rounded-xl  gradient-bg gradient-border  font-bold text-white shadow-sm '

          >
            <div
              className="bg-black/40 m-0.5 relative inset-0 z-0 rounded-2xl gap-2 flex items-center justify-center px-5 py-3">
              <IconDocument size={17} className='fill-foreground' />
              <span> Subir {type} </span>
            </div>
          </a >
        </>
      )}
    </div>
  );
};

export default ListOfResources;
