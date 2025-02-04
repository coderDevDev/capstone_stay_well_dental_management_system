import axios from 'axios';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import checkAuth from '../app/auth';
import {
  Squares2X2Icon,
  UsersIcon,
  PresentationChartLineIcon,
  BanknotesIcon,
  DocumentChartBarIcon,
  CogIcon,
  IdentificationIcon,
  QuestionMarkCircleIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import {
  Home, Package, Truck, ShoppingCart, UserCheck,

  Banknote


} from "lucide-react"

const iconClasses = 'h-6 w-6';
import { NavLink, Routes, Link, useLocation } from 'react-router-dom';
import SidebarSubmenu from '../containers/SidebarSubmenu';
const AppRoutes = () => {
  const [accountSettings, setAccountSettings] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [isLoaded, setIsLoaded] = useState([]);

  const fetchAccountSettings = async () => {
    try {

      const token = checkAuth();
      const decoded = jwtDecode(token);
      let role = decoded.role;

      // //console.log({ decoded })






      setIsLoaded(true)



      const newRoutes = [];
      let result = []




      // if (role === 'Patient') {
      //   newRoutes.push({
      //     path: '/app/dashboard',
      //     icon: <Squares2X2Icon className={iconClasses} />,
      //     name: 'Dashboard',
      //   });

      // }




      if (role === 'Dentist') {
        newRoutes.push({
          path: '/app/dashboard',
          icon: <Home className={iconClasses} />,
          name: 'Dashboard',
        });
        // newRoutes.push({
        //   path: '/app/profile',
        //   icon: <Squares2X2Icon className={iconClasses} />,
        //   name: 'Profile',
        // });

        newRoutes.push({
          path: '/app/users',
          icon: <UserCheck className={iconClasses} />,
          name: 'Patients',
        });

        newRoutes.push({
          path: '/app/appointments',
          icon: <Squares2X2Icon className={iconClasses} />,
          name: 'Appointments',
        });


        newRoutes.push({
          path: '/app/inventory',
          icon: <Package className={iconClasses} />,
          name: 'Inventory',
        });


        newRoutes.push({
          path: '/app/suppliers-orders',
          icon: <Truck className={iconClasses} />,
          name: 'Suppliers & Orders',
        });

        newRoutes.push({
          path: '/app/payments',
          icon: <Banknote className={iconClasses} />,
          name: 'Payments',
        });

      }


      if (role === 'Patient') {
        // newRoutes.push({
        //   path: '/app/dashboard',
        //   icon: <Squares2X2Icon className={iconClasses} />,
        //   name: 'Dashboard',
        // });
        newRoutes.push({
          path: '/app/profile',
          icon: <Squares2X2Icon className={iconClasses} />,
          name: 'Profile',
        });


        newRoutes.push({
          path: '/app/appointments',
          icon: <Squares2X2Icon className={iconClasses} />,
          name: 'Appointments',
        });
        newRoutes.push({
          path: '/app/payments',
          icon: <Squares2X2Icon className={iconClasses} />,
          name: 'Payments',
        });

      }




      if (result.includes('Employees Page')) {
        newRoutes.push({
          path: '/app/employees',
          icon: <IdentificationIcon className={iconClasses} />,
          name: 'Employees',
        });
      }
      if (result.includes('Inventory')) {
        newRoutes.push({
          path: '/app/inventory',
          icon: <DocumentChartBarIcon className={iconClasses} />,
          name: 'Inventory',
        });
      }
      if (result.includes("Customer's Record")) {
        newRoutes.push({
          path: '/app/users',
          icon: <UsersIcon className={iconClasses} />,
          name: 'Customer Record',
        });
      }
      if (result.includes('Transaction History')) {
        newRoutes.push({
          path: '/app/transactions',
          icon: <PresentationChartLineIcon className={iconClasses} />,
          name: 'Transactions',
        });
      }
      if (result.includes('Layaway')) {
        newRoutes.push({
          path: '/app/layaway',
          icon: <BanknotesIcon className={iconClasses} />,
          name: 'Lay-away',
        });
      }
      if (result.includes('Supplier Details')) {
        newRoutes.push({
          path: '/app/suppliers',
          icon: <UsersIcon className={iconClasses} />,
          name: 'Suppliers',
        });
      }


      // newRoutes.push({
      //   path: '/app/faq',
      //   icon: <QuestionMarkCircleIcon className={iconClasses} />,
      //   name: 'FAQ',
      // });

      if (result.includes('Settings') && role === 'super_admin') {
        newRoutes.push({
          path: '/app/settings',
          icon: <CogIcon className={iconClasses} />,
          name: 'Settings',
        });

      }


      setRoutes(newRoutes);
    } catch (error) {
      console.error('Error fetching account settings:', error);
    }
  };

  useEffect(() => {
    fetchAccountSettings();
  }, []);




  return isLoaded && <div>
    {
      routes.map((route, k) => {


        return (
          <li className="p-4 text-center" key={k}>
            {route.submenu ? (
              <SidebarSubmenu {...route} />
            ) : (
              <NavLink
                end
                to={route.path}
                className={({ isActive }) =>
                  `${isActive ? 'font-bold text-white bg-blue-700 shadow-2xl' : 'font-bold text-gray-700 shadow-1xl'}`
                }>
                {route.icon} {route.name}
                {location.pathname === route.path ? (
                  <span
                    className="absolute inset-y-0 left-0 w-2 rounded-tr-md rounded-br-md"
                    aria-hidden="true"></span>
                ) : null}
              </NavLink>
            )}
          </li>
        );
      })
    }

  </div>




};

export default AppRoutes;
