import React, { useState, useContext } from 'react';
import './Sidebar.scss';
import NimbleLogo from '../../assets/nimble-logo.png';
import { GlobalContext } from '../../GlobalContext';

import { Link, withRouter } from 'react-router-dom';
import Tooltip from '@material-ui/core/Tooltip';
import Badge from '@material-ui/core/Badge';

function Sidebar(props) {
  const [selectedButton, setSelectedButton] = useState('overview');

  const { loggedInUser } = useContext(GlobalContext);

  const handleButtonClick = async selected => {
    if (selected === 'overview') {
      props.handleSidebarSelection('all');
    } else if (selected === 'my-tasks') {
      props.handleSidebarSelection(loggedInUser.user_id);
    } else if (selected === 'unassigned') {
      props.handleSidebarSelection('none');
    } else if (selected === 'people') {
      props.handleSidebarSelection('people');
    } else if (selected === 'settings') {
      props.handleSidebarSelection('settings');
    } else if (selected === 'nimble') {
      props.history.push('/');
      window.location.reload();
    }
    setSelectedButton(selected);
  };

  return (
    <div className='sidebar'>
      <Link to='/' onClick={() => handleButtonClick('nimble')}>
        <div className='sidebar-logo-container logo-text'>
          <img src={NimbleLogo} alt='Nimble Logo' />
          <p>NIMBLE</p>
        </div>
      </Link>
      <div className='sidebar-buttons-container'>
        <Link
          to={props.projectId ? `/project/${props.projectId}` : '/'}
          onClick={() => handleButtonClick('overview')}
          className={selectedButton === 'overview' ? 'link active-button' : 'link'}
        >
          <Tooltip title={'All Project Tasks'} enterDelay={300}>
            <div className='sidebar-button'>
              <i className='fas fa-th-large'></i>
              <p>OVERVIEW</p>
            </div>
          </Tooltip>
        </Link>
        <Tooltip title={'Only My Tasks'} enterDelay={300}>
          <div
            onClick={() => handleButtonClick('my-tasks')}
            className={selectedButton === 'my-tasks' ? 'sidebar-button active-button' : 'sidebar-button'}
          >
            <i className='far fa-user'></i>
            <p>MY TASKS</p>
          </div>
        </Tooltip>
        <Tooltip title={'Unassigned Tasks'} enterDelay={300}>
          <div
            onClick={() => handleButtonClick('unassigned')}
            className={selectedButton === 'unassigned' ? 'sidebar-button active-button' : 'sidebar-button'}
          >
            <i className='far fa-question-circle'></i>
            <p>UNASSIGNED</p>
          </div>
        </Tooltip>
        <Tooltip title={'Project Collaborators'} enterDelay={300}>
          <div
            onClick={() => handleButtonClick('people')}
            className={selectedButton === 'people' ? 'sidebar-button active-button' : 'sidebar-button'}
          >
            {props.connectionRequests.length > 0 ? (
              <Badge color='secondary' badgeContent={props.connectionRequests.length} overlap='circle'>
                <i className='fas fa-users'></i>
              </Badge>
            ) : (
              <i className='fas fa-users'></i>
            )}
            <p>PEOPLE</p>
          </div>
        </Tooltip>
        <Tooltip title={'Project Settings'} enterDelay={300}>
          <div
            onClick={() => handleButtonClick('settings')}
            className={selectedButton === 'settings' ? 'sidebar-button active-button' : 'sidebar-button'}
          >
            <i className='fas fa-sliders-h'></i>
            <p>SETTINGS</p>
          </div>
        </Tooltip>
      </div>
    </div>
  );
}

export default withRouter(Sidebar);
