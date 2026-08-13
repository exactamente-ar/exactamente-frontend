import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BlogView from './BlogView';
import type { Blog, BlogPost, BlogSubtopic } from '../types/blog';
import type { Subject } from '@/features/home/types/subjects';

const authMock = vi.hoisted(() => ({ token: null as string | null, loading: false }));
const blogMock = vi.hoisted(() => ({ blog: null as Blog | null, loading: false }));

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
  { id: 'sub-general', name: 'Subtema general', slug: 'general', isDefault: true },
  { id: 'sub-parciales', name: 'Parciales y finales', slug: 'parciales', isDefault: false },
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

  it('muestra el login cuando no hay sesión', () => {
    render(<BlogView subject={subject} />);
    expect(screen.getByText('Iniciá sesión para leer y participar en el blog.')).toBeTruthy();
    expect(screen.getByText('Continuar con Google')).toBeTruthy();
  });

  it('no muestra el login cuando hay sesión', () => {
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
    expect(screen.getByText('¿Alguien tiene el parcial?')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Parciales y finales' }));

    expect(screen.getByText('¿Alguien tiene el parcial?')).toBeTruthy();
    expect(screen.queryByText('Duda del tema 1')).toBeNull();
  });

  it('muestra el chip "General" además de cada subtema', () => {
    authMock.token = 'token-123';
    render(<BlogView subject={subject} />);
    expect(screen.getByRole('button', { name: 'General' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Subtema general' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Parciales y finales' })).toBeTruthy();
  });

  it('aplica el scrollbar custom al feed', () => {
    authMock.token = 'token-123';
    const { container } = render(<BlogView subject={subject} />);
    expect(container.querySelector('.custom-scrollbar')).not.toBeNull();
  });
});
