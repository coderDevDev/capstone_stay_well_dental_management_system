import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import InputText from '../../../components/Input/InputText';

import Dropdown from '../../../components/Input/Dropdown';
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';
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
import { useLocation } from 'react-router';
import { debounce } from 'lodash';

import {
  setAppSettings,
  getFeatureList
} from '../../../features/settings/appSettings/appSettingsSlice';

import {
  regions,
  provinces,
  cities,
  barangays,
  provincesByCode,
  regionByCode
} from 'select-philippines-address';

function SolarUserLinear(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  );
}
function placementInfoIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="w-6 h-6">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  );
}

function paymentInfoIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="w-6 h-6">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
      />
    </svg>
  );
}

function Register(funcProps) {
  const dispatch = useDispatch();
  const [emailError, setEmailError] = useState('');
  const [currentWizardIndex, setCurrentWizardIndex] = useState(false);
  const navigate = useNavigate();
  const [users, setUser] = useState([]);
  const [isLoaded, setIsLoaded] = useState([]);
  const [addressRegions, setRegions] = useState([]);
  const [addressProvince, setProvince] = useState([]);
  const [addressCity, setCity] = useState([]);
  const [addressBarangay, setBarangay] = useState([]);
  const search = useLocation().search;
  const id = new URLSearchParams(search).get('userId');
  const userId = id || '';

  console.log({ userId });
  const [selectedUser, setSelectedUser] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const getUser = async () => {
    setIsLoaded(false);
    let res = await axios({
      method: 'GET',
      url: `user/${userId}/childDetails`
    });
    let user = res.data.data;

    setSelectedUser(user);
    setIsLoaded(true);
    prepareAddress(user);
  };
  useEffect(() => {
    dispatch(getFeatureList()).then(result => {
      getUser().then(() => {
        console.log('loaded__user');
        setIsLoaded(true);
      });
    });
  }, []);

  const prepareAddress = async selectedUser => {
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
    // await regionByCode('01').then(region => console.log(region.region_name));
    // await provinces().then(province => {
    //   console.log({ province });
    //   setProvince(
    //     province.map(r => {
    //       return {
    //         value: r.region_code,
    //         label: r.region_name
    //       };
    //     })
    //   );
    // });
    await provincesByCode(selectedUser.address_region).then(province => {
      setProvince(
        province.map(r => {
          return {
            value: r.province_code,
            label: r.province_name
          };
        })
      );
    });
    // await provinceByName('Rizal').then(province =>
    //   console.log(province.province_code)
    // );
    await cities(selectedUser.address_province).then(cities => {
      setCity(
        cities.map(r => {
          return {
            value: r.city_code,
            label: r.city_name
          };
        })
      );
    });
    await barangays(selectedUser.address_city).then(barangays => {
      setCity(
        barangays.map(r => {
          return {
            value: r.barangay_code,
            label: r.barangay_name
          };
        })
      );
    });
  };
  useEffect(() => { }, []);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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

        console.log({ isExist });
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

  // console.log({ selectedUser: selectedUser.address_region });
  // console.log({
  //   dex: regionByCode(selectedUser.address_region).then(region => region)
  // });
  const formikConfig = () => {
    return {
      initialValues: {
        Full_Name_of_Child: selectedUser.Full_Name_of_Child,
        Name_of_Mother_or_Caregiver: selectedUser.Name_of_Mother_or_Caregiver,
        Address_or_Location: selectedUser.Address_or_Location,
        address_region: selectedUser.address_region,
        address_province: selectedUser.address_province,
        address_city: selectedUser.address_city,
        Date_of_Birth: moment(new Date(selectedUser.Date_of_Birth)).format(
          'YYYY-MM-D'
        ),
        Sex: selectedUser.Sex,
        Weight: selectedUser.Weight,
        Height: selectedUser.Height,
        Age_in_Months: selectedUser.Age_in_Months,
        Weight_for_Age_Status: selectedUser.Weight_for_Age_Status,
        Height_for_Age_Status: selectedUser.Height_for_Age_Status,
        Weight_for_Lt_or_Ht_Status: selectedUser.Weight_for_Lt_or_Ht_Status,
        address_barangay: selectedUser.address_barangay
      },
      validationSchema: Yup.object({
        Full_Name_of_Child: Yup.string().required('Required'),
        Name_of_Mother_or_Caregiver: Yup.string().required('Required'),

        Sex: Yup.string().required('Required'),
        Date_of_Birth: Yup.date().required('Required'),

        Address_or_Location: Yup.string().required('Required'),
        address_region: Yup.string().required('Required'),
        address_province: Yup.string().required('Required'),
        address_city: Yup.string().required('Required'),
        address_barangay: Yup.string(),

        Weight: Yup.number().required('Required'),
        Height: Yup.number().required('Required'),

        Age_in_Months: Yup.number().required('Required'),

        Weight_for_Age_Status: Yup.string().required('Required'),
        Height_for_Age_Status: Yup.string().required('Required'),
        Weight_for_Lt_or_Ht_Status: Yup.string().required('Required')
      }),
      validateOnMount: true,
      validateOnChange: false,
      onSubmit: async (values, { setFieldError, setSubmitting }) => {
        setSubmitting(true);

        try {
          let memberData = {
            ...values,
            Date_of_Birth: Date.parse(values.Date_of_Birth),
            address_region: await regionByCode(values.address_region).then(
              region => region.region_code
            ),
            address_province: await provincesByCode(values.address_region).then(
              province => {
                let data = province.find(
                  p => p.province_code === values.address_province
                );
                return data.province_code;
              }
            ),
            address_city: await cities(values.address_province).then(city => {
              let data = city.find(p => p.city_code === values.address_city);

              return data.city_code;
            }),
            Address_or_Location: addressBarangay.find(
              p => p.value === values.Address_or_Location
            ).label
          };

          console.log({ memberData });
          let res = await axios({
            method: 'POST',
            url: `user/${userId}/updateChildInfo`,
            data: memberData
          }).then(() => {
            toast.success('Created Successfully', {
              onClose: () => {
                setSubmitting(false);
                // navigate('/app/users');
                window.location.reload();
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

          // return data;
        } catch (error) {
          console.log({ error });
        } finally {
        }
      }
    };
  };
  return (
    isLoaded && (
      <div className="">
        <div className="mt-0">
          <div
            className="grid  md:grid-cols-1 grid-cols-1  bg-base-100 rounded-xl 

         ">
            <div className="p-2 space-y-4 md:space-y-6 sm:p-4">
              {/* <h1 className="text-md font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Register
            </h1> */}
              <Formik {...formikConfig()}>
                {({
                  handleSubmit,
                  handleChange,
                  handleBlur, // handler for onBlur event of form elements
                  values,
                  touched,
                  errors,
                  submitForm,
                  setFieldTouched,
                  setFieldValue,
                  setFieldError,
                  setErrors,
                  isSubmitting
                }) => {
                  const checkValidateTab = () => {
                    // submitForm();
                  };
                  const errorMessages = () => {
                    // you can add alert or console.log or any thing you want
                    alert('Please fill in the required fields');
                  };

                  return (
                    <div></div>
                  )
                }}
              </Formik>
            </div>
          </div>
        </div>

        <ToastContainer />
      </div>
    )
  );
}

export default Register;
