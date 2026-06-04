import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { uploadResource, checkDuplicate } from '@/shared/services/api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { UploadFormState, UploadFormErrors } from '../types/form';

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const INITIAL_STATE: UploadFormState = {
  careerId: '',
  planId: '',
  subjectId: '',
  type: 'resumen',
  title: '',
  subtype: '',
  examYear: '',
  examMonth: '',
  examDay: '',
  topic: '',
  notes: '',
  file: null,
  imageFiles: [],
  fileMode: 'pdf',
};

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`Error cargando ${file.name}`)); };
    img.src = url;
  });
}

async function imagesToPdf(imageFiles: File[]): Promise<File> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  for (let i = 0; i < imageFiles.length; i++) {
    if (i > 0) doc.addPage();
    const img = await loadImage(imageFiles[i]);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext('2d')!.drawImage(img, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const pageRatio = pageW / pageH;
    let drawW: number, drawH: number, x: number, y: number;
    if (imgRatio > pageRatio) {
      drawW = pageW; drawH = pageW / imgRatio;
      x = 0; y = (pageH - drawH) / 2;
    } else {
      drawH = pageH; drawW = pageH * imgRatio;
      x = (pageW - drawW) / 2; y = 0;
    }
    doc.addImage(dataUrl, 'JPEG', x, y, drawW, drawH);
  }

  const blob = doc.output('blob');
  return new File([blob], 'imagenes.pdf', { type: 'application/pdf' });
}

type InitialValues = Partial<Omit<UploadFormState, 'file' | 'imageFiles'>>;

type DuplicateWarning = { hasSimilar: boolean; similar: Array<{ id: string; title: string; status: string }> };

export function useUploadForm(initialValues?: InitialValues) {
  const { token, logout } = useAuth();
  const [formData, setFormData] = useState<UploadFormState>({ ...INITIAL_STATE, ...initialValues });
  const [errors, setErrors] = useState<UploadFormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | undefined>(undefined);
  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateWarning | null>(null);
  const [duplicateConfirmed, setDuplicateConfirmed] = useState(false);

  const updateField = <K extends keyof UploadFormState>(key: K, value: UploadFormState[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: UploadFormErrors = {};
    if (!formData.careerId) newErrors.careerId = 'Seleccioná una carrera';
    if (!formData.subjectId) newErrors.subjectId = 'Seleccioná una materia';
    if (formData.type === 'resumen' && !formData.title) newErrors.title = 'Ingresá un título para el resumen';
    if (formData.type === 'parcial' && !formData.subtype) newErrors.subtype = 'Seleccioná el subtipo';
    if (!formData.examYear) newErrors.examYear = 'Seleccioná el año del examen';
    if (!formData.examMonth) newErrors.examMonth = 'Seleccioná el mes del examen';
    if (formData.type === 'final' && !formData.examDay) newErrors.examDay = 'Ingresá el día del examen';
    if (formData.fileMode === 'pdf' && !formData.file) newErrors.file = 'Seleccioná un archivo PDF';
    if (formData.fileMode === 'images' && formData.imageFiles.length === 0) newErrors.file = 'Agregá al menos una imagen';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const doUpload = async () => {
    setUploading(true);
    try {
      let finalFile: File;

      if (formData.fileMode === 'images') {
        finalFile = await imagesToPdf(formData.imageFiles);
        if (finalFile.size > MAX_FILE_SIZE) {
          setErrors((prev) => ({ ...prev, file: 'El PDF generado supera los 20 MB. Reducí la cantidad de imágenes.' }));
          setUploading(false);
          return;
        }
      } else {
        finalFile = formData.file!;
      }

      const result = await uploadResource(
        {
          subjectId: formData.subjectId,
          type: formData.type,
          file: finalFile,
          title: formData.title || undefined,
          subtype: formData.subtype || undefined,
          examYear: formData.examYear ? Number(formData.examYear) : undefined,
          examMonth: formData.examMonth ? Number(formData.examMonth) : undefined,
          examDay: formData.type === 'final' && formData.examDay ? Number(formData.examDay) : undefined,
          topic: formData.topic && formData.topic !== 'none' ? Number(formData.topic) : undefined,
          notes: formData.notes || undefined,
        },
        token!
      );

      if (result.error) {
        if (result.error.includes('401')) {
          logout();
          window.location.href = '/login?redirect=/upload';
          return;
        }
        setUploadError(result.error);
        return;
      }

      setShowSuccess(true);
      setFormData(INITIAL_STATE);
      setDuplicateWarning(null);
      setDuplicateConfirmed(false);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error al subir el recurso');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(undefined);
    if (!validate() || !token) return;

    if (!duplicateConfirmed && formData.type !== 'resumen' && formData.examYear && formData.examMonth) {
      const dupResult = await checkDuplicate(
        {
          subjectId: formData.subjectId,
          type: formData.type,
          subtype: formData.subtype || undefined,
          examYear: Number(formData.examYear),
          examMonth: Number(formData.examMonth),
          topic: formData.topic && formData.topic !== 'none' ? Number(formData.topic) : undefined,
        },
        token
      );

      if (!dupResult.error && dupResult.data.hasSimilar) {
        setDuplicateWarning(dupResult.data);
        return;
      }
    }

    await doUpload();
  };

  return {
    formData,
    errors,
    showSuccess,
    uploading,
    uploadError,
    duplicateWarning,
    onCareerChange: (v: string) => {
      setFormData((prev) => ({ ...prev, careerId: v, planId: '', subjectId: '' }));
      setErrors((prev) => ({ ...prev, careerId: undefined, planId: undefined, subjectId: undefined }));
    },
    onPlanChange: (v: string) => {
      setFormData((prev) => ({ ...prev, planId: v, subjectId: '' }));
      setErrors((prev) => ({ ...prev, planId: undefined, subjectId: undefined }));
    },
    onSubjectChange: (v: string) => updateField('subjectId', v),
    onTypeChange: (v: string) => {
      setFormData((prev) => ({ ...prev, type: v as UploadFormState['type'], title: '', subtype: '', examDay: '' }));
      setErrors((prev) => ({ ...prev, type: undefined, title: undefined, subtype: undefined, examDay: undefined }));
    },
    onTitleChange: (v: string) => updateField('title', v),
    onSubtypeChange: (v: string) => updateField('subtype', v),
    onExamYearChange: (v: string) => updateField('examYear', v),
    onExamMonthChange: (v: string) => updateField('examMonth', v),
    onExamDayChange: (v: string) => updateField('examDay', v),
    onTopicChange: (v: string) => updateField('topic', v),
    onNotesChange: (v: string) => updateField('notes', v),
    onFileChange: (f: File | null) => updateField('file', f),
    onImagesChange: (files: File[]) => updateField('imageFiles', files),
    onFileModeChange: (mode: 'pdf' | 'images') => {
      setFormData((prev) => ({ ...prev, fileMode: mode, file: null, imageFiles: [] }));
      setErrors((prev) => ({ ...prev, file: undefined }));
    },
    onDuplicateConfirm: () => {
      setDuplicateWarning(null);
      setDuplicateConfirmed(true);
      doUpload();
    },
    handleSubmit,
    closeSuccess: () => setShowSuccess(false),
  };
}
