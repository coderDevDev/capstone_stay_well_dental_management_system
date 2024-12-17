import { useEffect, useMemo, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';

import { format, formatDistance, formatRelative, subDays } from 'date-fns';

import { formatAmount } from '../../features/dashboard/helpers/currencyFormat';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import { useLocation } from 'react-router';
import CheckBadgeIcon from '@heroicons/react/24/outline/CheckBadgeIcon';
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';
import Dropdown from '../../components/Input/Dropdown';
import InputText from '../../components/Input/InputText';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Table, {
  AvatarCell,
  SelectColumnFilter,
  StatusPill,
  DateCell
} from '../../pages/protected/DataTables/Table';

function InternalPage() {
  const dispatch = useDispatch();
  const cart = useSelector(state => state.cart);
  const [isLoaded, setIsLoaded] = useState(false);

  const [payoutData, setPayoutData] = useState([]);
  let userDetails = JSON.parse(localStorage.getItem('loggedInUser'));
  const [statusOptions, setStatusOptions] = useState([
    {
      value: 'APPROVED',
      label: 'Approve'
    },
    {
      value: 'HOLD',
      label: 'Hold'
    }
  ]);
  const search = useLocation().search;
  const ID = new URLSearchParams(search).get('ID');

  const getPayout = async () => {
    let res = await axios({
      method: 'GET',
      url: `payout/getPayout/${ID}`
    });
    let data = res.data.data;

    console.log(data);
    if (data.status === 'APPROVED') {
      setStatusOptions([
        {
          value: 'COMPLETED',
          label: 'Completed'
        }
        // {
        //   value: 'DENIED',
        //   label: 'Deny'
        // }
      ]);
    }

    if (data.status === 'COMPLETED') {
      setStatusOptions([]);
    }

    if (data.status === 'HOLD' || data.status === 'HOLD') {
      setStatusOptions([
        {
          value: 'UNHOLD',
          label: 'Unhold'
        }
      ]);
    }

    setPayoutData(data);
    setIsLoaded(true);
  };

  const componentPDF = useRef();
  const generatePDF = useReactToPrint({
    content: () => componentPDF.current,
    documentTitle: 'Userdata'
    // onAfterPrint: () => alert('Data saved in PDF')
  });

  useEffect(() => {
    dispatch(setPageTitle({ title: 'Invoice' }));
    getPayout();
  }, []);

  let userInfo = payoutData.userInfo;

  console.log({ payoutData });

  let taskReward = (payoutData.rawData || []).find(
    n => n.name === 'dailyBonus'
  );

  let binaryIncome = (payoutData.rawData || []).find(
    n => n.name === 'binaryIncome'
  );

  let giftChequeIncome = (payoutData.rawData || []).find(
    n => n.name === 'giftChequeIncome'
  );

  let computationConfig = payoutData.computationConfig;

  let subTotal = (payoutData.rawData || []).reduce((acc, current) => {
    return acc + current.quantity;
  }, 0);

  let rawTotalIncome =
    (payoutData.rawData || []).reduce(
      (acc, current) => {
        return acc + current.quantity;
      },

      0
    ) || 0;

  let serviceFee = computationConfig?.serviceFee;
  let processFee = computationConfig?.processFee;

  let serviceFeeTotalDeduction = rawTotalIncome * serviceFee;

  let fsCodeTotalDeduction = payoutData.fsCodeTotalDeduction || 0;

  let totalDeduction = serviceFeeTotalDeduction + processFee;

  let grandTotal = rawTotalIncome - totalDeduction - fsCodeTotalDeduction;

  const formikConfig = {
    initialValues: {
      status: '',
      remarks: ''
    },
    validationSchema: Yup.object({
      status: Yup.string().required('Required'),
      remarks: Yup.string().required('Required')
    }),
    onSubmit: async (
      values,
      { setSubmitting, errors, setFieldError, resetForm }
    ) => {
      try {
        setSubmitting(true);

        console.log({ values });
        await axios({
          method: 'POST',
          url: 'admin/payout/changePayoutStatus',
          data: {
            ID: payoutData.ID,
            status: values.status,
            remarks: values.remarks
          }
        });
        document.getElementById('approveRequestModal').close();
        toast.success('Updated Successfully', {
          onClose: () => {
            setSubmitting(false);
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
        window.location.reload();
      } catch (error) {
        console.log(error);
        toast.error('Something went wrong', {
          onClose: () => {
            setSubmitting(false);
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
      } finally {
        // setSubmitting(false);
      }
    }
  };
  return (
    !!isLoaded && (
      <div>
        <div className="max-w-[85rem] px-2 sm:px-6 lg:px-8 mx-auto my-4 sm:my-10 mt-0">
          <div className="sm:w-11/12 lg:w-3/4 mx-auto">
            <div className="mt-2 flex justify-end gap-x-3 mb-4">
              {payoutData.status !== 'COMPLETED' &&
                userDetails.role === 'super_admin' ? (
                <button
                  className="btn bg-green-500  font-bold btn-md text-white"
                  onClick={() => {
                    console.log('Dex');
                    document.getElementById('approveRequestModal').showModal();
                  }}>
                  <i className="fa-solid fa-circle-info fa-2xl"></i>
                  Update status
                </button>
              ) : (
                <div>{/* <StatusPill value={payoutData.status} /> */}</div>
              )}

              <a
                className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                href="#"
                onClick={generatePDF}>
                <svg
                  className="flex-shrink-0 size-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect width="12" height="8" x="6" y="14" />
                </svg>
                Print
              </a>
            </div>
            {/* <!-- Card --> */}
            <div
              ref={componentPDF}
              className="flex flex-col p-4 sm:p-10 bg-white shadow-md rounded-xl dark:bg-gray-800">
              {/* <!-- Grid --> */}
              <div className="flex justify-between">
                <div>
                  <img
                    className="mask mask-squircle w-20 "
                    src="/system_logo.jpg"
                    alt="Logo"></img>
                  {/* <h1 className="mt-2 text-lg md:text-xl font-semibold text-base-600 dark:text-white font-bold">
                    Amulet
                  </h1> */}
                </div>
                {/* <!-- Col --> */}

                <div className="text-end">
                  <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-200">
                    Invoice Code
                  </h2>
                  <span className="mt-1 block text-gray-500">
                    {payoutData.invoiceCode}
                  </span>
                  {/* 
            <address className="mt-4 not-italic text-gray-800 dark:text-gray-200">
              45 Roker Terrace<br>
              Latheronwheel<br>
              KW5 8NW, London<br>
              United Kingdom<br>
            </address> */}
                </div>
                {/* <!-- Col --> */}
              </div>
              {/* <!-- End Grid -->

        <!-- Grid --> */}
              <div className="mt-8 grid sm:grid-cols-2 gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Bill to:
                  </h3>
                  <h3 className="text-lg text-blue-900 dark:text-blue-900 font-bold">
                    {userInfo.firstName} {userInfo.lastName}
                  </h3>
                  <address className="mt-2 not-italic text-gray-500">
                    {userInfo.address}
                  </address>
                </div>
                {/* <!-- Col --> */}

                <div className="sm:text-end space-y-2">
                  {/* <!-- Grid --> */}
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-2">
                    <dl className="grid sm:grid-cols-5 gap-x-3">
                      <dt className="col-span-3 font-semibold text-gray-800 dark:text-gray-200">
                        Invoice Date
                      </dt>
                      <dd className="col-span-2 text-gray-500 text-sm">
                        {format(
                          payoutData.dateTimeAdded,
                          'MMM dd, yyyy hh:mm:ss a'
                        )}
                      </dd>
                    </dl>

                    {payoutData.dateOfApproval && (
                      <dl className="grid sm:grid-cols-5 gap-x-3">
                        <dt className="col-span-3 font-semibold text-gray-800 dark:text-gray-200">
                          Approval Date
                        </dt>
                        <dd className="col-span-2 text-gray-500 text-sm">
                          {format(
                            payoutData.dateOfApproval,
                            'MMM dd, yyyy hh:mm:ss a'
                          )}
                        </dd>
                      </dl>
                    )}

                    {payoutData.dateCompleted && (
                      <dl className="grid sm:grid-cols-5 gap-x-3">
                        <dt className="col-span-3 font-semibold text-gray-800 dark:text-gray-200">
                          Date Completed
                        </dt>
                        <dd className="col-span-2 text-gray-500 text-sm">
                          {format(
                            payoutData.dateCompleted,
                            'MMM dd, yyyy hh:mm:ss a'
                          )}
                        </dd>
                      </dl>
                    )}
                    <dl className="grid sm:grid-cols-5 gap-x-3">
                      <dt className="col-span-3 font-semibold text-gray-800 dark:text-gray-200">
                        Status
                      </dt>
                      <dd className="col-span-2 text-gray-500 text-sm">
                        {' '}
                        <StatusPill value={payoutData.status} />
                      </dd>
                    </dl>
                    <dl className="grid sm:grid-cols-5 gap-x-3">
                      <dt className="col-span-3 font-semibold text-gray-800 dark:text-gray-200">
                        Code Type
                      </dt>
                      <dd className="col-span-2 text-gray-500 text-sm">
                        {' '}
                        <StatusPill value={userInfo.type} />
                      </dd>
                    </dl>
                  </div>
                  {/* <!-- End Grid --> */}
                </div>
                {/* <!-- Col --> */}
              </div>
              {/* <!-- End Grid -->

        <!-- Table --> */}
              <div className="mt-6">
                <div className="border border-gray-200 p-4 rounded-lg space-y-4 dark:border-gray-700">
                  <div className="hidden sm:grid sm:grid-cols-5">
                    <div className="sm:col-span-2 text-xs font-medium text-gray-500 uppercase">
                      Type
                    </div>

                    <div className="text-end text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </div>
                  </div>

                  {payoutData.type !== 'giftChequeIncome' ? (
                    <div>
                      <div className="hidden sm:block border-b border-gray-200 dark:border-gray-700"></div>

                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        <div className="col-span-full sm:col-span-2">
                          <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">
                            Item
                          </h5>
                          <p className="font-medium text-gray-800 dark:text-gray-200">
                            Task Rewards
                          </p>
                        </div>

                        <div>
                          <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">
                            Amount
                          </h5>
                          <p className="sm:text-end text-gray-800 dark:text-gray-200">
                            {formatAmount(taskReward?.quantity)}
                          </p>
                        </div>
                      </div>

                      <div className="sm:hidden border-b border-gray-200 dark:border-gray-700"></div>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        <div className="col-span-full sm:col-span-2">
                          <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">
                            Sales Type
                          </h5>
                          <p className="font-medium text-gray-800 dark:text-gray-200">
                            Binary Income
                          </p>
                        </div>

                        <div>
                          <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">
                            Amount
                          </h5>
                          <p className="sm:text-end text-gray-800 dark:text-gray-200">
                            {formatAmount(binaryIncome.quantity)}
                          </p>
                        </div>
                      </div>

                      <div className="sm:hidden border-b border-gray-200 dark:border-gray-700"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      <div className="col-span-full sm:col-span-2">
                        <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">
                          Item
                        </h5>
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          Gift Cheque
                        </p>
                      </div>

                      <div>
                        <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase">
                          Amount
                        </h5>
                        <p className="sm:text-end text-gray-800 dark:text-gray-200">
                          {formatAmount(giftChequeIncome?.quantity)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* <!-- End Table -->

        <!-- Flex --> */}
              <div className="mt-8 flex sm:justify-end">
                <div className="w-full max-w-2xl sm:text-end space-y-2">
                  {/* <!-- Grid --> */}
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-2">
                    <dl className="grid sm:grid-cols-5 gap-x-3">
                      <dt className="col-span-3 font-semibold text-gray-800 dark:text-gray-200">
                        Subtotal
                      </dt>
                      <dd className="col-span-2 text-gray-500 font-bold">
                        {' '}
                        {formatAmount(subTotal)}
                      </dd>
                    </dl>

                    <dl className="grid sm:grid-cols-5 gap-x-3">
                      <dt className="col-span-3 font-semibold text-gray-800 dark:text-gray-200">
                        Processing Fee
                      </dt>
                      <dd className="col-span-2 text-gray-500 font-bold">
                        {' '}
                        - {formatAmount(computationConfig.processFee)}
                      </dd>
                    </dl>

                    <dl className="grid sm:grid-cols-5 gap-x-3">
                      <dt className="col-span-3 font-semibold text-gray-800 dark:text-gray-200">
                        Service Fee
                      </dt>
                      <dd className="col-span-2 text-gray-500 font-bold">
                        {' '}
                        -{' '}
                        {formatAmount(subTotal * computationConfig.serviceFee)}
                      </dd>
                    </dl>

                    {fsCodeTotalDeduction > 0 && (
                      <dl className="grid sm:grid-cols-5 gap-x-3">
                        <dt className="col-span-3 font-semibold text-gray-800 dark:text-gray-200">
                          Commission Deduction
                        </dt>
                        <dd className="col-span-2 text-gray-500 font-bold">
                          {' '}
                          - {formatAmount(fsCodeTotalDeduction)}
                        </dd>
                      </dl>
                    )}
                    <hr />
                    <dl className="grid sm:grid-cols-5 gap-x-3">
                      <dt className="col-span-3 font-semibold text-gray-800 dark:text-gray-200">
                        Grand Total
                      </dt>
                      <dd className="col-span-2 text-green-500 font-bold">
                        {formatAmount(grandTotal)}
                      </dd>
                    </dl>
                  </div>
                  {/* <!-- End Grid --> */}
                </div>
              </div>
              {/* <!-- End Flex --> */}

              <div className="mt-8 sm:mt-12">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Thank you!
                </h4>
                <p className="text-gray-500">
                  If you have any questions concerning this invoice, please
                  contact us.
                </p>
                <div className="mt-2">
                  {/* <p className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                    admin@gmail.com
                  </p>
                  <p className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                    +63 9
                  </p> */}
                </div>
              </div>

              <p className="mt-5 text-sm text-gray-500">© 2024 Amulet.</p>
            </div>
            {/* <!-- End Card -->

      <!-- Buttons --> */}

            {/* <!-- End Buttons --> */}
          </div>
        </div>
        <dialog id="approveRequestModal" className="modal">
          <div className="modal-box">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
            <h2 className="mb-2 text-2xl font-bold text-gray-700 dark:text-gray-400">
              Update status
            </h2>
            <hr />

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
                return (
                  <Form>
                    <div className="mt-8">
                      <Dropdown
                        className="z-50"
                        // icons={mdiMapMarker}
                        label="Status"
                        name="status"
                        value={values.status}
                        setFieldValue={setFieldValue}
                        onBlur={handleBlur}
                        options={statusOptions}
                        allValues={statusOptions}
                      />
                      <InputText
                        // icons={mdiEmailCheckOutline}
                        type="text"
                        label="Remarks"
                        name="remarks"
                        placeholder=""
                        value={values.remarks}
                        onBlur={async e => {
                          // await handleEmailChange(e);
                          await handleBlur(e);
                        }}
                      // onChange={handleEmailChange}
                      />
                      <button
                        type="submit"
                        className="btn mt-2 justify-end  btn-neutral float-right"
                        disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <span className="loading loading-spinner text-white"></span>
                            Processing...
                          </>
                        ) : (
                          <>Submit</>
                        )}
                      </button>
                    </div>
                  </Form>
                );
              }}
            </Formik>

            {/* <div className="modal-action">
              <form method="dialog">
                <button className="btn">Close</button>
              </form>
            </div> */}
          </div>
        </dialog>
        <ToastContainer />
      </div>
    )
  );
  {
    /* <!-- End Invoice --> */
  }
}

export default InternalPage;
