import { useState } from 'react';
import NewPostForm from '../composer/NewPostForm';
import PostCard from './PostCard';
import SubtopicChips from './SubtopicChips';
import BlogViewSkeleton from './BlogViewSkeleton';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useBlog } from '../hooks/useBlog';
import { ReplyProvider } from '../context/ReplyContext';
import EmptyState from '@/shared/components/EmptyState';
import { filterPostsBySubtopic, resolveActiveSubtopic } from '../utils/feed';
import type { Subject } from '@/features/home/types/subjects';

interface Props {
  subject: Subject;
}

function BlogViewInner({ subject }: Props) {
  const { token, loading } = useAuth();
  const {
    blog,
    loading: blogLoading,
    error,
    retry,
    addPost,
    addComment,
    removePost,
    removeComment,
    updatePostVote,
    updateCommentVote,
  } = useBlog(subject.id, token, loading);
  const [selected, setSelected] = useState('');

  if (blogLoading) return <BlogViewSkeleton />;

  const subtopics = blog?.subtopics ?? [];
  const activeSubtopicId = resolveActiveSubtopic(selected, subtopics);
  const posts = filterPostsBySubtopic(blog?.posts ?? [], activeSubtopicId);

  return (
    <div
      className='mt-6 relative flex flex-col h-[750px] rounded-2xl border border-zinc-800/50 overflow-hidden scroll-smooth'
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

      {/* Inicio del contenido "real" del blog */}
      <div className='relative z-10 flex min-h-0 flex-1 flex-col h-full'>
        {/* Header fijo arriba con efecto Liquid Glass transparente */}
        <header className='shrink-0 px-4 py-5 w-full rounded-b-2xl border-b border-white/20 bg-white/[0.02] backdrop-saturate-[120%] backdrop-brightness-[110%] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.3),inset_0_-1px_1px_rgba(255,255,255,0.2)] backdrop-blur-md'>
          {/* Brillo especular superior (Glossy) */}
          <div
            className='absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.10] to-transparent pointer-events-none rounded-t-2xl'
            aria-hidden='true'
          />

          <h2 className='relative z-10 shrink-0 text-3xl md:text-4xl font-bold text-white md:m-1 tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]'>
            {subject.shortName || subject.title}
          </h2>

          <div className='relative z-10 shrink-0 mt-4'>
            <SubtopicChips
              subtopics={subtopics}
              selected={activeSubtopicId}
              onChange={setSelected}
            />
          </div>
        </header>

        {/* Scroll únicamente en el área de contenido del blog */}
        <div className='custom-scrollbar relative min-h-0 flex-1 overflow-y-auto p-4 pb-4'>
          {error ? (
            <div className='flex flex-col items-center justify-center h-full gap-3 p-6 text-center'>
              <p className='text-sm text-red-400'>{error}</p>
              <button
                type='button'
                onClick={retry}
                className='rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700'
              >
                Reintentar
              </button>
            </div>
          ) : posts.length > 0 ? (
            <ul className='flex flex-col gap-4'>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  subjectId={subject.id}
                  post={post}
                  onDeleted={removePost}
                  onCommentDeleted={(commentId) => removeComment(post.id, commentId)}
                  onVoteChanged={updatePostVote}
                  onCommentVoteChanged={updateCommentVote}
                />
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
                className='w-32 h-auto -mt-12 md:mt-0 md:w-48'
              />
            </div>
          )}
        </div>

        {/* Input composer fijo en la base */}
        <div className='shrink-0 border-t border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl pt-3 pb-3 px-3'>
          <NewPostForm
            subjectId={subject.id}
            subtopicId={activeSubtopicId}
            onPostCreated={addPost}
            onCommentCreated={addComment}
          />
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
