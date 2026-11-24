import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Subject } from '@/features/home/types/subjects';
import type { ResourceFetch } from '@/features/resource/types/resource';
import ResourcesView from './ResourcesView';

const getByIdResources = vi.hoisted(() => vi.fn());

vi.mock('@/features/resource/services/resource', () => ({ getByIdResources }));

const subject: Subject = {
  id: 's1',
  title: 'Álgebra',
  shortName: 'ALG',
  description: '',
  url: '/algebra',
  urlMoodle: '',
  urlPrograma: '',
  correlatives: [],
  required: [],
  quadmester: 1,
  year: 2,
  careers: [],
  resourceCounts: { resumen: 0, parcial: 0, final: 0 },
};

const resource: ResourceFetch = {
  id: 'r1',
  title: 'Parcial de junio',
  type: 'parcial',
  subtype: null,
  examYear: 2024,
  examMonth: 6,
  topic: null,
  fileUrl: 'https://files.example.com/r1.pdf',
};

describe('ResourcesView', () => {
  it('con datos del servidor muestra la lista en el primer render, sin pedirla otra vez', () => {
    render(<ResourcesView subject={subject} type='Parciales' initialData={[resource]} />);

    expect(screen.getByText('1 recursos disponibles')).toBeInTheDocument();
    expect(getByIdResources).not.toHaveBeenCalled();
  });
});
