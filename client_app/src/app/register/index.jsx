import RegisterPage from '@/app/register/page';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Page() {
  const navigate = useNavigate();

  const handleRegistrationSuccess = () => {
    navigate('/verify-email-notice');
  };

  const handleRegistrationError = (error) => {
    // Error will be the message string from the API response
    toast.error(error, {
      duration: 5000,
      position: 'top-center',
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-6 flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-[80%] md:max-w-[90%] lg:max-w-[80%] xl:max-w-[1000px] mx-auto">
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 lg:p-8">
          <div className="flex justify-center mb-4">
            <img
              src="/logo.jpg"
              alt="Logo"
              className="w-50 h-20 border-4 border-blue-950 shadow-lg p-1 rounded-lg"
            />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold leading-tight text-blue-950 dark:text-white">
              Patient Registration
            </h1>
          </div>
          <RegisterPage
            onSuccess={handleRegistrationSuccess}
            onError={handleRegistrationError}
          />
        </div>
      </div>
    </div>
  );
}