import { useUploadForm } from '@/hooks/useUploadForm';
import SuccessModal from './SuccesModal';
import UploadHeader from './UploadHeader';
import InfoSection from './InfoSection';
import { MATERIAS_SISTEMAS } from '@/data/materias';
import UploadForm from './UploadForm';

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
    uploadError,
  } = useUploadForm();

  return (
    <div className='min-h-screen pt-20'>
      <SuccessModal showSuccess={showSuccess} closeSuccess={closeSuccess} />
      <div className='max-w-4xl mx-auto py-12'>
        <UploadHeader />
        <UploadForm
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
        <InfoSection />
      </div>
    </div>
  );
};

export default UploadSection;
