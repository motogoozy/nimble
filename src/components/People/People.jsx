import React, { Component } from 'react';
import './People.scss';
import SmallAddButton from '../SmallAddButton/SmallAddButton';

import axios from 'axios';

export default class PeoplePage extends Component {
	state = {
		currentConnections: [],
		connectionRequests: [],
		pendingConnections: [],
	};

	componentDidMount = async () => {
		await this.getUserConnections();
		console.log(this.state);
	};

	getUserConnections = async () => {
		const { loggedInUserId } = this.props;
		let res = await axios.get(`/connection/${loggedInUserId}`);
		let current = [], requests = [], pending = [];
		res.data.forEach(connection => {
			if (connection.status === 2) {
				current.push(connection);
			} else {
				if (connection.receive_id === loggedInUserId) {
					requests.push(connection);
				} else if (connection.send_id === loggedInUserId) {
					pending.push(connection);
				}
			}
		});
		this.setState({
			currentConnections: current,
			connectionRequests: requests,
			pendingConnections: pending,
		});
	};

	render() {
		return (
			<div className='people-page'>
				<div className='connection-column'>
					<div className="connection-column-header">
						<p>Current Connections</p>
						<SmallAddButton title={'Add Connection'}/>
					</div>
					<div className='connection-column-body'>

					</div>
				</div>
				<div className='connection-column'>
					<div className="connection-column-header">
						<p>Connection Requests (Received)</p>
					</div>
					<div className='connection-column-body'>

					</div>
				</div>
				<div className='connection-column'>
					<div className="connection-column-header">
						<p>Pending Connections (Sent)</p>
					</div>
					<div className='connection-column-body'>

					</div>
				</div>
			</div>
		)
	}
}