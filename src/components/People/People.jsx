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
		projectCollaborators: [],
	};

	componentDidMount = async () => {
		this.getProjectUsers();
		await this.getUserConnections();
		this.categorizeConnections();
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

	categorizeConnections = async () => {
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

	getProjectUsers = async () => {
		const { projectId } = this.props;

		let res = await axios.get(`/project/${projectId}/users`);
		this.setState({ projectCollaborators: res.data });
	};
	
	displayUsers = (list, action, tooltipTitle) => {
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
			return <UserConnection key={`${list}: ${user.user_id}`} user={user} action={action} tooltipTitle={tooltipTitle}/>
		})
	};

	displayProjectCollaborators = () => {
		const { projectCollaborators } = this.state;
		return projectCollaborators.map(user => {
			return (
				<UserConnection
					key={`projectCollaborator: ${user.user_id}`}
					user={user}
					action={'Remove'}
					tooltipTitle={'Remove Person From Project'}
				/>
			)
		})
	};


	render() {
		const { currentConnections, connectionRequests, pendingConnections, users, projectCollaborators } = this.state;

		return (
			<div className='people-main'>
				<div className='project-collaborators-container'>
					<div className='project-collaborators-column'>
						<div className='collaborators-column-header'>
							<p>Project Collaborators</p>
							<SmallAddButton title={'Invite User to Project'}/>
						</div>
						<div className='collaborators-column-body'>
							{
								Object.keys(projectCollaborators).length !== 0
								&&
								this.displayProjectCollaborators()
							}
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
								this.displayUsers(currentConnections, 'Remove', 'Remove Connection')
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
								this.displayUsers(connectionRequests, 'Delete', 'Delete Connection Request')
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
								this.displayUsers(pendingConnections, 'Cancel', 'Cancel Connection Request')
							}
						</div>
					</div>
				</div>
			</div>
		)
	}
}