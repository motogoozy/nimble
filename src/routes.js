import React from 'react';
import { Switch, Route } from 'react-router-dom';
import LandingPage from './views/LandingPage/LandingPage';
import Dashboard from './views/Dashboard/Dashboard';
import ProfilePage from './views/ProfilePage/ProfilePage';

export default (
   <Switch>e
      <Route component={LandingPage} exact path='/' />
      <Route component={Dashboard} exact path='/dashboard' />
      <Route component={Dashboard} exact path='/dashboard/project/:project_id' />
      <Route component={ProfilePage} path='/profile' />
   </Switch>
)