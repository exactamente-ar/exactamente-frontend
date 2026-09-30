import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BlogView from './BlogView';
import type { Blog, BlogPost, BlogSubtopic } from '../types/blog';
import type { Subject } from '@/features/home/types/subjects';

const authMock = vi.hoisted(() => ({ token: null as string | null, loading: false }));
const blogMock = vi.hoisted(() => ({
  blog: null as Blog | null,
  loading: false,
  error: null as string | null,
  retry: vi.fn(),
  addPost: vi.fn(),
  addComment: vi.fn(),
  removePost: vi.fn(),
  removeComment: vi.fn(),
  updatePostVote: vi.fn(),
  updateCommentVote: vi.fn(),
}));

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => authMock,
}));

vi.mock('@/features/blog/hooks/useBlog', () => ({
  useBlog: () => blogMock,
}));

const subject: Subject = {
  id: 'subj-1',
  title: 'Álgebra',
  shortName: 'Álgebra',
  description: '',
  url: '/algebra',
  urlMoodle: '',
  urlPrograma: '',
  correlatives: [],
  required: [],
  quadmester: 1,
  year: 1,
  careers: [],
  resourceCounts: { resumen: 0, parcial: 0, final: 0 },
};

const subtopics: BlogSubtopic[] = [
  { id: 'sub-parciales', name: 'Parciales y finales', slug: 'parciales', isDefault: false },
  { id: 'sub-general', name: 'General', slug: 'general', isDefault: true },
];

function post(id: string, subtopicId: string, body: string): BlogPost {
  return {
    id,
    subtopicId,
    body,
    authority: 'visible',
    status: 'published',
    netScore: 0,
    createdAt: '2026-01-01T00:00:00Z',
    author: null,
    images: [],
    comments: [],
    mine: false,
    myVote: 0,
  };
}

const blog: Blog = {
  subjectId: 'subj-1',
  subtopics,
  posts: [
    post('p1', 'sub-general', 'Duda del tema 1'),
    post('p2', 'sub-parciales', '¿Alguien tiene el parcial?'),
  ],
};

beforeEach(() => {
  authMock.token = null;
  authMock.loading = false;
  blogMock.blog = blog;
  blogMock.loading = false;
  blogMock.error = null;
  blogMock.retry = vi.fn();
  vi.stubGlobal('localStorage', {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('BlogView', () => {
  it('muestra el skeleton mientras carga el blog', () => {
    blogMock.loading = true;
    blogMock.blog = null;
    render(<BlogView subject={subject} />);
    expect(screen.getByRole('status', { name: 'Cargando publicaciones' })).toBeTruthy();
  });

  it('permite leer el feed públicamente aunque no haya sesión', () => {
    authMock.token = null;
    render(<BlogView subject={subject} />);

    expect(screen.getByText('Duda del tema 1')).toBeTruthy();
    expect(screen.getByText('Iniciá sesión para publicar o responder en el blog.')).toBeTruthy();
    expect(screen.queryByText('Iniciá sesión para leer y participar en el blog.')).toBeNull();
  });

  it('muestra el estado de error y botón de reintento cuando la API falla', async () => {
    const user = userEvent.setup();
    blogMock.blog = null;
    blogMock.error = 'No se pudo cargar el blog';
    render(<BlogView subject={subject} />);

    expect(screen.getByText('No se pudo cargar el blog')).toBeTruthy();
    const retryBtn = screen.getByRole('button', { name: 'Reintentar' });
    expect(retryBtn).toBeTruthy();

    await user.click(retryBtn);
    expect(blogMock.retry).toHaveBeenCalledTimes(1);
  });

  it('muestra el composer activo cuando hay sesión', () => {
    authMock.token = 'token-123';
    render(<BlogView subject={subject} />);
    expect(screen.queryByText('Iniciá sesión para leer y participar en el blog.')).toBeNull();
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeTruthy();
  });

  it('filtra el feed según el chip de subtema', async () => {
    authMock.token = 'token-123';
    const user = userEvent.setup();
    render(<BlogView subject={subject} />);

    expect(screen.getByText('Duda del tema 1')).toBeTruthy();
    expect(screen.queryByText('¿Alguien tiene el parcial?')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Parciales y finales' }));

    expect(screen.getByText('¿Alguien tiene el parcial?')).toBeTruthy();
    expect(screen.queryByText('Duda del tema 1')).toBeNull();
  });

  it('selecciona el único chip "General" al entrar', () => {
    authMock.token = 'token-123';
    render(<BlogView subject={subject} />);

    const general = screen.getAllByRole('button', { name: 'General' });
    expect(general).toHaveLength(1);
    expect(general[0]).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', { name: 'Todos' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Parciales y finales' })).toBeTruthy();
  });

  it('muestra el subtema general primero aunque la API lo entregue después', () => {
    authMock.token = 'token-123';
    render(<BlogView subject={subject} />);

    const group = screen.getByRole('group', { name: 'Subtema del blog' });
    const labels = within(group)
      .getAllByRole('button')
      .map((button) => button.textContent);

    expect(labels).toEqual(['General', 'Parciales y finales']);
  });

  it('aplica el scrollbar custom al feed', () => {
    authMock.token = 'token-123';
    const { container } = render(<BlogView subject={subject} />);
    expect(container.querySelector('.custom-scrollbar')).not.toBeNull();
  });

  it('hidrata el voto del usuario en el post', () => {
    authMock.token = 'token-123';
    blogMock.blog = {
      ...blog,
      posts: [{ ...post('p1', 'sub-general', 'Duda del tema 1'), myVote: 1 }],
    };
    render(<BlogView subject={subject} />);
    expect(screen.getByRole('button', { name: 'Votar a favor' })).toHaveClass('text-green-500');
  });

  it('deshabilita los votos en una publicación eliminada', () => {
    authMock.token = 'token-123';
    blogMock.blog = {
      ...blog,
      posts: [{ ...post('p1', 'sub-general', '[Eliminado]'), status: 'deleted' }],
    };
    render(<BlogView subject={subject} />);
    expect(screen.getByRole('button', { name: 'Votar a favor' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Votar en contra' })).toBeDisabled();
  });
});
