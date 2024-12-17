import { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Table, { StatusPill } from '../../pages/protected/DataTables/Table';
import { formatAmount } from '../dashboard/helpers/currencyFormat';
import { format } from 'date-fns';
import InputText from '../../components/Input/InputText';

import Dropdown from '../../components/Input/Dropdown';
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';
function ForgotPassword() {
    const [activeTab, setActiveTab] = useState(1); // State to control active tab
    const [activeTabMain, setactiveTabMain] = useState('myprofile'); // State to control active tab
    const INITIAL_USER_OBJ = { emailId: "" };
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [linkSent, setLinkSent] = useState(false);
    const [userObj, setUserObj] = useState(INITIAL_USER_OBJ);
    const [isLoaded, setIsLoaded] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState({});
    const params = useParams();
    let userId = params.userId;
    const [selectedUser, setSelectedUser] = useState({});
    const [orders, setOrders] = useState([]);

    const [layAwayOrders, setlayAwayOrders] = useState([]);
    const [orderType, setOrderType] = useState('direct');

    const [viewedUser, setviewedUser] = useState({});
    const [faqs, setFaqs] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const toggleFaq = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const getFAQS = async () => {
        let res = await axios({
            method: 'get',
            url: `/faq`,

        });
        let result = res.data.data;

        console.log({ result })
        setFaqs(result);
        setIsLoaded(true);
    };


    const getUser = async () => {
        let res = await axios.get(`user/${userId}/findCustomer`);
        let [user] = res.data.data;
        setSelectedUser(user);
        setviewedUser(user)
        setIsLoaded(true);
    };

    const fetchOrders = async () => {
        let res = await axios.post('transactions/listOrder', {
            customerId: userId, type: orderType
        });
        let list = res.data.data;
        setOrders(list);
    };


    useEffect(() => {
        getFAQS()
    }, []);




    useEffect(() => {
        getUser();
        fetchOrders();

    }, [orderType]);

    const columns = useMemo(() => [
        {
            Header: 'Action',
            Cell: ({ row }) => {
                let TransactionID = row.original.TransactionID || row.original.LayawayID;
                let link = `/myprofile/${userId}/order/${TransactionID}`;


                console.log({ Dex: row.original.LayawayID })
                if (row.original.LayawayID) {
                    link = `/myprofile/${userId}/layaway/${TransactionID}`;
                }
                return (
                    <div className="flex space-x-2">
                        <Link to={link}>
                            <button className="btn btn-outline btn-sm">
                                <i className="fa-regular fa-eye"></i>
                            </button>
                        </Link>
                    </div>
                );
            },
        },
        {
            Header: 'Transaction ID',
            accessor: 'TransactionID',
            Cell: ({ row }) => {
                let TransactionID = row.original.TransactionID || row.original.LayawayID;
                return TransactionID;
            },
        },
        {
            Header: 'Date Created',
            accessor: '',
            Cell: ({ row }) => {
                let dateCreated = row.original.Date_Modified || row.original.Date_Created;
                return format(dateCreated, 'MMM dd, yyyy');
            },
        },
        {
            Header: 'Item Name',
            accessor: 'ItemName',
        },
        {
            Header: 'Amount To Pay',
            accessor: 'Price',
            Cell: ({ row }) => {
                const totalAmount = row.original.Price * row.original.Grams;
                return formatAmount(totalAmount);
            },
        },
        {
            Header: 'Status',
            accessor: 'Status',
            Cell: ({ row }) => {
                let Status = row.original.Status || row.original.status;
                return <StatusPill value={Status} />;
            },
        },
    ], [userId]);

    let totalAmountToPay = [...orders, ...layAwayOrders]
        .filter(o => o.Status !== 'PAID')
        .reduce((acc, current) => acc + current.Price, 0);


    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formikConfigUpdate = (viewedUser) => {
        return {
            initialValues: {
                CustomerName: viewedUser.CustomerName || '',
                Facebook: viewedUser.Facebook || '',
                Contact: viewedUser.Contact || '',
                Address: viewedUser.Address || ''

            },
            validationSchema: Yup.object({
                CustomerName: Yup.string().required('Required'),
                Facebook: Yup.string().required('Required'),
                Contact: Yup.number().required('Required'),
                Address: Yup.string().required('Required'),
            }),
            validateOnMount: true,
            validateOnChange: false,
            onSubmit: async (values, { setFieldError, setSubmitting, resetForm }) => {
                setSubmitting(true);

                try {



                    let res = await axios({
                        method: 'put',
                        url: `user/${viewedUser.CustomerID}`,
                        data: values
                    })
                    document.getElementById('updateCustomer').close();
                    setviewedUser({})
                    await getUser();
                    resetForm();
                    toast.success('Customer successfully updated!', {
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


                } catch (error) {
                    console.log({ error });
                } finally {
                }
            }
        };
    };

    return (
        selectedUser ? (
            <div className="bg-base-200 flex items-center p-4 sm:p-8">
                <div className="w-full max-w-7xl mx-auto">
                    <div className="relative bg-cover bg-center h-40" style={{ backgroundImage: "url('/Log In Page.png')" }}>
                        <div className="absolute inset-0 bg-black opacity-50"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="p-3 rounded-full text-white bg-customBlue">
                                <img src="/A.V. Logo.png" alt="AV De Asis Logo" className="h-20 " />
                            </div>
                        </div>
                    </div>
                    {/* Profile Details Section */}
                    <div className="">
                        <div className="flex justify-center mb-4 p-4">

                            <button
                                className={`btn ${activeTabMain === 'myprofile' ? 'bg-customBrown text-white ' : 'bg-base-200'} mr-2`}
                                onClick={() => {
                                    setactiveTabMain('myprofile');

                                }}
                            >
                                My Profile
                            </button>
                            <button
                                className={`btn ${activeTabMain === 'faqs' ? 'bg-customBrown text-white' : 'bg-base-200'}`}
                                onClick={() => {
                                    setactiveTabMain('faqs');

                                }}
                            >
                                FAQS
                            </button>
                        </div>     </div>
                    <div className="">
                        {activeTabMain === 'myprofile' && <div>
                            <div className="bg-gray-100 p-4 sm:p-6 mb-6 rounded-lg">

                                <h2 className="text-2xl font-bold mb-4">My Profile</h2>
                                <div className="bg-white shadow rounded-lg p-4 sm:p-6">
                                    <button
                                        onClick={() => {


                                            document.getElementById('updateCustomer').showModal();
                                        }}

                                        className="ml-4 flex items-center px-4 py-2 bg-buttonPrimary text-white rounded-lg hover:bg-blue-600">

                                        <i className="fa-solid fa-edit mr-2"></i>
                                        Update
                                    </button>
                                    <div className="flex flex-col items-center space-y-4">
                                        <img
                                            className="w-24 h-24 rounded-full object-cover"
                                            src="https://img.freepik.com/premium-vector/young-smiling-man-avatar-man-with-brown-beard-mustache-hair-wearing-yellow-sweater-sweatshirt-3d-vector-people-character-illustration-cartoon-minimal-style_365941-860.jpg?w=740"
                                            alt="Profile"
                                        />
                                        <div className="text-center">
                                            <h2 className="text-xl font-semibold text-gray-800">{selectedUser.CustomerName}</h2>
                                            <p className="text-gray-600">{selectedUser.Facebook}</p>
                                            <p className="mt-2 text-gray-500">{selectedUser.Contact} | {selectedUser.Address}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 grid gap-4">
                                    <div className="stats shadow">
                                        <div className="stat">
                                            <div className="stat-title">Total Orders</div>
                                            <div className="stat-value">{orders.length}</div>
                                        </div>
                                        <div className="stat">
                                            <div className="stat-title">To Pay</div>
                                            <div className="stat-value">{formatAmount(totalAmountToPay)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Orders Table Section */}
                            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                                <h2 className="text-2xl font-bold mb-4">Orders</h2>
                                <div className="flex mb-4">
                                    <button
                                        className={`btn ${activeTab === 1 ? 'btn-primary' : 'btn-outline'} mr-2`}
                                        onClick={() => {
                                            setActiveTab(1);
                                            setOrderType('direct');
                                        }}
                                    >
                                        Direct
                                    </button>
                                    <button
                                        className={`btn ${activeTab === 2 ? 'btn-primary' : 'btn-outline'}`}
                                        onClick={() => {
                                            setActiveTab(2);
                                            setOrderType('layaway');
                                        }}
                                    >
                                        Layaway
                                    </button>
                                </div>
                                <div className="overflow-auto">
                                    <Table columns={columns} data={orders} />
                                </div>
                            </div>
                        </div>
                        }

                        {
                            activeTabMain === 'faqs' && <div className="max-w-2xl mx-auto p-4 mt-4 bg-white shadow-lg">
                                <h2 className="text-2xl font-semibold text-center mb-6">Frequently Asked Questions</h2>
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        placeholder="Search FAQs..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                                    />
                                </div>


                                {filteredFaqs.map(faq => (
                                    <div key={faq.id} className="border-b border-gray-200 py-4">
                                        <button
                                            onClick={() => toggleFaq(faq.id)}
                                            className="w-full text-left flex justify-between items-center font-medium text-lg text-gray-700 md:text-xl"
                                        >
                                            {faq.question}
                                            <span className="text-gray-500 md:hidden">
                                                {expandedId === faq.id ? "-" : "+"}
                                            </span>
                                            <span className="hidden md:inline text-gray-500">
                                                {expandedId === faq.id ? "−" : "+"}
                                            </span>
                                        </button>
                                        {expandedId === faq.id && (
                                            <div className="mt-2 max-h-32 overflow-y-auto text-gray-600 text-base md:text-lg">
                                                {faq.answer}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        }
                    </div>
                </div>
                <ToastContainer />

                <dialog id="updateCustomer" className="modal">
                    <div className="modal-box">
                        <form method="dialog">
                            {/* if there is a button in form, it will close the modal */}
                            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                        </form>
                        <h1 className="font-bold text-lg">Update</h1>
                        {/* <p className="text-sm text-gray-500 mt-1">Customer Details</p> */}
                        <div className="p-2 space-y-4 md:space-y-6 sm:p-4">
                            {viewedUser.CustomerName && <Formik {...formikConfigUpdate(viewedUser)}>
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
                                        <Form className="">
                                            {/* <label
                        className={`block mb-2 text-green-400 text-left font-bold`}>
                        Child
                      </label> */}
                                            <div className="grid grid-cols-1 gap-3 md:grid-cols-1 ">


                                                <InputText
                                                    className="border-2 border-none focus:border-purple-500 rounded-lg p-2 w-full"
                                                    disabled
                                                    label="Full Name"
                                                    name="CustomerName"
                                                    type="text"
                                                    placeholder=""
                                                    value={values.CustomerName}
                                                    onBlur={handleBlur} // This apparently updates `touched`?
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 ">

                                                <InputText
                                                    className="border-2 border-none focus:border-purple-500 rounded-lg p-2 w-full"
                                                    label="Facebook Link"
                                                    name="Facebook"
                                                    type="text"
                                                    placeholder=""
                                                    value={values.Facebook}
                                                    onBlur={handleBlur} // This apparently updates `touched`?
                                                />
                                                <InputText

                                                    label="Contact Number"
                                                    name="Contact"
                                                    type="text"
                                                    placeholder=""
                                                    value={values.Contact}
                                                    onBlur={handleBlur} // This apparently updates `touched`?
                                                />
                                            </div>



                                            <div className="grid grid-cols-1 gap-3 md:grid-cols-1 ">


                                                <InputText

                                                    label="Complete Address"
                                                    name="Address"
                                                    type="text"
                                                    placeholder=""
                                                    value={values.Address}
                                                    onBlur={handleBlur} // This apparently updates `touched`?
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className={
                                                    'btn mt-4 shadow-lg w-full bg-buttonPrimary font-bold text-white' +
                                                    (loading ? ' loading' : '')
                                                }>
                                                Update
                                            </button>
                                        </Form>
                                    );
                                }}
                            </Formik>} </div>
                    </div>
                </dialog>
            </div>
        ) : (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Unknown User</h1>
                    <p className="text-lg text-gray-600">We couldn't find the user you're looking for.</p>
                </div>
            </div>
        )
    );
}

export default ForgotPassword;



