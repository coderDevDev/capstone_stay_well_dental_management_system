import React, { useEffect, useState } from 'react';
import RoutesSideBar from '../routes/sidebar';
import { NavLink, Routes, Link, useLocation } from 'react-router-dom';
import SidebarSubmenu from './SidebarSubmenu';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import { useDispatch } from 'react-redux';
import axios from 'axios';

function LeftSidebar() {
  const location = useLocation();

  const dispatch = useDispatch();

  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const [selectedUser, setSelectedUser] = useState({});

  const [isLoaded, setIsLoaded] = useState(false);



  const getUser = async () => {
    let res = await axios({
      method: 'GET',
      url: `user/${loggedInUser.user_id}`
    });
    let user = res.data.data;



    setSelectedUser(user);
    setIsLoaded(true);
  };

  useEffect(() => {
    getUser();
    ////console.log({ selectedUser: selectedUser });
  }, []);

  const close = e => {
    document.getElementById('left-sidebar-drawer').click();
  };

  //console.log({ selectedUser })

  return isLoaded && (

    <div className="drawer-side text-white h-screen w-60 drawer-side text-white h-screen w-60 bg-gradient-to-r from-gray-200 to-gray-100">
      <label htmlFor="left-sidebar-drawer" className="drawer-overlay"></label>
      {/* <div className=" mx-auto flex items-center justify-center mb-8 mt-4">
        <img src="/A.V. Logo.png" alt="Logo" className="w-30 h-24" />
      </div> */}
      {/* <hr class="border-t-2 border-white mx-auto w-1/2 my-2"></hr> */}
      {/* <div className=" mx-auto flex items-center justify-center mb-3 mt-6">
        <img
          src={selectedUser?.profilePic || 'https://img.freepik.com/premium-vector/young-smiling-man-avatar-man-with-brown-beard-mustache-hair-wearing-yellow-sweater-sweatshirt-3d-vector-people-character-illustration-cartoon-minimal-style_365941-860.jpg?w=740'}
          alt="Logo"
          className="w-24 h-24 rounded-full"
        />
      </div> */}
      <div className=" mx-auto flex items-center justify-center mb-8 mt-4">
        <div className="flex justify-center mb-6">
          <img src="/logo.jpg" alt="Logo" className="w-50 h-20 border-4 border-blue-950 shadow-lg p-1" />
        </div>
      </div>
      <ul className="menu  text-white items-center justify-between mx-auto ">
        <button
          className="btn btn-ghost bg-base-300 btn-circle z-50 top-0 right-0 mt-4 mr-2 absolute lg:hidden"
          onClick={() => close()}>
          <XMarkIcon className="h-5 w-5" />
        </button>

        {/* {selectedUser && (
          <li className="flex items-center justify-between mb-3">
            <label className="text-white">
              Hello, <span className="font-bold">{selectedUser.full_name} </span>
            </label>
            <label className="text-white">
              <span className="font-bold">Role: {selectedUser.role} </span>
            </label>
          </li>
        )} */}

        <RoutesSideBar />
      </ul>
    </div>
  );
}

export default LeftSidebar;
