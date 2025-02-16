import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import LandingIntro from './LandingIntro';
import ErrorText from '../../components/Typography/ErrorText';
import InputText from '../../components/Input/InputText';
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';
import { mdiAccount, mdiLockOutline, mdiEye, mdiEyeOff } from '@mdi/js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

function TriangleGridBackground() {
  return (
    <div className="relative w-full h-screen bg-gray-100 overflow-hidden">
      {/* Triangle 1 */}
      <div className="absolute top-10 left-10 w-0 h-0 border-l-[50px] border-l-transparent border-b-[100px] border-b-red-500 border-r-[50px] border-r-transparent"></div>

      {/* Triangle 2 */}
      <div className="absolute top-1/4 right-20 w-0 h-0 border-l-[60px] border-l-transparent border-b-[120px] border-b-blue-500 border-r-[60px] border-r-transparent"></div>

      {/* Triangle 3 */}
      <div className="absolute bottom-16 left-1/3 w-0 h-0 border-l-[70px] border-l-transparent border-b-[140px] border-b-green-500 border-r-[70px] border-r-transparent"></div>

      {/* Triangle 4 */}
      <div className="absolute bottom-10 right-10 w-0 h-0 border-l-[40px] border-l-transparent border-b-[80px] border-b-yellow-500 border-r-[40px] border-r-transparent"></div>

      {/* Main Content */}

    </div>
  );
}


function Login() {
  const INITIAL_LOGIN_OBJ = {
    password: '',
    emailId: ''
  };

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loginObj, setLoginObj] = useState(INITIAL_LOGIN_OBJ);


  const [showPassword, setShowPassword] = useState(false); // State to manage password visibility

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const [isLoading, setIsLoading] = useState(false);

  const formikConfig = {
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: Yup.object({
      email: Yup.string().required('Required field'),
      password: Yup.string()
        .min(8, 'Minimun of 8 character(s)')
        .required('Required field')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setIsLoading(true);
      try {
        let res = await axios({
          method: 'POST',
          url: 'auth/login',
          data: values
        });

        if (!res.data.success) {
          toast.error(res.data.message);
          return;
        }

        if (res.data.needsVerification) {
          toast.error('Please verify your email before logging in', {
            action: {
              label: 'Resend',
              onClick: () => handleResendVerification(values.email)
            }
          });
          return;
        }

        let { token } = res.data;
        let user = res.data.data;

        localStorage.setItem('token', token);
        localStorage.setItem('loggedInUser', JSON.stringify(user));

        toast.success('Login successful!');
        window.location.href = '/app/dashboard';
      } catch (error) {
        toast.error(error.response?.data?.message || 'Login failed');
      } finally {
        setIsLoading(false);
        setSubmitting(false);
      }
    }
  };

  const handleResendVerification = async (email) => {
    try {
      const response = await axios.post('auth/resend-verification', { email });
      if (response.data.success) {
        toast.success('Verification email sent successfully');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to resend verification email');
    }
  };

  return (
    // <div

    <div className="flex flex-col md:flex-row min-h-screen">


      {/* Login Form - Full Width on Small Screens */}
      <div className="w-full  flex items-center justify-center bg-gray-100 px-6 md:px-0">
        <div className="w-full max-w-lg">
          <div className="flex justify-center mb-4">
            <img src="/logo.jpg" alt="Logo" className="w-50 h-20 border-4 border-blue-950 shadow-lg p-0 rounded-lg" />
          </div>
          <div className="p-6 shadow-lg bg-white rounded-lg">
            <h1 className="text-xl font-bold text-center text-blue-950">Login</h1>
            <Formik {...formikConfig}>
              {({ handleSubmit, handleBlur, values }) => (
                <Form className="space-y-4">
                  <InputText
                    icons={mdiAccount}
                    label="Username"
                    labelColor="text-blue-950"
                    name="email"
                    type="text"
                    value={values.email}
                    onBlur={handleBlur}
                  />
                  <div className="relative">
                    <InputText
                      icons={mdiLockOutline}
                      labelColor="text-blue-950"
                      label="Password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={values.password}
                      onBlur={handleBlur}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showPassword ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d={mdiEyeOff} />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d={mdiEye} />
                        </svg>
                      )}
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-700 text-white font-bold py-2 rounded flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                  <div className="text-right text-blue-950 text-sm">
                    <a href="/forgot-password" className="hover:underline">Forgot Password?</a>
                  </div>
                  <div className="text-center text-blue-950 text-sm">
                    <a href="/register" className="hover:underline">Don't have an account? Register</a>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Login;
