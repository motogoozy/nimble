import React, { Component } from 'react';
import './LandingPage.scss';
import NimbleLogo from '../../../assets/nimble-logo.png';
import DashboardScreenshot from '../../../assets/dashboard-screenshot.png';

import { Button } from '@material-ui/core';

export default class LandingPage extends Component {
	render() {
		return (
			<div className='landing-page'>
				<div className='landing-page-header'>
					<div className='landing-header-logo-container'>
						<img src={NimbleLogo} alt="Nimble Logo"/>
						{/* <p>NIMBLE</p> */}
					</div>
					<div className='landing-header-button-container'>
						<Button variant='outlined'>Sign Up</Button>
						<Button variant='outlined'>Login</Button>
					</div>
				</div>
				<div className='landing-top-container'>
					<div className='landing-top-left'>
						<div className='landing-logo-container'>
							<img src={NimbleLogo} alt="Nimble Logo" />
							<p>NIMBLE</p>
						</div>
						<p>A Simple Approach to Project Management</p>
						<div className='landing-button-container'>
							<Button variant='outlined'>Get Started</Button>
							<p>Already have an account? <span>Sign In</span></p>
						</div>
					</div>
					<div className='landing-top-right'>
						<img src={DashboardScreenshot} alt="Dashboard Screenshot"/>
					</div>
				</div>
				<div className='landing-bottom-container'>

				</div>
				<div className='landing-info-box-container'>
					<div className='landing-info-box'>
						<div className='info-box-header'>
							<p>Tasks</p>
						</div>
						<div className='info-box-body'>
							<p>Create, Manage, & Assign Tasks. Break large tasks down into smaller checklists.</p>
						</div>
					</div>
					<span></span>
					<div className='landing-info-box'>
						<div className='info-box-header'>
							<p>Organize Projects</p>
						</div>
						<div className='info-box-body'>
							<p>Group tasks together with custom lists. Moving tasks is a breeze with intuitive drag-and-drop
								functionality.</p>
						</div>
					</div>
					<span></span>
					<div className='landing-info-box'>
						<div className='info-box-header'>
							<p>Collaborate With Others</p>
						</div>
						<div className='info-box-body'>
							<p>Easy to use Dashboard provides a high-level overview of the project. Quickly filter by assigned &
								unassigned tasks.</p>
						</div>
					</div>
				</div>
			</div>
		)
	}
}
