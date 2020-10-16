import React from 'react';
import { Switch, Route } from 'react-router-dom';
import LandingPage from './views/LandingPage/LandingPage';
import Dashboard from './views/Dashboard/Dashboard';
import ProfilePage from './views/ProfilePage/ProfilePage';
import LoginPage from './views/LoginPage/LoginPage';
import RegisterPage from './views/RegisterPage/RegisterPage';
import NotFound from './views/NotFound/NotFound';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import GlobalContext from './GlobalContext.js';

export default (
  <GlobalContext.Consumer>
    {value => {
      return (
        <>
          <Switch>
            <PrivateRoute component={Dashboard} exact path='/' />
            <PrivateRoute component={Dashboard} exact path='/project/:project_id' />
            <PublicRoute component={LandingPage} exact path='/welcome' />
            <PublicRoute component={LoginPage} path='/login' restricted={true} />
            <PublicRoute component={RegisterPage} path='/register' restricted={true} />
            <PrivateRoute component={ProfilePage} path='/profile' />

            <Route component={NotFound} path='*' />
          </Switch>
        </>
      );
    }}
  </GlobalContext.Consumer>
);
