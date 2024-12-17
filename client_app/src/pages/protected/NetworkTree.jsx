import { useEffect, useState, useRef, useSelector } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import Dashboard from '../../features/dashboard/index';
import Tree from 'react-d3-tree';
import axios from 'axios';
import InputText from '../../components/Input/InputText';
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';
import Dropdown from '../../components/Input/Dropdown';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';

import './customTree.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import TitleCard from '../../components/Cards/TitleCard';
import { mdiAccount } from '@mdi/js';
import { format, formatDistance, formatRelative, subDays } from 'date-fns';
import {
  setAppSettings,
  getFeatureList
} from '../../features/settings/appSettings/appSettingsSlice';

import OrgChartTree from './OrgChart';

const renderNodeWithCustomEvents = ({
  nodeDatum,
  toggleNode,
  handleNodeClick,
  setFieldValue,
  setAvailablePosition,
  setIsLoaded,
  packageList
}) => {
  const nodeSize = { x: '17%', y: '25%' };
  const foreignObjectProps = {
    width: nodeSize.x,
    height: nodeSize.y,
    x: -90,
    y: 40
  };
  let aP = packageList.find(p => p.name === nodeDatum.packageType);
  return (
    <g>
      <circle
        // stroke="#a21caf"
        fill="#334155"
        r="35"
        onClick={async () => {
          handleNodeClick(nodeDatum);

          setFieldValue('parentNodeName', nodeDatum.name);
          setFieldValue('parentUserName', nodeDatum.attributes.userName);
          setFieldValue('parentNodeEmail', nodeDatum.attributes.displayID);
          setFieldValue('parentNodeID', nodeDatum.attributes.ID);
        }}
      />
      <text
        fill="#94a3b8"
        fontWeight="bold"
        strokeWidth="0"
        x="-8"
        y="5"
        onClick={async () => {
          handleNodeClick(nodeDatum);

          setFieldValue('parentNodeName', nodeDatum.name);
          setFieldValue('parentUserName', nodeDatum.attributes.userName);
          setFieldValue('parentNodeEmail', nodeDatum.attributes.displayID);
          setFieldValue('parentNodeID', nodeDatum.attributes.ID);
        }}
        fontSize="10">
        {nodeDatum.name &&
          nodeDatum.name
            .match(/\b(\w)/g)
            .join('')
            .toUpperCase()}
      </text>

      {/* <foreignObject {...foreignObjectProps}>
        <text fill="black" x="20" dy="20" strokeWidth="1">
          {nodeDatum.attributes?.displayID}
        </text>
      </foreignObject> */}
      {/* <text fill="black" x="40" dy="20" strokeWidth="0">
        {nodeDatum.attributes?.displayID}
      </text> */}

      <foreignObject {...foreignObjectProps}>
        <div
          onClick={() => {
            navigator.clipboard.writeText(nodeDatum.attributes.ID);
          }}
          style={{
            border: '1px solid black',
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '1px'
            // overflow: 'auto'
          }}>
          <h4
            style={{
              textAlign: 'center',
              fontWeight: 'bold'
              // borderBottom: '1px solid black'
            }}>
            {nodeDatum.name} - {nodeDatum.attributes?.userName}
          </h4>

          <h6 style={{ textAlign: 'center', fontSize: '15px' }}>
            {nodeDatum.packageType}({nodeDatum.codeType})
            {/* {nodeDatum.attributes?.userName} */}
          </h6>
          <h6 style={{ textAlign: 'center', fontSize: '12px' }}></h6>
          <h6 style={{ textAlign: 'center', fontSize: '12px' }}>
            {nodeDatum.attributes?.displayID}
          </h6>
          {/* <h6 style={{ textAlign: 'center', fontSize: '12px' }}>
            {nodeDatum.attributes?.ID}
          </h6> */}

          {/* {nodeDatum.children && (
            <button style={{ width: '100%' }} onClick={toggleNode}>
              {nodeDatum.__rd3t.collapsed ? 'Expand' : 'Collapse'}
            </button>
          )} */}
        </div>
      </foreignObject>

      {/* {nodeDatum.attributes?.displayID && (
        <text fill="black" x="20" dy="20" strokeWidth="1">
          {nodeDatum.attributes?.displayID}
        </text>
      )} */}

      {/* {nodeDatum.attributes?.email && (
      <text fill="black" x="20" dy="20" strokeWidth="1">
        Department: {nodeDatum.attributes?.email}
      </text>
    )} */}
    </g>
  );
};

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function StatusPill({ value }) {
  const status = value ? value.toLowerCase() : 'unknown';

  return (
    <span
      className={classNames(
        'px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm',
        status.startsWith('regular') ? 'bg-green-100 text-green-800' : null,
        status.startsWith('free_slot') ? 'bg-red-100 text-red-800' : null
      )}>
      {status}
    </span>
  );
}

