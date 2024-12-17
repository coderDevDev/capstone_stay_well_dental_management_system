import moment from 'moment';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TitleCard from '../../../components/Cards/TitleCard';
import { showNotification } from '../../common/headerSlice';

import CheckBadgeIcon from '@heroicons/react/24/outline/CheckBadgeIcon';
import InputText from '../../../components/Input/InputText';
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';
import Dropdown from '../../../components/Input/Dropdown';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { format, formatDistance, formatRelative, subDays } from 'date-fns';
import ViewColumnsIcon from '@heroicons/react/24/outline/EyeIcon';
import PlusCircleIcon from '@heroicons/react/24/outline/PlusCircleIcon';
import TrashIcon from '@heroicons/react/24/outline/InboxArrowDownIcon';
import { NavLink, Routes, Link, useLocation } from 'react-router-dom';

import { CompactTable } from '@table-library/react-table-library/compact';

import { useReactToPrint } from 'react-to-print';

import Table, {
  AvatarCell,
  SelectColumnFilter,
  StatusPill,
  DateCell
} from '../../../pages/protected/DataTables/Table'; // new
import QRCode from 'react-qr-code';

const nodes = [
  {
    id: '0',
    name: 'Shopping List',
    deadline: new Date(2020, 1, 15),
    type: 'TASK',
    isComplete: true,
    nodes: 3
  }
];

const COLUMNS = [
  { label: 'Task', renderCell: item => item.name },
  {
    label: 'Deadline',
    renderCell: item =>
      item.deadline.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
  },
  { label: 'Type', renderCell: item => item.type },
  {
    label: 'Complete',
    renderCell: item => item.isComplete.toString()
  },
  { label: 'Tasks', renderCell: item => item.nodes }
];

const getStatus = status => {
  if (status === 'AVAILABLE')
    return (
      <div className="badge badge-outline text-green-600 font-bold">
        <i class="fa-solid fa-user-check mr-2"></i>
        {status}
      </div>
    );
  if (status === 'USED')
    return (
      <div className="badge badge-outline text-red-600 font-bold">
        <i class="fa-solid fa-user-slash mr-2"></i>

        {status}
      </div>
    );
  else return <div className="badge badge-ghost">{status}</div>;
};

