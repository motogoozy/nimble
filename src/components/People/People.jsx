import React, { Component } from 'react';
import './People.scss';
import SmallAddButton from '../SmallAddButton/SmallAddButton';
import UserConnection from './UserConnection/UserConnection';

import axios from 'axios';
import CircularProgress from '@material-ui/core/CircularProgress';

export default class PeoplePage extends Component {
	state = {
		currentConnections: '',
		connectionRequests: '',
		pendingConnections: '',
		users: '',
		projectCollaborators: '',
		displayAddCollaboratorModal: false,
	};

	componentDidMount = async () => {
		await this.getProjectUsers();
		await this.getUserConnections();
		await this.categorizeConnections();
	};

	componentDidUpdate = async (prevProps) => {
		if (prevProps.projectId !== this.props.projectId) {
			await this.getProjectUsers();
			await this.getUserConnections();
			await this.categorizeConnections();
		}
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

	addProjectUser = async (userId) => {
		const { projectId } = this.props;
		
		try {
			await axios.post(`/project/${projectId}/${userId}`);
			await this.getProjectUsers();
			await this.getUserConnections();
			await this.categorizeConnections();
		} catch (err) {
			if (err.response.data.message) {
				console.log(err.response.data.message);
			}
		}
	};

	removeProjectUser = async (userId) => {
		const { projectId } = this.props;

		try {
			await axios.delete(`/project/${projectId}/${userId}`);
			await this.getProjectUsers();
			await this.getUserConnections();
			await this.categorizeConnections();
		} catch (err) {
			if (err.response.data.message) {
				console.log(err.response.data.message);
			}
		}
	};

	displayProjectCollaborators = () => {
		const { projectCollaborators } = this.state;
		const { loggedInUser } = this.props;

		if (projectCollaborators.length === 0) {
			return (
				<div>
					<p>No users assigned to this project.</p>
				</div>
			)
		} else {
			return projectCollaborators.map(user => {
				let avatarColor = this.formatColor(user.color);
				return (
					<div className='project-collaborator-user'>
						<UserConnection
							key={`projectCollaborator: ${user.user_id}`}
							user={user}
							actions={['Remove']}
							tooltipTitles={['Remove Person From Project']}
							avatarColor={avatarColor}
						/>
						{
							user.user_id !== loggedInUser.user_id
							&&
							<p className='remove-project-user cursor-pointer' onClick={() => this.removeProjectUser(user.user_id)}>Remove</p>
						}
					</div>
				)
			})
		}
	};
	
	displayCurrentConnections = (list) => {
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
					key={`connection-id: ${connection.connection_id}`}
					user={user}
					avatarColor={avatarColor}
				/>
			)
		})
	};

	displayConnectionRequests = (list) => {
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
					key={`connection-id: ${connection.connection_id}`}
					user={user}
					avatarColor={avatarColor}
				/>
			)
		})
	};

	displayPendingConnections = (list) => {
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
					key={`connection-id: ${connection.connection_id}`}
					user={user}
					avatarColor={avatarColor}
				/>
			)
		})
	};


	addCollaboratorModal = () => {
		const { currentConnections, projectCollaborators, users } = this.state;
		const { loggedInUser } = this.props;

		const displayAvailableConnections = (list) => {
			if (list.length === 0) {
				return <i style={{ color: 'gray' }}>No connections available.</i>
			}

			return list.map(user => {
				if (user) {
					const avatarColor = this.formatColor(user.color);
					
					return (
						<div className='add-available-connection' key={`available: ${user.user_id}`}>
							<UserConnection
								user={user}
								actions={[]}
								tooltipTitles={[]}
								avatarColor={avatarColor}
							/>
							<div onClick={() => this.addProjectUser(user.user_id)}>
								<SmallAddButton title={'Add Person'}/>
							</div>
						</div>
					)
				} else return null;
			});
		};

		let remainingConnections = currentConnections.filter(connection => {
			let isAvailable = true;
			for (let i = 0; i < projectCollaborators.length; i++) {
				if (connection.send_id === loggedInUser.user_id) {
					if (connection.receive_id === projectCollaborators[i].user_id) {
						isAvailable = false;
						break;
					}
				} else {
					if (connection.send_id === projectCollaborators[i].user_id) {
						isAvailable = false;
						break;
					}
				}
			}
			return isAvailable;
		})

		let userList = remainingConnections.map(connection => {
			if (connection.receive_id === loggedInUser.user_id) {
				return users[connection.send_id];
			} else {
				return users[connection.receive_id];
			}
		});

		return (
			<div className='modal-wrapper' onClick={() => this.setState({ displayAddCollaboratorModal: false })}>
				<div className='add-project-collaborator-modal' onClick={e => e.stopPropagation()}>
					<div className='add-project-collaborator-modal-header'>
						<p>Add Person to Project</p>
					</div>
					<div className='add-project-collaborator-connections-container'>
						<p style={{ marginBottom: '1rem', textDecoration: 'underline' }}>Available Connections:</p>
						<div className='add-project-collaborator-connections'>
							{ displayAvailableConnections(userList) }
						</div>
					</div>
				</div>
			</div>
		)
	};

	render() {
		const { currentConnections, connectionRequests, pendingConnections, users, projectCollaborators } = this.state;

		return (
			<div className='people-main'>
				<div className='project-collaborators-container'>
					<div className='project-collaborators-column'>
						<div className='collaborators-column-header'>
							<p>Project Collaborators</p>
							{
								currentConnections
								&&
								<div onClick={() => this.setState({ displayAddCollaboratorModal: true })}>
									<SmallAddButton title={'Add User to Project'} />
								</div>
							}
						</div>
						<div className='collaborators-column-body'>
							{
								projectCollaborators
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
							{
								currentConnections
								&&
								<SmallAddButton title={'Add Connection'}/>
							}
						</div>
						<div className='connection-column-body'>
							{
								users
								?
								this.displayCurrentConnections(currentConnections)
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
								users
								?
								this.displayConnectionRequests(connectionRequests)
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
								users
								?
								this.displayPendingConnections(pendingConnections)
								:
								<div className='progress-container'>
									<CircularProgress />
								</div>
							}
						</div>
					</div>
				</div>
				{
					this.state.displayAddCollaboratorModal
					&&
					this.addCollaboratorModal()
				}
			</div>
		)
	}
}