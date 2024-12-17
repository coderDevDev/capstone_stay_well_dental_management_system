import { useState, useRef, useEffect, useMemo } from 'react'
import { NavLink, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import LandingIntro from './LandingIntro'
import ErrorText from '../../components/Typography/ErrorText'
import InputText from '../../components/Input/InputText'
import TextAreaInput from '../../components/Input/TextAreaInput'
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon'
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup'
import { mdiAccount, mdiLockOutline } from '@mdi/js';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useParams } from 'react-router';

import { formatAmount } from '../dashboard/helpers/currencyFormat';
import Table, {
    AvatarCell,
    SelectColumnFilter,
    StatusPill,
    DateCell
} from '../../pages/protected/DataTables/Table';

function ForgotPassword() {



    const navigate = useNavigate();
    const INITIAL_USER_OBJ = {
        emailId: ""
    }

    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [linkSent, setLinkSent] = useState(false)
    const [userObj, setUserObj] = useState(INITIAL_USER_OBJ)
    const [isLoaded, setIsLoaded] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState({});
    const [preview, setPreview] = useState('');
    const params = useParams()

    let userId = params.userId;
    let transactionId = params.transactionId;


    const [selectedUser, setSelectedUser] = useState({});
    const [orders, setOrders] = useState([]);


    const [file, setFile] = useState(null);


    const handleOnChange = e => {
        console.log(e.target.files[0]);
        setFile(e.target.files[0]);
    };

    const getUser = async () => {
        let res = await axios({
            method: 'GET',
            url: `user/${userId}/findCustomer`
        });
        let [user] = res.data.data;


        setSelectedUser(user);

    };


    const fetchOrders = async () => {
        let res = await axios({
            method: 'POST',
            url: 'transactions/listOrder',
            data: {
                customerId: userId,
                transactionId

            }
        });

        let list = res.data.data;



        setSelectedOrder(list[0])
    };

    useEffect(() => {
        getUser();
        fetchOrders();

        setIsLoaded(true);
    }, []);




    const submitForm = (e) => {
        e.preventDefault()
        setErrorMessage("")

        if (userObj.emailId.trim() === "") return setErrorMessage("Email Id is required! (use any value)")
        else {
            setLoading(true)
            // Call API to send password reset link
            setLoading(false)
            setLinkSent(true)
        }
    }

    const updateFormValue = ({ updateType, value }) => {
        setErrorMessage("")
        setUserObj({ ...userObj, [updateType]: value })
    }

    console.log({ selectedUser })


    const columns = useMemo(
        () => [

            {
                Header: 'Transaction ID',
                accessor: 'TransactionID',
                Cell: ({ row, value }) => {
                    return <span className="">{value}</span>;
                }
            },
            {
                Header: 'Item Name',
                accessor: 'ItemName',
                Cell: ({ row, value }) => {

                    return <span className="">{value}</span>;
                }
            },
            {
                Header: 'Amount',
                accessor: 'Price',
                Cell: ({ row, value }) => {
                    let thisRow = row.original;
                    const totalAmount = thisRow.Price * thisRow.Grams;
                    return <span className="">{formatAmount(totalAmount)}</span>;
                }
            },
            // {
            //     Header: 'Grams',
            //     accessor: '',
            //     Cell: ({ row, value }) => {
            //         return <span className=""></span>;
            //     }
            // },
            {
                Header: 'Status',
                accessor: 'Status',
                Cell: ({ row, value }) => {
                    let colors = {
                        'IN_PROGRESS': 'bg-yellow-500',
                        'PAID': 'bg-green-500',
                        'COMPLETED': 'bg-blue-500',
                        'CANCELLED': 'bg-red-500'
                    }
                    return (
                        <div className="flex items-center space-x-1">


                            <div className={`px-2 py-1 rounded-full font-normal text-white ${colors[value]}`}>
                                {value}
                            </div>
                        </div>
                    );
                }
            },
            {
                Header: 'Action',
                accessor: '',
                Cell: ({ row, value }) => {


                    let thisOrder = row.original;

                    return <div className="flex">



                        <button className="btn btn-outline btn-sm mr-2" onClick={async () => {


                            setSelectedOrder(thisOrder);

                            document.getElementById('viewReceipt').showModal();


                        }}>  <i class="fa-regular fa-eye"></i>
                        </button>

                        <button className="btn btn-outline btn-sm mr-2" onClick={async () => {


                            setSelectedOrder(thisOrder);

                            document.getElementById('paymentModal').showModal();


                        }}>  <i class="fa-regular fa-credit-card"></i>
                        </button>


                    </div >
                }
            },
        ]);


    console.log({ selectedOrder })
    let colors = {
        'IN_PROGRESS': 'bg-yellow-500',
        'PAID': 'bg-green-500',
        'COMPLETED': 'bg-blue-500',
        'CANCELLED': 'bg-red-500'
    }



    const formikConfigViewReciept = () => {


        let validation = {
            Comments: Yup.string().required('Required'),
            // Proof_Payment: Yup.string().required('Required')
        };

        let initialValues = {

            Proof_Payment: '',
            Comments: ''
        }




        return {

            initialValues: initialValues,
            validationSchema: Yup.object(validation),
            // validateOnMount: true,
            // validateOnChange: true,
            onSubmit: async (values, { setFieldError, setSubmitting, }) => {





                console.log({ file })

                if (!file) {
                    setFieldError('Proof_Payment', 'Required');
                }



                if (file && values.Comments) {
                    const data = new FormData();
                    data.append('Proof_Payment', file);
                    data.append('Comments', values.Comments);


                    data.append('TransactionID', selectedOrder.TransactionID);
                    // data.append('TransactionID', selectedOrder.TransactionID);
                    // if(file){

                    // }

                    let res = await axios({
                        // headers: {
                        //   'content-type': 'multipart/form-data'
                        // },
                        method: 'POST',
                        url: 'transactions/makePayment',
                        data
                    });



                    toast.success(`Submitted Successfully`, {
                        position: 'top-right',
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: 'light'
                    });

                    navigate(`/myprofile/${userId}`);
                }




            }
        }
    };

    let isPaid = selectedOrder.Status === 'PAID';
    return (
        selectedUser ? isLoaded && (
            <div className="min-h-screen bg-base-200 flex flex-col items-center bg-customBlue shadow-lg">
                <div className="card w-full max-w-7xl mx-2 sm:mx-auto shadow-xl">
                    <div className="p-4 flex flex-col sm:flex-row justify-between items-center">
                        <button
                            onClick={() => navigate(-1)} // Go back to the previous page
                            className="btn bg-buttonPrimary text-white mb-2 sm:mb-0">
                            Back
                        </button>
                        <h1 className="text-lg sm:text-xl font-bold">Invoice Details</h1>
                    </div>
                    <div className="flex flex-col gap-4 bg-base-100 rounded-xl">
                        <div className="bg-gray-100 p-4 sm:p-6 flex-1">
                            <div className="flex items-center justify-between">
                                <div className={`px-3 py-1 rounded-full text-white ${colors[selectedOrder.Status]}`}>
                                    {selectedOrder.Status}
                                </div>
                            </div>
                            <div className="relative bg-cover bg-center h-40" style={{ backgroundImage: "url('/Log In Page.png')" }}>
                                <div className="absolute inset-0 bg-black opacity-50"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="p-3 rounded-full text-white bg-customBlue">
                                        <img src="/A.V. Logo.png" alt="AV De Asis Logo" className="h-20 " />
                                    </div>
                                </div>
                            </div>
                            <div className="p-1 space-y-4 sm:space-y-6">
                                <div className="overflow-x-auto">
                                    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 mx-auto">
                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
                                            <div className="text-gray-700 font-semibold text-lg">A.V De Asis</div>
                                            <div className="text-gray-700 text-left md:text-right mt-2 md:mt-0">
                                                <div className="font-bold text-xl">INVOICE</div>
                                                <div className="text-sm">Date: {selectedOrder.Date_Created}</div>
                                                <div className="text-sm">Invoice #: INV-{selectedOrder.TransactionID}</div>
                                            </div>
                                        </div>
                                        <div className="border-b-2 border-gray-300 pb-4 mb-6">
                                            <h2 className="text-xl sm:text-2xl font-bold mb-2">Bill To:</h2>
                                            <div className="text-gray-700">{selectedOrder.CustomerName}</div>
                                            <div className="text-gray-700">{selectedOrder.Address}</div>
                                            <div className="text-gray-700">{selectedOrder.Contact}</div>
                                            <div className="text-gray-700">{selectedOrder.Email}</div>
                                        </div>
                                        <table className="w-full text-left text-xs sm:text-sm md:text-base mb-6">
                                            <thead>
                                                <tr>
                                                    <th className="font-bold uppercase py-2">Description</th>
                                                    <th className="font-bold uppercase py-2">Grams</th>
                                                    <th className="font-bold uppercase py-2">Price</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="py-4">
                                                        <ul className="list-disc pl-5">
                                                            {selectedOrder && JSON.parse(selectedOrder?.itemNames || `[]`).map((itemObj, index) => (
                                                                <li key={index} className="mb-1">
                                                                    {itemObj.item}: <span className="font-semibold">{itemObj.count}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </td>
                                                    <td className="py-4">{selectedOrder.Grams ? selectedOrder.Grams.toFixed(2) : 0} grams</td>
                                                    <td className="py-4">{formatAmount(selectedOrder.Price)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <div className="flex justify-between">
                                            <div className="text-gray-700">Grand Total:</div>
                                            <div className="font-bold text-xl text-green-500">{formatAmount(selectedOrder.Price)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right section for Payment Steps */}
                        <div className="flex flex-col gap-4 bg-base-100 rounded-xl">
                            {selectedOrder.Status === 'PAID' ? (
                                <div className="bg-gray-100 p-4 sm:p-6 flex-1">
                                    <div className="flex justify-center">
                                        <div className="px-3 py-1 text-white bg-blue-600">Proof of Payment</div>
                                    </div>
                                    <div className="p-4">
                                        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 mx-auto">
                                            <img src={selectedOrder.proof_of_payment} alt="Proof of Payment" className="w-full h-auto object-cover" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="p-4 sm:p-6 flex-1">
                                        <h2 className="text-xl sm:text-2xl font-bold mb-2">Step 1: Pay</h2>
                                        <div className="space-y-4 sm:space-y-6">
                                            <div className="divider font-bold">Scan QR</div>
                                            <p className="text-center">
                                                Please pay <span className="font-bold text-green-500">{formatAmount(selectedOrder.Price)}</span> using the QR Code below.
                                            </p>
                                            <div className="flex justify-center">
                                                <img src="/paymentMethod.png" alt="Payment Method" className="w-full max-w-xs sm:max-w-sm h-auto" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 sm:p-6 flex-1">
                                        <h2 className="text-xl sm:text-2xl font-bold mb-2">Step 2: Upload Proof of Payment</h2>
                                        <Formik {...formikConfigViewReciept()}>
                                            {({
                                                handleSubmit, handleBlur, values, setFieldValue,
                                            }) => (
                                                <Form className="space-y-4 sm:space-y-6">
                                                    <InputText
                                                        label="Upload"
                                                        name="Proof_Payment"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            setFile(file);
                                                            if (file) {
                                                                setPreview(URL.createObjectURL(file));
                                                            }
                                                        }}
                                                        onBlur={handleBlur}
                                                    />
                                                    <div className="flex justify-center">
                                                        <img id="blah" alt="" className="h-40 w-28 sm:h-60 sm:w-40 object-contain" src={preview} />
                                                    </div>
                                                    <InputText label="Comments" name="Comments" type="text" value={values.Comments} onBlur={handleBlur} />
                                                    <button type="submit" className="btn w-full bg-buttonPrimary font-bold text-white">Submit</button>
                                                </Form>
                                            )}
                                        </Formik>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <ToastContainer />
            </div>
        ) : (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Unknown User</h1>
                    <p className="text-lg text-gray-600">We couldn't find the user you're looking for.</p>
                </div>
            </div>
        )
    );

    let totalGrams = selectedOrder && JSON.parse(selectedOrder?.itemNames || `[]`).reduce((acc, current) => {
        // Assuming current is an object with a weight property
        return acc + (current.count || 0); // Add the weight of the current item to the accumulator
    }, 0);


    return <div>

        <div className="max-w-sm mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Header Image and Logo */}
            <div className="relative bg-cover bg-center h-40" style={{ backgroundImage: "url('/Log In Page.png')" }}>
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="p-3 rounded-full text-white bg-customBlue">
                        <img src="/A.V. Logo.png" alt="AV De Asis Logo" className="h-20 " />
                    </div>
                </div>
            </div>

            {/* Contact Information Section */}
            <div className="p-4 bg-gray-100 text-center">
                <h2 className="text-lg font-semibold text-gray-800 text-center mb-4">Your Contact Information</h2>
            </div>
            <div className="p-6 bg-white">


                <div className="text-center">
                    <p className="text-xl font-semibold text-gray-700">{selectedUser.CustomerName}</p>
                </div>
                <div className="mt-4">
                    <div className="flex items-center mb-3">
                        <label className="w-1/3 text-gray-500 font-medium">Address:</label>
                        <div className="w-2/3 bg-gray-100 p-2 rounded-lg flex items-center justify-between">
                            <span>{selectedUser.Address}</span>
                            {/* <button className="text-gray-500 hover:text-blue-600">
                                ✏️
                            </button> */}
                        </div>
                    </div>
                    <div className="flex items-center mb-3">
                        <label className="w-1/3 text-gray-500 font-medium">Phone:</label>
                        <div className="w-2/3 bg-gray-100 p-2 rounded-lg flex items-center justify-between">
                            <span>{selectedUser.Contact}</span>
                            {/* <button className="text-gray-500 hover:text-blue-600">
                                ✏️
                            </button> */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Current Order Status Section */}
            <div className="p-4 bg-gray-100 text-center">
                <div className="p-4 bg-gray-100 text-center">
                    <h2 className="text-lg font-semibold text-gray-800">Current Order Status</h2>
                </div>
                {/* Add your order status content here */}
                <div className="max-w-sm mx-auto -100 rounded-xl p-6 shadow-lg bg-white">
                    {/* Order Header */}
                    <h2 className="text-center text-lg font-semibold text-gray-800 mb-4">Order - {selectedOrder.OrderID}</h2>

                    {/* Order Items Table */}
                    <div className="text-sm">
                        <div className="flex justify-between border-b border-gray-300 pb-2 mb-2">
                            <span className="font-semibold">Items:</span>
                            <span className="font-semibold">Quantity:</span>
                            <span className="font-semibold">Price:</span>
                        </div>


                        {selectedOrder && JSON.parse(selectedOrder?.itemNames || `[]`).map((itemObj, index) => {




                            return <div className="flex justify-between mb-1 text-center items-center">

                                <span>{itemObj.item}</span>
                                <span>{itemObj.count}</span>
                                <span className="">-</span>


                            </div>
                        })}





                        {/* Total Grams and Price */}
                        <div className="flex justify-between border-t border-gray-300 pt-2 mb-2">
                            <span className="font-semibold">Total Grams:</span>
                            <span>{totalGrams}g</span>
                            <span className="font-semibold text-red-600">{formatAmount(selectedOrder.Price)}</span>
                        </div>

                        {/* Additional Order Information */}
                        <div className="mt-2">
                            <div className="flex justify-between mb-1">
                                <span className="text-gray-500">Price/g:</span>
                                <span className="text-gray-800 font-medium">{formatAmount(selectedOrder.orinalPricePerGram)}</span>
                            </div>
                            <div className="flex justify-between mb-1">
                                <span className="text-gray-500">Order Date:</span>
                                <span className="text-gray-800 font-medium">{selectedOrder.Date_Created}</span>
                            </div>
                            <div className="flex justify-between mb-1">
                                <span className="text-gray-500">Category:</span>
                                <span className="text-gray-800 font-medium">{selectedOrder.Category}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Status:</span>
                                <span className="text-gray-800 font-medium">      {selectedOrder.Status}</span>
                            </div>
                        </div>
                    </div>

                    {/* View Previous Orders Button */}
                    <button
                        onClick={() => navigate(-1)} // Go back to the previous page
                        className="btn bg-buttonPrimary text-white mb-2 sm:mb-0 w-full mt-4">
                        View Previous Orders
                    </button>
                    {/* <button className="w-full mt-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800">
                        View Previous Orders
                    </button> */}
                </div>
            </div>
        </div>
    </div >
}

export default ForgotPassword