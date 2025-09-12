import { useUploadForm } from '@/features/upload/hooks/useUploadForm';
import SuccessModal from './SuccesModal';
import { MATERIAS_SISTEMAS } from '@/shared/data/materias';
import UploadForm from './UploadForm';
import { useEffect } from 'react';

const subjects = MATERIAS_SISTEMAS.map((subject) => subject.title);
const tiposAporte = [
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
    captchaToken,
    setCaptchaToken,
    uploadError,
  } = useUploadForm();

  useEffect(() => {
    const skeleton = document.getElementById('upload-skeleton');
    if (skeleton) {
      skeleton.style.display = 'none';
    }
  }, []);

  return (
    <>
      <SuccessModal showSuccess={showSuccess} closeSuccess={closeSuccess} />
      <div className='max-w-4xl mx-auto pt-12'>

        <UploadForm
          setCaptchaToken={setCaptchaToken}
          captchaToken={captchaToken}
          uploadError={uploadError}
          uploading={uploading}
          formData={formData}
          errors={errors}
          handleInputChange={handleInputChange}
          handleFileChange={handleFileChange}
          handleSubmit={handleSubmit}
          subjects={subjects}
          tiposAporte={tiposAporte}
        />
      </div>
    </>
  );
};

export default UploadSection;
