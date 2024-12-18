import { useEffect, useState, forwardRef, createRef, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import Settings from '../../features/layaway';
import InputText from '../../components/Input/InputText';

import Dropdown from '../../components/Input/Dropdown';
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import checkAuth from '../../app/auth';
import { ToastContainer, toast } from 'react-toastify';
import html2canvas from 'html2canvas';
import domtoimage from 'dom-to-image';
import Table, {
  AvatarCell,
  SelectColumnFilter,
  StatusPill,
  DateCell
} from '../../pages/protected/DataTables/Table'; // new


import { format, formatDistance, formatRelative, subDays } from 'date-fns';

const Tab1Content = () => {

  const token = checkAuth();

  const decoded = jwtDecode(token);

  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState({});
  const [acccountSetttings, setAccountSettings] = useState({});
  const fetchEmployee = async () => {
    let res = await axios({
      method: 'GET',
      url: `user/${decoded.EmployeeID}/childDetails`
    });
    let user = res.data.data;


    setSelectedEmployee(user[0]);
    setIsLoaded(true);
  };

  const fetchAccountSettings = async () => {
    let res = await axios({
      method: 'GET',
      url: `settings/accounts/get`
    });
    let result = res.data.data;

    setAccountSettings(result)


    // setSelectedEmployee(user[0]);
    // setIsLoaded(true);
  };

  useEffect(() => {

    fetchEmployee();
    // fetchAccountSettings()

  }, []);

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setprofilePhotoPreview] = useState(null);
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    //console.log({ file })
    setProfilePhoto(file)
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setprofilePhotoPreview(reader.result); // Set the image preview

      };
      reader.readAsDataURL(file);
    }
  };


  const formikConfig = (selectedEmployee) => {


    //console.log({ selectedEmployee })
    return {
      initialValues: {
        type: selectedEmployee.role,
        Admin_Fname: selectedEmployee.Admin_Fname,
        Admin_Lname: selectedEmployee.Admin_Lname,
        Phone: selectedEmployee.Phone,
        Username: selectedEmployee.Username,
        Password: selectedEmployee.Password,
        BirthDate: selectedEmployee.BirthDate ? selectedEmployee.BirthDate.split('T')[0] : '', // Format as YYYY-MM-DD
      },
      validationSchema: Yup.object({
        Admin_Fname: Yup.string().required('Required'),
        Admin_Lname: Yup.string().required('Required'),
        Phone: Yup.string()
          .matches(/^\d{11}$/, 'Phone number must be exactly 11 digits')
          .required('Phone number is required'),
        Username: Yup.string().required('Required'),
        Password: Yup.string().required('Required'),
      }),
      // validateOnMount: true,
      // validateOnChange: false,
      onSubmit: async (values, { setFieldError, setSubmitting }) => {
        setSubmitting(true);

        try {


          let isDoable = acccountSetttings.find(item => item.name === 'Edit Details')[decoded.role]


          if (!!isDoable) {


            if (profilePhoto) {
              const data = new FormData();

              // //console.log({ profilePhoto })
              data.append('profilePic', profilePhoto);
              await axios({
                // headers: {
                //   'content-type': 'multipart/form-data'
                // },
                method: 'POST',
                url: 'user/uploadProfilePicture',
                data
              });

            }




            let { type, ...others } = values
            let res = await axios({
              method: 'post',
              url: `user/editEmployee`,
              data: {
                EmployeeID: decoded.EmployeeID,
                ...others
              }
            });

            toast.success('Updated successfully',

              {
                onclose: () => {

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
            window.location.reload(); // Reloads the current window
          }
          else {
            toast.error('Access denied: You do not have permission to update these details.', {
              position: 'top-right',
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: 'light'
            });
          }







        } catch (error) {
          //console.log({ error });
        } finally {
        }
      }
    };
  };



  return isLoaded &&
    <div>
      <div className="p-2 space-y-4 md:space-y-6 sm:p-4">
        <Formik {...formikConfig(selectedEmployee)}>
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

            // //console.log({ values })

            return (
              <Form className="">
                {/* <label
            className={`block mb-2 text-green-400 text-left font-bold`}>
            Child
          </label> */}
                <div className="flex items-center justify-center">
                  <label className="relative cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <img
                      src={profilePhotoPreview || selectedEmployee.profilePic || 'https://via.placeholder.com/150'}
                      alt="Profile"
                      className="w-32 h-32 rounded-full border-4 border-gray-300 shadow-md"
                    />
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="text-gray-600 text-sm">{selectedEmployee.profilePic || profilePhoto ? '' : 'Upload Photo'}</span>
                    </span>
                  </label>
                </div>
                <InputText
                  disabled

                  label="Type"
                  name="type"
                  type="text"
                  placeholder=""
                  value={values.type}
                  onBlur={handleBlur} // This apparently updates `touched`?
                />
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">


                  <InputText

                    label="First Name"
                    name="Admin_Fname"
                    type="text"
                    placeholder=""
                    value={values.Admin_Fname}
                    onBlur={handleBlur} // This apparently updates `touched`?
                  />
                  <InputText

                    label="Last Name"
                    name="Admin_Lname"
                    type="text"
                    placeholder=""
                    value={values.Admin_Lname}
                    onBlur={handleBlur} // This apparently updates `touched`?
                  />
                </div>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 ">
                  <InputText

                    label="Birth Date"
                    name="BirthDate"
                    type="date"
                    placeholder=""
                    value={values.BirthDate}
                    onBlur={handleBlur} // This apparently updates `touched`?
                  />

                  <InputText

                    label="Phone Number"
                    name="Phone"
                    type="text"
                    placeholder=""
                    value={values.Phone}
                    onBlur={handleBlur} // This apparently updates `touched`?
                  />
                </div>



                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">


                  <InputText

                    label="Username"
                    name="Username"
                    type="text"
                    placeholder=""
                    value={values.Username}
                    onBlur={handleBlur} // This apparently updates `touched`?
                  />
                  <InputText

                    label="Password"
                    name="Password"
                    type="text"
                    placeholder=""
                    value={values.Password}
                    onBlur={handleBlur} // This apparently updates `touched`?
                  />
                </div>
                <button
                  type="submit"
                  className={
                    'btn mt-4 shadow-lg  bg-buttonPrimary font-bold text-white'
                  }>
                  Update
                </button>
              </Form>
            );
          }}
        </Formik> </div></div>
}
const PricingTab = () => {

  const token = checkAuth();

  const decoded = jwtDecode(token);

  const [isLoaded, setIsLoaded] = useState(false);
  const [pricingSettings, setPricingSettings] = useState({}); // Changed variable name here
  const [error, setError] = useState(null); // Add error state for error handling

  const fetchPricingSettings = async () => {
    try {
      const res = await axios.get(`settings/pricing/1`); // Using shorthand for axios.get
      const settings = res.data.data; // Changed variable name here
      setPricingSettings(settings); // Changed function call here
    } catch (err) {
      console.error('Error fetching pricing settings:', err); // Log the error
      setError('Failed to fetch pricing settings'); // Changed error message here
    } finally {
      setIsLoaded(true); // Ensure isLoaded is set to true regardless of success or error
    }
  };

  useEffect(() => {
    fetchPricingSettings(); // Changed function call here
  }, []);
  const formikConfig = () => {


    return {
      initialValues: {
        ...pricingSettings
      },
      validationSchema: Yup.object({
        Base_Price_Brand_New: Yup.number()
          .required('Base Price for Brand New is required')
          .positive('Base Price must be a positive number'),

        Amount_Per_Gram_Brand_New: Yup.number()
          .required('Amount Per Gram for Brand New is required')
          .positive('Amount Per Gram must be a positive number')
          .test('is-greater', 'Amount Per Gram must be greater than Base Price', function (value) {
            const { Base_Price_Brand_New } = this.parent; // Access the other field
            return value > Base_Price_Brand_New; // Return true if the condition is met
          }),
        Base_Price_Subasta: Yup.number()
          .required('Base Price for Subasta is required')
          .positive('Base Price must be a positive number'),

        Amount_Per_Gram_Subasta: Yup.number()
          .required('Amount Per Gram for Subasta is required')
          .positive('Amount Per Gram must be a positive number')
          .test('is-greater', 'Amount Per Gram must be greater than Base Price', function (value) {
            const { Base_Price_Subasta } = this.parent; // Access the other field
            return value > Base_Price_Subasta; // Return true if the condition is met
          }),
        Interest_Brand_New: Yup.number()
          .required('Interest is required')
          .positive('Interest must be a positive number'),
        Interest_Subasta: Yup.number()
          .required('Interest is required')
          .positive('Interest must be a positive number')
      }),
      // validateOnMount: true,
      // validateOnChange: false,
      onSubmit: async (values, { setFieldError, setSubmitting }) => {
        setSubmitting(true);

        try {




          let res = await axios({
            method: 'put',
            url: `settings/pricing/1`,
            data: {
              ...values
            }
          });

          toast.success('Updated Successfully', {
            position: 'top-right',
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'light'
          });
        } catch (error) {
          //console.log({ error });
        } finally {
        }
      }
    };
  };



  return isLoaded &&
    <div>
      <div className="p-2 space-y-4 md:space-y-6 sm:p-4">
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
            //console.log({ Dex: values })
            const checkValidateTab = () => {
              // submitForm();
            };
            const errorMessages = () => {
              // you can add alert or console.log or any thing you want
              alert('Please fill in the required fields');
            };

            // //console.log({ values })

            return (
              <Form className="">
                {/* <label
            className={`block mb-2 text-green-400 text-left font-bold`}>
            Child
          </label> */}
                <h1 className="text-2xl font-bold text-orange-300">
                  Brand New
                </h1>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3 ">


                  <InputText

                    label="Base Price"
                    name="Base_Price_Brand_New"
                    type="number"
                    placeholder=""
                    value={values.Base_Price_Brand_New}
                    onBlur={handleBlur} // This apparently updates `touched`?
                  />
                  <InputText

                    label="Amount Per Gram"
                    name="Amount_Per_Gram_Brand_New"
                    type="number"
                    placeholder=""
                    value={values.Amount_Per_Gram_Brand_New}
                    onBlur={handleBlur} // This apparently updates `touched`?
                  />
                  <InputText

                    label="Interest Per Gram"
                    name="Interest_Brand_New"
                    type="number"
                    placeholder=""
                    value={values.Interest_Brand_New}
                    onBlur={handleBlur} // This apparently updates `touched`?
                  />
                </div>
                <h1 className="text-2xl font-bold text-orange-300">
                  Subasta
                </h1>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3 ">


                  <InputText

                    label="Base Price"
                    name="Base_Price_Subasta"
                    type="number"
                    placeholder=""
                    value={values.Base_Price_Subasta}
                    onBlur={handleBlur} // This apparently updates `touched`?
                  />
                  <InputText

                    label="Amount Per Gram"
                    name="Amount_Per_Gram_Subasta"
                    type="number"
                    placeholder=""
                    value={values.Amount_Per_Gram_Subasta}
                    onBlur={handleBlur} // This apparently updates `touched`?
                  />
                  <InputText

                    label="Interest Per Gram"
                    name="Interest_Subasta"
                    type="number"
                    placeholder=""
                    value={values.Interest_Subasta}
                    onBlur={handleBlur} // This apparently updates `touched`?
                  />
                </div>
                <button
                  type="submit"
                  className={
                    'btn mt-4 shadow-lg  bg-buttonPrimary font-bold text-white'
                  }>
                  Update
                </button>
              </Form>
            );
          }}
        </Formik> </div></div>
}
const NotificationsTab = () => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const notificationsPerPage = 5;
  const [isVisible, setIsVisible] = useState(false); // State to manage visibility
  useEffect(() => {
    const fetchNotifications = async () => {
      setError(null); // Reset error before fetching
      setLoading(true); // Set loading true when fetching
      try {
        const response = await axios.get('/notification/list', {
          params: { page: currentPage, limit: notificationsPerPage },
        });
        setNotifications((prevNotifications) => [
          ...prevNotifications,
          ...response.data.data,
        ]);
      } catch (err) {
        setError('Failed to fetch notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [currentPage]);

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      is_read: true,
    }));
    setNotifications(updatedNotifications);
  };

  const LayawayReminder = forwardRef(({ id, customerId, customerName, dueDate, remainingBalance }, ref) => {
    return (
      <dialog
        id="createCodeModal"
        className="modal modal-bottom sm:modal-middle">
        <div ref={ref} id={`layaway-reminder-${id}`}
          className={`max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg`}
        >
          <header className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-700">A.V. De Asis Jewelry</h1>
          </header>

          <div className="text-left space-y-2">
            <p className="text-gray-700"><strong>Customer ID:</strong> {customerId}</p>
            <p className="text-gray-700"><strong>Customer Name:</strong> {customerName}</p>
            <p className="text-gray-700"><strong>Due Date:</strong> {dueDate}</p>
            <p className="text-gray-700"><strong>Remaining Balance:</strong> ₱{remainingBalance}</p>
          </div>

          <div className="mt-4 text-gray-700">
            <p>We kindly remind you to make your scheduled payments to avoid any inconvenience.</p>
            <p>If you have any questions or need assistance regarding your layaway plan, feel free to contact our team.</p>
          </div>

          <footer className="mt-6 text-right">
            <p className="text-gray-700">Best regards,</p>
            <p className="text-gray-700 font-bold">A.V. De Asis Jewelry</p>
          </footer>
        </div>
      </dialog>
    );
  });

  const exportNotifications = (notification) => {
    setIsVisible(true);

    const reminderDiv = document.getElementById(`layaway-reminder-${notification.id}`);
    if (reminderDiv) {

      reminderDiv.style.display = 'block';

      domtoimage.toPng(reminderDiv, {
        filter: (node) => {
          // Ignore link elements that load external styles
          return !(node.tagName === 'LINK' && node.href && node.href.includes('fonts.googleapis.com'));
        }
      })
        .then((dataUrl) => {
          reminderDiv.style.display = '';
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = 'exported_image.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

        })
        .catch((error) => {
          console.error('Failed to export image:', error);
        });

    }
  };

  const handleCheckboxChange = (id) => {
    const updatedNotifications = notifications.map((notification) =>
      notification.id === id ? { ...notification, selected: !notification.selected } : notification
    );
    setNotifications(updatedNotifications);
  };

  const handleSeeMore = () => {
    setCurrentPage(prevPage => prevPage + 1); // Increment the page number
  };

  if (loading) {
    return <div className="flex justify-center items-center"><span className="loader">Loading...</span></div>;
  }

  return (
    <div className="w-full bg-white shadow-md rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <div>
          <button
            onClick={markAllAsRead}
            className="text-orange-300 hover:text-orange-400 transition-colors mr-2"
          >
            Mark All as Read
          </button>
        </div>
      </div>
      <ul className="divide-y divide-gray-200">
        {notifications.map((notification) => {
          const briefMessage = notification.message.split('.')[0];
          return <li
            key={notification.id}
            className={`flex justify-between p-2 ${notification.is_read === 0 ? 'bg-gray-100' : 'bg-white'}`}
          >
            <input
              type="checkbox"
              checked={notification.selected}
              onChange={() => handleCheckboxChange(notification.id)}
              className="mr-2"
              aria-label={`Select notification for ${notification.message}`}
            />
            <p className={`font-semibold text-sm ${notification.is_read ? 'text-gray-500' : 'text-gray-800'}`}>
              {briefMessage}
            </p>
            <LayawayReminder id={notification.id} ref={createRef()} {...JSON.parse(notification.messageData)} />
            <button
              onClick={() => exportNotifications(notification)}
              className="ml-2 bg-orange-500 text-white py-1 px-2 rounded hover:bg-orange-600 transition-colors"
            >
              <i class="fa-solid fa-file-export"></i>
            </button>
          </li>
        })}
      </ul>
      <button
        onClick={handleSeeMore}
        className="text-center mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
      >
        See More
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};
const AccountSettingsTab = () => {
  // Sample data for demonstration purposes
  const [acccountSetttings, setAccountSettings] = useState([]);

  const [actions, setActions] = useState([

  ]);

  const fetchAccountSettings = async () => {
    let res = await axios({
      method: 'GET',
      url: `settings/accounts/get`
    });
    let result = res.data.data;

    //console.log({ result })

    setActions(result.filter(item => item.name === 'Edit Details' || item.name === 'Password Reset'))


    // setSelectedEmployee(user[0]);
    // setIsLoaded(true);
  };

  useEffect(() => {

    // fetchAccountSettings()

  }, []);




  // Handle checkbox change
  const handleCheckboxChange = (index, role) => {
    setActions((prevActions) => {
      const updatedActions = [...prevActions];
      updatedActions[index][role] = !updatedActions[index][role];
      return updatedActions;
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();


    try {


      let res = await axios({
        method: 'post',
        url: `settings/accounts`,
        data: actions
      });


      toast.success('Updated Successfully', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light'
      });
    } catch (error) {
      //console.log({ error });
    } finally {
    }

    // You can replace this alert with your submission logic (e.g., API call)
    //alert('Data submitted: ' + JSON.stringify(actions));
  };


  //console.log({ actions })
  return (
    <div className="overflow-x-auto shadow-lg">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-700">Accounts</h1>
      </header>
      <form onSubmit={handleSubmit}>
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Action</th>
              <th className="py-3 px-6 text-left">Super Admin</th>
              <th className="py-3 px-6 text-left">Admin</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm font-light">
            {actions.map((action, index) => (
              <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left">{action.name}</td>
                <td className="py-3 px-6 text-left">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={action.super_admin}
                      onChange={() => handleCheckboxChange(index, 'super_admin')}
                      className="form-checkbox"
                      aria-label={`Toggle ${action.name} for Super Admin`}
                    />
                  </div>
                </td>
                <td className="py-3 px-6 text-left">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={action.admin}
                      onChange={() => handleCheckboxChange(index, 'admin')}
                      className="form-checkbox"
                      aria-label={`Toggle ${action.name} for Admin`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 text-right p-4">
          <button
            type="submit"
            className="m-2 px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition duration-200"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
};

const RecordManagementTab = () => {
  // Sample data for demonstration purposes
  const [actions, setActions] = useState([

  ]);

  const fetchAccountSettings = async () => {
    let res = await axios({
      method: 'GET',
      url: `settings/accounts/get`
    });
    let result = res.data.data;

    //console.log({ result })
    const token = checkAuth();
    const decoded = jwtDecode(token);
    let details = result.filter(item => (item.name !== 'Edit Details' && item.name !== 'Password Reset'));

    //console.log({ details })
    setActions(details)


    // setSelectedEmployee(user[0]);
    // setIsLoaded(true);
  };

  useEffect(() => {

    fetchAccountSettings()

  }, []);


  // Handle checkbox change
  const handleCheckboxChange = (index, role) => {
    setActions((prevActions) => {
      const updatedActions = [...prevActions];
      updatedActions[index][role] = !updatedActions[index][role];
      return updatedActions;
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();


    try {


      let res = await axios({
        method: 'post',
        url: `settings/accounts`,
        data: actions
      });


      toast.success('Updated Successfully', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light'
      });
    } catch (error) {
      //console.log({ error });
    } finally {
    }

    // You can replace this alert with your submission logic (e.g., API call)
    //alert('Data submitted: ' + JSON.stringify(actions));
  };

  return (
    <div className="overflow-x-auto shadow-lg">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-700">Accounts</h1>
      </header>
      <form onSubmit={handleSubmit}>
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Action</th>
              <th className="py-3 px-6 text-left">Super Admin</th>
              <th className="py-3 px-6 text-left">Admin</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm font-light">
            {actions.map((action, index) => (
              <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left">{action.name}</td>
                <td className="py-3 px-6 text-left">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={action.super_admin}
                      onChange={() => handleCheckboxChange(index, 'super_admin')}
                      className="form-checkbox"
                      aria-label={`Toggle ${action.name} for Super Admin`}
                    />
                  </div>
                </td>
                <td className="py-3 px-6 text-left">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={action.admin}
                      onChange={() => handleCheckboxChange(index, 'admin')}
                      className="form-checkbox"
                      aria-label={`Toggle ${action.name} for Admin`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 text-right p-4">
          <button
            type="submit"
            className="m-2 px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition duration-200"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
};

const AuditTrailTab = () => {
  const [auditTrailList, setAuditTrail] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const notificationsPerPage = 5;
  const [isVisible, setIsVisible] = useState(false); // State to manage visibility
  useEffect(() => {
    const fetchAuditTrail = async () => {
      setError(null); // Reset error before fetching
      setLoading(true); // Set loading true when fetching
      try {
        const response = await axios.get('/settings/auditTrail/list');
        setAuditTrail(response.data.data);

      } catch (err) {
        setError('Failed to fetch notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchAuditTrail();
  }, []);



  if (loading) {
    return <div className="flex justify-center items-center"><span className="loader">Loading...</span></div>;
  }

  const columns = [

    {
      Header: 'Employee ID',
      accessor: 'employeeId',
      Cell: ({ row, value }) => {
        return <span className="text-gray-600">{value}</span>;
      }
    },

    {
      Header: 'First Name',
      accessor: 'Admin_Fname',
      Cell: ({ row, value }) => {

        return <span className="text-gray-600">{value}</span>;
      }
    },
    {
      Header: 'Last Name',
      accessor: 'Admin_Lname',
      Cell: ({ row, value }) => {

        return <span className="text-gray-600">{value}</span>;
      }
    },
    {
      Header: 'Date Time',
      accessor: 'dateTime',
      Cell: ({ row, value }) => {
        return <span className="text-gray-600">{format(value, 'MMM dd, yyyy hh:mm:ss a')}</span>;
      }
    },
    {
      Header: 'Action',
      accessor: 'action',
      Cell: ({ row, value }) => {
        return <span className="text-yellow-500">{value}</span>;
      }
    }
  ]


  return (
    <div className="w-full bg-white shadow-md rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Audit Trail</h2>

      </div>
      <div>
        <Table
          style={{ overflow: 'wrap' }}
          className="table-sm"
          columns={columns}
          data={auditTrailList || []}

        />
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};
function InternalPage() {
  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState('Account');
  const categories = {
    General: ['Account', 'Pricing', 'Notifications', 'Audit Trail'],
    'Access Control': ['Accounts', 'Record Management'],
  };

  const content = {
    Tab1: 'Accounts',
    Tab2: 'Record Management',

  };

  // Map selectedTab to the corresponding component
  const tabComponents = {
    Account: <Tab1Content />,
    Pricing: <PricingTab />,
    Notifications: <NotificationsTab />,
    Accounts: <AccountSettingsTab />,
    "Record Management": <RecordManagementTab />,
    "Audit Trail": <AuditTrailTab />,
  };


  useEffect(() => {
    dispatch(setPageTitle({ title: 'Settings' }));
  }, []);

  return <div className="flex h-screen">
    {/* Sidebar for vertical tabs */}
    <div className="w-1/4 p-4 bg-gray-50">
      <div className="space-y-4">
        {Object.entries(categories).map(([category, tabs]) => (
          <div key={category}>
            <h2 className="mb-2 font-bold text-gray-700 text-xl ">{category}</h2>
            <div className="flex flex-col space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={`p-2 text-left ${selectedTab === tab ? 'bg-orange-300 text-white' : 'bg-white text-gray-800'
                    } rounded-md`}
                  onClick={() => setSelectedTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Main content area */}
    <div className="w-3/4 p-4 bg-gray-50">
      <div className="text-xl font-bold">   {tabComponents[selectedTab]}</div>
    </div>
    <ToastContainer />
  </div >
}

export default InternalPage;
