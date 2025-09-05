import IconAlertCircle from '@/shared/components/icons/react/IconAlertCircle';

interface ErrorMessageProps {
  message?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;
  return (
    <div className='flex items-center mt-2 text-red-600'>
      <IconAlertCircle size={16} className='fill-red-600 mr-2' />
      <span className='text-sm'>{message}</span>
    </div>
  );
};
export default ErrorMessage;
