import { describe, expect, it, beforeEach } from 'vitest';
import { readStoredFaculty, writeStoredFaculty, STORED_FACULTY_KEY } from './storedFaculty';

beforeEach(() => {
  localStorage.clear();
});

describe('storedFaculty', () => {
  it('devuelve null si no hay nada guardado', () => {
    expect(readStoredFaculty()).toBeNull();
  });

  it('guarda y relee la facultad elegida', () => {
    writeStoredFaculty({ universityId: 'u1', facultyId: 'f2' });
    expect(readStoredFaculty()).toEqual({ universityId: 'u1', facultyId: 'f2' });
  });

  it('devuelve null si el valor guardado está corrupto', () => {
    localStorage.setItem(STORED_FACULTY_KEY, '{ no es json');
    expect(readStoredFaculty()).toBeNull();
  });

  it('devuelve null si falta alguno de los ids', () => {
    localStorage.setItem(STORED_FACULTY_KEY, JSON.stringify({ universityId: 'u1' }));
    expect(readStoredFaculty()).toBeNull();
  });

  it('no escribe si falta un id', () => {
    writeStoredFaculty({ universityId: '', facultyId: 'f2' });
    expect(localStorage.getItem(STORED_FACULTY_KEY)).toBeNull();
  });
});
