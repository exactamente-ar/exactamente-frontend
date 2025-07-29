import Card from './CardSubject';
import CardSubjectLoading from './CardSubjectLoading';
import type { PropsListOfSubjects } from '@/types/filter';

function ListOfSubjects({ subjects, setFilters, loading, hasMore, showMore }: PropsListOfSubjects) {
  if (loading) {
    return (
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8'>
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSubjectLoading key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center'>
      <div className='w-full grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8'>
        {subjects.length == 0 ? (
          <div className='col-span-full w-full px-6 py-10 rounded-xl bg-gradient-to-br from-zinc-900/90 to-zinc-950/95 border border-border/60 overflow-hidden hover:border-zinc-700/80 text-center shadow-md'>
            <h2 className='text-xl font-semibold text-zinc-100 mb-2'>Sin resultados</h2>
            <p className='text-zinc-400 mb-4'>
              No se encontraron coincidencias con los filtros seleccionados.
            </p>
            <button
              className='hover:scale-105 duration-200 cursor-pointer px-4 py-2 mt-2 rounded-full bg-[#ffd100] text-black font-medium hover:brightness-110 transition'
              onClick={() => {
                setFilters({
                  search: '',
                  quadmester: 0,
                  year: 0,
                  carrer: 'Ingenieria en Sistemas',
                });
              }}
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          subjects.map((subject) => {
            return <Card key={subject.id} {...subject} />;
          })
        )}
      </div>
      {hasMore && (
        <button
          className='text-primary-foreground font-bold rounded-xl px-10 mt-10 cursor-pointer hover:scale-105 py-3 bg-primary '
          onClick={() => showMore()}
        >
          Ver más
        </button>
      )}
    </div>
  );
}

export default ListOfSubjects;
