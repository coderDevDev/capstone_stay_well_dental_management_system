import { themeChange } from 'theme-change';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ShoppingCartIcon from '@heroicons/react/24/outline/CreditCardIcon';
import Bars3Icon from '@heroicons/react/24/outline/Bars3Icon';
import MoonIcon from '@heroicons/react/24/outline/MoonIcon';
import SunIcon from '@heroicons/react/24/outline/SunIcon';
import BanknotesIcon from '@heroicons/react/24/outline/BanknotesIcon';
const iconClasses = `h-6 w-6`;
import { openRightDrawer } from '../features/common/rightDrawerSlice';
import globalConstantUtil from '../utils/globalConstantUtil';
const { RIGHT_DRAWER_TYPES, CALENDAR_EVENT_STYLE } = globalConstantUtil;

import axios from 'axios';
import { NavLink, Routes, Link, useLocation } from 'react-router-dom';

function Header() {
  const dispatch = useDispatch();
  const { noOfNotifications, pageTitle } = useSelector(state => state.header);
  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem('theme')
  );
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const [selectedUser, setSelectedUser] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  console.log({ loggedInUser })

  const getUser = async () => {
    let res = await axios({
      method: 'GET',
      url: `user/${1}`
    });
    let user = res.data.data;


    setSelectedUser(user[0]);
    setIsLoaded(true);
  };
  useEffect(() => {
    getUser();
    //console.log({ selectedUser: selectedUser });
  }, []);

  useEffect(() => {
    themeChange(false);
    if (currentTheme === null) {
      if (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        setCurrentTheme('dark');
      } else {
        setCurrentTheme('light');
      }
    }
    // getUser();
    // 👆 false parameter is required for react project
  }, []);

  // Opening right sidebar for notification
  const openNotification = () => {
    dispatch(
      openRightDrawer({
        header: 'Notifications',
        bodyType: RIGHT_DRAWER_TYPES.NOTIFICATION
      })
    );
  };

  async function logoutUser() {
    let res = await axios({
      method: 'POST',
      url: 'auth/logout',
      data: {}
    });

    localStorage.clear();
    window.location.href = '/';
  }
  const payoutCart = useSelector(state => state.cart);
  let cartItem = payoutCart.list.length;
  return isLoaded && (
    // navbar fixed  flex-none justify-between bg-base-300  z-10 shadow-md

    <div className="navbar sticky top-0 
    p-4 bg-gradient-to-r from-gray-200 to-gray-300
      z-10 text-blue-950 border bg-white shadow-1xl">
      {/* Menu toogle for mobile view or small screen */}
      <div className="flex-1 p-4 p-4 ">
        <label
          htmlFor="left-sidebar-drawer"
          className="btn drawer-button lg:hidden">
          <Bars3Icon className="h-5 inline-block w-5" />
        </label>
        <h1 className="text-2xl font-bold ml-2">{pageTitle}</h1>
      </div>

      <div className="flex-none ">
        {/* Multiple theme selection, uncomment this if you want to enable multiple themes selection, 
                also includes corporate and retro themes in tailwind.config file */}

        {/* <select className="select select-sm mr-4" data-choose-theme>
                    <option disabled selected>Theme</option>
                    <option value="light">Default</option>
                    <option value="dark">Dark</option>
                    <option value="corporate">Corporate</option>
                    <option value="retro">Retro</option>
                </select> */}

        {/* Light and dark theme selection toogle **/}
        {/* <div className="">
          {selectedUser && (
            <label className="swap ">
              Hi {selectedUser.firstName} {selectedUser.lastName}!
            </label>
          )}
        </div> */}

        {/* Notification icon */}

        {/* Profile icon, opening menu on click */}
        <div className="dropdown dropdown-end ml-4">
          <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
            <div className="avatar">
              <div className="">
                <div className="mask mask-circle w-10 h-10">
                  <img
                    src={selectedUser?.profilePic || 'https://img.freepik.com/premium-vector/young-smiling-man-avatar-man-with-brown-beard-mustache-hair-wearing-yellow-sweater-sweatshirt-3d-vector-people-character-illustration-cartoon-minimal-style_365941-860.jpg?w=740'}
                    alt="Avatar"
                  />
                </div>
              </div>
            </div>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52 text-slate-900 font-bold">
            <li>
              <Link
                to={`/app/settings-profile/user?userId=${loggedInUser.userId}`}>
                <a>Profile</a>
              </Link>
            </li>
            <div className="divider mt-0 mb-0"></div>
            <li>
              <a onClick={logoutUser}>Logout</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Header;
