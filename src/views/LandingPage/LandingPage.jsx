import React, { Component } from 'react';
import './LandingPage.scss';
import NimbleLogo from '../../assets/nimble-logo.png';
import DashboardScreenshot from '../../assets/dashboard-screenshot.png';

import { Button } from '@material-ui/core';
import { Link } from 'react-router-dom';

export default class LandingPage extends Component {
  render() {
    return (
      <div className='landing-page'>
        <div className='landing-page-header'>
          <div className='landing-header-logo-container'>
            {/* <img src={NimbleLogo} alt="Nimble Logo"/> */}
            {/* <p>NIMBLE</p> */}
          </div>
          <div className='landing-header-button-container'>
            <Link to='/register'>
              <Button variant='outlined'>Sign Up</Button>
            </Link>
            <Link to='/login'>
              <Button variant='outlined'>Login</Button>
            </Link>
          </div>
        </div>
        <div className='landing-top-container'>
          <div className='landing-top-left'>
            <div className='landing-logo-container'>
              <img src={NimbleLogo} alt='Nimble Logo' />
              <p>NIMBLE</p>
            </div>
            <p>A Simple Approach to Project Management</p>
            <div className='landing-button-container'>
              <Link to='/register'>
                <Button variant='outlined'>Get Started</Button>
              </Link>
              <Link to='/login'>
                <p>
                  Already have an account? <span>Sign In</span>
                </p>
              </Link>
            </div>
          </div>
          <div className='landing-top-right'>
            <img src={DashboardScreenshot} alt='Dashboard Screenshot' />
          </div>
        </div>
        <div className='landing-bottom-container'>
          <div>{/* Reviews or something can go here */}</div>
          <div></div> {/* Don't Touch Me */}
          <div>{/* Reviews or something can go here */}</div>
        </div>
        <div className='landing-info-box-container'>
          <div className='landing-info-box'>
            <div className='info-box-header'>
              <p>Manage</p>
            </div>
            <div className='info-box-body'>
              <p>
                Create & manage multiple projects, and assign tasks to people involved. Break large tasks down into
                smaller checklists.
              </p>
            </div>
          </div>
          <span></span>
          <div className='landing-info-box'>
            <div className='info-box-header'>
              <p>Organize</p>
            </div>
            <div className='info-box-body'>
              <p>
                Group tasks together with custom lists. Moving tasks is a breeze with intuitive drag-and-drop
                functionality.
              </p>
            </div>
          </div>
          <span></span>
          <div className='landing-info-box'>
            <div className='info-box-header'>
              <p>Collaborate</p>
            </div>
            <div className='info-box-body'>
              <p>
                See what others are working on at any time. The easy to use Dashboard provides a high-level overview of
                the project.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
