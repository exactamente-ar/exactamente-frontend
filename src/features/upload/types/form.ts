export interface UploadFormProps {
  formData: {
    materia: string;
    tipoAporte: string;
    titulo: string;
    descripcion: string;
    archivo: File | null;
    autor: string;
  };
  errors: {
    materia?: string;
    tipoAporte?: string;
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
  tiposAporte: { value: string; label: string; color: string }[];
  uploading: boolean;
  uploadError: string | null;
  captchaToken: string | null;
  setCaptchaToken: (token: string | null) => void;
}