import IconCheckCircle from '@/assets/icons/react/IconCheckCircle';
import IconX from '@/assets/icons/react/IconX';

interface SuccessModalProps {
  showSuccess: boolean;
  closeSuccess: () => void;
}

const SuccessModal = ({ showSuccess, closeSuccess }: SuccessModalProps) => {
  if (!showSuccess) return null;

  return (
    <div className='fixed inset-0 bg-black/95 border-primary/30  border flex items-center justify-center z-50 p-4'>
      <div className='bg-black/20 rounded-2xl p-8 max-w-md w-full relative animate-in fade-in duration-300'>
        <button
          onClick={closeSuccess}
          className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors'
        >
          <IconX size={24} />
        </button>
        <div className='text-center'>
          <div className='w-16 h-16 bg-green-900/70 border border-green-600 rounded-full flex items-center justify-center mx-auto mb-4'>
            <IconCheckCircle size={32} className=' stroke-green-600' />
          </div>
          <h3 className='text-2xl font-bold text-foreground mb-2'>¡Aporte enviado!</h3>
          <p className='text-foreground-secondary mb-6'>
            Tu aporte ha sido enviado exitosamente. Será revisado y publicado pronto.
          </p>
          <button
            onClick={closeSuccess}
            className='w-full bg-gradient-to-r from-[#FFDD00] to-[#FFCC00] text-black font-semibold py-3 rounded-xl hover:from-[#FFCC00] hover:to-[#FFB800] transition-all duration-200'
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
