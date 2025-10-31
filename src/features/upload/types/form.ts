

export interface FormData {
  materia: string;
  tipoRecurso: string;
  titulo: string;
  archivo: File | null;
}

export interface UploadFormProps {
  formData: FormData;
  errors: {
    materia?: string;
    tipoRecurso?: string;
    titulo?: string;
    archivo?: string;
    captcha?: string;
  };
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => void;
  subjects: string[];
  tiposRecurso: { value: string; label: string; color: string }[];
  uploading: boolean;
  uploadError: string | undefined;
  captchaToken: string | null;
  setCaptchaToken: (token: string | null) => void;
}