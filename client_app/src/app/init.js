import axios from 'axios';

const initializeApp = () => {
  console.log(import.meta.env);
  // Setting base URL for all API request via axios
  axios.defaults.baseURL = `${import.meta.env.VITE_REACT_APP_BASE_URL}/api`;

  console.log({ api: import.meta.env.VITE_REACT_APP_BASE_URL });

  if (!import.meta.env.NODE_ENV || import.meta.env.NODE_ENV === 'development') {
    // dev code
  } else {
    // Prod build code

    // Removing console.log from prod
    console.log = () => {};

    // init analytics here
  }
};

export default initializeApp;
