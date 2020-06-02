import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import 'normalize.css';
import { HashRouter } from 'react-router-dom';
import axios from 'axios';

axios.interceptors.response.use(response => {
	return response;
}, (err) => {
	if (err.response && !err.config.skipErrorHandler) {
		if (err.response.status === 401) {
			window.location.hash = '/login';
		}
	}
	return Promise.reject(err);
});

ReactDOM.render(
	<HashRouter>
		<App />
	</HashRouter>
, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
