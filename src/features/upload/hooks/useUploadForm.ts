import { useState } from 'react';
import type { FormData } from '../types/form';


const INITIAL_FORM_DATA: FormData = {
  materia: '',
  tipoRecurso: '',
  titulo: '',
  archivo: null,
};

const SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwm9m4VpPkV5-A5lUSgN2Dho6Lssfi2SVhO-i1owDiMSnKIuHG2beZS-SZGsJml_0Pp/exec';

export const useUploadForm = () => {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | undefined>(undefined);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setShowSuccess(false);
    setUploading(false);
    setUploadError(undefined);
  };

  const closeSuccess = () => setShowSuccess(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        archivo: 'El archivo supera el límite de 10MB',
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, archivo: file }));
    if (errors.archivo) {
      setErrors((prev) => ({ ...prev, archivo: '' }));
    }
  };
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.materia) newErrors.materia = 'Selecciona una materia';
    if (!formData.tipoRecurso) newErrors.tipoRecurso = 'Selecciona el tipo de Rescurso';
    if (!formData.titulo.trim()) newErrors.titulo = 'Ingresa un título';
    if (!captchaToken) newErrors.captcha = 'Por favor, verifica que no eres un robot';

    if (!formData.archivo) {
      newErrors.archivo = 'Selecciona un archivo';
    } else {
      const maxSize = 10 * 1024 * 1024; // 10 MB
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
      ];

      if (formData.archivo.size > maxSize) {
        newErrors.archivo = 'El archivo debe pesar menos de 10 MB';
      } else if (!allowedTypes.includes(formData.archivo.type)) {
        newErrors.archivo = 'Solo se permiten archivos PDF e imágenes (jpg, png, gif, webp)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result?.toString().split(',')[1];
        base64 ? resolve(base64) : reject('No se pudo leer el archivo.');
      };
      reader.onerror = () => reject('Error al leer el archivo con FileReader.');
      reader.readAsDataURL(file);
    });
  };

  const uploadFileToDrive = async (base64: string, token: string): Promise<string> => {
    // Usamos URLSearchParams para construir la URL de forma más segura y legible
    const params = new URLSearchParams({
      'g-recaptcha-response': token,
      filename: formData.archivo!.name,
      mimetype: formData.archivo!.type,
    });

    const response = await fetch(`${SCRIPT_URL}?${params.toString()}`, {
      method: 'POST',
      body: base64,
      headers: { 'Content-Type': 'text/plain' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    if (result.status !== 'success') {
      throw new Error(result.message || 'Error al subir el archivo');
    }

    return result.fileUrl;
  };

  const handleSubmit = (onSuccess?: () => void) => async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(undefined);

    if (!validateForm() || !formData.archivo || !captchaToken) {
      return;
    }

    setUploading(true);

    try {
      const base64 = await convertFileToBase64(formData.archivo);

      // Pasar el `captchaToken` como segundo argumento a la función de subida.
      const fileUrl = await uploadFileToDrive(base64, captchaToken);

      setShowSuccess(true);
      onSuccess?.();

      setTimeout(() => resetForm(), 3000);
    } catch (error: any) {
      setUploadError(error.message || 'Ocurrió un error durante la subida.');
    } finally {
      setUploading(false);
    }
  };

  return {
    formData,
    errors,
    showSuccess,
    uploading,
    uploadError,
    handleInputChange,
    handleFileChange,
    handleSubmit,
    closeSuccess,
    captchaToken,
    setCaptchaToken,
  };
};
