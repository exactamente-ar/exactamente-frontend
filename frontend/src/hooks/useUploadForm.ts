import { useState } from 'react';

export interface FormData {
  materia: string;
  tipoAporte: string;
  titulo: string;
  descripcion: string;
  archivo: File | null;
  autor: string;
}

const INITIAL_FORM_DATA: FormData = {
  materia: '',
  tipoAporte: '',
  titulo: '',
  descripcion: '',
  archivo: null,
  autor: '',
};

const SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwRGof6cJ0y7H03GTDssrKjaRJNF5rgC4uTnuc9g8xp1w5dnSsovkLPfEtRfbGFb93A/exec';

export const useUploadForm = () => {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setShowSuccess(false);
    setUploading(false);
    setUploadError(null);
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
    setFormData((prev) => ({ ...prev, archivo: file }));
    if (errors.archivo) {
      setErrors((prev) => ({ ...prev, archivo: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.materia) newErrors.materia = 'Selecciona una materia';
    if (!formData.tipoAporte) newErrors.tipoAporte = 'Selecciona el tipo de aporte';
    if (!formData.titulo.trim()) newErrors.titulo = 'Ingresa un título';

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

  const uploadFileToDrive = async (base64: string): Promise<string> => {
    const response = await fetch(
      `${SCRIPT_URL}?filename=${encodeURIComponent(
        formData.archivo!.name
      )}&mimetype=${encodeURIComponent(formData.archivo!.type)}`,
      {
        method: 'POST',
        body: base64,
        headers: { 'Content-Type': 'text/plain' },
      }
    );

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
    setUploadError(null);

    if (!validateForm() || !formData.archivo) return;

    setUploading(true);

    try {
      const base64 = await convertFileToBase64(formData.archivo);
      const fileUrl = await uploadFileToDrive(base64);
      // console.log('Archivo subido con éxito a Google Drive:', fileUrl);

      setShowSuccess(true);
      onSuccess?.();

      setTimeout(() => resetForm(), 3000);
    } catch (error: any) {
      setUploadError(error.message || 'Ocurrió un error durante la subida.');
      // console.error('Upload error:', error);
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
  };
};
