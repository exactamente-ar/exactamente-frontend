export async function fetchSheet<T = unknown>(
  url: string
): Promise<{ data: T[]; error: string | null }> {
  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }

    const json = await res.json();
    return { data: json, error: null };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : null,
    };
  }
}
