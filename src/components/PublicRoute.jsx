import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import GlobalContext from '../GlobalContext';

const PublicRoute = ({ component: Component, restricted, ...rest }) => {
  const { loggedInUser } = useContext(GlobalContext);

  return (
    // restricted = true meaning restricted route
    // restricted = false meaning public route
    <Route
      render={props => (loggedInUser?.user_id && restricted ? <Redirect to='/' /> : <Component {...props} />)}
      {...rest}
    />
  );
};

export default PublicRoute;
