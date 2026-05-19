import { useUploadForm } from '@/features/upload/hooks/useUploadForm';
import SuccessModal from './SuccesModal';
import UploadForm from './UploadForm';
import { useEffect, useState } from 'react';
import { getSubjects } from '@/shared/services/api';

const tiposRecurso = [
  { value: 'resumen', label: 'Resumen', color: 'from-emerald-500 to-emerald-600' },
  { value: 'parcial', label: 'Parcial', color: 'from-blue-500 to-blue-600' },
  { value: 'final', label: 'Final', color: 'from-purple-500 to-purple-600' },
];

const UploadSection = () => {
  const {
    formData,
    errors,
    showSuccess,
    handleInputChange,
    handleFileChange,
    handleSubmit,
    closeSuccess,
    uploading,
    uploadError,
  } = useUploadForm();
  const [subjects, setSubjects] = useState<string[]>([]);
  useEffect(() => {
    const skeleton = document.getElementById('upload-skeleton');
    if (skeleton) {
      skeleton.style.display = 'none';
    }
  }, []);
  useEffect(() => {
    getSubjects().then(({ data }) => {
      setSubjects(data.map((subject) => subject.title));
    });
  }, []);

  return (
    <>
      <SuccessModal showSuccess={showSuccess} closeSuccess={closeSuccess} />
      <div className='max-w-4xl mx-auto pt-12'>

        <UploadForm
          uploadError={uploadError}
          uploading={uploading}
          formData={formData}
          errors={errors}
          handleInputChange={handleInputChange}
          handleFileChange={handleFileChange}
          handleSubmit={handleSubmit}
          subjects={subjects}
          tiposRecurso={tiposRecurso}
        />
      </div>
    </>
  );
};

export default UploadSection;
