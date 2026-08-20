import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewPostForm from './NewPostForm';
import { ReplyProvider, useReplyContext, type ReplyTarget } from '../context/ReplyContext';

const authMock = vi.hoisted(() => ({ token: 'token-123' as string | null }));
const createPostMock = vi.hoisted(() => vi.fn());
const createCommentMock = vi.hoisted(() => vi.fn());

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => authMock,
}));

vi.mock('@/shared/services/api', () => ({
  createPost: createPostMock,
  createComment: createCommentMock,
}));

function ReplyHarness({
  target,
  onPostCreated,
  onCommentCreated,
}: {
  target: ReplyTarget;
  onPostCreated?: (post: unknown) => void;
  onCommentCreated?: (postId: string, comment: unknown) => void;
}) {
  const { setReplyTarget } = useReplyContext();
  return (
    <div>
      <button type='button' onClick={() => setReplyTarget(target)}>
        activar respuesta
      </button>
      <NewPostForm
        subjectId='subj-1'
        subtopicId='sub-a'
        onPostCreated={onPostCreated}
        onCommentCreated={onCommentCreated}
      />
    </div>
  );
}

let reload: ReturnType<typeof vi.fn>;

beforeEach(() => {
  authMock.token = 'token-123';
  reload = vi.fn();
  createPostMock.mockReset();
  createCommentMock.mockReset();
  createPostMock.mockResolvedValue({ data: {}, error: null });
  createCommentMock.mockResolvedValue({ data: {}, error: null });
  vi.stubGlobal('location', { ...window.location, reload });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('NewPostForm', () => {
  it('deshabilita el envío mientras el mensaje está vacío', () => {
    render(
      <ReplyProvider>
        <NewPostForm subjectId='subj-1' subtopicId='sub-a' />
      </ReplyProvider>,
    );
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled();
  });

  it('publica con autoría visible por defecto', async () => {
    const user = userEvent.setup();
    render(
      <ReplyProvider>
        <NewPostForm subjectId='subj-1' subtopicId='sub-a' />
      </ReplyProvider>,
    );

    await user.type(screen.getByPlaceholderText('¿Qué querés preguntar o compartir?'), 'hola');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(createPostMock).toHaveBeenCalledTimes(1);
    const [subjectId, payload] = createPostMock.mock.calls[0];
    expect(subjectId).toBe('subj-1');
    expect(payload).toMatchObject({
      subtopicId: 'sub-a',
      body: 'hola',
      authority: 'visible',
      images: [],
    });
  });

  it('publica como anónimo al marcar el check', async () => {
    const user = userEvent.setup();
    render(
      <ReplyProvider>
        <NewPostForm subjectId='subj-1' subtopicId='sub-a' />
      </ReplyProvider>,
    );

    await user.type(screen.getByPlaceholderText('¿Qué querés preguntar o compartir?'), 'duda');
    await user.click(screen.getByTitle('Publicar como anónimo'));
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    const [, payload] = createPostMock.mock.calls[0];
    expect(payload.authority).toBe('anonymous');
  });

  it('adjunta imágenes al post', async () => {
    render(
      <ReplyProvider>
        <NewPostForm subjectId='subj-1' subtopicId='sub-a' />
      </ReplyProvider>,
    );

    const file = new File(['img'], 'foto.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    // We need to mock URL.createObjectURL since it's not implemented in jsdom
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    URL.revokeObjectURL = vi.fn();

    fireEvent.change(input, { target: { files: [file] } });

    const imgPreview = document.querySelector('img[src="blob:mock-url"]');
    expect(imgPreview).not.toBeNull();

    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  it('muestra una tile "PDF" en la preview al adjuntar un PDF, sin intentar renderizarlo como imagen', () => {
    render(
      <ReplyProvider>
        <NewPostForm subjectId='subj-1' subtopicId='sub-a' />
      </ReplyProvider>,
    );

    const file = new File(['pdf-bytes'], 'apunte.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn(() => 'blob:mock-pdf-url');
    URL.revokeObjectURL = vi.fn();

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText('PDF')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Abrir PDF adjunto' })).toHaveAttribute(
      'href',
      'blob:mock-pdf-url',
    );
    expect(document.querySelector('img[src="blob:mock-pdf-url"]')).toBeNull();

    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  it('llama onPostCreated con el post creado al publicar con éxito', async () => {
    const onPostCreated = vi.fn();
    const created = { id: 'p1', subtopicId: 'sub-a' };
    createPostMock.mockResolvedValue({ data: created, error: null });
    const user = userEvent.setup();
    render(
      <ReplyProvider>
        <NewPostForm subjectId='subj-1' subtopicId='sub-a' onPostCreated={onPostCreated} />
      </ReplyProvider>,
    );

    await user.type(screen.getByPlaceholderText('¿Qué querés preguntar o compartir?'), 'hola');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(onPostCreated).toHaveBeenCalledTimes(1);
    expect(onPostCreated).toHaveBeenCalledWith(created);
  });

  it('llama onCommentCreated con el postId y el comentario al responder', async () => {
    const onCommentCreated = vi.fn();
    const created = { id: 'c2', postId: 'p1' };
    createCommentMock.mockResolvedValue({ data: created, error: null });
    const user = userEvent.setup();
    render(
      <ReplyProvider>
        <ReplyHarness
          target={{ postId: 'p1', parentId: 'c1', snippet: 'Recordatorio a todos los alumnos' }}
          onCommentCreated={onCommentCreated}
        />
      </ReplyProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'activar respuesta' }));
    await user.type(screen.getByPlaceholderText('¿Qué querés preguntar o compartir?'), 'gracias');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(onCommentCreated).toHaveBeenCalledTimes(1);
    expect(onCommentCreated).toHaveBeenCalledWith('p1', created);
  });

  it('muestra el botón de inicio de sesión cuando no hay token', () => {
    authMock.token = null;
    render(
      <ReplyProvider>
        <NewPostForm subjectId='subj-1' subtopicId='sub-a' />
      </ReplyProvider>,
    );

    expect(screen.getByText('Iniciá sesión para publicar o responder en el blog.')).toBeTruthy();
    expect(screen.getByText('Continuar con Google')).toBeTruthy();
  });

  it('muestra error si se intentan adjuntar más de 6 archivos', () => {
    render(
      <ReplyProvider>
        <NewPostForm subjectId='subj-1' subtopicId='sub-a' />
      </ReplyProvider>,
    );

    const files = Array.from(
      { length: 7 },
      (_, i) => new File(['img'], `foto${i}.jpg`, { type: 'image/jpeg' }),
    );
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files } });

    expect(screen.getByText('Podés adjuntar hasta 6 archivos')).toBeTruthy();
  });

  it('resetea el formulario y la altura del textarea al publicar con éxito', async () => {
    createPostMock.mockResolvedValue({ data: { id: 'p1' }, error: null });
    const user = userEvent.setup();
    render(
      <ReplyProvider>
        <NewPostForm subjectId='subj-1' subtopicId='sub-a' />
      </ReplyProvider>,
    );

    const textarea = screen.getByPlaceholderText(
      '¿Qué querés preguntar o compartir?',
    ) as HTMLTextAreaElement;
    textarea.style.height = '120px';

    await user.type(textarea, 'hola');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    await waitFor(() => expect(textarea.value).toBe(''));
    expect(textarea.style.height).toBe('auto');
  });

  it('muestra "Respondiendo a" y crea un comentario al responder', async () => {
    const user = userEvent.setup();
    render(
      <ReplyProvider>
        <ReplyHarness
          target={{ postId: 'p1', parentId: 'c1', snippet: 'Recordatorio a todos los alumnos' }}
        />
      </ReplyProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'activar respuesta' }));

    expect(screen.getByText(/Respondiendo a:/)).toBeTruthy();
    expect(createCommentMock).not.toHaveBeenCalled();

    await user.type(screen.getByPlaceholderText('¿Qué querés preguntar o compartir?'), 'gracias');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(createCommentMock).toHaveBeenCalledTimes(1);
    expect(createCommentMock).toHaveBeenCalledWith(
      'subj-1',
      'p1',
      { parentId: 'c1', body: 'gracias', authority: 'visible', images: [] },
      'token-123',
    );
    expect(createPostMock).not.toHaveBeenCalled();
  });

  it('bloquea el envío si el texto contiene más de 2 líneas en blanco consecutivas', async () => {
    const user = userEvent.setup();
    render(
      <ReplyProvider>
        <NewPostForm subjectId='subj-1' subtopicId='sub-a' />
      </ReplyProvider>,
    );

    const textarea = screen.getByPlaceholderText('¿Qué querés preguntar o compartir?');
    fireEvent.change(textarea, { target: { value: 'linea 1\n\n\n\nlinea 2' } });
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(
      screen.getByText('No se permiten más de dos líneas en blanco consecutivas'),
    ).toBeTruthy();
    expect(createPostMock).not.toHaveBeenCalled();
  });
});
