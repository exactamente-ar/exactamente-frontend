export interface UploadFormState {
  careerId: string;
  planId: string;
  subjectId: string;
  type: 'resumen' | 'parcial' | 'final';
  title: string;
  subtype: string;
  examYear: string;
  examMonth: string;
  examDay: string;
  topic: string;
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
  title?: string;
  subtype?: string;
  examYear?: string;
  examMonth?: string;
  examDay?: string;
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
  duplicateWarning: { hasSimilar: boolean; similar: Array<{ id: string; title: string; status: string }> } | null;
  onCareerChange: (careerId: string) => void;
  onPlanChange: (planId: string) => void;
  onSubjectChange: (subjectId: string) => void;
  onTypeChange: (type: string) => void;
  onTitleChange: (value: string) => void;
  onSubtypeChange: (value: string) => void;
  onExamYearChange: (value: string) => void;
  onExamMonthChange: (value: string) => void;
  onExamDayChange: (value: string) => void;
  onTopicChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  onImagesChange: (files: File[]) => void;
  onFileModeChange: (mode: 'pdf' | 'images') => void;
  onDuplicateConfirm: () => void;
  onSubmit: (e: React.FormEvent) => void;
}
