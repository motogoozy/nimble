import React, { Component } from 'react';
import './App.scss';
import './styles.scss';
import Routes from './routes';

class App extends Component {
   render() {
      return (
         <div className="App">
            { Routes }
         </div>
      );
   }
};

export default App;