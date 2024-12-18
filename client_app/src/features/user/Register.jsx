import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import LandingIntro from './LandingIntro';
import ErrorText from '../../components/Typography/ErrorText';
import InputText from '../../components/Input/InputText';
import RadioText from '../../components/Input/Radio';
import Dropdown from '../../components/Input/Dropdown';
import TextAreaInput from '../../components/Input/TextAreaInput';


import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';
import {
  mdiAccount,
  mdiBallotOutline,
  mdiGithub,
  mdiMail,
  mdiUpload,
  mdiAccountPlusOutline,
  mdiPhone,
  mdiLock,
  mdiVanityLight,
  mdiLockOutline,
  mdiCalendarRange,
  mdiPhoneOutline,
  mdiMapMarker,
  mdiEmailCheckOutline,
  mdiAccountHeartOutline,
  mdiCashCheck,
  mdiAccountCreditCardOutline,
  mdiCreditCardOutline
} from '@mdi/js';

// import MultiStep from 'react-multistep';
import { usePlacesWidget } from 'react-google-autocomplete';
import Autocomplete from 'react-google-autocomplete';
import FormWizard from 'react-form-wizard-component';
import 'react-form-wizard-component/dist/style.css';
import ForwardIcon from '@heroicons/react/24/outline/ForwardIcon';
import BackwardIcon from '@heroicons/react/24/outline/BackwardIcon';
import PlayCircleIcon from '@heroicons/react/24/outline/PlusCircleIcon';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { debounce } from 'lodash';

import {
  regions,
  provinces,
  cities,
  barangays,
  provincesByCode,
  regionByCode
} from 'select-philippines-address';



