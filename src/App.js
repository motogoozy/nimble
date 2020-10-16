import React, { useState, useEffect } from 'react';
import './App.scss';
import './styles.scss';
import GlobalContext from './GlobalContext';
import Routes from './routes';

import axios from 'axios';
import Swal from 'sweetalert2';
import PulseLoader from 'react-spinners/PulseLoader';

export default function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
          if (err.response.data) {
            console.log(err.response.data);
          }
          Swal.fire({
            type: 'error',
            title: 'Something went wrong...',
            text: 'Internal Server Error',
          });
        }
      }
      return Promise.reject(err);
    }
  );

  const getUserSession = () => axios.get('/auth/user_session');

  useEffect(() => {
    getUserSession()
      .then(res => {
        setLoggedInUser(res.data);
      })
      .catch(err => console.log(err))
      .finally(() => setIsLoading(false));
  }, []);

  const globalState = {
    loggedInUser,
    setLoggedInUser,
  };

  return (
    <div className='App'>
      {isLoading ? (
        <div className='progress-container'>
          <PulseLoader size={12} color={'#995D81'} />
        </div>
      ) : (
        <GlobalContext.Provider value={globalState}>{Routes}</GlobalContext.Provider>
      )}
    </div>
  );
}
