import React, { Component } from 'react';
import './Sidebar.scss';
import NimbleLogo from '../../assets/nimble-logo.png';

import { Link, withRouter } from 'react-router-dom';
import Tooltip from '@material-ui/core/Tooltip';

class Sidebar extends Component {
   state = {
      selectedButton: 'overview',
   };

   handleButtonClick = async (selected) => {
      const { loggedInUserId } = this.props
      if (selected === 'overview') {
         this.props.handleSidebarSelection('all');
      } else if (selected === 'my-tasks') {
         this.props.handleSidebarSelection(loggedInUserId);
      } else if (selected === 'unassigned') {
         this.props.handleSidebarSelection('none');
      } else if (selected === 'people') {
         this.props.handleSidebarSelection('people');
      }
      this.setState({ selectedButton: selected });
   };

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
                  to={`/dashboard/project/${this.props.projectId}`}
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
                     style={{ textDecoration: 'none' }}
                  >
                     <i className="far fa-user"></i>
                     <p>MY TASKS</p>
                  </div>
               </Tooltip>
               <Tooltip title={'Unassigned Tasks'} enterDelay={300}>
                  <div
                     onClick={() => this.handleButtonClick('unassigned')}
                     className={selectedButton === 'unassigned' ? 'sidebar-button active-button' : 'sidebar-button'}
                  >
                     <i className="far fa-question-circle"></i>
                     <p>UNASSIGNED</p>
                  </div>
               </Tooltip>
               <Tooltip title={'Project Collaborators'} enterDelay={300}>
                  <div
                     onClick={() => this.handleButtonClick('people')}
                     className={selectedButton === 'people' ? 'sidebar-button active-button' : 'sidebar-button'}
                  >
                     <i className="fas fa-users"></i>
                     <p>PEOPLE</p>
                  </div>
               </Tooltip>
               {/* <Tooltip title={'All Tasks In Progress'} enterDelay={300}>
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
               </Tooltip> */}
               <Tooltip title={'Project Settings'} enterDelay={300}>
                  <div
                     onClick={() => this.handleButtonClick('settings')}
                     className={selectedButton === 'settings' ? 'sidebar-button active-button' : 'sidebar-button'}
                  >
                     {/* <i class="fas fa-cog"></i> */}
                     <i className="fas fa-sliders-h"></i>
                     <p>SETTINGS</p>
                  </div>
               </Tooltip>
            </div>
         </div>
      )
   }
}

export default withRouter(Sidebar);