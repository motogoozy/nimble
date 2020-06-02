import React from 'react';
import './App.scss';
import './styles.scss';
import Routes from './routes';

import axios from 'axios';
import Swal from 'sweetalert2';

export default function App() {
   let baseUrl = '/api';
   axios.defaults.baseURL = baseUrl;
   axios.interceptors.response.use(response => {
      return response;
   }, (err) => {
      if (err.response && !err.config.skipErrorHandler) {
         if (err.response.status === 401) {
            window.location.hash = '/login';
         }
         if (err.response.status === 500) {
            Swal.fire({
               type: 'error',
               title: 'Internal Server Error',
               text: err.response.data,
            })
         }
      }
      return Promise.reject(err);
   });

   return (
      <div className="App">
         { Routes }
      </div>
   );
};
