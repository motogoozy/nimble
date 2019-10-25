import React, { Component } from 'react';
import './Sidebar.scss';
import NimbleLogo from '../../assets/nimble-logo.png';

export default class Sidebar extends Component {
    render() {
        return (
            <div className='sidebar'>
                <div className='sidebar-logo-container logo-text'>
                    <img src={NimbleLogo} alt="Nimble Logo"/>
                    <p>NIMBLE</p>
                </div>
                <div className='sidebar-buttons-container'>
                    <div className='sidebar-button'>
                        <i className="fas fa-th-large"></i>
                        <p>OVERVIEW</p>
                    </div>
                    <div className='sidebar-button'>
                        <i className="fas fa-tasks"></i>
                        <p>MY TASKS</p>
                    </div>
                    <div className='sidebar-button'>
                        <i className="fas fa-spinner"></i>
                        <p>IN PROGRESS</p>
                    </div>
                    <div className='sidebar-button'>
                        <i className="far fa-check-square"></i>
                        <p>COMPLETED</p>
                    </div>
                </div>
            </div>
        )
    }
}
