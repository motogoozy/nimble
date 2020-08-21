import React from 'react';
import { Switch, Route } from 'react-router-dom';
import LandingPage from './views/LandingPage/LandingPage';
import Dashboard from './views/Dashboard/Dashboard';
import ProfilePage from './views/ProfilePage/ProfilePage';
import LoginPage from './views/LoginPage/LoginPage';
import RegisterPage from './views/RegisterPage/RegisterPage';
import NotFound from './views/NotFound/NotFound';

export default (
  <Switch>
    <Route component={Dashboard} exact path='/' />
    <Route component={Dashboard} exact path='/project/:project_id' />
    <Route component={LandingPage} exact path='/welcome' />
    <Route component={LoginPage} path='/login' />
    <Route component={RegisterPage} path='/register' />
    <Route component={ProfilePage} path='/profile' />

    <Route component={NotFound} path='*' />
  </Switch>
);
