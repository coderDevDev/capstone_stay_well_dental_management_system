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
  ArchiveBoxIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import {
  Home, Package, Truck, ShoppingCart, UserCheck,
  PhilippinePeso,
  Banknote,
  Calendar,

  Building2
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

      console.log({ decoded })
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



      if (role === 'admin') {
        newRoutes.push({
          path: '/app/dashboard',
          icon: <Home className={iconClasses} />,
          name: 'Dashboard',
        });

        newRoutes.push({
          path: '/app/dental-branches',
          icon: <Building2 className={iconClasses} />,
          name: 'Dental Branches',
        });


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

      }

      if (role === 'dentist') {
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


        // newRoutes.push({
        //   path: '/app/inventory',
        //   icon: <Package className={iconClasses} />,
        //   name: 'Inventory',
        // });


        newRoutes.push({
          path: '/app/employees',
          icon: <UserGroupIcon className={iconClasses} />,
          name: 'Employees',
        });



        newRoutes.push({
          path: '/app/attendance',
          icon: <Calendar className={iconClasses} />,
          name: 'Attendance',
        });


        newRoutes.push({
          path: '/app/payroll',
          icon: <PhilippinePeso className={iconClasses} />,
          name: 'Payroll',
        });





        newRoutes.push({
          path: '/app/suppliers-orders',
          icon: <Truck className={iconClasses} />,
          name: 'Inventory & Suppliers',
        });

        newRoutes.push({
          path: '/app/payments',
          icon: <Banknote className={iconClasses} />,
          name: 'Payments',
        });

        newRoutes.push({
          path: '/app/dental-services',
          icon: <Squares2X2Icon className={iconClasses} />,
          name: 'Dental Services',
        });

      }


      if (role === 'patient') {
        newRoutes.push({
          path: '/app/dashboard',
          icon: <Squares2X2Icon className={iconClasses} />,
          name: 'Dashboard',
        });
        newRoutes.push({
          path: '/app/appointments',
          icon: <Squares2X2Icon className={iconClasses} />,
          name: 'Appointments',
        });
        newRoutes.push({
          path: '/app/profile',
          icon: <Squares2X2Icon className={iconClasses} />,
          name: 'Profile',
        });



        newRoutes.push({
          path: '/app/payments',
          icon: <Squares2X2Icon className={iconClasses} />,
          name: 'Payments',
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
