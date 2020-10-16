import React from 'react';

const NotFound = () => {
  const styles = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    fontFamily: 'sans-serif',
  };

  return (
    <div style={styles}>
      <h2>404 page not found</h2>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
};

export default NotFound;
