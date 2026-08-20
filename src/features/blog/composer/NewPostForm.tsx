import { useRef, useState, useEffect, type ChangeEvent } from 'react';
import { CornerDownRight, EyeOff, FileText, ImagePlus, LoaderCircle, Send, X } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { GoogleLoginButton } from '@/features/auth/components/GoogleLoginButton';
import { createPost, createComment } from '@/shared/services/api';
import { useReplyContext } from '../context/ReplyContext';
import { snippetOf } from '../utils/format';
import { FormatSelector } from './FormatSelector';
import type { BlogComment, BlogPost } from '../types/blog';

interface Props {
  subjectId: string;
  subtopicId: string;
  onPostCreated?: (post: BlogPost) => void;
  onCommentCreated?: (postId: string, comment: BlogComment) => void;
}

const MAX_ATTACHMENTS = 6;
const PDF_MIME = 'application/pdf';

export default function NewPostForm({
  subjectId,
  subtopicId,
  onPostCreated,
  onCommentCreated,
}: Props) {
  const { token } = useAuth();
  const { replyTarget, setReplyTarget } = useReplyContext();
  const [body, setBody] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file));
    setImagePreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [images]);

  useEffect(() => {
    const area = textareaRef.current;
    if (!area) return;
    if (!body) {
      area.style.height = 'auto';
      area.style.overflowY = 'hidden';
      return;
    }
    area.style.height = 'auto';
    const newHeight = area.scrollHeight;
    const maxHeight = 320;

    if (newHeight > maxHeight) {
      area.style.height = `${maxHeight}px`;
      area.style.overflowY = 'auto';
    } else if (newHeight > 0) {
      area.style.height = `${newHeight}px`;
      area.style.overflowY = 'hidden';
    } else {
      area.style.height = 'auto';
      area.style.overflowY = 'hidden';
    }
  }, [body]);

  function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    if (images.length + files.length > MAX_ATTACHMENTS) {
      setError(`Podés adjuntar hasta ${MAX_ATTACHMENTS} archivos`);
      e.target.value = '';
      return;
    }
    setError(null);
    setImages((prev) => [...prev, ...files]);
    e.target.value = '';
  }

  function removeImage(index: number) {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length <= MAX_ATTACHMENTS) {
        setError(null);
      }
      return next;
    });
  }

  function resizeTextarea() {
    const area = textareaRef.current;
    if (!area) return;
    if (!body) {
      area.style.height = 'auto';
      area.style.overflowY = 'hidden';
      return;
    }
    area.style.height = 'auto';
    const newHeight = area.scrollHeight;
    const maxHeight = 320;

    if (newHeight > maxHeight) {
      area.style.height = `${maxHeight}px`;
      area.style.overflowY = 'auto';
    } else if (newHeight > 0) {
      area.style.height = `${newHeight}px`;
      area.style.overflowY = 'hidden';
    } else {
      area.style.height = 'auto';
      area.style.overflowY = 'hidden';
    }
  }

  function resetForm() {
    setBody('');
    setImages([]);
    setReplyTarget(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.overflowY = 'hidden';
    }
  }

  function insertSnippet(snippet: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      setBody((prev) => (prev ? `${prev}\n\n${snippet}` : snippet));
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const prev = body;
    const before = prev.substring(0, start);
    const after = prev.substring(end);
    const newBody =
      before +
      (before && !before.endsWith('\n') ? '\n' : '') +
      snippet +
      (after && !after.startsWith('\n') ? '\n' : '') +
      after;

    setBody(newBody);

    setTimeout(() => {
      textarea.focus();
      resizeTextarea();
    }, 0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !body.trim() || submitting) return;
    if (!replyTarget && !subtopicId) return;

    if (/(?:\r?\n[ \t]*){4,}/.test(body)) {
      setError('No se permiten más de dos líneas en blanco consecutivas');
      return;
    }

    setSubmitting(true);
    setError(null);
    const authority = anonymous ? 'anonymous' : 'visible';

    if (replyTarget) {
      const { postId, parentId } = replyTarget;
      const result = await createComment(
        subjectId,
        postId,
        { parentId, body: body.trim(), authority, images },
        token,
      );
      setSubmitting(false);
      if (result.error !== null) {
        setError(result.error);
        return;
      }
      resetForm();
      onCommentCreated?.(postId, result.data);
      return;
    }

    const result = await createPost(
      subjectId,
      { subtopicId, body: body.trim(), authority, images },
      token,
    );
    setSubmitting(false);
    if (result.error !== null) {
      setError(result.error);
      return;
    }
    resetForm();
    onPostCreated?.(result.data);
  }

  if (!token) {
    return (
      <div className='flex items-center justify-between gap-3 rounded-xl border border-zinc-700/60 bg-zinc-900/70 p-3'>
        <p className='text-xs text-zinc-400'>Iniciá sesión para publicar o responder en el blog.</p>
        <GoogleLoginButton />
      </div>
    );
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
        <label
          aria-label='Agregar imágenes o PDFs'
          title='Agregar imágenes o PDFs'
          className='flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200'
        >
          <input
            type='file'
            accept='image/jpeg,image/png,image/webp,application/pdf'
            multiple
            className='hidden'
            onChange={handleFiles}
          />
          <ImagePlus size={20} />
        </label>

        <div className='flex flex-col flex-1 gap-2 bg-transparent min-w-0'>
          {images.length > 0 && (
            <div className='flex flex-wrap gap-2 pt-2 px-1'>
              {images.map((file, i) => (
                <div key={i} className='relative group'>
                  {file.type === PDF_MIME ? (
                    <a
                      href={imagePreviews[i]}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-md border border-zinc-700 bg-zinc-900/70 text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200'
                      aria-label='Abrir PDF adjunto'
                    >
                      <FileText size={20} aria-hidden='true' />
                      <span className='text-[10px] font-bold'>PDF</span>
                    </a>
                  ) : (
                    <img
                      src={imagePreviews[i]}
                      className='h-16 w-16 rounded-md object-cover border border-zinc-700'
                      alt=''
                    />
                  )}
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
            }}
            onFocus={() => {
              if (isMobile && textareaRef.current) {
                setTimeout(() => {
                  textareaRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                }, 150);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (canSend) {
                  handleSubmit({ preventDefault: () => {} } as React.FormEvent);
                }
              }
            }}
            placeholder={isMobile ? '¿Qué querés compartir?' : '¿Qué querés preguntar o compartir?'}
            maxLength={50_000}
            rows={1}
            className='min-h-[40px] max-h-80 w-full resize-none bg-transparent py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none custom-scrollbar leading-relaxed overflow-hidden'
          />
        </div>

        <FormatSelector onSelectFormat={insertSnippet} />

        <button
          type='button'
          onClick={() => setAnonymous(!anonymous)}
          className={`flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full transition-colors ${
            anonymous
              ? 'text-zinc-100 bg-zinc-800 border border-zinc-600'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
          title={anonymous ? 'Publicando como anónimo' : 'Publicar como anónimo'}
          aria-label={anonymous ? 'Publicando como anónimo' : 'Publicar como anónimo'}
        >
          <EyeOff size={18} aria-hidden='true' />
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
