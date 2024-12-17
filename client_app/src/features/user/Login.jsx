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
    onSubmit: async (
      values,
      { setSubmitting, setFieldValue, setErrorMessage, setErrors }
    ) => {
      try {
        let res = await axios({
          method: 'POST',
          url: 'auth/login',
          data: values
        });

        let { token } = res.data;
        let user = res.data.data;

        localStorage.setItem('token', token);


        localStorage.setItem('loggedInUser', JSON.stringify(user));

        window.location.href = '/app/dashboard';
      } catch (error) {

        // console.log(error.response.data.message)
        toast.error(`Login Failed. Unknown User.`, {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light'
        });
      }

      // setErrorMessage('');
      // localStorage.setItem('token', 'DumyTokenHere');
      // setLoading(false);
      // window.location.href = '/app/dashboard';
    }
  };

  return (
    // <div

    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Column for Background Image */}
      <div className="w-1/2 flex items-center justify-center relative ">

        {/* <TriangleGridBackground /> */}
        <div className="w-full max-w-md p-8 space-y-6 shadow-lg
         bg-gradient-to-r from-gray-200 to-gray-300
          shadow-lg 
         
         rounded-lg shadow-lg p-6">

          <h1
            className="text-xl font-bold leading-tight tracking-tight
             text-gray-900 md:text-2xl dark:text-white text-center text-blue-950">
            Login
          </h1>
          <div>
            <Formik {...formikConfig}>
              {({
                handleSubmit,
                handleChange,
                handleBlur, // handler for onBlur event of form elements
                values,
                touched,
                errors
              }) => {
                return (
                  <Form className="space-y-4 md:space-y-6">
                    <InputText
                      icons={mdiAccount}
                      label="Username"
                      labelColor="text-blue-950"
                      name="email"
                      type="text"
                      placeholder=""
                      value={values.email}
                      onBlur={handleBlur} // This apparently updates `touched`?
                    />

                    <div className="relative">
                      <InputText
                        icons={mdiLockOutline}
                        labelColor="text-blue-950"
                        label="Password"
                        name="password"
                        type={showPassword ? "text" : "password"} // Change type based on visibility
                        value={values.password}
                        onBlur={handleBlur}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 z-10" // Added z-10
                      >
                        {showPassword ? (
                          <svg className="w-10 h-5 mt-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d={mdiEyeOff} />
                          </svg>
                        ) : (
                          <svg className="w-10 h-5 mt-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d={mdiEye} />
                          </svg>
                        )}
                      </button>
                    </div>
                    <div class="text-right text-blue-950">
                      <a href="/forgot-password"><span class="text-sm  text-blue-950 inline-block  hover:text-buttonPrimary  hover:underline hover:cursor-pointer transition duration-200">Forgot Password?</span></a></div>

                    <button
                      type="submit"
                      className={
                        'btn mt-2 w-full bg-cyan-700 font-bold text-white' +
                        (loading ? ' loading' : '')
                      }>
                      Sign in
                    </button>

                    {/* <div className="text-sm font-light text-gray-500 dark:text-gray-400 mt-4">
                      Don't have an account yet?
                      <Link to="/register">
                        <span className="  inline-block  hover:text-primary hover:underline hover:cursor-pointer transition duration-200">
                          Register
                        </span>
                      </Link>
                    </div> */}
                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      </div>
      <div className="hidden md:block w-1/2  bg-gradient-to-r from-gray-100 to-teal-400
      z-10 text-blue-950 border bg-white  relative flex items-center justify-center">
        {/* Triangle Decorations */}

        {/* Centered Circle with Text */}
        <div className="relative w-full h-screen ">
          <div className="absolute top-10 left-10 w-0 h-0 border-l-[50px] border-l-transparent border-b-[100px] border-b-red-500 border-r-[50px] border-r-transparent"></div>
          <div className="absolute top-1/4 right-20 w-0 h-0 border-l-[60px] border-l-transparent border-b-[120px] border-b-blue-500 border-r-[60px] border-r-transparent"></div>
          <div className="absolute bottom-16 left-1/3 w-0 h-0 border-l-[70px] border-l-transparent border-b-[140px] border-b-green-500 border-r-[70px] border-r-transparent"></div>
          <div className="absolute bottom-10 right-10 w-0 h-0 border-l-[40px] border-l-transparent border-b-[80px] border-b-yellow-500 border-r-[40px] border-r-transparent"></div>

          {/* Centered Circle */}
          <div className="absolute top-1/2 left-1/2 transform 
          -translate-x-1/2 -translate-y-1/2 bg-cyan-600 text-white w-72 h-72 flex flex-col
           items-center justify-center text-center clip-hexagon p-10">
            <h2 className="text-xl font-bold">BOOK YOUR APPOINTMEN NOW</h2>
            <p className="text-sm mt-2">Get started with your dental care in just a few minutes.</p>
            <button className="mt-4 bg-white text-cyan-950 py-2 px-6 rounded-full font-bold">
              Apply Now
            </button>
          </div>
        </div>

      </div>
      <ToastContainer />
    </div>
  );
}

export default Login;
