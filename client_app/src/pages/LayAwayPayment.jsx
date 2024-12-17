import moment from 'moment';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { showNotification } from '../features/common/headerSlice';
import TitleCard from '../components/Cards/TitleCard';
// import { RECENT_TRANSACTIONS } from '../../utils/dummyData';
import FunnelIcon from '@heroicons/react/24/outline/FunnelIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import SearchBar from '../components/Input/SearchBar';
import { NavLink, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ViewColumnsIcon from '@heroicons/react/24/outline/EyeIcon';
import PlusCircleIcon from '@heroicons/react/24/outline/PlusCircleIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import { format, formatDistance, formatRelative, subDays } from 'date-fns';

import { QRCodeSVG } from 'qrcode.react';
import { formatAmount } from '../features/dashboard/helpers/currencyFormat';
import {
  setAppSettings,
  getFeatureList
} from '../features/settings/appSettings/appSettingsSlice';

import easyinvoice from 'easyinvoice';

import Table, {
  AvatarCell,
  SelectColumnFilter,
  StatusPill,
  DateCell
} from './protected/DataTables/Table'; // new

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import InputText from '../components/Input/InputText';

import Dropdown from '../components/Input/Dropdown';
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';
import RadioText from '../components/Input/Radio';
import { useParams } from 'react-router-dom';
function LayAwayPayment({ layAwayID }) {
  const { userId, transactionId } = useParams();

  const [file, setFile] = useState(null);
  const [users, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [paymentHistoryList, setActivePaymentHistory] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeChildID, setactiveChildID] = useState('');

  const [isAddPaymentOpen, setisAddPaymentOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [suppliers, setSupplierList] = useState([]);


  const [payments, setPayments] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(8000); // Adjust based on your data


  const [inventoryList, setInventoryList] = useState([]);
  const [selectedSupplierID, setSelectedSupplier] = useState({});

  const fetchInventoryOrders = async () => {
    let res = await axios({
      method: 'POST',
      url: 'inventory/list',
      data: {
        SupplierID: selectedSupplierID
      }
    });

    let list = res.data.data;




    setInventoryList(list.map((s) => {
      return {
        label: `${s.OrderID}`,
        value: s.OrderID,
        SupplierID: s.SupplierID

      }
    }));
  };


  // Sample function to fetch payment data (replace with your API call)
  const fetchPayments = async () => {
    // Example data: replace with your API call



    let res = await axios({
      method: 'POST',
      url: 'layaway/payment/list',
      data: {
        LayawayID: transactionId
      }
    });

    let list = res.data.data;


    setPayments(list);
    // calculateTotalPaid(samplePayments);
  };

  // Calculate total paid
  const calculateTotalPaid = (payments) => {
    const total = payments.reduce((acc, payment) => acc + payment.amount, 0);
    setTotalPaid(total);
  };

  useEffect(() => {
    fetchPayments();
  }, [selectedOrder]);


  const fetchOrders = async () => {
    let res = await axios({
      method: 'POST',
      url: 'layaway/list',
      data: {
        LayawayID: transactionId
      }
    });

    let list = res.data.data;



    console.log({ transactionId, list })


    setOrders(list);
    setSelectedOrder(list[0]);
  };

  const fetchCustomers = async () => {
    let res = await axios({
      method: 'POST',
      url: 'user/getCustomerList',
      data: {

      }
    });

    let list = res.data.data;


    setCustomers(list.map((s) => {
      return {
        label: `${s.CustomerName} - ${s.Contact}`,
        value: s.CustomerID,
        Facebook: s.Facebook
      }
    }));
  };

  const fetchSuppliers = async () => {
    let res = await axios({
      method: 'POST',
      url: 'supplier/list',
      data: {

      }
    });

    let list = res.data.data;


    setSupplierList(list.map((s) => {
      return {
        label: s.SupplierName,
        value: s.SupplierID,

      }
    }));
  };

  const fetchAll = () => {

    fetchSuppliers();
    fetchCustomers();
    fetchOrders();
    fetchInventoryOrders()
  }

  useEffect(() => {
    fetchInventoryOrders()
  }, [selectedSupplierID]);

  useEffect(() => {

    fetchAll();
    setIsLoaded(true);

  }, []);

  const appSettings = useSelector(state => state.appSettings);
  let { codeTypeList, packageList } = appSettings;


  const applyFilter = params => {
    let filteredUsers = users.filter(t => {
      return t.address === params;
    });
    setUser(filteredUsers);
  };





  const handleOnChange = e => {

    setFile(e.target.files[0]);
  };



  const totalAmountPaid = selectedOrder ? payments.filter(s => ['PAYMENT_FOR_APPROVAL', 'PARTIALLY_PAID', 'PAID'].includes(s.status)).reduce((acc, current) => {
    return acc + parseInt(current.amount)
  }, 0) : 0;
  console.log({ totalAmountPaid })



  const formikConfigAddPayment = () => {

    let remainingBalance = parseInt(selectedOrder?.Price) - totalAmountPaid;


    let validation = {
      amount: Yup.number()
        .required('Required')
        .moreThan(0, 'Amount must be greater than 0') // Downpayment must be greater than 0
        .max(remainingBalance, `Amount must be less than remaining balance of ₱${remainingBalance.toFixed(2)}`), // Downpayment must be less than Price
      payment_method: Yup.string().required('Required')
    };

    let initialValues = {

      proof_of_payment: '',
      amount: '',
      payment_method: ''
    }





    return {
      initialValues: initialValues,
      validationSchema: Yup.object(validation),
      // validateOnMount: true,
      // validateOnChange: false,
      onSubmit: async (values, { setFieldError, setSubmitting }) => {
        setSubmitting(true);



        try {


          const data = new FormData();



          data.append('Proof_Payment', file);
          data.append('payment_method', values.payment_method);
          data.append('amount', values.amount);
          data.append('customer_id', selectedOrder.CustomerID);
          data.append('layAwayID', selectedOrder.LayawayID);

          data.append('OrderID', selectedOrder.OrderID);

          let updatedStatus = remainingBalance - values.amount === 0 ? 'PAID' : 'PAYMENT_FOR_APPROVAL';



          data.append('status', updatedStatus);

          let result = await axios({
            // headers: {
            //   'content-type': 'multipart/form-data'
            // },
            method: 'POST',
            url: 'layaway/makePayment',
            data
          });

          fetchPayments()
          document.getElementById('addPayment').close();
          await fetchAll();
          // document.getElementById('addOrder').close();
          // // await fetchSuppliers();
          document.getElementById('viewReceipt').close();
          toast.success('Payment added successfully!', {
            // onClose: () => {
            //   setSubmitting(false);
            //   navigate('/app/transactions');
            // },
            position: 'top-right',
            autoClose: 500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'light'
          });

          fetchAll();


        } catch (error) {
          console.log({ error });
        } finally {
        }
      }
    };
  };




  console.log({ isLoaded })
  return (
    isLoaded && selectedOrder && (

      <div className="min-h-screen bg-base-00 flex items-center bg-customBlue shadow-lg">


        <Formik {...formikConfigAddPayment()}>
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
            isSubmitting,

          }) => {
            return <dialog id="addPayment" className="modal">
              <div className="modal-box">
                <h3 className="font-bold text-lg">Add Payment</h3>
                {/* <p className="py-4">Pick a file</p> */}
                {/* 
                {isSubmitting && (
                  <div
                    class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mt-2"
                    role="alert">
                    <p class="font-bold">Please wait</p>
                    <p>Uploading ...</p>
                  </div>
                )} */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-1 ">
                  <InputText

                    label="Customer Name"
                    name="CustomerName"
                    type="text"
                    placeholder=""
                    value={selectedOrder.CustomerName}

                    onBlur={handleBlur} // This apparently updates `touched`?
                    disabled


                  /></div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 mt-2">
                  <Dropdown

                    // icons={mdiAccount}
                    label="Payment Method"
                    name="payment_method"
                    placeholder=""
                    value={"Cash"}
                    setFieldValue={setFieldValue}
                    onBlur={handleBlur}
                    options={[
                      {
                        label: "Cash",
                        value: "Cash"
                      },
                      {
                        label: "BDO",
                        value: "BDO"
                      },
                      {
                        label: "BPI",
                        value: "BPI"
                      }
                    ]}
                    functionToCalled={(value) => {

                      // setPlan();
                      // let user = users.find(u => {
                      //   return u.value === value
                      // })
                      setPlan(value)
                      setFieldValue('MonthsToPay', value)
                    }}

                  />
                  <InputText

                    label="Amount"
                    name="amount"
                    type="number"
                    placeholder=""


                    onBlur={handleBlur} // This apparently updates `touched`?


                  />

                </div>
                <label className="form-control w-full">
                  <div className="label font-bold">
                    Proof of Payment
                    {/* <span className="label-text">Pick a file</span> */}
                  </div>
                  <input
                    name="proof_of_payment"
                    type="file"
                    className="file-input file-input-bordered w-full max-w-xs w-full"
                    onChange={handleOnChange}
                  />
                </label>

                <div className="modal-action">
                  {/* if there is a button in form, it will close the modal */}
                  <button
                    className="btn mr-2 bg-green-500"
                    disabled={isSubmitting || !file}
                    type='submit'
                    onClick={e => {
                      e.preventDefault();
                      if (!isSubmitting && file) {
                        handleSubmit(e);
                      }
                    }}
                  >
                    Submit
                  </button>
                  <button className="btn" onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('addPayment').close();
                  }}>
                    Close
                  </button>
                </div>
              </div>
            </dialog>
          }}
        </Formik>

        <div className="card mx-auto w-full max-w-7xl shadow-xl bg-base-100">
          <div className="p-4 flex justify-between items-center">
            <button
              onClick={() => navigate(-1)} // Go back to the previous page
              className="btn bg-buttonPrimary text-white">
              Back
            </button>

            <div>
              <button

                disabled={selectedOrder.status === 'PAID'
                }
                className="btn mr-2 bg-green-500" onClick={() => document.getElementById('addPayment').showModal()}>Add Payment</button>


            </div>
          </div>
          <div className="container mx-auto ">
            <h1 className="text-2xl font-bold mb-4 text-center">Payment Summary</h1>
            <div className="p-4">
              <div className="flex justify-between font-bold">
                <span>Status:</span>
                <span className='font-2xl'><StatusPill value={selectedOrder.status} /></span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Customer Name:</span>
                <span>{selectedOrder.CustomerName}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Customer ID</span>
                <span>{selectedOrder.CustomerID}</span>
              </div>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="py-2 px-4 text-left">Layaway ID</th>
                    <th className="py-2 px-4 text-left">Amount Paid</th>
                    <th className="py-2 px-4 text-left">Payment Method</th>
                    <th className="py-2 px-4 text-left">Payment Date</th>
                    <th className="py-2 px-4 text-left">View</th>
                    <th className="py-2 px-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(payment => (
                    <tr key={payment.layAwayID} className="border-b">
                      <td className="py-2 px-4">{payment.layAwayID}</td>
                      <td className="py-2 px-4">{formatAmount(payment.amount)}</td>
                      <td className="py-2 px-4">{payment.payment_method}</td>
                      <td className="py-2 px-4">{format(payment.payment_date, 'MMM dd, yyyy')}</td>
                      <td className="py-2 px-4">

                        <button className="btn btn-outline btn-sm mr-2" onClick={async () => {

                          window.open(payment.proof_of_payment, '_blank'); // Opens the image in a new tab



                        }}>



                          <i class="fa-regular fa-eye"></i>
                        </button>


                      </td>
                      <td className="py-2 px-4"> <StatusPill value={payment.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4">
                <div className="flex justify-between font-bold">
                  <span className=''>Order Amount:</span>
                  <span className='text-green-500'>{formatAmount(selectedOrder.Price)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total Amount Paid:</span>
                  <span>{formatAmount(totalAmountPaid)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Remaining Balance:</span>
                  <span className='text-yellow-500'>{formatAmount(selectedOrder.Price - totalAmountPaid)}</span>
                </div>
              </div>
            </div>
          </div>

        </div >

        <dialog id="viewProofPaymentImage" className="modal">
          <div className="modal-box w-11/12 max-w-5xl">

            <div className="container mx-auto p-4">
              <h1 className="text-2xl font-bold mb-4">Payment Summary</h1>
              <div className="p-4">
                <div className="flex justify-between font-bold">
                  <span>Status:</span>
                  <span className='font-2xl'><StatusPill value={selectedOrder.status} /></span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Customer Name:</span>
                  <span>{selectedOrder.CustomerName}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Customer ID</span>
                  <span>{selectedOrder.CustomerID}</span>
                </div>
              </div>
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="py-2 px-4 text-left">Layaway ID</th>
                      <th className="py-2 px-4 text-left">Amount Paid</th>
                      <th className="py-2 px-4 text-left">Payment Method</th>
                      <th className="py-2 px-4 text-left">Payment Date</th>
                      <th className="py-2 px-4 text-left">View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(payment => (
                      <tr key={payment.layAwayID} className="border-b">
                        <td className="py-2 px-4">{payment.layAwayID}</td>
                        <td className="py-2 px-4">{formatAmount(payment.amount)}</td>
                        <td className="py-2 px-4">{payment.payment_method}</td>
                        <td className="py-2 px-4">{format(payment.payment_date, 'MMM dd, yyyy')}</td>
                        <td className="py-2 px-4">

                          <button className="btn btn-outline btn-sm mr-2" onClick={async () => {

                            window.open(payment.proof_of_payment, '_blank'); // Opens the image in a new tab



                          }}>



                            <i className="fa-regular fa-eye"></i>
                          </button>


                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-4">
                  <div className="flex justify-between font-bold">
                    <span className=''>Order Amount:</span>
                    <span className='text-green-500'>{formatAmount(selectedOrder.Price)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total Amount Paid:</span>
                    <span>{formatAmount(totalAmountPaid)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Remaining Balance:</span>
                    <span className='text-yellow-500'>{formatAmount(selectedOrder.Price - totalAmountPaid)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-action">




              <div className='flex'>

                <button

                  disabled={orders.find(o => {
                    return o.LayawayID === selectedOrder.LayawayID && o.status === 'PAID'
                  })}
                  className="btn mr-2 bg-green-500" onClick={() => document.getElementById('addPayment').showModal()}>Add Payment</button>

                <button className="btn"
                  onClick={() => document.getElementById('viewProofPaymentImage').close()}
                >Close</button>
              </div>


            </div>
          </div>
        </dialog>


        <ToastContainer />

      </div >
    )
  );
}

export default LayAwayPayment;
