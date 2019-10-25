import React, { Component } from 'react';
import './SettingsPage.scss';
import Header from '../../Header/Header';

export default class SettingsPage extends Component {
   render() {
      return (
         <div className='settings-page page-content'>
            <Header />
            <h1>Settings</h1>
         </div>
      )
   }
}
