import { useUploadForm } from '@/features/upload/hooks/useUploadForm';
import SuccessModal from './SuccesModal';
import UploadForm from './UploadForm';
import { useEffect, useState } from 'react';
import { getSubjects } from '@/shared/services/api';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { AuthGuard } from '@/features/auth/components/AuthGuard';

const tiposRecurso = [
  { value: 'resumen', label: 'Resumen' },
  { value: 'parcial', label: 'Parcial' },
  { value: 'final', label: 'Final' },
];

function UploadSectionInner() {
  const {
    formData,
    errors,
    showSuccess,
    uploading,
    uploadError,
    onSubjectChange,
    onTypeChange,
    onPeriodChange,
    onNotesChange,
    onFileChange,
    onImagesChange,
    onFileModeChange,
    handleSubmit,
    closeSuccess,
  } = useUploadForm();

  const [subjects, setSubjects] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const skeleton = document.getElementById('upload-skeleton');
    if (skeleton) skeleton.style.display = 'none';
  }, []);

  useEffect(() => {
    getSubjects().then(({ data }) => {
      setSubjects(data.map((s) => ({ value: s.id, label: s.title })));
    });
  }, []);

  return (
    <>
      <SuccessModal showSuccess={showSuccess} closeSuccess={closeSuccess} />
      <div className='max-w-4xl mx-auto pt-12'>
        <UploadForm
          formData={formData}
          errors={errors}
          subjects={subjects}
          tiposRecurso={tiposRecurso}
          uploading={uploading}
          uploadError={uploadError}
          onSubjectChange={onSubjectChange}
          onTypeChange={onTypeChange}
          onPeriodChange={onPeriodChange}
          onNotesChange={onNotesChange}
          onFileChange={onFileChange}
          onImagesChange={onImagesChange}
          onFileModeChange={onFileModeChange}
          onSubmit={handleSubmit}
        />
      </div>
    </>
  );
}

export default function UploadSection() {
  return (
    <AuthProvider>
      <AuthGuard>
        <UploadSectionInner />
      </AuthGuard>
    </AuthProvider>
  );
}
