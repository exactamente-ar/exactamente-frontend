import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog';
import IconCheckCircle from '@/shared/components/icons/react/IconCheckCircle';

interface SuccessModalProps {
  showSuccess: boolean;
  closeSuccess: () => void;
}

const SuccessModal = ({ showSuccess, closeSuccess }: SuccessModalProps) => {
  return (
    <Dialog open={showSuccess} onOpenChange={(open) => { if (!open) closeSuccess(); }}>
      <DialogContent className='bg-black/90 border border-primary/30 rounded-2xl p-8 max-w-md text-center [&>button]:text-zinc-400 [&>button]:hover:text-zinc-200'>
        <div className='flex flex-col items-center gap-4'>
          <div className='w-16 h-16 bg-green-900/70 border border-green-600 rounded-full flex items-center justify-center'>
            <IconCheckCircle size={32} className='stroke-green-600' />
          </div>
          <DialogTitle className='text-2xl font-bold text-foreground'>
            !Recurso enviado!
          </DialogTitle>
          <DialogDescription className='text-foreground-secondary'>
            Tu recurso ha sido enviado exitosamente. Sera revisado y publicado pronto.
          </DialogDescription>
          <button
            onClick={closeSuccess}
            className='w-full font-semibold py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-foreground transition-all duration-200'
          >
            Continuar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
