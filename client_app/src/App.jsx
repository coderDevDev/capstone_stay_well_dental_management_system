import React, { lazy, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import './App.css';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Outlet
} from 'react-router-dom';
import { themeChange } from 'theme-change';
import checkAuth from './app/auth';
import initializeApp from './app/init';

// Importing pages
const Layout = lazy(() => import('./containers/Layout'));
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Register = lazy(() => import('./pages/Register'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

const MyProfile = lazy(() => import('./pages/MyProfile'));
const PaymentOrder = lazy(() => import('./pages/PaymentOrder'));
const LayawayPaymentOrder = lazy(() => import('./pages/LayAwayPayment'));
// Initializing different libraries
initializeApp();

// Check for login and initialize axios
const token = checkAuth();

const AuthWrapper = dex => {
  let decodedToken = jwtDecode(token);

  let currentDate = new Date();

  // // JWT exp is in seconds
  if (decodedToken.exp * 1000 < currentDate.getTime()) {
    return <Navigate to="/login"></Navigate>;
  }

  return <Outlet />;
};

function App() {
  useEffect(() => {
    themeChange(false);
  }, []);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/myprofile/:userId" element={<MyProfile />} />
          <Route path="/myprofile/:userId/order/:transactionId" element={<PaymentOrder />} />
          <Route path="/myprofile/:userId/layaway/:transactionId" element={<LayawayPaymentOrder />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* <Route path="/register" element={<Register />} /> */}
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          {/* Place new routes over this */}
          <Route element={<AuthWrapper />}>
            <Route path="/app/*" element={<Layout />} />
          </Route>

          <Route
            path="*"
            element={
              <Navigate to={token ? '/app/dashboard' : '/login'} replace />
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
