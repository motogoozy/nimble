import React, { Component } from 'react';
import './Dashboard.scss';
import Sidebar from '../../Sidebar/Sidebar';
import Header from '../../Header/Header';
import Column from '../../Column/Column';
import AddButton from '../../AddButton/AddButton';

import Tooltip from '@material-ui/core/Tooltip';

export default class Dashboard extends Component {
   state = {};
   
   displayColumns = () => {
      return (
         <div className='column-container'>
            <Column />
            <Column />
            <Column />
            <Column />
            {/* <Column />
            <Column /> */}
            <Tooltip title={'Add Column'}>
               <div>
                  <AddButton />
               </div>
            </Tooltip>
         </div>
      )
   }
	
	render() {
		return (
			<div className='dashboard'>
				<Sidebar />
            <div className='main-content-container'>
               <Header />
               <div className='main-content'>
                  { this.displayColumns() }
               </div>
            </div>
			</div>
		)
	}
}
