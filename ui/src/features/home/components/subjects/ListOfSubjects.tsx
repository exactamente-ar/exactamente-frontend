import type { PropsListOfSubjects } from '../../types/filter';
import Card from './CardSubject';
import CardSubjectLoading from './CardSubjectLoading';

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
          <div className='col-span-full w-full px-6 py-10 rounded-xl bg-gradient-to-br from-zinc-900/90 to-zinc-950/95 border gradient-border  overflow-hidden hover:border-zinc-700/80 text-center shadow-md'>
            <h2 className='text-xl font-semibold text-zinc-100 mb-2'>Sin resultados</h2>
            <p className='text-zinc-400 mb-4'>
              No se encontraron coincidencias con los filtros seleccionados.
            </p>

              <button
               onClick={() => {
                setFilters({
                  search: '',
                  quadmester: 0,
                  year: 0,
                  carrer: 'Ingenieria en Sistemas',
                });
              }}
        className='mx-auto cursor-pointer flex items-center  duration-200 hover:scale-105 rounded-xl  gradient-bg gradient-border  font-bold text-white shadow-sm '
      >
       <div className="bg-black/40 mx-[1px] relative inset-0 z-0 rounded-2xl gap-2 flex items-center justify-center px-5 py-3">
         
        Restablecer filtros
    </div>
       
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
