export interface UploadFormState {
  subjectId: string;
  type: 'resumen' | 'parcial' | 'final' | '';
  period: string;
  notes: string;
  file: File | null;
  imageFiles: File[];
  fileMode: 'pdf' | 'images';
}

export interface UploadFormErrors {
  subjectId?: string;
  type?: string;
  file?: string;
}

export interface UploadFormProps {
  formData: UploadFormState;
  errors: UploadFormErrors;
  subjects: { value: string; label: string }[];
  tiposRecurso: { value: string; label: string }[];
  uploading: boolean;
  uploadError: string | undefined;
  onSubjectChange: (subjectId: string) => void;
  onTypeChange: (type: string) => void;
  onPeriodChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  onImagesChange: (files: File[]) => void;
  onFileModeChange: (mode: 'pdf' | 'images') => void;
  onSubmit: (e: React.FormEvent) => void;
}
