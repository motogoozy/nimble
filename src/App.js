import React, { useState } from 'react';
import './App.scss';
import './styles.scss';
import { GlobalContext } from './GlobalContext';
import Routes from './routes';

import axios from 'axios';
import Swal from 'sweetalert2';

export default function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);

  const globalState = {
    loggedInUser,
    setLoggedInUser,
  };

  let baseUrl = '/api';
  axios.defaults.baseURL = baseUrl;
  axios.interceptors.response.use(
    response => {
      return response;
    },
    err => {
      if (err.response) {
        if (err.response.status === 499) {
          window.location.hash = '/welcome';
        }
        if (err.response.status === 500) {
          Swal.fire({
            type: 'error',
            title: 'Something went wrong...',
            text: `${err.response.data} (Internal Server Error)`,
          });
        }
      }
      return Promise.reject(err);
    }
  );

  return (
    <div className='App'>
      <GlobalContext.Provider value={globalState}>{Routes}</GlobalContext.Provider>
    </div>
  );
}
