import React, { Component } from 'react';
import './Profile.scss';
import Header from '../../Header/Header';

export default class Profile extends Component {
   render() {
      return (
         <div className='profile page-content'>
            <Header />
            <h1>Profile</h1>
         </div>
      )
   }
}
