import React from 'react';
import { Switch, Route } from 'react-router-dom';
import LandingPage from './components/views/LandingPage/LandingPage';
import Dashboard from './components/views/Dashboard/Dashboard';
import Profile from './components/views/Profile/Profile';
import SettingsPage from './components/views/SettingsPage/SettingsPage';

export default (
   <Switch>
      <Route component={LandingPage} exact path='/' />
      <Route component={Dashboard} exact path='/dashboard' />
      <Route component={Dashboard} path='/dashboard/project/:project_id' />
      <Route component={Profile} path='/profile' />
      <Route component={SettingsPage} path='/settings' />
   </Switch>
)