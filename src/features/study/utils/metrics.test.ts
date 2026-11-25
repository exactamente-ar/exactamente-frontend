import { describe, expect, it } from 'vitest';
import type { StudySession } from '@/features/study/domain/sessions';
import { weekMinutes } from './metrics';

function at(date: Date, minutes: number, id = date.toISOString()): StudySession {
  return {
    id,
    startedAt: date.toISOString(),
    endedAt: date.toISOString(),
    minutes,
    recordedMinutes: minutes,
    endReason: 'manual',
    careerId: 'c1',
    careerName: 'Ing. en Sistemas',
    subjectId: 's1',
    subjectName: 'Cálculo II',
    updatedAt: date.toISOString(),
  };
}

// Wednesday 25/11/2026; the week starts on Monday 23/11.
const NOW = new Date(2026, 10, 25, 12, 0);

describe('weekMinutes', () => {
  it('suma la semana actual (offset 0) y la anterior (offset -1)', () => {
    const sessions = [
      at(new Date(2026, 10, 23, 0, 0), 30),
      at(new Date(2026, 10, 25, 9, 0), 45),
      at(new Date(2026, 10, 22, 23, 59), 50),
      at(new Date(2026, 10, 16, 8, 0), 10),
      at(new Date(2026, 10, 15, 8, 0), 99),
    ];

    expect(weekMinutes(sessions, NOW, 0)).toBe(75);
    expect(weekMinutes(sessions, NOW, -1)).toBe(60);
  });
});
