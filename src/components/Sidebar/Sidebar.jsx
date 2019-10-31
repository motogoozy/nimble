import React, { Component } from 'react';
import './Sidebar.scss';
import NimbleLogo from '../../assets/nimble-logo.png';

import { Link, withRouter } from 'react-router-dom';
import Tooltip from '@material-ui/core/Tooltip';

class Sidebar extends Component {
   state = {
      selectedButton: 'overview',
   };

   handleButtonClick = (selected) => {
      this.setState({ selectedButton: selected });
   }

   render() {
      const { selectedButton } = this.state;

      return (
         <div className='sidebar'>
            <Link
               to='/dashboard'
               style={{ textDecoration: 'none' }}
               onClick={() => this.setState({ selectedButton: 'overview' })}
            >
               <div className='sidebar-logo-container logo-text'>
                  <img src={NimbleLogo} alt="Nimble Logo"/>
                  <p>NIMBLE</p>
               </div>
            </Link>
            <div className='sidebar-buttons-container'>
               <Link 
                  to='/dashboard'
                  onClick={() => this.handleButtonClick('overview')}
                  className={selectedButton === 'overview' ? 'link active-button' : 'link'}
                  style={{ textDecoration: 'none' }}
               >
                  <Tooltip title={'All Project Tasks'} enterDelay={300}>
                     <div className='sidebar-button'>
                        <i className="fas fa-th-large"></i>
                        <p>OVERVIEW</p>
                     </div>
                  </Tooltip>
               </Link>
               <Tooltip title={'Only My Tasks'} enterDelay={300}>
                  <div
                     onClick={() => this.handleButtonClick('my-tasks')}
                     className={selectedButton === 'my-tasks' ? 'sidebar-button active-button' : 'sidebar-button'}
                  >
                     <i class="far fa-user"></i>
                     <p>MY TASKS</p>
                  </div>
               </Tooltip>
               <Tooltip title={'All Uncompleted Tasks'} enterDelay={300}>
                  <div
                     onClick={() => this.handleButtonClick('todo')}
                     className={selectedButton === 'todo' ? 'sidebar-button active-button' : 'sidebar-button'}
                  >
                     <i className="fas fa-tasks"></i>
                     <p>TO DO</p>
                  </div>
               </Tooltip>
               <Tooltip title={'All Tasks In Progress'} enterDelay={300}>
                  <div
                     onClick={() => this.handleButtonClick('in-progress')}
                     className={selectedButton === 'in-progress' ? 'sidebar-button active-button' : 'sidebar-button'}
                  >
                     <i className="fas fa-spinner"></i>
                     <p>IN PROGRESS</p>
                  </div>
               </Tooltip>
               <Tooltip title={'All Completed Tasks'} enterDelay={300}>
                  <div
                     onClick={() => this.handleButtonClick('completed')}
                     className={selectedButton === 'completed' ? 'sidebar-button active-button' : 'sidebar-button'}
                  >
                     <i className="far fa-check-square"></i>
                     <p>COMPLETED</p>
                  </div>
               </Tooltip>
            </div>
         </div>
      )
   }
}

export default withRouter(Sidebar);