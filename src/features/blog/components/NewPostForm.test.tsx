import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewPostForm from './NewPostForm';
import { ReplyProvider, useReplyContext, type ReplyTarget } from '../context/ReplyContext';

const createPostMock = vi.hoisted(() => vi.fn());
const createCommentMock = vi.hoisted(() => vi.fn());

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ token: 'token-123' }),
}));

vi.mock('@/shared/services/api', () => ({
  createPost: createPostMock,
  createComment: createCommentMock,
}));

function ReplyHarness({ target }: { target: ReplyTarget }) {
  const { setReplyTarget } = useReplyContext();
  return (
    <div>
      <button type='button' onClick={() => setReplyTarget(target)}>
        activar respuesta
      </button>
      <NewPostForm subjectId='subj-1' subtopicId='sub-a' />
    </div>
  );
}

let reload: ReturnType<typeof vi.fn>;

beforeEach(() => {
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

  it('recarga la página al publicar con éxito', async () => {
    const user = userEvent.setup();
    render(
      <ReplyProvider>
        <NewPostForm subjectId='subj-1' subtopicId='sub-a' />
      </ReplyProvider>,
    );

    await user.type(screen.getByPlaceholderText('¿Qué querés preguntar o compartir?'), 'hola');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(reload).toHaveBeenCalledTimes(1);
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
});
