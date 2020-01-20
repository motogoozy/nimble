import React, { Component } from 'react';
import './People.scss';
import SmallAddButton from '../SmallAddButton/SmallAddButton';
import UserConnection from './UserConnection/UserConnection';

import axios from 'axios';
import CircularProgress from '@material-ui/core/CircularProgress';

export default class PeoplePage extends Component {
	state = {
		currentConnections: [],
		connectionRequests: [],
		pendingConnections: [],
		users: {},
		projectCollaborators: [],
	};

	componentDidMount = async () => {
		await this.getProjectUsers();
		await this.getUserConnections();
		await this.categorizeConnections();
	};

	getUserConnections = async () => {
		const { loggedInUser } = this.props;
		let res = await axios.get(`/connection/${loggedInUser.user_id}`);
		let current = [], requests = [], pending = [];
		res.data.forEach(connection => {
			if (connection.status === 2) {
				current.push(connection);
			} else {
				if (connection.receive_id === loggedInUser.user_id) {
					requests.push(connection);
				} else if (connection.send_id === loggedInUser.user_id) {
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
		const { loggedInUser } = this.props;
		let userMap = {};

		let promises = list.map(connection => {
			if (connection.send_id !== loggedInUser.user_id) {
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

	formatColor = (colorArr) => `rgba(${colorArr[0]}, ${colorArr[1]}, ${colorArr[2]}, ${colorArr[3]})`;
	
	displayConnections = (list, actions, tooltipTitles) => {
		const { users } = this.state;
		const { loggedInUser } = this.props;

		return list.map(connection => {
			let userId;
			if (connection.send_id === loggedInUser.user_id ) {
				userId = connection.receive_id;
			} else {
				userId = connection.send_id;
			}
			let user = users[userId];
			let avatarColor = this.formatColor(user.color);
			return (
				<UserConnection
					key={`${list}: ${user.user_id}`}
					user={user}
					actions={actions}
					tooltipTitles={tooltipTitles}
					avatarColor={avatarColor}
				/>
			)
		})
	};

	displayProjectCollaborators = () => {
		const { projectCollaborators } = this.state;

		return projectCollaborators.map(user => {
			let avatarColor = this.formatColor(user.color);
			return (
				<UserConnection
					key={`projectCollaborator: ${user.user_id}`}
					user={user}
					actions={['Remove']}
					tooltipTitles={['Remove Person From Project']}
					avatarColor={avatarColor}
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
								?
								this.displayProjectCollaborators()
								:
								<div className='progress-container'>
									<CircularProgress />
								</div>
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
								?
								this.displayConnections(currentConnections, ['Remove'], ['Remove Connection'])
								:
								<div className='progress-container'>
									<CircularProgress />
								</div>
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
								?
								this.displayConnections(connectionRequests, ['Accept', 'Delete'], ['Accept Connection Request', 'Delete Connection Request'])
								:
								<div className='progress-container'>
									<CircularProgress />
								</div>
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
								?
								this.displayConnections(pendingConnections, ['Cancel'], ['Cancel Connection Request'])
								:
								<div className='progress-container'>
									<CircularProgress />
								</div>
							}
						</div>
					</div>
				</div>
			</div>
		)
	}
}