function InternalPage() {
  const dispatch = useDispatch();
  const shouldRecenterTreeRef = useRef(true);
  const [treeTranslate, setTreeTranslate] = useState({ x: 0, y: 0 });
  let treeContainerRef = useRef(null);
  const [treeStucture, setTreeStucture] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [users, setUser] = useState([]);
  const [sponseeCode, setSponseeCode] = useState('');

  let userDetails = JSON.parse(localStorage.getItem('loggedInUser'));

  const [activeNodeId, setActiveNodeId] = useState('');

  const [availablePosition, setAvailablePosition] = useState([
    { value: 'LEFT', label: 'Left' },
    { value: 'RIGHT', label: 'Right' }
  ]);

  const refTree = useRef();
  const [bbox, setBbox] = useState({});
  const [currentTree, setCurrentTree] = useState({});

  useEffect(() => {
    dispatch(setPageTitle({ title: 'Network Tree' }));

    // console.log({ shouldRecenterTreeRef })
    // if (treeContainerRef.current && shouldRecenterTreeRef.current) {
    //   shouldRecenterTreeRef.current = false;
    //   const dimensions = treeContainerRef.current.getBoundingClientRect();
    //   console.log({ dimensions });
    //   setTreeTranslate({
    //     x: dimensions.width / 2,
    //     y: dimensions.height / 8
    //   });
    // }
  }, []);

  const appSettings = {
    codeTypeList: [],
    packageList: []
  };
  const [pairMatchedUsers, setPairMatchedUsers] = useState([]);
  const getTreeStructure = async () => {
    let res = await axios({
      method: 'POST',
      url: 'user/getTreeStructure'
    });
    let treeStucture = res.data.data;

    setTreeStucture(treeStucture);
  };

  const fetchUsers = async () => {
    let res = await axios({
      method: 'POST',
      url: 'user/getMySponseelist',
      data: {
        sponsorIdNumber: ''
      }
    });

    let list = res.data.data
      .filter(({ parentID, isRootNode }) => {
        return !isRootNode && !parentID;
      })
      .map(({ ID, firstName, lastName, code_type, displayID, userName }) => {
        return {
          value: ID,
          label: `${displayID} ${firstName} ${lastName} - (${code_type})`,
          userName: userName
        };
      });

    setUser(list);
  };

  const [networkNode, setNetworkNode] = useState([]);
  const getNetworkNode = async () => {
    let res = await axios({
      method: 'POST',
      url: 'user/getNetworkNodeList'
    });

    let list = res.data.data;

    setNetworkNode(list);
  };

  const [leftFLoaterData, setLeftFLoaterData] = useState([]);
  const fetchFloaterData = async () => {
    let res = await axios({
      method: 'POST',
      url: 'user/listFloaterData',
      data: {
        floaterPosition: 'LEFT'
      }
    });

    let list = res.data.data;

    setLeftFLoaterData(list);
  };

  const [rightFLoaterData, setRightFLoaterData] = useState([]);
  const fetchRightFloaterData = async () => {
    let res = await axios({
      method: 'POST',
      url: 'user/listFloaterData',
      data: {
        floaterPosition: 'RIGHT'
      }
    });

    let list = res.data.data;

    setRightFLoaterData(list);
  };

  let loadAll = async () => {
    await Promise.all([
      getTreeStructure(),
      fetchUsers(),
      getNetworkNode(),
      fetchFloaterData(),
      fetchRightFloaterData()
    ]).then(() => {
      setIsLoaded(true);
    });
  };
  useEffect(() => {
    loadAll();
  }, []);

  const set = () => {
    setBbox(
      currentTree && currentTree.current
        ? currentTree.current.getBoundingClientRect()
        : {}
    );
  };

  const observed = useRef(null);

  useEffect(() => {
    if (isLoaded && observed.current && shouldRecenterTreeRef.current) {
      shouldRecenterTreeRef.current = false;
      const dimensions = observed.current.getBoundingClientRect();
      console.log({ dimensions });
      setTreeTranslate({
        x: dimensions.width / 2,
        y: dimensions.height / 8
      });
    }
  }, [isLoaded]);

  const handleNodeClick = async nodeDatum => {
    if (isLoaded) {
      let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

      if (nodeDatum.children.length < 2) {
        await axios({
          method: 'POST',
          url: 'user/getUserNodeWithChildren',
          data: {
            ID: nodeDatum.attributes.ID
          }
        }).then(res => {
          setAvailablePosition(res.data.data);
          setActiveNodeId(nodeDatum.attributes.ID);
          document.getElementById('createChildModal').showModal();
        });

        // setPairMatchedUsers(nodeDatum.matchingPairs);
        // document.getElementById('viewModal').showModal();
      }
    }
  };

  const formikConfig = {
    initialValues: {
      parentNodeName: '',
      parentUserName: '',
      parentNodeEmail: '',
      targetUserID: '',
      parentNodeID: '',
      position: '',
      code: '',
      childUserName: ''
    },
    validationSchema: Yup.object({
      parentNodeName: Yup.string().required('Required'),
      parentNodeEmail: Yup.string().required('Required'),
      targetUserID: Yup.string().required('Required'),
      parentNodeID: Yup.string().required('Required'),
      position: Yup.string().required('Required')
    }),
    // validateOnMount: true,
    // validateOnChange: false,
    onSubmit: async (
      values,
      { setSubmitting, errors, setFieldError, resetForm }
    ) => {
      try {
        setSubmitting(true);

        let createChildren = await axios({
          method: 'POST',
          url: 'user/createChildren',
          data: {
            parentNodeID: values.parentNodeID,
            position: values.position,
            targetUserID: values.targetUserID,
            code: values.code
          }
        }).then(async result => {
          let { networkID } = result.data.data;

          await axios({
            method: 'POST',
            url: 'user/createFloater',
            data: {
              ID: networkID
            }
          });

          // let res = await axios({
          //   method: 'POST',
          //   url: 'user/getNetworkNodeList',
          //   data: {
          //     childID: values.targetUserID
          //   }
          // });

          // let networkList = res.data.data;

          // for (let item of networkList) {
          //   let createFloater = await axios({
          //     method: 'POST',
          //     url: 'user/createFloater',
          //     data: {
          //       ID: item.ID
          //     }
          //   });
          // }
        });

        // await getNetworkNode();
        // await fetchFloaterData();
        // await fetchRightFloaterData();

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

        // reload
        document.getElementById('createChildModal').close();
        let reloadFunc = [
          getTreeStructure(),
          fetchUsers(),
          getNetworkNode(),
          fetchFloaterData(),
          fetchRightFloaterData()
        ];
        setIsLoaded(false);
        await Promise.all(reloadFunc).then(() => {
          setIsLoaded(true);
        });
      } catch (error) {
        let message = error.response.data.message;

        if (message === 'invalid_code') {
          setFieldError(
            'code',
            `The coupon code you entered is not valid. Please double-check the code and try again.`
          );
        } else if (message === 'error_seperate_tree_detected') {
          setFieldError(
            'targetUserID',
            `Unable to add. Please check and remove the network tree under this newly registered downline.`
          );
        } else if (message === 'error_not_connected_to_root_user') {
          setFieldError(
            'parentUserName',
            `Unable to add. This user is not connected to main network.
            Please connect this user to the main network first.`
          );
        } else {
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
          document.getElementById('createChildModal').close();
        }
      } finally {
        setSubmitting(false);
      }
    }
  };

  return isLoaded ? (
    <div className="">
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
          let leftPoints = leftFLoaterData.find(lf => {
            return !lf.status;
          });

          let rightPoints = rightFLoaterData.find(lf => {
            return !lf.status;
          });

          return (
            <div>
              <div className="p-2 ">
                <ul className="menu bg-white lg:menu-horizontal rounded-box shadow-md">
                  <li
                    key="nt"
                    onClick={() => {
                      document
                        .getElementById('viewNetworkAndFloaterModal')
                        .showModal();
                    }}>
                    <a>
                      <i className="fa-solid fa-network-wired"></i>
                      Network Transactions
                      {/* <span className="badge badge-sm">99+</span> */}
                    </a>
                  </li>
                  <li key="lp">
                    {leftPoints && (
                      <a>
                        <span className="px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm bg-green-100 text-green-800">
                          Left Points : {leftPoints.points}
                        </span>
                      </a>
                    )}
                  </li>
                  <li key="rp">
                    {rightPoints && (
                      <a>
                        <span className="px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm bg-lime-100 text-lime-800">
                          Right Points : {rightPoints.points}
                        </span>
                      </a>
                    )}
                  </li>
                </ul>
              </div>
              <div
                // ref={refTree}
                ref={el => {
                  console.log(el);
                  observed.current = el;
                }} // or setState(el)
                style={{ height: '100vh' }}
                className="">
                <Tree
                  // translate={{ x: 800, y: 100 }}
                  // dimensions={{
                  //   width: '100%',
                  //   height: '100%'
                  // }}
                  rootNodeClassName="node__root"
                  branchNodeClassName="node__branch"
                  leafNodeClassName="node__leaf"
                  data={treeStucture}
                  orientation="vertical"
                  pathFunc="step" // 'diagonal' | 'elbow' | 'straight' | 'step'
                  translate={treeTranslate}
                  collapsible={false}
                  separation={{
                    siblings: 2,
                    nonSiblings: 2
                  }}
                  renderCustomNodeElement={rd3tProps =>
                    renderNodeWithCustomEvents({
                      ...rd3tProps,
                      handleNodeClick,
                      setFieldValue,
                      setAvailablePosition,
                      setIsLoaded,
                      packageList: appSettings.packageList
                    })
                  }
                />

                <dialog id="createChildModal" className="modal">
                  <div className="modal-box w-11/12 max-w-3xl">
                    <form method="dialog">
                      {/* if there is a button in form, it will close the modal */}
                      <button
                        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                        disabled={isSubmitting}>
                        ✕
                      </button>
                    </form>

                    <h3 className="font-bold text-lg">Add Placement</h3>
                    {isSubmitting && (
                      <div
                        class="flex items-center p-4 mb-4 text-sm text-yellow-800 border border-yellow-300 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300 dark:border-yellow-800 mt-2"
                        role="alert">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="stroke-current shrink-0 h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        <span className="ml-2">
                          Please do not close this tab while we process your
                          request. Closing the tab prematurely may interrupt the
                          process and cause delays. Thank you for your patience.
                        </span>
                        <span className="loading loading-dots loading-md ml-3"></span>
                      </div>
                    )}

                    {isLoaded && (
                      <Form>
                        <div className="divider font-bold">
                          Placement Information
                        </div>
                        <InputText
                          icons={mdiAccount}
                          disabled
                          label="Username"
                          name="parentUserName"
                          type="text"
                          placeholder=""
                          value={values.parentUserName}

                          // onChange={handleEmailChange}
                        />
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-2 ">
                          <InputText
                            icons={mdiAccount}
                            disabled
                            label="Placement Name"
                            name="parentNodeName"
                            type="text"
                            placeholder=""
                            value={values.parentNodeName}

                            // onChange={handleEmailChange}
                          />
                          <InputText
                            // icons={mdiEmailCheckOutline}
                            disabled
                            label="Placement ID"
                            name="parentNode_Id"
                            type="text"
                            placeholder=""
                            value={values.parentNodeEmail}

                            // onChange={handleEmailChange}
                          />
                        </div>
                        <div className="divider font-bold">
                          Newly Registered Downlines
                        </div>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-2 ">
                          <Dropdown
                            // icons={mdiAccount}
                            label="Name"
                            name="targetUserID"
                            type="text"
                            placeholder=""
                            value={values.targetUserID}
                            setFieldValue={setFieldValue}
                            onBlur={handleBlur}
                            options={users}
                            affectedInput="targetUserID"
                            affectedInputValue="id"
                            functionToCalled={value => {
                              let foundUserName = users.find(u => {
                                return u.value === value;
                              });
                              setFieldValue(
                                'childUserName',
                                foundUserName.userName
                              );
                              setSponseeCode();
                            }}
                          />
                          <Dropdown
                            label="Position"
                            name="position"
                            type="text"
                            placeholder=""
                            value={values.position}
                            setFieldValue={setFieldValue}
                            onBlur={handleBlur}
                            options={availablePosition}
                            affectedInput="position"
                            affectedInputValue="id"
                          />
                        </div>
                        <InputText
                          icons={mdiAccount}
                          disabled
                          label="Username"
                          name="childUserName"
                          type="text"
                          placeholder=""
                          value={values.childUserName}

                          // onChange={handleEmailChange}
                        />
                        {/* <div className="grid grid-cols-2 gap-3 md:grid-cols-2 ">
                        <InputText
                          label="Code"
                          name="getCode"
                          type="text"
                          placeholder=""
                          value={''}
                          disabled
                        />
                        <InputText
                          label="Code"
                          name="code"
                          type="text"
                          placeholder=""
                          value={'settedCode'}
                          disabled
                        />
                      </div> */}
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
                      </Form>
                    )}
                  </div>
                </dialog>
                <dialog id="viewModal" className="modal">
                  <div className="modal-box w-11/12 max-w-4xl">
                    <form method="dialog">
                      {/* if there is a button in form, it will close the modal */}
                      <button
                        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                        disabled={isSubmitting}>
                        ✕
                      </button>
                    </form>
                    <h3 className="font-bold text-lg">Details</h3>

                    <Form>
                      <div className="overflow-x-auto"></div>
                    </Form>
                  </div>
                </dialog>
                <div className="">
                  {isLoaded && (
                    <dialog id="viewNetworkAndFloaterModal" className="modal">
                      <div className="modal-box max-w-6xl">
                        <form method="dialog">
                          {/* if there is a button in form, it will close the modal */}
                          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                            ✕
                          </button>
                        </form>
                        <div className="divider">
                          <h1 className="text-xl font-semibold  text-slate-600 font-bold">
                            {' '}
                          </h1>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
                          <TitleCard
                            key={'key'}
                            title={'Network'}
                            topMargin={'mt-2'}
                            className="overflow-scroll w-full">
                            <div className="overflow-x-scroll w-full">
                              <table className="table table-xs table-auto ">
                                <thead>
                                  <tr>
                                    <th>Type</th>
                                    <th>Name</th>
                                    <th>Position</th>
                                    <th>Points</th>
                                    <th>Date</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {networkNode.map((node, index) => {
                                    let fullName = `${node.childDetails.firstName} ${node.childDetails.lastName}`;

                                    console.log({ node });
                                    let data = node.list_ParentsOfParents;

                                    let foundData = {};

                                    let isDirectParent =
                                      node.parentID === userDetails.userId;

                                    if (isDirectParent) {
                                      foundData = {
                                        position: node.position
                                      };
                                    } else {
                                      foundData = data.find(user => {
                                        return user.ID === userDetails.userId;
                                      });
                                    }

                                    return (
                                      <tr>
                                        <th>
                                          {StatusPill({
                                            value: node.childDetails.code_type
                                          })}
                                        </th>
                                        <th>{fullName}</th>
                                        <th>
                                          {foundData && foundData.position}
                                        </th>
                                        <th>{node.points}</th>
                                        <td>
                                          {format(
                                            node.date_created,
                                            'MMM dd, yyyy hh:mm:ss a'
                                          )}
                                        </td>
                                        <th>
                                          {/* <button
                                    // disabled={node.isDisabledInUI}
                                    className="btn btn-outline btn-sm ml-2 btn-success"
                                    onClick={async () => {
                                      setActiveNodeId(node.ID);
                                      // let res = await axios({
                                      //   method: 'POST',
                                      //   url: 'user/createFloater',
                                      //   data: {
                                      //     ID: node.ID
                                      //   }
                                      // });
                                      // await getNetworkNode();
                                      // await fetchFloaterData();
                                      // await fetchRightFloaterData();
                                    }}>
                                    Receive
                                  </button> */}
                                        </th>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </TitleCard>

                          <TitleCard
                            key={'key'}
                            title={'Left Points Transactions'}
                            topMargin={'mt-2'}>
                            <table className="table table-xs">
                              <thead>
                                <tr>
                                  <th></th>
                                  <th>Name</th>
                                  <th>Points</th>
                                  <th>Action</th>
                                  <th>Status</th>
                                  {/* <th>Date</th> */}
                                </tr>
                              </thead>
                              <tbody>
                                {leftFLoaterData.map(
                                  ({
                                    status,
                                    points,
                                    action_type,
                                    fromUser,
                                    date_created
                                  }) => {
                                    let fullName = `${fromUser.firstName} ${fromUser.lastName}`;
                                    return (
                                      <tr>
                                        <th></th>
                                        <th>
                                          {action_type !== 'DIFFERENCE' &&
                                            fullName}
                                        </th>
                                        <th>{points}</th>
                                        <th>{action_type}</th>
                                        <th>{status ? 'TRUE' : 'FALSE'}</th>
                                        {/* <th>
                                          {' '}
                                          {format(
                                            date_created,
                                            'MMM dd, yyyy hh:mm:ss a'
                                          )}
                                        </th> */}
                                      </tr>
                                    );
                                  }
                                )}
                              </tbody>
                            </table>
                          </TitleCard>
                          <TitleCard
                            key={'key'}
                            title={'Right Points Transactions'}
                            topMargin={'mt-2'}>
                            <table className="table table-xs">
                              <thead>
                                <tr>
                                  <th></th>
                                  <th>Name</th>
                                  <th>Points</th>
                                  <th>Action</th>
                                  <th>Status</th>
                                  {/* <th>Date</th> */}
                                </tr>
                              </thead>
                              <tbody>
                                {rightFLoaterData.map(
                                  ({
                                    status,
                                    points,
                                    action_type,
                                    fromUser,
                                    date_created
                                  }) => {
                                    let fullName = `${fromUser.firstName} ${fromUser.lastName}`;
                                    return (
                                      <tr>
                                        <th></th>
                                        <th>
                                          {action_type !== 'DIFFERENCE' &&
                                            fullName}
                                        </th>
                                        <th>{points}</th>
                                        <th>{action_type}</th>
                                        <th>{status ? 'TRUE' : 'FALSE'}</th>
                                        {/* <th>
                                          {' '}
                                          {format(
                                            date_created,
                                            'MMM dd, yyyy hh:mm:ss a'
                                          )}
                                        </th> */}
                                      </tr>
                                    );
                                  }
                                )}
                              </tbody>
                            </table>
                          </TitleCard>

                          {/* <TitleCard
                          key={'key'}
                          title={'Right Floater'}
                          topMargin={'mt-2'}>
                          <table className="table table-xs">
                            <thead>
                              <tr>
                                <th></th>
                                <th>Name</th>
                                <th>Points</th>
                                <th>Action</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            {rightFLoaterData.map(
                              ({ status, points, action_type, fromUser }) => {
                                let fullName = `${fromUser.firstName} ${fromUser.lastName}`;
                                return (
                                  <tr>
                                    <th></th>
                                    <th>{fullName}</th>
                                    <th>{points.low}</th>
                                    <th>{action_type}</th>
                                    <th>{status ? 'TRUE' : 'FALSE'}</th>
                                  </tr>
                                );
                              }
                            )}
                          </table>
                        </TitleCard> */}
                        </div>
                      </div>
                    </dialog>
                  )}
                </div>
                <ToastContainer />
              </div>
            </div>
          );
        }}
      </Formik>
    </div>
  ) : (
    <div>
      <div className="absolute right-1/2 bottom-1/2  transform translate-x-1/2 translate-y-1/2 ">
        <div className="flex">
          <span className="loading loading-ring loading-lg text-warning"></span>
          <h1 className="ml-3 text-base-900 font-bold"> Fetching Data</h1>
        </div>
      </div>
    </div>
  );
}

function OrgTree() {
  return (
    <div style={{ height: '100%' }}>
      <OrgChartTree
        nodes={[
          {
            id: 1,
            name: 'PJ',
            title: 'CEO',
            img: 'https://cdn.balkan.app/shared/7.jpg',
            tags: ['IT']
          },
          {
            id: 2,
            pid: 1,
            name: 'Dex',
            title: 'Full Stack Developer',
            img: 'https://cdn.balkan.app/shared/7.jpg',
            tags: ['IT'],
            tags: ['IT']
          },
          {
            id: 3,
            pid: 1,
            name: 'Kristian',
            title: 'Marketing',
            img: 'https://cdn.balkan.app/shared/7.jpg',
            tags: ['IT']
          },
          {
            id: 4,
            pid: 2,
            name: 'Charlou',
            title: 'Mobile Developer',
            img: 'https://cdn.balkan.app/shared/7.jpg',
            tags: ['IT']
          },
          {
            id: 5,
            pid: 2,
            name: 'Henses',
            title: 'Developer/Marketing',
            img: 'https://cdn.balkan.app/shared/6.jpg',
            tags: ['IT']
          },
          {
            id: 6,
            pid: 3,
            name: 'Jaycee',
            title: 'Marketing',
            img: 'https://cdn.balkan.app/shared/7.jpg',
            tags: ['IT']
          },
          {
            id: 7,
            pid: 3,
            name: 'Axztech',
            title: 'Developer',
            img: 'https://cdn.balkan.app/shared/6.jpg',
            tags: ['IT']
          }
        ]}
      />
    </div>
  );
}

export default OrgTree;
