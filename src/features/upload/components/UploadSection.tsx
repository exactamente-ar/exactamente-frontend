import { useUploadForm } from '@/features/upload/hooks/useUploadForm';
import SuccessModal from './SuccesModal';
import UploadForm from './UploadForm';
import { useEffect, useState } from 'react';
import { getCareers, getSubjects, getCareerPlans } from '@/shared/services/api';
import type { Subject } from '@/features/home/types/subjects';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { AuthGuard } from '@/features/auth/components/AuthGuard';
import { GoogleLoginButton } from '@/features/auth/components/GoogleLoginButton';

const tiposRecurso = [
  { value: 'resumen', label: 'Resumen' },
  { value: 'parcial', label: 'Parcial' },
  { value: 'final', label: 'Final' },
];

function LoginGate() {
  return (
    <div className='max-w-md mx-auto pt-12 text-center space-y-4'>
      <p className='text-zinc-400'>Iniciá sesión para subir recursos</p>
      <GoogleLoginButton />
    </div>
  );
}

function UploadSectionInner() {
  const {
    formData,
    errors,
    showSuccess,
    uploading,
    uploadError,
    onCareerChange,
    onPlanChange,
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

  const [careers, setCareers] = useState<{ value: string; label: string }[]>([]);
  const [plans, setPlans] = useState<{ value: string; label: string }[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [subjects, setSubjects] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const skeleton = document.getElementById('upload-skeleton');
    if (skeleton) skeleton.style.display = 'none';
  }, []);

  useEffect(() => {
    getCareers().then(({ data }) => {
      setCareers(data.map((c) => ({ value: c.id, label: c.name })));
    });
  }, []);

  useEffect(() => {
    if (!formData.careerId) {
      setPlans([]);
      setAllSubjects([]);
      setSubjects([]);
      return;
    }
    getCareerPlans(formData.careerId).then(({ data }) => {
      const mapped = data.map((p) => ({ value: p.id, label: p.name }));
      setPlans(mapped);
      if (mapped.length === 1) onPlanChange(mapped[0].value);
    });
    getSubjects({ careerId: formData.careerId }).then(({ data }) => {
      setAllSubjects(data);
    });
  }, [formData.careerId]);

  useEffect(() => {
    if (!formData.planId) {
      setSubjects([]);
      return;
    }
    const filtered = allSubjects
      .filter((s) => s.careers.some((c) => c.planId === formData.planId))
      .map((s) => ({ value: s.id, label: s.title }));
    setSubjects(filtered);
  }, [formData.planId, allSubjects]);

  return (
    <>
      <SuccessModal showSuccess={showSuccess} closeSuccess={closeSuccess} />
      <AuthGuard fallback={<LoginGate />}>
        <div className='max-w-4xl mx-auto pt-12'>
          <UploadForm
            formData={formData}
            errors={errors}
            careers={careers}
            plans={plans}
            subjects={subjects}
            tiposRecurso={tiposRecurso}
            uploading={uploading}
            uploadError={uploadError}
            onCareerChange={onCareerChange}
            onPlanChange={onPlanChange}
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
      </AuthGuard>
    </>
  );
}

export default function UploadSection() {
  return (
    <AuthProvider>
      <UploadSectionInner />
    </AuthProvider>
  );
}
