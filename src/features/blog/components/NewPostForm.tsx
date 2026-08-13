import { useRef, useState, useEffect, type ChangeEvent } from 'react';
import { CornerDownRight, EyeOff, ImagePlus, LoaderCircle, Send, X } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { createPost, createComment } from '@/shared/services/api';
import { useReplyContext } from '../context/ReplyContext';
import { snippetOf } from '../utils/format';

interface Props {
  subjectId: string;
  subtopicId: string;
}

const MAX_IMAGES = 6;

export default function NewPostForm({ subjectId, subtopicId }: Props) {
  const { token } = useAuth();
  const { replyTarget, setReplyTarget } = useReplyContext();
  const [body, setBody] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file));
    setImagePreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [images]);

  function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    setImages((prev) => [...prev, ...Array.from(files)].slice(0, MAX_IMAGES));
    e.target.value = '';
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function resizeTextarea() {
    const area = textareaRef.current;
    if (!area) return;
    area.style.height = 'auto';
    area.style.height = `${Math.min(area.scrollHeight, 160)}px`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !body.trim() || submitting) return;
    if (!replyTarget && !subtopicId) return;

    setSubmitting(true);
    setError(null);
    const authority = anonymous ? 'anonymous' : 'visible';

    const result = replyTarget
      ? await createComment(
          subjectId,
          replyTarget.postId,
          { parentId: replyTarget.parentId, body: body.trim(), authority, images },
          token,
        )
      : await createPost(subjectId, { subtopicId, body: body.trim(), authority, images }, token);

    setSubmitting(false);
    if (result.error !== null) {
      setError(result.error);
      return;
    }
    window.location.reload();
  }

  const canSend = Boolean(token && body.trim() && (replyTarget || subtopicId)) && !submitting;

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-2'>
      {replyTarget && (
        <div className='flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-xs text-zinc-400'>
          <CornerDownRight size={14} className='shrink-0 text-zinc-500' />
          <span className='min-w-0 truncate'>
            Respondiendo a: <span className='text-zinc-200'>{snippetOf(replyTarget.snippet)}</span>
          </span>
          <button
            type='button'
            onClick={() => setReplyTarget(null)}
            aria-label='Cancelar respuesta'
            className='ml-auto shrink-0 text-zinc-500 transition-colors hover:text-zinc-200'
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className='flex items-end gap-2 rounded-xl border border-zinc-700/60 bg-zinc-900/70 p-2'>
        <input
          ref={fileInputRef}
          type='file'
          accept='image/jpeg,image/png,image/webp'
          multiple
          className='hidden'
          onChange={handleFiles}
        />
        <button
          type='button'
          onClick={() => fileInputRef.current?.click()}
          aria-label='Agregar imágenes'
          title='Agregar imágenes'
          className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200'
        >
          <ImagePlus size={20} />
        </button>

        <div className='flex flex-col flex-1 gap-2 bg-transparent overflow-hidden'>
          {images.length > 0 && (
            <div className='flex flex-wrap gap-2 pt-2 px-1'>
              {imagePreviews.map((url, i) => (
                <div key={i} className='relative group'>
                  <img
                    src={url}
                    className='h-16 w-16 rounded-md object-cover border border-zinc-700'
                    alt=''
                  />
                  <button
                    type='button'
                    onClick={() => removeImage(i)}
                    className='absolute -top-1.5 -right-1.5 flex items-center justify-center h-5 w-5 bg-zinc-800 border border-zinc-600 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors'
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              resizeTextarea();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (canSend) {
                  handleSubmit({ preventDefault: () => {} } as React.FormEvent);
                }
              }
            }}
            placeholder='¿Qué querés preguntar o compartir?'
            maxLength={50_000}
            rows={1}
            className='max-h-40 flex-1 resize-none bg-transparent py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none'
          />
        </div>

        <button
          type='button'
          onClick={() => setAnonymous(!anonymous)}
          className={`flex h-10 shrink-0 select-none items-center justify-center gap-1.5 rounded-full px-3 text-xs transition-colors ${
            anonymous
              ? 'text-zinc-100 bg-zinc-800'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
          }`}
          title='Publicar como anónimo'
        >
          <EyeOff size={16} aria-hidden='true' />
          <span className='hidden sm:inline'>Anónimo</span>
        </button>

        <button
          type='submit'
          disabled={!canSend}
          aria-label='Enviar'
          className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-200 transition-colors hover:bg-yellow-500/30 disabled:opacity-40'
        >
          {submitting ? <LoaderCircle size={20} className='animate-spin' /> : <Send size={20} />}
        </button>
      </div>

      {error && (
        <p className='text-sm text-red-400' role='alert'>
          {error}
        </p>
      )}
    </form>
  );
}
