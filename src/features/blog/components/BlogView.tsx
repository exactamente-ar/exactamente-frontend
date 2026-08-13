import { useState } from 'react';
import NewPostForm from './NewPostForm';
import PostCard from './PostCard';
import SubtopicChips from './SubtopicChips';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ReplyProvider } from '../context/ReplyContext';
import { GoogleLoginButton } from '@/features/auth/components/GoogleLoginButton';
import EmptyState from '@/shared/components/EmptyState';
import { ALL_SUBTOPICS_ID, filterPostsBySubtopic, resolveComposerSubtopic } from '../utils/feed';
import type { Blog } from '@/features/blog/types/blog';
import type { Subject } from '@/features/home/types/subjects';

interface Props {
  subject: Subject;
  blog: Blog | null;
}

function BlogViewInner({ subject, blog }: Props) {
  const { token, loading } = useAuth();
  const subtopics = blog?.subtopics ?? [];
  const [selected, setSelected] = useState(ALL_SUBTOPICS_ID);

  const posts = filterPostsBySubtopic(blog?.posts ?? [], selected);
  const composerSubtopicId = resolveComposerSubtopic(selected, subtopics);
  const gated = !loading && !token;

  return (
    <div
      className='mt-6 relative flex min-h-0 flex-1 flex-col rounded-2xl border border-zinc-800/50 overflow-hidden scroll-smooth'
      style={{
        backgroundImage: 'url("/images/materia-2.webp")',
        backgroundSize: 'cover',
        backgroundPosition: 'right',
      }}
    >
      {/* Fondo oscuro sobre la imagen */}
      <div className='absolute inset-0 bg-zinc-950/80 pointer-events-none' />

      {/* Borde giratorio con los mismos colores */}
      <div
        className='absolute inset-0 pointer-events-none rounded-2xl overflow-hidden z-0'
        style={{
          padding: '1px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      >
        <div className='absolute left-1/2 top-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(#6b46c1,#b83280,#f6e05e,#38b2ac,#6b46c1)] opacity-40 animate-[spin_6s_linear_infinite]' />
      </div>

      <div className='relative z-10 flex min-h-0 flex-1 flex-col gap-4 md:py-6'>
        <header className='md:px-4 w-full gap-2'>
          {/* todo hacer efecto cool en este titulo idk */}
          <h2 className='shrink-0 text-4xl font-bold text-white md:m-1'>
            {subject.shortName || subject.title}
          </h2>

          <div className='shrink-0'>
            <SubtopicChips subtopics={subtopics} selected={selected} onChange={setSelected} />
          </div>
        </header>
        <div className='relative flex min-h-0 flex-1 flex-col'>
          <div
            className={`flex min-h-0 flex-1 flex-col ${
              gated ? 'pointer-events-none select-none blur-sm' : ''
            }`}
          >
            <div className='min-h-0 flex-1 overflow-y-auto pb-18'>
              {posts.length > 0 ? (
                <ul className='flex flex-col gap-4'>
                  {posts.map((post) => (
                    <PostCard key={post.id} subjectId={subject.id} post={post} />
                  ))}
                </ul>
              ) : (
                <div className='flex flex-col items-center justify-center h-full'>
                  <EmptyState
                    title='Todavía no hay publicaciones'
                    description='Sé el primero en preguntar o compartir algo.'
                  />
                  <img
                    src='/illustrations/empty_blog_illustation.svg'
                    alt='No hay publicaciones'
                    className='w-48 h-auto'
                  />
                </div>
              )}
            </div>

            <div className='shrink-0 border-t border-zinc-800 pt-3'>
              <NewPostForm subjectId={subject.id} subtopicId={composerSubtopicId} />
            </div>
          </div>

          {gated && (
            <div className='absolute inset-0 z-10 flex items-center justify-center p-4 bottom-20'>
              <div className='flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-zinc-700/60 bg-zinc-900/90 p-6 text-center shadow-2xl shadow-black/50'>
                <p className='text-sm text-zinc-300'>
                  Iniciá sesión para leer y participar en el blog.
                </p>
                <GoogleLoginButton />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BlogView(props: Props) {
  return (
    <AuthProvider>
      <ReplyProvider>
        <BlogViewInner {...props} />
      </ReplyProvider>
    </AuthProvider>
  );
}
