export interface UploadFormState {
  careerId: string;
  planId: string;
  subjectId: string;
  type: 'resumen' | 'parcial' | 'final' | '';
  period: string;
  notes: string;
  file: File | null;
  imageFiles: File[];
  fileMode: 'pdf' | 'images';
}

export interface UploadFormErrors {
  careerId?: string;
  planId?: string;
  subjectId?: string;
  type?: string;
  file?: string;
}

export interface UploadFormProps {
  formData: UploadFormState;
  errors: UploadFormErrors;
  careers: { value: string; label: string }[];
  plans: { value: string; label: string }[];
  subjects: { value: string; label: string }[];
  tiposRecurso: { value: string; label: string }[];
  uploading: boolean;
  uploadError: string | undefined;
  onCareerChange: (careerId: string) => void;
  onPlanChange: (planId: string) => void;
  onSubjectChange: (subjectId: string) => void;
  onTypeChange: (type: string) => void;
  onPeriodChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  onImagesChange: (files: File[]) => void;
  onFileModeChange: (mode: 'pdf' | 'images') => void;
  onSubmit: (e: React.FormEvent) => void;
}
