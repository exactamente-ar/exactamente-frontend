import IconDownload from '@/shared/components/icons/react/IconDownload';

interface SubmitButtonProps {
  isSubmitting: boolean;
  text: string;
  submittingText: string;
  errors: {
    materia?: string;
    tipoRecurso?: string;
    titulo?: string;
    archivo?: string;
    captcha?: string;
  };
  uploadError?: string | null;
}

function SubmitButton({
  isSubmitting,
  text,
  submittingText,
  errors,
  uploadError,
}: SubmitButtonProps) {
  const hasError =
    !!uploadError || Object.values(errors).some((error) => error && error.length > 0);

  return (
    <button
      type='submit'
      disabled={isSubmitting}
      className={`  cursor-pointer w-full bg-primary text-black font-bold py-3 rounded-xl  transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed ${
        hasError && 'border-4 border-red-500 shadowlg-xl shadow-red-500/20 hover:shadow-red-500/30'
      }`}
    >
      {isSubmitting ? (
        <span className='flex items-center gap-2'>
          <svg className='animate-spin' width='20' height='20' viewBox='0 0 24 24'>
            <g fill='#000000'>
              <path
                fillRule='evenodd'
                d='M12 19a7 7 0 1 0 0-14a7 7 0 0 0 0 14m0 3c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10'
                clipRule='evenodd'
                opacity='.2'
              />
              <path d='M2 12C2 6.477 6.477 2 12 2v3a7 7 0 0 0-7 7z' />
            </g>
          </svg>
          {submittingText}
        </span>
      ) : (
        <>
          <IconDownload size={20} className='mr-2' />
          {text}
        </>
      )}
    </button>
  );
}

export default SubmitButton;
