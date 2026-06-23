export type ResourceFetch = {
  id: string;
  subjectId: string;
  subjectTitle: string | null;
  title: string;
  fileUrl: string;
  type: 'resumen' | 'parcial' | 'final';
  subtype: 'parcial' | 'recuperatorio' | 'prefinal' | 'parcialito' | null;
  examYear: number | null;
  examMonth: number | null;
  topic: number | null;
};

export type StringResource = 'Parciales' | 'Resumenes' | 'Finales';
