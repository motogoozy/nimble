import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import GlobalContext from '../GlobalContext';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { loggedInUser } = useContext(GlobalContext);

  return (
    // Show the component only when the user is logged in. Otherwise, redirect the user to /login page
    <Route
      render={props => (loggedInUser?.user_id ? <Component {...props} /> : <Redirect to='/welcome' />)}
      {...rest}
    />
  );
};

export default PrivateRoute;
