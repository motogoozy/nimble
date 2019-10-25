import React, { Component } from 'react';
import './Dashboard.scss';
import Sidebar from '../../Sidebar/Sidebar';
import Header from '../../Header/Header';
import Profile from '../Profile/Profile';
import SettingsPage from '../SettingsPage/SettingsPage';

import { Switch, Route } from 'react-router-dom';

export default class Dashboard extends Component {
	state = {};
	
	render() {
		return (
			<div className='dashboard page-content'>
				<Sidebar />
               <div className='main-content-container'>
                  <Header />
                  <div className='main-content'>
                     <Switch>
                        <Route component={Profile} path='/profile' />
                        <Route component={SettingsPage} path='/settings' />
                     </Switch>
                  </div>
               </div>
			</div>
		)
	}
}