function Register({ isFromUpdateProfile, patientId }) {

  console.log({ isFromUpdateProfile, patientId })
  const [emailError, setEmailError] = useState('');
  const [currentWizardIndex, setCurrentWizardIndex] = useState(false);
  const navigate = useNavigate();
  const [users, setUser] = useState([]);
  const [isLoaded, setIsLoaded] = useState([]);
  const [addressRegions, setRegions] = useState([]);
  const [addressProvince, setProvince] = useState([]);
  const [addressCity, setCity] = useState([]);
  const [addressBarangay, setBarangay] = useState([]);
  const prepareAddress = async () => {
    await regions().then(region => {
      setRegions(
        region.map(r => {
          return {
            value: r.region_code,
            label: r.region_name
          };
        })
      );
    });
    // await regionByCode('01').then(region => //console.log(region.region_name));
    await provinces().then(province => console.log(province));
    await provincesByCode('05').then(
      province => {
        setProvince(
          province.map(p => {
            return {
              value: p.province_code,
              label: p.province_name
            };
          })
        );
      }
    );
    // await provinceByName('Rizal').then(province =>
    //   //console.log(province.province_code)
    // );
    await cities(patientId?.address_province).then(cities => {
      setCity(
        cities.map(p => {
          return {
            value: p.city_code,
            label: p.city_name
          };
        })
      );
    });

    await barangays(patientId?.address_city).then(cities => {
      setBarangay(
        cities.map(p => {

          return {
            value: p.brgy_code,
            label: p.brgy_name
          };
        })
      );
    });
  };
  useEffect(() => {
    prepareAddress();
  }, []);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const appSettings = useSelector(state => state.appSettings);
  let { codeTypeList, packageList } = appSettings;

  const amulet_packageSelection = packageList.map(p => {
    return {
      label: p.displayName,
      value: p.name
    };
  });

  const paymentMethodSelection = [
    {
      label: 'Cheque',
      value: 'cheque'
    },
    {
      label: 'Cash',
      value: 'cash'
    }
  ];

  const signatureSelection = [
    {
      label: 'Yes',
      value: true
    },
    {
      label: 'No',
      value: false
    }
  ];

  let firstValidation = [];
  let secondValidation = [];

  let validation = [];
  const debouncedEmailValidation = debounce(
    async (value, setFieldError, errors, setErrors) => {
      if (!errors.email) {
        let res = await axios({
          method: 'POST',
          url: 'user/isEmailExist',
          data: {
            email: value
          }
        });

        const isExist = res.data.isEmailExist;

        //console.log({ isExist });
        if (isExist) {
          // setEmailError('Email already exists');
          setFieldError('email', 'Email already exists');

          // setErrors({
          //   email: 'Email already exists'
          // });
        } else {
        }
      }
    },
    600,
    {
      trailing: true
    }
  );
  const debouncedUserNameValidation = debounce(
    async (value, setFieldError, errors) => {
      // let res = await axios({
      //   method: 'POST',
      //   url: 'user/isUserNameExist',
      //   data: {
      //     userName: value
      //   }
      // });
      // const isExist = res.data.isUserNameExist;
      // if (isExist) {
      //   setFieldError('userName', 'Username already exists');
      // } else {
      //   setFieldError('userName', '');
      // }
    },
    600,
    {
      trailing: true
    }
  );



  let initialValues = {

    "email": "",
    "password": "",
    "firstName": "",
    "middleName": "",
    "lastName": "",
    "address_region": "05",
    "address_province": "",
    "address_city": "",
    "Address_or_Location": "",
    "age": "",
    "gender": "",
    "birthDate": "",
    "medical_history": "",
    "phone_number": ""

  };

  if (!!patientId?.patient_id) {
    initialValues = {

      "email": patientId.email,
      "password": patientId.password,
      "firstName": patientId.patient_first_name,
      "middleName": patientId.middle_name,
      "lastName": patientId.patient_last_name,
      "address_region": patientId.address_region,
      "address_province": patientId.address_province,
      "address_city": patientId.address_city,
      "Address_or_Location": patientId.address_or_location,
      "age": patientId.age,
      "gender": patientId.gender,
      "birthDate": patientId.date_of_birth,
      "medical_history": patientId.medical_history,
      "phone_number": patientId.phone_number

    };

  }

  const formikConfig = {
    initialValues,
    validationSchema: Yup.object({
      email: Yup.string().email().required("Required"),
      password: Yup.string().required("Required"),
      firstName: Yup.string().required("First Name is required"),
      middleName: Yup.string().nullable(),
      lastName: Yup.string().required("Last Name is required"),
      address_region: Yup.string().required("Region is required"),
      address_province: Yup.string().required("Province is required"),
      address_city: Yup.string().required("City is required"),
      Address_or_Location: Yup.string().required("Barangay is required"),
      age: Yup.number()
        .min(1, "Age must be greater than 0.")
        .required("Age is required"),
      gender: Yup.string().required("Required"),
      birthDate: Yup.string().required("Required"),
      medical_history: Yup.string().required("Required"),
      phone_number: Yup.number().required("Required"),

    }),
    validateOnMount: true,
    validateOnChange: false,
    onSubmit: async (values, { setFieldError, setSubmitting }) => {
      setSubmitting(true);

      try {
        let memberData = {
          ...values,
          // address_region: await regionByCode(values.address_region).then(
          //   region => region.region_name
          // ),
          // address_province: await provincesByCode(values.address_region).then(
          //   province => {
          //     let data = province.find(
          //       p => p.province_code === values.address_province
          //     );
          //     return data.province_name;
          //   }
          // ),
          // address_city: await cities(values.address_province).then(city => {
          //   let data = city.find(p => p.city_code === values.address_city);

          //   return data.city_name;
          // }),
          // Address_or_Location: addressBarangay.find(
          //   p => p.value === values.Address_or_Location
          // ).label
        };

        //console.log({ memberData });
        let res = await axios({
          method: 'POST',
          url: 'user/create',
          data: memberData
        }).then(async () => {


          const sendMessage = async ({ firstName, lastName, phoneNumber, }) => {
            const message = `Dear ${firstName} ${lastName}. Congratulations! Your registration was successful. We’re thrilled to have you with us. Stay well and enjoy all the benefits ahead!`;


            // URL encoding the message and phone number
            const url = `https://sadnsrmvis.com/hwebit_sms/index.php?cp_num=${encodeURIComponent(phoneNumber)}&message=${encodeURIComponent(message)}`;

            try {
              // Perform the request to the server
              const response = await fetch(url);
              const data = await response.json(); // Assuming the server returns JSON

              // Handle the server response
              if (response.ok) {
                //console.log('Message sent successfully:', data);
              } else {
                console.error('Error sending message:', data);
              }
            } catch (error) {
              console.error('Network error:', error);
            }
          };
          await sendMessage({
            firstName: values.firstName,
            lastName: values.lastName,
            phoneNumber: values.phone_number
          });

          toast.success('Created Successfully', {
            onClose: () => {
              // setSubmitting(false);
              // navigate('/app/users');
            },
            position: 'top-right',
            autoClose: 500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'light'
          });
        });

        // let data = res.data;


      } catch (error) {

        const errorMessage = error.response?.data?.message || 'An unexpected error occurred';

        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light'
        });
      } finally {
      }
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    isLoaded && (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
        <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
          {!isFromUpdateProfile && <div className="text-center">


            <h1 className="text-2xl font-bold leading-tight text-gray-900 dark:text-white ">
              Member Registration
            </h1>

            <div className='mt-5 border-b border-gray-30'></div>
            {/* <p className="text-gray-600 dark:text-gray-300 mt-2">
              Please fill in the required details to register.
            </p> */}
          </div>}

          <Formik {...formikConfig}>
            {({
              handleSubmit,
              handleBlur,
              values,
              touched,
              errors,
              setFieldTouched,
              setFieldValue,
              isSubmitting
            }) => (
              <Form className="space-y-4">

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <InputText
                    icons={mdiAccount}
                    label="Email"
                    name="email"
                    type="text"
                    placeholder="Enter your email"
                    value={values.email}
                    onBlur={handleBlur}
                  />
                  {
                    !patientId?.patient_id && <InputText
                      icons={mdiAccount}
                      label="Password"
                      name="password"
                      type="text"
                      placeholder="Enter your password"
                      value={values.password}
                      onBlur={handleBlur}
                    />
                  }


                </div>



                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <InputText
                    icons={mdiAccount}
                    label="First Name"
                    name="firstName"
                    type="text"
                    placeholder="Enter given name"
                    value={values.firstName}
                    onBlur={handleBlur}
                  />
                  <InputText
                    icons={mdiAccount}
                    label="Middle Name"
                    name="middleName"
                    type="text"
                    placeholder="Enter your Middle Name"
                    value={values.middleName}
                    onBlur={handleBlur}
                  />
                  <InputText
                    icons={mdiAccount}
                    label="Last Name"
                    name="lastName"
                    type="text"
                    placeholder="Enter your Last Name"
                    value={values.lastName}
                    onBlur={handleBlur}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className='mt-2'>
                    <Dropdown
                      className="z-50 mt-5"

                      label="Gender"
                      name="gender"
                      value={values.gender}
                      setFieldValue={setFieldValue}
                      onBlur={handleBlur}
                      options={[{
                        label: 'Male',
                        value: 'Male'
                      }, {
                        label: 'Female',
                        value: 'Female'
                      }
                      ]}
                      affectedInput=""
                      functionToCalled={async code => { }}
                    />
                  </div>



                  <InputText
                    icons={mdiAccount}
                    label="Birth Date"
                    name="birthDate"
                    type="date"
                    placeholder="Enter your birth date"
                    value={values.birthDate}
                    onBlur={handleBlur}
                    onChange={(e) => {

                      let value = e.target.value

                      const birthDate = new Date(value);
                      const today = new Date();
                      const age = today.getFullYear() - birthDate.getFullYear();
                      const month = today.getMonth() - birthDate.getMonth();

                      // Adjust age if the birthday hasn't happened yet this year
                      if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {

                      } else {


                        setFieldValue('age', age)


                      }
                      setFieldValue('birthDate', value)
                      // if (values) {

                      // }
                    }}
                    max={getTodayDate()} // Disable future date
                  />
                  <InputText
                    icons={mdiAccount}
                    label="Age"
                    name="age"
                    disabled
                    type="text"
                    placeholder="Enter your age"
                    value={values.age}
                    onBlur={handleBlur}
                  />

                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Dropdown
                    icons={mdiMapMarker}
                    label="Region"
                    name="address_region"
                    value={values.address_region}
                    setFieldValue={setFieldValue}
                    onBlur={handleBlur}
                    options={addressRegions}

                    functionToCalled={async regionCode => {


                      if (regionCode) {
                        setFieldValue('address_province', '');
                        await provincesByCode(regionCode).then(
                          province => {
                            setProvince(
                              province.map(p => {
                                return {
                                  value: p.province_code,
                                  label: p.province_name
                                };
                              })
                            );
                          }
                        );
                      }
                    }}
                  />
                  <Dropdown
                    icons={mdiMapMarker}
                    label="Province"
                    name="address_province"
                    value={values.address_province}
                    setFieldValue={setFieldValue}
                    onBlur={handleBlur}
                    options={addressProvince}
                    functionToCalled={async code => {
                      if (code) {
                        await cities(code).then(cities => {
                          setCity(
                            cities.map(p => {
                              return {
                                value: p.city_code,
                                label: p.city_name
                              };
                            })
                          );
                        });
                      }
                    }}
                  />
                  <Dropdown
                    icons={mdiMapMarker}
                    label="City"
                    name="address_city"
                    value={values.address_city}
                    setFieldValue={setFieldValue}
                    onBlur={handleBlur}
                    options={addressCity}
                    functionToCalled={async code => {
                      if (code) {
                        await barangays(code).then(cities => {
                          setBarangay(
                            cities.map(p => {
                              //console.log({ p });
                              return {
                                value: p.brgy_code,
                                label: p.brgy_name
                              };
                            })
                          );
                        });
                      }
                    }}
                  />
                  <Dropdown
                    icons={mdiMapMarker}
                    label="Barangay"
                    name="Address_or_Location"
                    value={values.Address_or_Location}
                    setFieldValue={setFieldValue}
                    onBlur={handleBlur}
                    options={addressBarangay}
                  />
                </div>


                <InputText
                  icons={mdiAccount}
                  label="Mobile Number"
                  name="phone_number"

                  type="text"
                  placeholder="Enter your mobile number"
                  value={values.phone_number}
                  onBlur={handleBlur}
                />
                <TextAreaInput

                  label="Medical History"
                  name="medical_history"

                  type="text"
                  placeholder="Enter medical history details"
                  value={values.medical_history}
                  onBlur={handleBlur}
                />

                <div className="flex justify-end">
                  {!isFromUpdateProfile && <button
                    type='submit'
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-cyan-900 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
                    Create Account
                  </button>
                  }

                  {/* {isFromUpdateProfile && <button
                    type='submit'
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-cyan-900 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
                    Update
                  </button>
                  } */}

                </div>
              </Form>
            )}
          </Formik>
        </div>

        <ToastContainer />



      </div >

    )
  );
}

export default Register;