const CodeTableComponent = ({ data, appSettings, componentPDF }) => {
  let { codeTypeList, packageList } = appSettings;

  const columns = useMemo(
    () => [
      {
        Header: 'QR Code',
        accessor: 'name',
        Cell: AvatarCell,
        imgAccessor: 'imgUrl',
        emailAccessor: 'email'
      },
      {
        Header: 'Type',
        accessor: 'type',
        Filter: SelectColumnFilter, // new,
        Cell: ({ value }) => {
          return <span className="font-bold text-slate-700">{value}</span>;
        }
      },

      {
        Header: 'Package',
        accessor: 'packageType',
        Filter: SelectColumnFilter, // new
        // filter: 'includes',
        Cell: ({ value }) => {
          let pt = packageList.find(p => {
            return p.name === value;
          });

          return (
            <span className="font-bold text-slate-600">
              {pt && pt.displayName}
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
        Cell: StatusPill,
        Filter: SelectColumnFilter
      }
    ],
    []
  );
  // const tableData = useMemo(() => getData(), []);
  return (
    <div>
      <div ref={componentPDF} style={{ width: '100%' }}>
        <Table columns={columns} data={data} />
      </div>
    </div>
  );
};

const PendingCodeBundleTableComponent = ({
  data,
  appSettings,
  setPendingCodesInModalView
}) => {
  let { codeTypeList, packageList } = appSettings;
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log({ data });
  const columns = useMemo(
    () => [
      {
        Header: 'Bundle Name',
        accessor: 'displayName',
        Filter: SelectColumnFilter, // new,
        Cell: ({ value }) => {
          return <span className="font-bold text-slate-700">{value}</span>;
        }
      },
      {
        Header: 'Total Code',
        accessor: '',
        Filter: SelectColumnFilter, // new,
        Cell: ({ value, row }) => {
          let total = row.original.codeList.length;
          return <span className="font-bold text-slate-700">{total}</span>;
        }
      },
      {
        Header: 'Date Created',
        accessor: 'dateTimeAdded',
        Cell: DateCell
      },
      {
        Header: 'Action',
        accessor: '',
        Filter: SelectColumnFilter, // new,
        Cell: ({ value, row }) => {
          let bundle = row.original;

          console.log(bundle);
          return (
            <div className="flex">
              {/* <button
                className="btn btn-sm"
                onClick={() => {
                  openModal(bundle.bundleId);
                }}>
                View
                <ViewColumnsIcon className="h-4 w-4 text-blue-500" />
              </button> */}

              <button
                className="btn btn-sm ml-2"
                disabled={isSubmitting}
                onClick={async () => {
                  if (!isSubmitting) {
                    await sendConfirmationForApproval(bundle.bundleId);
                  }
                }}>
                Send
                <TrashIcon className="h-4 w-4 text-green-500" />
              </button>
            </div>
          );
        }
      }
    ],
    []
  );
  const openModal = bundleId => {
    document.getElementById('viewPendingCodeModal').showModal();

    let selectedBundle = data.find(b => {
      return bundleId === b.bundleId;
    });

    setPendingCodesInModalView(selectedBundle.codeList);
  };

  const sendConfirmationForApproval = async bundleId => {
    setIsSubmitting(true);
    try {
      let res = await axios({
        method: 'POST',
        url: 'code/sendConfirmationForApproval',
        data: {
          bundleId
        }
      });
      toast.success('Email Sent Successfuly', {
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
      toast.error('Something went wrong', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return <Table columns={columns} data={data} />;
};

function CodeGenerator() {
  const appSettings = useSelector(state => state.appSettings);

  const [openTab, setOpenTab] = useState(1);

  const [isLoaded, setIsLoaded] = useState(false);

  const [codeList, setCodes] = useState([]);
  const fetchCodes = async () => {
    let res = await axios({
      method: 'POST',
      url: 'code/getCodeList'
    });
    let codes = res.data.data;
    setCodes(codes);
    setIsLoaded(true);
  };
  useEffect(() => {
    fetchCodes();
  }, []);

  const [pendingCodeList, setPendingCodes] = useState([]);
  const [pendingCodeListModalView, setPendingCodesInModalView] = useState([]);
  const fetchPendingCodes = async () => {
    let res = await axios({
      method: 'POST',
      url: 'code/getPendingCodeList'
    });
    let codes = res.data.data;
    setPendingCodes(codes);
    setIsLoaded(true);
  };
  useEffect(() => {
    fetchPendingCodes();
  }, []);

  const componentPDF = useRef();
  const generatePDF = useReactToPrint({
    content: () => componentPDF.current,
    documentTitle: 'Userdata'
    // onAfterPrint: () => alert('Data saved in PDF')
  });

  const TopSideButtons = () => {
    const dispatch = useDispatch();

    const openAddNewModal = () => {
      document.getElementById('createCodeModal').showModal();
    };

    return (
      <div className="inline-block float-right ">
        <button className="btn btn-sm mt-2 mr-2" onClick={openAddNewModal}>
          <i className="fa-solid fa-circle-plus mr-1 "></i>
          Create
        </button>

        <button
          className="btn btn-sm mt-2 justify-end 
           float-right"
          onClick={generatePDF}>
          <i class="fa-solid fa-print text-warning"></i>
          Print
        </button>
      </div>
    );
  };

  const formikConfig = {
    initialValues: {
      codeType: '',
      packageType: '',
      quantity: 20
    },
    validationSchema: Yup.object({
      codeType: Yup.string().required('Required'),
      packageType: Yup.string().required('Required'),
      quantity: Yup.number().required('Required')
    }),
    // validateOnMount: true,
    // validateOnChange: false,
    onSubmit: async (values, { setSubmitting, errors }) => {
      setSubmitting(true);
      try {
        let res = await axios({
          method: 'POST',
          url: 'code/generateCodeBundle',
          data: values
        });
        fetchCodes();
        fetchPendingCodes();
        toast.success('Created Successfully', {
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
        toast.error('Something went wrong', {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light'
        });
      } finally {
        setSubmitting(false);
        document.getElementById('createCodeModal').close();
      }
    }
  };

  return (
    <div>
      {isLoaded && (
        <div>
          <ToastContainer />
          <TitleCard
            title="Code Generator"
            topMargin="mt-2"
            TopSideButtons={TopSideButtons()}>
            <div className="">
              <div className="flex flex-wrap">
                <div className="w-full">
                  <ul
                    className="flex mb-0 list-none flex-wrap pt-0 pb-4 flex-row"
                    role="tablist">
                    <li className="mr-2 last:mr-0 flex-auto text-center">
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
                        <i className="fa-solid fa-check-to-slot mr-2"></i>
                        Generated
                      </a>
                    </li>
                    <li className="-mb-px mr-2 last:mr-0 flex-auto text-center">
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
                        <i className="fa-solid fa-hourglass-half mr-2"></i>
                        Pending
                      </a>
                    </li>
                  </ul>
                  <div className="">
                    <div className="w-full">
                      <div>
                        <div
                          className={openTab === 1 ? 'block' : 'hidden'}
                          id="link1">
                          <div className="w-full">
                            {/* <CompactTable columns={COLUMNS} />; */}

                            <CodeTableComponent
                              data={codeList}
                              appSettings={appSettings}
                              setPendingCodesInModalView={
                                setPendingCodesInModalView
                              }
                              componentPDF={componentPDF}
                            />
                          </div>
                        </div>
                        <div
                          className={openTab === 2 ? 'block' : 'hidden'}
                          id="link2">
                          <PendingCodeBundleTableComponent
                            data={pendingCodeList}
                            appSettings={appSettings}
                            setPendingCodesInModalView={
                              setPendingCodesInModalView
                            }
                          />
                        </div>
                        <div
                          className={openTab === 3 ? 'block' : 'hidden'}
                          id="link3">
                          3
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TitleCard>
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
              let { codeTypeList, packageList } = appSettings;

              let updatedPackageList = packageList;

              if (values.codeType === 'FREE_SLOT') {
                updatedPackageList = packageList.filter(p => {
                  return p.name === 'package_10';
                });
              }
              return (
                <dialog
                  id="createCodeModal"
                  className="modal modal-bottom sm:modal-middle">
                  <div className="modal-box w-11/12 max-w-3xl">
                    <form method="dialog">
                      {/* if there is a button in form, it will close the modal */}
                      <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                        ✕
                      </button>
                    </form>
                    <h3 className="font-bold text-lg">Generate Code(s)</h3>
                    <div className="divider"></div>
                    <Form>
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-2 ">
                        <Dropdown
                          // icons={mdiAccount}
                          label="Code Type"
                          name="codeType"
                          type="text"
                          placeholder=""
                          value={values.codeType}
                          setFieldValue={setFieldValue}
                          onBlur={handleBlur}
                          options={codeTypeList.map(val => {
                            return {
                              value: val.name,
                              label: val.displayName
                            };
                          })}
                          affectedInput="codeType"
                          affectedInputValue="codeType"
                        />
                        <Dropdown
                          label="Amulet Package"
                          name="packageType"
                          type="text"
                          placeholder=""
                          value={values.packageType}
                          setFieldValue={setFieldValue}
                          onBlur={handleBlur}
                          options={updatedPackageList.map(val => {
                            return {
                              value: val.name,
                              label: val.displayName
                            };
                          })}
                          affectedInput="packageType"
                          affectedInputValue="packageType"
                        />
                      </div>
                      <InputText
                        // icons={mdiEmailCheckOutline}

                        label="Quantity"
                        name="quantity"
                        type="number"
                        placeholder=""
                        min="1"
                        max="100"
                        value={values.quantity}

                      // onChange={handleEmailChange}
                      />
                      <button
                        type="submit"
                        className="btn mt-2 justify-end  btn-neutral float-right"
                        disabled={isSubmitting}>
                        Submit
                      </button>
                    </Form>
                  </div>
                </dialog>
              );
            }}
          </Formik>

          <dialog
            id="viewPendingCodeModal"
            className="modal modal-bottom sm:modal-middle">
            <div className="modal-box w-11/12 max-w-3xl">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                  ✕
                </button>
              </form>
              <h3 className="font-bold text-lg">List of Code(s)</h3>
              <div className="divider"></div>

              <CodeTableComponent
                data={pendingCodeList}
                appSettings={appSettings}
                setPendingCodesInModalView={setPendingCodesInModalView}
              />
            </div>
          </dialog>
        </div>
      )}
    </div>
  );
}

export default CodeGenerator;
