import React, { Component } from 'react';
import './People.scss';

export default class PeoplePage extends Component {
	render() {
		return (
			<div className='people-page'>
				<div className='connection-column'>
					<div className="connection-column-header">
						<h4>Current Connections</h4>
					</div>
					<div className='connection-column-body'>

					</div>
				</div>
				<div className='connection-column'>
					<div className="connection-column-header">
						<h4>Connection Requests (Received)</h4>
					</div>
					<div className='connection-column-body'>

					</div>
				</div>
				<div className='connection-column'>
					<div className="connection-column-header">
						<h4>Pending Connections (Sent)</h4>
					</div>
					<div className='connection-column-body'>

					</div>
				</div>
			</div>
		)
	}
}