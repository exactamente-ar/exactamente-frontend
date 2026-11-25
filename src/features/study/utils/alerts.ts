import type { StudyCompletion, StudyEvent } from '@/features/study/store/studyStore';
import { formatMinutes } from './format';

/** The page's single polite live region, rendered by `Layout.astro`. */
export const STUDY_LIVE_ID = 'study-live';

const CAP_DETAIL =
  'Cerramos tu foco al llegar a 1 h de tiempo extra. Podés corregirlo en tus métricas.';

function recordedTitle(minutes: number, subjectName: string, todayMinutes: number): string {
  return `+${formatMinutes(minutes)} de ${subjectName} · hoy llevás ${formatMinutes(todayMinutes)}`;
}

export function toastMessage(completion: StudyCompletion): {
  title: string;
  detail: string | null;
} {
  if (completion.kind === 'too-short') {
    return { title: 'El foco duró menos de un minuto y no se registró.', detail: null };
  }
  const { session, todayMinutes } = completion;
  return {
    title: recordedTitle(session.minutes, session.subjectName, todayMinutes),
    detail: session.endReason === 'cap' ? CAP_DETAIL : null,
  };
}

/** What the live region says. Only transitions, never the countdown. */
export function announcement(event: StudyEvent): string {
  switch (event.type) {
    case 'focus-started':
      return 'Arrancó tu foco.';
    case 'focus-ended':
      return `Terminó tu foco de ${event.targetMinutes} min. El tiempo extra se sigue contando.`;
    case 'break-started':
      return 'Empezó tu descanso.';
    case 'break-ended':
      return 'Terminó tu descanso.';
    case 'session-recorded':
      return `Sesión registrada: ${recordedTitle(
        event.session.minutes,
        event.session.subjectName,
        event.todayMinutes,
      )}`;
    case 'session-skipped':
      return 'El foco duró menos de un minuto y no se registró.';
  }
}

type Permission = NotificationPermission | 'unsupported';

export function notificationPermission(): Permission {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof Notification === 'undefined') return false;
  if (Notification.permission === 'granted') return true;
  try {
    return (await Notification.requestPermission()) === 'granted';
  } catch {
    return false;
  }
}

export function showNotification(title: string, body: string): void {
  if (notificationPermission() !== 'granted') return;
  try {
    new Notification(title, { body, icon: '/logo.png', tag: 'exactamente-study' });
  } catch {
    // Android Chrome only allows notifications from a service worker; the chip
    // still shows the overtime and the sound still plays.
  }
}

type AudioContextCtor = typeof AudioContext;
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor: AudioContextCtor | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    audioContext ??= new Ctor();
    if (audioContext.state === 'suspended') void audioContext.resume();
    return audioContext;
  } catch {
    return null;
  }
}

/**
 * Creates (or resumes) the audio context inside a user gesture, so autoplay
 * policies let the end-of-focus sound play later without one.
 */
export function primeAudio(): void {
  getAudioContext();
}

function tone(ctx: AudioContext, frequency: number, at: number, length: number) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.2, at + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(at);
  oscillator.stop(at + length);
}

/** A short two-note bell, synthesized: no audio asset and no new host for the CSP. */
export function playChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  tone(ctx, 880, now, 1);
  tone(ctx, 1320, now + 0.3, 1);
}
