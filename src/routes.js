import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Dashboard from './components/views/Dashboard/Dashboard';

export default (
    <Switch>
        <Route component={Dashboard} path='/Dashboard' />
    </Switch>
)