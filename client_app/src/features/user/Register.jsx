import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import LandingIntro from './LandingIntro';
import ErrorText from '../../components/Typography/ErrorText';
import InputText from '../../components/Input/InputText';
import RadioText from '../../components/Input/Radio';
import Dropdown from '../../components/Input/Dropdown';
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
    // await regionByCode('01').then(region => console.log(region.region_name));
    await provinces().then(province => console.log(province));
    // await provincesByCode('01').then(province => console.log(province));
    // await provinceByName('Rizal').then(province =>
    //   console.log(province.province_code)
    // );
    await cities().then(city => console.log(city));
    await barangays().then(barangays => console.log(barangays));
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

  const formikConfig = {
    initialValues: {
      Full_Name_of_Child: '',
      Name_of_Mother_or_Caregiver: '',
      Address_or_Location: '',
      address_region: '',
      address_province: '',
      address_city: '',
      Date_of_Birth: '',
      Sex: '',
      Weight: '',
      Height: '',
      Age_in_Months: '',
      Weight_for_Age_Status: '',
      Height_for_Age_Status: '',
      Weight_for_Lt_or_Ht_Status: '',
      address_barangay: ''
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
          address_region: await regionByCode(values.address_region).then(
            region => region.region_name
          ),
          address_province: await provincesByCode(values.address_region).then(
            province => {
              let data = province.find(
                p => p.province_code === values.address_province
              );
              return data.province_name;
            }
          ),
          address_city: await cities(values.address_province).then(city => {
            let data = city.find(p => p.city_code === values.address_city);

            return data.city_name;
          }),
          Address_or_Location: addressBarangay.find(
            p => p.value === values.Address_or_Location
          ).label
        };

        console.log({ memberData });
        let res = await axios({
          method: 'POST',
          url: 'user/create',
          data: memberData
        }).then(() => {
          toast.success('Created Successfully', {
            onClose: () => {
              setSubmitting(false);
              navigate('/app/users');
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

        let data = res.data;

        return data;
      } catch (error) {
        console.log({ error });
      } finally {
      }
    }
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
              <Formik {...formikConfig}>
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
                    <FormWizard
                      onComplete={() => {
                        if (!isSubmitting) {
                          console.log('Dex');
                          handleSubmit();
                        }
                      }}
                      stepSize="xs"
                      color="#334155"
                      finishButtonText="Submit"
                      finishButtonTemplate={handleComplete => (
                        <div>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            className="btn mt-2 justify-end  btn-neutral float-right"
                            onClick={() => {
                              handleComplete();
                            }}>
                            {isSubmitting ? (
                              <>
                                <span className="loading loading-spinner text-white"></span>
                                Processing...
                              </>
                            ) : (
                              <>
                                <PlayCircleIcon className="h-6 w-6" />
                                Submit
                              </>
                            )}
                          </button>
                        </div>
                      )}
                      backButtonTemplate={handlePrevious => (
                        <div>
                          <button
                            className="btn mt-2 justify-end  float-left"
                            onClick={() => {
                              handlePrevious();
                            }}>
                            <BackwardIcon className="h-6 w-6" />
                            Previous
                          </button>
                        </div>
                      )}
                      nextButtonTemplate={(handleNext, currentIndex, ee) => (
                        <div>
                          <button
                            className="btn mt-2 justify-end  btn-neutral float-right"
                            onClick={async () => {
                              console.log({ currentWizardIndex });
                              // check tab name
                              // if (currentWizardIndex === 0) {
                              //   if (values.email) {
                              //     let res = await axios({
                              //       method: 'POST',
                              //       url: 'user/isEmailExist',
                              //       data: {
                              //         email: values.email
                              //       }
                              //     }).then(res => {
                              //       return res;
                              //     });
                              //     const isExist = res.data.isEmailExist;

                              //     if (isExist) {
                              //       setFieldValue('email', '');
                              //       setFieldError('email', 'dex');
                              //     }
                              //   }
                              // }

                              validation.map(key => {
                                setFieldTouched(key);
                              });
                              let errorKeys = Object.keys(errors);

                              const findCommonErrors = (arr1, arr2) => {
                                // if firstValidation exists on errorKeys
                                return arr1.some(item => arr2.includes(item));
                              };

                              const hasFirstValidationError = findCommonErrors(
                                errorKeys,
                                validation
                              );

                              if (hasFirstValidationError === false) {
                                handleNext();
                              }
                            }}>
                            Next
                            <ForwardIcon className="h-6 w-6" />
                          </button>
                        </div>
                      )}>
                      <FormWizard.TabContent
                        title="Child Information"
                        icon={SolarUserLinear()}
                        isValid={checkValidateTab()}
                        errorMessages={errorMessages}>
                        <Form className="">
                          {/* <label
                            className={`block mb-2 text-green-400 text-left font-bold`}>
                            Child
                          </label> */}
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-1 ">
                            <InputText
                              icons={mdiAccount}
                              label="Full Name of Child"
                              name="Full_Name_of_Child"
                              type="text"
                              placeholder=""
                              value={values.Full_Name_of_Child}
                              onBlur={handleBlur} // This apparently updates `touched`?
                            />
                          </div>

                          {/* <label
                            className={`block mb-2 text-green-400 text-left font-bold`}>
                            Mother / Care Giver
                          </label> */}
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-1 mt-3">
                            <InputText
                              icons={mdiAccount}
                              label="Name of Mother/Caregiver"
                              name="Name_of_Mother_or_Caregiver"
                              type="text"
                              placeholder=""
                              value={values.Name_of_Mother_or_Caregiver}
                              onBlur={handleBlur} // This apparently updates `touched`?
                            />
                          </div>
                          <label
                            className={`block mb-2 text-green-400 text-left font-bold mt-3`}>
                            Child Address
                          </label>
                          <div className="z-50 grid grid-cols-1 gap-3 md:grid-cols-4 ">
                            <Dropdown
                              className="z-50"
                              icons={mdiMapMarker}
                              label="Region"
                              name="address_region"
                              value={values.address_region}
                              setFieldValue={setFieldValue}
                              onBlur={handleBlur}
                              options={addressRegions}
                              affectedInput="address_province"
                              allValues={values}
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
                              className="z-50"
                              icons={mdiMapMarker}
                              label="Province"
                              name="address_province"
                              value={values.address_province}
                              d
                              setFieldValue={setFieldValue}
                              onBlur={handleBlur}
                              options={addressProvince}
                              affectedInput="address_city"
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
                              className="z-50"
                              icons={mdiMapMarker}
                              label="City"
                              name="address_city"
                              // value={values.civilStatus}
                              setFieldValue={setFieldValue}
                              onBlur={handleBlur}
                              options={addressCity}
                              affectedInput="address_barangay"
                              functionToCalled={async code => {
                                if (code) {
                                  await barangays(code).then(cities => {
                                    setBarangay(
                                      cities.map(p => {
                                        console.log({ p });
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
                              className="z-50"
                              icons={mdiMapMarker}
                              label="Barangay"
                              name="Address_or_Location"
                              value={values.Address_or_Location}
                              setFieldValue={setFieldValue}
                              onBlur={handleBlur}
                              options={addressBarangay}
                              affectedInput=""
                              functionToCalled={async code => { }}
                            />
                          </div>

                          <label
                            className={`block mb-2 text-green-400 text-left font-bold`}>
                            Other Information
                          </label>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 ">
                            <InputText
                              icons={mdiCalendarRange}
                              label="Birth Date"
                              name="Date_of_Birth"
                              type="date"
                              placeholder=""
                              value={values.Date_of_Birth}
                              onBlur={handleBlur} // This apparently updates `touched`?
                            />

                            <Dropdown
                              icons={mdiAccount}
                              label="Gender"
                              name="Sex"
                              placeholder=""
                              value={values.Sex}
                              setFieldValue={setFieldValue}
                              onBlur={handleBlur}
                              options={[
                                { value: 'Male', label: 'Male' },
                                { value: 'Female', label: 'Female' }
                              ]}
                            />
                          </div>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">
                            <InputText
                              icons={mdiAccount}
                              label="Weight (kg)"
                              name="Weight"
                              type="number"
                              placeholder=""
                              value={values.birthday}
                              onBlur={handleBlur} // This apparently updates `touched`?
                            />
                            <InputText
                              icons={mdiAccount}
                              label="Height (cm)"
                              name="Height"
                              type="number"
                              placeholder=""
                              value={values.age}
                              onBlur={handleBlur} // This apparently updates `touched`?
                            />
                          </div>

                          <label
                            className={`block mb-2 text-green-400 text-left font-bold`}>
                            Health Information
                          </label>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                            <InputText
                              icons={mdiAccount}
                              label="Age In Months"
                              name="Age_in_Months"
                              type="number"
                              placeholder=""
                              value={values.age}
                              onBlur={handleBlur} // This apparently updates `touched`?
                            />

                            <Dropdown
                              icons={mdiAccount}
                              label="Weight for Age Status"
                              name="Weight_for_Age_Status"
                              placeholder=""
                              value={values.Weight_for_Age_Status}
                              setFieldValue={setFieldValue}
                              onBlur={handleBlur}
                              options={[
                                { value: 'N', label: 'Normal' },
                                { value: 'OW', label: 'Overweight' },
                                { value: 'UW', label: 'Underweight' },
                                { value: 'SUW', label: 'Severely Underweight' },
                                { value: 'Ob', label: 'Obese' }
                              ]}
                            />
                            <Dropdown
                              icons={mdiAccount}
                              label="Height for Age Status"
                              name="Height_for_Age_Status"
                              placeholder=""
                              value={values.Height_for_Age_Status}
                              setFieldValue={setFieldValue}
                              onBlur={handleBlur}
                              options={[
                                { value: 'N', label: 'Normal' },
                                { value: 'St', label: 'Stunted' },
                                { value: 'SSt', label: 'Severely Stunted' }
                              ]}
                            />
                            <Dropdown
                              icons={mdiAccount}
                              label="Weight for Lt/Ht Status"
                              name="Weight_for_Lt_or_Ht_Status"
                              placeholder=""
                              value={values.Weight_for_Lt_or_Ht_Status}
                              setFieldValue={setFieldValue}
                              onBlur={handleBlur}
                              options={[
                                { value: 'N', label: 'Normal' },
                                { value: 'MW', label: 'Moderately Wasted' },
                                { value: 'SW', label: 'Severely Wasted' }
                              ]}
                            />
                          </div>
                        </Form>
                      </FormWizard.TabContent>
                    </FormWizard>
                  );
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
