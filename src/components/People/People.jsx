import React, { Component } from 'react';
import './People.scss';
import SmallAddButton from '../SmallAddButton/SmallAddButton';
import UserConnection from './UserConnection/UserConnection';

import axios from 'axios';

export default class PeoplePage extends Component {
	state = {
		currentConnections: [],
		connectionRequests: [],
		pendingConnections: [],
		users: {},
	};

	componentDidMount = async () => {
		await this.getUserConnections();
		await this.getUsers();
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

	getUserById = (userId) => axios.get(`user/${userId}`);

	getUsers = async () => {
		const { currentConnections, connectionRequests, pendingConnections } = this.state;
		let connected = await this.getUserDetails(currentConnections);
		let requests = await this.getUserDetails(connectionRequests);
		let pending = await this.getUserDetails(pendingConnections);
		
		let allUsers = {
			...connected,
			...requests,
			...pending
		};

		this.setState({ users: allUsers });
	}

	getUserDetails = async (list) => {
		const { loggedInUserId } = this.props;
		let userMap = {};

		let promises = list.map(connection => {
			if (connection.send_id !== loggedInUserId) {
				return this.getUserById(connection.send_id);
			} else {
				return this.getUserById(connection.receive_id);
			}
		})
		let results = await Promise.all(promises);
		results.forEach(result => {
			let userData = result.data;
			userMap[userData.user_id] = userData;
		})
		return userMap;
	};
	
	displayConnections = (list) => {
		const { users } = this.state;
		const { loggedInUserId } = this.props;

		return list.map(connection => {
			let userId;
			if (connection.send_id === loggedInUserId ) {
				userId = connection.receive_id;
			} else {
				userId = connection.send_id;
			}
			let user = users[userId];
			return <UserConnection key={user.user_id} user={user}/>
		})
	};


	render() {
		const { currentConnections, connectionRequests, pendingConnections, users } = this.state;

		return (
			<div className='people-main'>
				<div className='project-collaborators-container'>
					<div className='project-collaborators-column'>
						<div className='collaborators-column-header'>
							<p>Project Collaborators</p>
							<SmallAddButton title={'Invite User to Project'}/>
						</div>
						<div className='collaborators-column-body'>

						</div>
					</div>
				</div>
				<div className='connections-container'>
					<div className='connection-column' >
						<div className="connection-column-header">
							<p>Current Connections</p>
							<SmallAddButton title={'Add Connection'}/>
						</div>
						<div className='connection-column-body'>
							{
								Object.keys(users).length !== 0
								&&
								this.displayConnections(currentConnections)
							}
						</div>
					</div>
					<div className='connection-column' >
						<div className="connection-column-header">
							<p>Connection Requests (Received)</p>
						</div>
						<div className='connection-column-body'>
							{
								Object.keys(users).length !== 0
								&&
								this.displayConnections(connectionRequests)
							}
						</div>
					</div>
					<div className='connection-column' >
						<div className="connection-column-header">
							<p>Pending Connections (Sent)</p>
						</div>
						<div className='connection-column-body'>
							{
								Object.keys(users).length !== 0
								&&
								this.displayConnections(pendingConnections)
							}
						</div>
					</div>
				</div>
			</div>
		)
	}
}