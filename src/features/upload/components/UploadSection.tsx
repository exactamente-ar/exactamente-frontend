import { useUploadForm } from '@/features/upload/hooks/useUploadForm';
import SuccessModal from './SuccesModal';
import UploadForm from './UploadForm';
import { useEffect, useState } from 'react';
import { getCareers, getSubjects, getCareerPlans } from '@/shared/services/api';
import { DEFAULT_PLAN_YEAR } from '@/features/home/constants/filter';
import type { Subject } from '@/features/home/types/subjects';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { useAuth } from '@/features/auth/hooks/useAuth';

const tiposRecurso = [
  { value: 'resumen', label: 'Resumen' },
  { value: 'parcial', label: 'Parcial' },
  { value: 'final', label: 'Final' },
];

function parseInitialValues() {
  if (typeof window === 'undefined') return {};

  const draftRaw = localStorage.getItem('exactamente_upload_draft');
  if (draftRaw) {
    localStorage.removeItem('exactamente_upload_draft');
    try { return JSON.parse(draftRaw); } catch {}
  }

  const params = new URLSearchParams(window.location.search);
  const careerId = params.get('careerId');
  const planId = params.get('planId');
  const subjectId = params.get('subjectId');
  const type = params.get('type');
  const result: Record<string, string> = {};
  if (careerId) result.careerId = careerId;
  if (planId) result.planId = planId;
  if (subjectId) result.subjectId = subjectId;
  if (type === 'resumen' || type === 'parcial' || type === 'final') result.type = type;
  return result;
}

function UploadSectionInner() {
  const { token, loading: authLoading } = useAuth();
  const {
    formData,
    errors,
    showSuccess,
    uploading,
    uploadError,
    duplicateWarning,
    onCareerChange,
    onPlanChange,
    onSubjectChange,
    onTypeChange,
    onTitleChange,
    onSubtypeChange,
    onExamYearChange,
    onExamMonthChange,
    onExamDayChange,
    onTopicChange,
    onNotesChange,
    onFileChange,
    onImagesChange,
    onFileModeChange,
    onDuplicateConfirm,
    handleSubmit,
    closeSuccess,
  } = useUploadForm(parseInitialValues());

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
      if (!formData.planId) {
        if (mapped.length === 1) {
          onPlanChange(mapped[0].value);
        } else if (mapped.length > 1) {
          const defaultPlan = data.find((p) => p.year === DEFAULT_PLAN_YEAR);
          if (defaultPlan) onPlanChange(defaultPlan.id);
        }
      }
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
          duplicateWarning={duplicateWarning}
          onCareerChange={onCareerChange}
          onPlanChange={onPlanChange}
          onSubjectChange={onSubjectChange}
          onTypeChange={onTypeChange}
          onTitleChange={onTitleChange}
          onSubtypeChange={onSubtypeChange}
          onExamYearChange={onExamYearChange}
          onExamMonthChange={onExamMonthChange}
          onExamDayChange={onExamDayChange}
          onTopicChange={onTopicChange}
          onNotesChange={onNotesChange}
          onFileChange={onFileChange}
          onImagesChange={onImagesChange}
          onFileModeChange={onFileModeChange}
          onDuplicateConfirm={onDuplicateConfirm}
          onSubmit={handleSubmit}
          isAuthenticated={!!token}
          isAuthLoading={authLoading}
        />
      </div>
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
