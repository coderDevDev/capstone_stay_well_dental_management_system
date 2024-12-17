import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import {
  setAppSettings,
  getFeatureList
} from '../../features/settings/appSettings/appSettingsSlice';
import CodeGenerator from '../../features/code_generator/components/index';
import { formatAmount } from '../../features/dashboard/helpers/currencyFormat';
import axios from 'axios';
import { Formik, useField, useFormik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import InputText from '../../components/Input/InputText';
import {
  removeItem,
  updateQuantity,
  addToCart,
  resetCart
} from '../../features/payoutCart/index';

import TitleCard from '../../components/Cards/TitleCard';
import PlusCircleIcon from '@heroicons/react/24/outline/PlusCircleIcon';

import Table, {
  AvatarCell,
  SelectColumnFilter,
  StatusPill,
  DateCell,
  DateRangeColumnFilter,
  dateBetweenFilterFn,
  DefaultColumnFilter,
  DateColumnFilter
} from './DataTables/Table';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { NavLink, Routes, Link, useLocation } from 'react-router-dom';

const isWithinPayoutWindow = () => {
  const now = new Date();
  const day = now.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
  const hour = now.getHours();

  // Check if it's Monday (day = 1) and time is after or at 12:00 AM (hour = 0)
  // or if it's Tuesday (day = 2) and time is before or at 11:59 PM (hour = 23)
  if ((day === 1 && hour >= 0) || (day === 2 && hour <= 23)) {
    return true;
  } else {
    return false;
  }
};

const PackageCart = ({
  data,
  cartState,
  index,
  errors,
  touched,
  values,
  setFieldValue
}) => {
  const dispatch = useDispatch();

  const [quantity, setQuantity] = useState(data?.quantity || 0);

  const [totalPrice, setTotalPrice] = useState(+data?.price * +data?.quantity);

  const handleChange = e => {
    const value =
      parseInt(e.target.value) > 0 ? parseInt(e.target.value) : undefined;

    setQuantity(value);
    setFieldValue(`totalAmountToWithdrawList.${index}.quantity`, value);
  };

  const handleRemove = () => {
    dispatch(removeItem({ ID: data?.ID }));
  };

  useEffect(() => {
    setTotalPrice(data?.currentIncomeAmount - quantity);
    dispatch(updateQuantity({ ID: data?.ID, quantity, incomeType: data.name }));
  }, [quantity, data?.currentIncomeAmount, data?.ID, dispatch]);

  let { icon, displayName, placeholder, currentIncomeAmount } = data;

  return (
    <div className="justify-between mb-6 rounded-lg bg-white p-6 shadow-lg sm:flex sm:justify-start">
      <img src={icon} alt="" className="w-20 rounded-lg md:w-30 h-20" />
      {/* <i class="fa-solid fa-gift text-4xl text-green-700"></i> */}
      <div className="sm:ml-4 sm:flex sm:w-full sm:justify-between">
        <div className="mt-5 sm:mt-0">
          <h2 className="text-lg font-bold text-gray-700 dark:text-gray-400">
            {displayName}
          </h2>
          <p className="mt-1 text-1xl text-yellow-600 font-bold">
            {formatAmount(currentIncomeAmount)}
          </p>
        </div>
        <div className="mt-4 flex flex flex-col justify-between  sm:space-y-6 sm:mt-0 sm:block sm:space-x-6">
          <div className="inline-flex items-center  font-semibold text-gray-500 rounded-md  ">
            <InputText
              type="text"
              placeholder="Enter amount"
              onChange={handleChange}
              name={`totalAmountToWithdrawList.${index}.quantity`}

              // value={values.parentUserName}

              // onChange={handleEmailChange}
            />
            {/* <span
              className="py-2 cursor-pointer rounded-r bg-gray-100 py-1 px-3 duration-100 hover:bg-green-500 hover:text-blue-50"
              onClick={() => setQuantity(amount => amount + 1)}>
              {' '}
              +{' '}
            </span> */}
          </div>

          <div className="mb-0 flex justify-between mt-2">
            <p className="text-gray-700 text-sm italic ">Subtotal : </p>
            <p className="text-gray-700 text-sm font-bold italic ">
              {formatAmount(quantity || 0)}
            </p>
          </div>
          <hr className="" />
          {/* <div className="mb-0 flex justify-between mt-0">
            <p className="text-gray-700 text-xs">Remaining</p>
            <p className="text-gray-700 text-xs">{formatAmount(totalPrice)}</p>
          </div> */}
        </div>
      </div>
    </div>
  );
};
function InternalPage() {
  const dispatch = useDispatch();
  const cart = useSelector(state => state.cart);
  const [isLoaded, setIsLoaded] = useState(false);
  const [openTab, setOpenTab] = useState(1);
  const [userIncomeSalesData, setUserIncomeSalesData] = useState([]);

  const [payoutList, setPayoutList] = useState([]);

  const [activePayoutModal, setActivePayoutModal] = useState(
    'taskRewardAndBinaryIncome'
  );
  const handleAddToCart = data => {
    dispatch(
      addToCart({
        ...data,
        quantity: 0
      })
    );
  };

  const getDashboardStats = async () => {
    setIsLoaded(false);

    let res = await axios({
      method: 'POST',
      url: 'transaction/getDashboardStats'
    });

    let data = res.data.data;

    let result = Object.keys(data).map((key, index) => {
      return {
        ID: index,
        name: key,
        displayName: data[key].displayName,
        icon: `/${key}.png`,
        placeholder: 'Enter Amount (Php)',
        currentIncomeAmount: data[key].grandTotal,
        price: 0,
        quantity: 0
      };
    });

    await setUserIncomeSalesData(result);

    result
      // .filter(incomeType => incomeType.name !== 'giftChequeIncome')
      .map(item => {
        console.log('handleAddToCart');
        handleAddToCart(item);
      });
    setIsLoaded(true);
  };

  useEffect(() => {
    dispatch(setPageTitle({ title: 'Payout' }));
  }, []);

  const formikConfig = {
    initialValues: {
      totalAmountToWithdrawList: [
        {
          name: 'dailyBonus',
          quantity: undefined
        },
        {
          name: 'binaryIncome',
          quantity: undefined
        }
        // {
        //   name: 'giftChequeIncome',
        //   quantity: undefined
        // }
      ]
      // cartState: cart,
      // subtotal: 0
    },
    validationSchema: Yup.object({
      totalAmountToWithdrawList: Yup.array().of(
        Yup.object().shape({
          quantity: Yup.number().test(
            'minMax',
            'Value must be between 500 and 10.',
            (val, key) => {
              let keyType = key.parent.name;
              let checkInputQuantity = cart.list.some((value, current) => {
                return value.quantity > 0;
              });

              let incomeSales = cart.list.find(a => a.name === keyType);
              let max = incomeSales.currentIncomeAmount;
              let min = 500;

              if (!checkInputQuantity) {
                return key.createError({
                  message: `At least one field is required.`
                });
              } else if (val > max) {
                return key.createError({
                  message: `The value entered exceeds the maximum allowed value ${formatAmount(
                    max
                  )}`
                });
              } else if (val < min) {
                return key.createError({
                  message: `The value entered is below the minimum allowed value ${formatAmount(
                    min
                  )}`
                });
              } else {
                return true;
              }
            }
          )

          // .required('Required')
        })
      )
    }),
    // validateOnMount: true,
    // validateOnChange: true,
    // validateOnBlur: true,
    onSubmit: async (
      values,
      { setSubmitting, errors, setFieldError, resetForm }
    ) => {
      try {
        let formValues = values.cartState;

        let res = await axios({
          method: 'POST',
          url: `payout/createPayoutRequest`,
          data: {
            ...formValues,
            type: 'dailyBonus&&binaryIncome',
            list: formValues.list
              .filter(p => p.name !== 'giftChequeIncome')
              .map(l => {
                return {
                  name: l.name,
                  currentIncomeAmount: l.currentIncomeAmount,
                  quantity: l.quantity
                };
              })
          }
        }).then(async () => {
          document.getElementById('createPayoutRequestModal').close();
          toast.success('Created Successfully', {
            onClose: () => {
              setSubmitting(false);
              window.location.reload();
            },
            position: 'top-right',
            autoClose: 1,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: false,
            progress: false,
            theme: 'light'
          });
        });

        dispatch(
          resetCart({
            quantity: 0
          })
        );

        // setIsLoaded(true);
      } catch (error) {
        console.log(error);
        toast.error('Something went wrong', {
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
        // setSubmitting(false);
      }
    }
  };

  const formikConfigGiftCheque = {
    initialValues: {
      totalAmountToWithdrawList: [
        {
          name: 'giftChequeIncome',
          quantity: 0
        }
      ]
      // cartState: cart,
      // subtotal: 0
    },
    validationSchema: Yup.object({
      totalAmountToWithdrawList: Yup.array().of(
        Yup.object().shape({
          quantity: Yup.number().test(
            'minMax',
            'Value must be between 500 and 10.',
            (val, key) => {
              let keyType = key.parent.name;
              let checkInputQuantity = cart.list.some((value, current) => {
                return value.quantity > 0;
              });

              let incomeSales = cart.list.find(a => a.name === keyType);
              let max = incomeSales.currentIncomeAmount;
              let min = 500;

              if (!checkInputQuantity) {
                return key.createError({
                  message: `At least one field is required.`
                });
              } else if (val > max) {
                return key.createError({
                  message: `The value entered exceeds the maximum allowed value ${formatAmount(
                    max
                  )}`
                });
              } else if (val < min) {
                return key.createError({
                  message: `The value entered is below the minimum allowed value ${formatAmount(
                    min
                  )}`
                });
              } else {
                return true;
              }
            }
          )

          // .required('Required')
        })
      )
    }),
    // validateOnMount: true,
    // validateOnChange: true,
    // validateOnBlur: true,
    onSubmit: async (
      values,
      { setSubmitting, errors, setFieldError, resetForm }
    ) => {
      try {
        let formValues = values.cartState;

        // console.log({
        //   ...formValues,
        //   list: formValues.list.map(l => {
        //     return {
        //       name: l.name,
        //       currentIncomeAmount: l.currentIncomeAmount,
        //       quantity: l.quantity
        //     };
        //   })
        // });

        let giftChequeData = formValues.list
          .filter(l => {
            return l.name === 'giftChequeIncome';
          })
          .map(l => {
            return {
              name: l.name,
              currentIncomeAmount: l.currentIncomeAmount,
              quantity: l.quantity
            };
          });

        let formattedValues = {
          type: 'giftChequeIncome',
          list: giftChequeData,
          grandTotal: values.totalAmountToWithdrawList['0'].quantity,
          processingFeeTotalDeduction: 0,
          serviceFeeTotalDeduction: 0,
          total: values.totalAmountToWithdrawList['0'].quantity,
          fsCodeTotalDeduction: 0
        };
        let res = await axios({
          method: 'POST',
          url: `payout/createPayoutRequest`,
          data: formattedValues
        }).then(async () => {
          document.getElementById('createGiftChequeRequestModal').close();
          toast.success('Created Successfully', {
            onClose: () => {
              setSubmitting(false);
              window.location.reload();
            },
            position: 'top-right',
            autoClose: 1,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: false,
            progress: false,
            theme: 'light'
          });
        });

        dispatch(
          resetCart({
            quantity: 0
          })
        );

        // setIsLoaded(true);
      } catch (error) {
        console.log(error);
        toast.error('Something went wrong', {
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
        // setSubmitting(false);
      }
    }
  };

  useEffect(() => {
    getDashboardStats();
  }, []);

  const listPayout = async () => {
    setIsLoaded(false);
    let res = await axios({
      method: 'GET',
      url: 'payout/listPayout'
    });

    let data = res.data.data;

    setPayoutList(data);

    setIsLoaded(true);
  };

  useEffect(() => {
    listPayout();
  }, []);

  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

  const [userActiveCode, setUserActiveCode] = useState({});

  const getUser = async () => {
    // setIsLoaded(false);
    let res = await axios({
      method: 'GET',
      url: `user/${loggedInUser.userId}`
    });
    let user = res.data.data;

    setUserActiveCode(user.codeInfo);
  };

  useEffect(() => {
    getUser();
  }, []);

  const TopSideButtons = ({ removeFilter, applyFilter, applySearch }) => {
    let checkIfIsWithinPayoutWindow = isWithinPayoutWindow();

    console.log({ checkIfIsWithinPayoutWindow });

    return (
      <div>
        <button
          className="btn btn-warning  font-bold btn-md"
          disabled={!checkIfIsWithinPayoutWindow}
          onClick={() => {
            if (checkIfIsWithinPayoutWindow) {
              setActivePayoutModal('taskRewardAndBinaryIncome');

              document.getElementById('createPayoutRequestModal').showModal();
            }
          }}>
          <PlusCircleIcon className="h-6 w-6" />
          Payout Request
        </button>
        <button
          className="btn ml-2 btn-accent font-bold"
          disabled={!checkIfIsWithinPayoutWindow}
          onClick={() => {
            if (checkIfIsWithinPayoutWindow) {
              setActivePayoutModal('giftChequeIncome');
              document
                .getElementById('createGiftChequeRequestModal')
                .showModal();
            }
          }}>
          {' '}
          <PlusCircleIcon className="h-6 w-6 " />
          Gift Cheque Request
        </button>
      </div>
    );
  };

  const incomeType = {
    dailyBonus: 'Task Rewards',
    binaryIncome: 'Binary Income',
    giftChequeIncome: 'Gift Cheque'
  };
  const TablePayoutList = ({ data, appSettings, componentPDF, type }) => {
    const columns = useMemo(
      () => [
        {
          Header: 'Code Type',
          accessor: 'userInfo.codeType',
          Cell: ({ value }) => {
            return <span className="font-bold text-slate-700">{value}</span>;
          }
        },

        {
          Header: 'Income Type',
          accessor: '',
          Cell: ({ row }) => {
            let list = JSON.parse(row.original.rawData);
            let filtered = list.filter(l => l.quantity > 0);

            return (
              <ul className="menu bg-base-100 w-56 rounded-box">
                {filtered.map(({ name }) => {
                  return (
                    <li>
                      <a className="text-lg">
                        <span className="fa-solid fa-circle-check text-green-500"></span>
                        {incomeType[name]}
                      </a>
                    </li>
                  );
                })}
              </ul>
            );
          }
        },

        {
          Header: 'Requested Amount',
          accessor: 'rawTotal',
          Cell: ({ value }) => {
            return (
              <span className="font-bold text-slate-700">
                {' '}
                {formatAmount(value)}
              </span>
            );
          }
        },
        {
          Header: 'Total Deduction',
          accessor: 'totalDeduction',
          Cell: ({ value }) => {
            return (
              <span className="font-bold text-red-400">
                {formatAmount(value)}
              </span>
            );
          }
        },

        ,
        {
          Header: 'Withdrawable Amount',
          accessor: 'grandTotal',
          Cell: ({ value }) => {
            return (
              <span className="font-bold text-green-500">
                {formatAmount(value)}
              </span>
            );
          }
        },

        {
          Header: 'Date Created',
          accessor: 'dateTimeAdded',
          Cell: DateCell
        },
        {
          Header: 'Approval Date',
          accessor: 'dateTimeApproved',
          Cell: DateCell
        },
        {
          Header: 'Status',
          accessor: 'status',
          Cell: StatusPill
        },
        {
          Header: 'Action',
          accessor: '',
          Cell: ({ row }) => {
            let ID = row.original.ID;
            return (
              <Link to={`/app/checkout?ID=${ID}`}>
                <button className="btn btn-sm ">View</button>
              </Link>
            );
          }
        }
      ],
      []
    );
    // const tableData = useMemo(() => getData(), []);

    let filteredPayoutList = payoutList;
    if (type === 'giftChequeIncome') {
      filteredPayoutList = filteredPayoutList.filter(n => {
        return n.type === 'giftChequeIncome';
      });
    } else {
      filteredPayoutList = filteredPayoutList.filter(n => {
        return n.type !== 'giftChequeIncome';
      });
    }
    return (
      <div>
        <div className="">
          <Table
            style={{ overflow: 'wrap' }}
            className="table-sm"
            columns={columns}
            data={filteredPayoutList}
          />
        </div>
      </div>
    );
  };

  const DeductionHistoryList = ({
    data,
    appSettings,
    componentPDF,
    type,
    openTab
  }) => {
    console.log({ openTab });
    const columns = useMemo(
      () => [
        {
          Header: 'Invoice #',
          accessor: 'invoiceCode',
          Cell: ({ value }) => {
            return <span className="font-bold text-slate-700">{value}</span>;
          }
        },
        {
          Header: 'Code Type',
          accessor: 'userInfo.codeType',
          Cell: ({ value }) => {
            return <span className="font-bold text-slate-700">{value}</span>;
          }
        },
        {
          Filter: false,
          Header: 'Status',
          accessor: 'status',
          Cell: StatusPill
        },
        {
          // Filter: DefaultColumnFilter,
          Header: 'Approval Date',
          accessor: 'dateOfApproval',
          Cell: DateCell,
          Filter: DateColumnFilter,
          filter: dateBetweenFilterFn
          // filter: dateBetweenFilterFn
        },
        {
          Header: 'Amount Deducted',
          accessor: 'fsCodeTotalDeduction',
          Cell: ({ value }) => {
            return (
              <span className="font-bold text-red-400">
                {' '}
                {formatAmount(value)}
              </span>
            );
          },
          Footer: info => {
            // Only calculate total visits if rows change
            const total = useMemo(
              () =>
                info.rows.reduce(
                  (sum, row) => row.values.fsCodeTotalDeduction + sum,
                  0
                ),
              [info.rows]
            );

            return (
              <span className="font-bold text-yellow-700 text-sm">
                Total Deduction:
                {formatAmount(total)}
              </span>
            );
          }
        },

        {
          Header: 'Action',
          accessor: '',
          Cell: ({ row }) => {
            let ID = row.original.ID;
            return (
              <Link to={`/app/checkout?ID=${ID}`}>
                <button className="btn btn-sm ">View</button>
              </Link>
            );
          }
        }
      ],
      []
    );

    const [deductionList, setDeductionList] = useState([]);

    const listDeductionHistory = async () => {
      let res = await axios({
        method: 'GET',
        url: 'payout/listDeductionHistory'
      });

      let data = res.data.data;
      setDeductionList(data);
    };

    useEffect(() => {
      if (openTab === 3) {
        listDeductionHistory();
      }
    }, []);

    let filteredPayoutList = [];

    return (
      <div>
        <div className="">
          <div
            className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4"
            role="alert">
            <p className="font-bold">Note</p>
            <ul class="list-disc ml-4">
              <li>This table shows the balance of your Free Slot Account</li>
            </ul>
          </div>
          <Table
            style={{ overflow: 'wrap' }}
            className="table-sm"
            columns={columns}
            data={deductionList}
          />
        </div>
      </div>
    );
  };

  return (
    !!isLoaded && (
      <div>
        <div
          className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4"
          role="alert">
          <p className="font-bold">Reminder</p>
          <ul class="list-disc ml-4">
            <li>
              The Encashment Module will be active from 12:00 AM very Monday
              until 11:59 PM on Tuesday (weekly). Please ensure all payout
              request are made before Wednesday.
            </li>
          </ul>
        </div>
        <TitleCard
          title=""
          topMargin="mt-2"
          TopSideButtons={<TopSideButtons />}>
          <div className="">
            <div className="">
              <ul
                className="flex mb-0 list-none flex-wrap pt-0 pb-4 flex-row"
                role="tablist">
                <li className="">
                  <a
                    className={
                      'text-xs font-bold uppercase px-5 py-3 shadow-sm rounded block leading-normal ' +
                      (openTab === 1
                        ? 'text-white bg-slate-700 rounded-lg shadow-lg'
                        : 'text-slate-700 bg-slate-200 shadow-md')
                    }
                    onClick={e => {
                      e.preventDefault();
                      setOpenTab(1);
                    }}
                    data-toggle="tab"
                    href="#link1"
                    role="tablist">
                    {/* <i className="fa-solid fa-check-to-slot mr-2"></i> */}
                    Encashment List
                  </a>
                </li>
                <li className="">
                  <a
                    className={
                      'text-xs font-bold uppercase px-5 py-3 shadow-sm rounded block leading-normal ' +
                      (openTab === 2
                        ? 'text-white bg-slate-700 rounded-lg shadow-lg'
                        : 'text-slate-700 bg-slate-200 shadow-md')
                    }
                    onClick={e => {
                      e.preventDefault();
                      setOpenTab(2);
                    }}
                    data-toggle="tab"
                    href="#link2"
                    role="tablist">
                    {/* <i className="fa-solid fa-hourglass-half mr-2"></i> */}
                    Gift Cheque List
                  </a>
                </li>

                {userActiveCode.type === 'FREE_SLOT' && (
                  <li className="">
                    <a
                      className={
                        'text-xs font-bold uppercase px-5 py-3 shadow-sm rounded block leading-normal ' +
                        (openTab === 3
                          ? 'text-white bg-slate-700 rounded-lg shadow-lg'
                          : 'text-slate-700 bg-slate-200 shadow-md')
                      }
                      onClick={e => {
                        e.preventDefault();
                        setOpenTab(3);
                      }}
                      data-toggle="tab"
                      href="#link2"
                      role="tablist">
                      {/* <i className="fa-solid fa-hourglass-half mr-2"></i> */}
                      Commission Deduction History
                    </a>
                  </li>
                )}
              </ul>
              <div className="">
                <div className="">
                  <div>
                    <div
                      className={openTab === 1 ? 'block' : 'hidden'}
                      id="link1">
                      <TablePayoutList />
                    </div>
                    <div
                      className={openTab === 2 ? 'block' : 'hidden'}
                      id="link2">
                      {' '}
                      <TablePayoutList type="giftChequeIncome" />
                    </div>
                    <div
                      className={openTab === 3 ? 'block' : 'hidden'}
                      id="link2">
                      {' '}
                      <DeductionHistoryList openTab={openTab} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TitleCard>
        <dialog id="createPayoutRequestModal" className="modal">
          <div className="modal-box w-11/12 max-w-5xl">
            <h2 className="mb-2 text-2xl font-bold text-gray-700 dark:text-gray-400">
              Create Payout
            </h2>
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
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
                isSubmitting,
                isValid
              }) => {
                let giftChequeTotal = cart.list.find(p => {
                  return p.name === 'giftChequeIncome';
                });
                let computationError =
                  (errors.totalAmountToWithdrawList || []).length > 0;

                return (
                  <Form>
                    <div className=" bg-gray-100 pt-5 p-4">
                      <div className="mx-auto max-w-5xl justify-center px-6 md:flex md:space-x-6 xl:px-0">
                        <div className="rounded-lg md:w-2/3">
                          <FieldArray
                            name="totalAmountToWithdrawList"
                            render={arrayHelpers => {
                              let filtered = cart.list.reduce(
                                (acc, current) => {
                                  if (current.name !== 'giftChequeIncome') {
                                    return [...acc, current];
                                  } else {
                                    return acc;
                                  }
                                },
                                []
                              );

                              return filtered.map((item, index) => {
                                return (
                                  <PackageCart
                                    key={item?.ID}
                                    data={item}
                                    cartState={cart}
                                    index={index}
                                    errors={errors}
                                    touched={touched}
                                    values={values}
                                    setFieldValue={setFieldValue}
                                  />
                                );
                              });
                            }}></FieldArray>
                        </div>

                        <div className="mt-6 h-full rounded-lg border bg-white p-6 shadow-md md:mt-0 md:w-1/3">
                          <h2 className="mb-8 text-2xl font-bold text-gray-700 dark:text-gray-400">
                            Order Summary
                          </h2>
                          <div className="mb-2 flex justify-between">
                            <p className="text-gray-700">Subtotal</p>
                            <p className="text-gray-700">
                              {!computationError
                                ? formatAmount(cart?.total)
                                : 0}
                            </p>
                          </div>
                          {/* <div className="mb-2 flex justify-between">
                            <p className="text-gray-700">Gift Cheque</p>
                            <p className="text-gray-700">
                              {' '}
                              +{' '}
                              {formatAmount(
                                giftChequeTotal && giftChequeTotal.quantity
                              )}
                            </p>
                          </div> */}
                          <div className="mb-2 flex justify-between">
                            <p className="text-gray-700">Service Fee (10%)</p>

                            {!computationError ? (
                              <p className="text-gray-700">
                                {' '}
                                {formatAmount(cart?.serviceFeeTotalDeduction)}
                              </p>
                            ) : (
                              0
                            )}
                          </div>
                          <div className="mb-2 flex justify-between">
                            <p className="text-gray-700">Processing Fee</p>

                            {!computationError ? (
                              <p className="text-gray-700">
                                {formatAmount(
                                  cart?.processingFeeTotalDeduction
                                )}
                              </p>
                            ) : (
                              0
                            )}
                          </div>
                          <div className="mb-2 flex justify-between">
                            <p className="text-gray-700">
                              {' '}
                              Commission Deduction (10%)
                            </p>

                            {!computationError ? (
                              <p className="text-gray-700">
                                {' '}
                                {formatAmount(cart?.commissionDeductionFee)}
                              </p>
                            ) : (
                              0
                            )}
                          </div>

                          <hr className="my-4" />
                          <div className="flex justify-between">
                            <p className="text-lg font-bold">Grand Total</p>
                            <div className="">
                              {!computationError ? (
                                <p className="mb-1 text-lg font-bold">
                                  {cart?.grandTotal > 0
                                    ? formatAmount(cart?.grandTotal)
                                    : 0}
                                </p>
                              ) : (
                                0
                              )}

                              {/* <p className="text-sm text-gray-700">including VAT</p> */}
                            </div>
                          </div>
                          {errors.totalAmountToWithdrawList &&
                            errors.totalAmountToWithdrawList.length > 0 && (
                              <div
                                className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4"
                                role="alert">
                                <p className="font-bold">Error</p>
                                <p>
                                  Please correct the errors before submitting
                                </p>
                                <ul class="list-disc ml-4">
                                  <li>At least one field is required</li>
                                  <li>Minimum and maximum amount are meet</li>
                                </ul>
                              </div>
                            )}

                          <button
                            type="submit"
                            onClick={e => {
                              if (isValid) {
                                setFieldValue('cartState', cart);
                              }

                              if (isSubmitting) {
                                e.preventDefault();
                              }
                            }}
                            disabled={isSubmitting}
                            className="mt-6 w-full rounded-md bg-blue-500 py-2 font-medium text-blue-50 hover:bg-blue-600">
                            Submit
                          </button>
                        </div>
                      </div>
                    </div>
                  </Form>
                );
              }}
            </Formik>
          </div>
        </dialog>
        <dialog id="createGiftChequeRequestModal" className="modal">
          <div className="modal-box w-11/12 max-w-5xl">
            <h2 className="mb-2 text-2xl font-bold text-gray-700 dark:text-gray-400">
              Gift Cheque Request
            </h2>
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
            <Formik {...formikConfigGiftCheque}>
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
                isValid
              }) => {
                let giftChequeTotal = cart.list.find(p => {
                  return p.name === 'giftChequeIncome';
                });
                let computationError =
                  (errors.totalAmountToWithdrawList || []).length > 0;

                return (
                  <Form>
                    <div className=" bg-gray-100 pt-5 p-4">
                      <div className="mx-auto max-w-5xl justify-center px-6 md:flex md:space-x-6 xl:px-0">
                        <div className="rounded-lg md:w-2/3">
                          <FieldArray
                            name="totalAmountToWithdrawList"
                            render={arrayHelpers => {
                              let filtered = cart.list.reduce(
                                (acc, current) => {
                                  if (current.name === 'giftChequeIncome') {
                                    return [...acc, current];
                                  } else {
                                    return acc;
                                  }
                                },
                                []
                              );

                              return filtered.map((item, index) => {
                                return (
                                  <PackageCart
                                    key={item?.ID}
                                    data={item}
                                    cartState={cart}
                                    index={index}
                                    errors={errors}
                                    touched={touched}
                                    values={values}
                                    setFieldValue={setFieldValue}
                                  />
                                );
                              });
                            }}></FieldArray>
                        </div>

                        <div className="mt-6 h-full rounded-lg border bg-white p-6 shadow-md md:mt-0 md:w-1/3">
                          <h2 className="mb-8 text-2xl font-bold text-gray-700 dark:text-gray-400">
                            Order Summary
                          </h2>
                          <div className="mb-2 flex justify-between">
                            <p className="text-gray-700">Subtotal</p>
                            <p className="text-gray-700">
                              {!computationError
                                ? formatAmount(
                                    values.totalAmountToWithdrawList['0']
                                      .quantity
                                  )
                                : 0}
                            </p>
                          </div>

                          <hr className="my-4" />
                          <div className="flex justify-between">
                            <p className="text-lg font-bold">Grand Total</p>
                            <div className="">
                              <p className="text-gray-700">
                                {!computationError
                                  ? formatAmount(
                                      values.totalAmountToWithdrawList['0']
                                        .quantity
                                    )
                                  : 0}
                              </p>
                            </div>
                          </div>
                          {errors.totalAmountToWithdrawList &&
                            errors.totalAmountToWithdrawList.length > 0 && (
                              <div
                                className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4"
                                role="alert">
                                <p className="font-bold">Error</p>
                                <p>
                                  Please correct the errors before submitting
                                </p>
                                <ul class="list-disc ml-4">
                                  <li>At least one field is required</li>
                                  <li>Minimum and maximum amount are meet</li>
                                </ul>
                              </div>
                            )}

                          <button
                            type="submit"
                            onClick={e => {
                              if (isValid) {
                                setFieldValue('cartState', cart);
                              }

                              if (isSubmitting) {
                                e.preventDefault();
                              }
                            }}
                            disabled={isSubmitting}
                            className="mt-6 w-full rounded-md bg-blue-500 py-2 font-medium text-blue-50 hover:bg-blue-600">
                            Submit
                          </button>
                        </div>
                      </div>
                    </div>
                  </Form>
                );
              }}
            </Formik>
          </div>
        </dialog>
        <ToastContainer />
      </div>
    )
  );
}

export default InternalPage;
