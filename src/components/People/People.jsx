import React, { Component } from 'react';
import './People.scss';
import SmallAddButton from '../SmallAddButton/SmallAddButton';
import UserConnection from './UserConnection/UserConnection';

import axios from 'axios';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

export default class PeoplePage extends Component {
	state = {
		currentConnections: '',
		connectionRequests: '',
		pendingConnections: '',
		users: '',
		projectUsers: '',
		newUserEmail: '',
		displayAddCollaboratorModal: false,
		displayAddConnectionModal: false,
		addingUser: '',
	};

	componentDidMount = async () => {
		await this.getUserConnections();
		await this.getUserConnectionDetails();
	};

	componentDidUpdate = async (prevProps) => {
		if (prevProps.projectId !== this.props.projectId) {
			await this.props.getProjectUsers();
			await this.getUserConnections();
			await this.getUserConnectionDetails();
		}
	};

	getUserConnections = async () => {
		const { loggedInUser } = this.props;
		let res = await axios.get(`/connection//user/${loggedInUser.user_id}`);
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

	getUserConnectionDetails = async () => {
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
		if (!list) return;
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

	handleInput = (key, value) => {
      this.setState({ [key]: value });
	};
	
	formatColor = (colorArr) => `rgba(${colorArr[0]}, ${colorArr[1]}, ${colorArr[2]}, ${colorArr[3]})`;

	addProjectUser = async (userId) => {
		const { projectId } = this.props;

		this.setState({ addingUser: userId }, async () => {
			try {
				await axios.post(`/project/${projectId}/user/${userId}`);
				await this.getUserConnections();
				await this.getUserConnectionDetails();
				await this.props.getProjectUsers();
				this.setState({ addingUser: '' });
			} catch (err) {
				if (err.response.data.message) {
					console.log(err.response.data.message);
				}
			}
		})
	};

	removeProjectUser = async (userId) => {
		const { projectId } = this.props;

		try {
			await axios.delete(`/project/${projectId}/user/${userId}`);
			await axios.delete(`/task_users/project/${projectId}/user/${userId}`)
			await this.props.getProjectUsers();
			await this.props.getTaskUsers();
			await this.props.getAllTasks();
			await this.getUserConnections();
			await this.getUserConnectionDetails();
		} catch (err) {
			if (err.response.data.message) {
				console.log(err.response.data.message);
			}
		}
	};

	addUserConnection = async () => {
		const { newUserEmail } = this.state;
		const { loggedInUser } = this.props;
		const body = {
			email: newUserEmail,
		};

		try {
			await axios.post(`/connection/user/${loggedInUser.user_id}`, body);
			this.setState({
				users: '',
				displayAddConnectionModal: false ,
				newUserEmail: '',
			}, async () => {
				await this.getUserConnections();
				await this.getUserConnectionDetails();
			});
		} catch (err) {
			if (err.response.data.message) {
				console.log(err.response.data.message);
			}
		}
	};

	cancelAddUserConnection = () => {
		this.setState({
			newUserEmail: '',
			displayAddConnectionModal: false
		});
	};

	removeUserConnection = async (connection) => {
		const { loggedInUser, projectId } = this.props;
		let userId;

		if (connection.send_id === loggedInUser.user_id) {
			userId = connection.receive_id;
		} else {
			userId = connection.send_id;
		}

		try {
			await axios.delete(`/connection/${connection.connection_id}/user/${loggedInUser.user_id}`);
			await axios.delete(`/project/${projectId}/user/${userId}`);
			await axios.delete(`/task_users/project/${projectId}/user/${userId}`);
			await this.props.getTaskUsers();
			await this.props.getAllTasks();
			this.setState({
				users: ''
			}, async () => {
				await this.getUserConnections();
				await this.getUserConnectionDetails();
				await this.props.getProjectUsers();
			})
		} catch (err) {
			if (err.response.data.message) {
				console.log(err.response.data.message);
			}
		}
	};

	acceptUserConnection = async (connectionId) => {
		const { loggedInUser, projectId } = this.props;
		const body = {
			user_id: loggedInUser.user_id,
		};

		try {
			await axios.put(`/connection/${connectionId}`, body);
			this.setState({
				users: '',
			}, async () => {
				await this.getUserConnections();
				await this.getUserConnectionDetails();
				await this.props.getConnectionRequests();
				if (projectId) {
					await this.props.getProjectUsers();
				}
			});
		} catch (err) {
			if (err.response.data.message) {
				console.log(err.response.data.message);
			}
		}
	};

	displayProjectUsers = () => {
		const { loggedInUser, projectUsers } = this.props;

		if (projectUsers.length === 0) {
			return (
				<div>
					<i className='no-connections-text'>No users assigned to this project.</i>
				</div>
			)
		}

		projectUsers.sort((a, b) => (a.first_name > b.first_name) ? 1 : -1);

		return projectUsers.map(user => {
			let avatarColor = this.formatColor(user.color);
			return (
				<div className='user-connection-container' key={`projectCollaborator: ${user.user_id}`}>
					<UserConnection
						user={user}
						actions={['Remove']}
						tooltipTitles={['Remove Person From Project']}
						avatarColor={avatarColor}
					/>
					{
						user.user_id !== loggedInUser.user_id
						&&
						<div className='user-connection-actions'>
							<Tooltip title={'Remove User from Project'}>
								<p onClick={() => this.removeProjectUser(user.user_id)}>Remove</p>
							</Tooltip>
						</div>
					}
				</div>
			)
		})
	};
	
	displayCurrentConnections = () => {
		const { users, currentConnections } = this.state;
		const { loggedInUser } = this.props;

		if (currentConnections.length === 0) {
			return (
				<div>
					<i className='no-connections-text'>No current connections.</i>
				</div>
			)
		}

		let connectionList = currentConnections.map(connection => {
			let userId;
			if (connection.send_id === loggedInUser.user_id ) {
				userId = connection.receive_id;
			} else {
				userId = connection.send_id;
			}
			let user = users[userId];
			let avatarColor = this.formatColor(user.color);
			return {
				connection: connection,
				user: user,
				avatarColor: avatarColor
			}
		});

		connectionList.sort((a, b) => (a.user.first_name > b.user.first_name) ? 1 : -1);

		return connectionList.map(obj => {
			return (
				<div className='user-connection-container' key={`current-connection-id: ${obj.connection.connection_id}`}>
					<UserConnection
						user={obj.user}
						avatarColor={obj.avatarColor}
					/>
					<div className='user-connection-actions'>
						<Tooltip title={'Remove User Connection'}>
							<p onClick={() => this.removeUserConnection(obj.connection)}>Remove</p>
						</Tooltip>
					</div>
				</div>
			)
		})
	};

	displayConnectionRequests = () => {
		const { users, connectionRequests } = this.state;
		const { loggedInUser } = this.props;

		if (connectionRequests.length === 0) {
			return (
				<div>
					<i className='no-connections-text'>No connection requests.</i>
				</div>
			)
		}

		let connectionList = connectionRequests.map(connection => {
			let userId;
			if (connection.send_id === loggedInUser.user_id ) {
				userId = connection.receive_id;
			} else {
				userId = connection.send_id;
			}
			let user = users[userId];
			let avatarColor = this.formatColor(user.color);
			return {
				connection: connection,
				user: user,
				avatarColor: avatarColor
			}
		});

		connectionList.sort((a, b) => (a.user.first_name > b.user.first_name) ? 1 : -1);

		return connectionList.map(obj => {
			return (
				<div className='user-connection-container' key={`request-connection-id: ${obj.connection.connection_id}`}>
					<UserConnection
						user={obj.user}
						avatarColor={obj.avatarColor}
					/>
					<div className='user-connection-actions'>
						<Tooltip title={'Accept Connection Request'}>
							<p className='accept-connection-button' onClick={() => this.acceptUserConnection(obj.connection.connection_id)}>Accept</p>
						</Tooltip>
						<Tooltip title={'Ignore Connection Request'}>
							<p onClick={() => this.removeUserConnection(obj.connection)}>Ignore</p>
						</Tooltip>
					</div>
				</div>
			)
		})
	};

	displayPendingConnections = () => {
		const { users, pendingConnections } = this.state;
		const { loggedInUser } = this.props;

		if (pendingConnections.length === 0) {
			return (
				<div>
					<i className='no-connections-text'>No pending connections.</i>
				</div>
			)
		}

		let connectionList = pendingConnections.map(connection => {
			let userId;
			if (connection.send_id === loggedInUser.user_id ) {
				userId = connection.receive_id;
			} else {
				userId = connection.send_id;
			}
			let user = users[userId];
			let avatarColor = this.formatColor(user.color);
			return {
				connection: connection,
				user: user,
				avatarColor: avatarColor
			}
		});

		connectionList.sort((a, b) => (a.user.first_name > b.user.first_name) ? 1 : -1);

		return connectionList.map(obj => {
			return (
				<div className='user-connection-container' key={`pending-connection-id: ${obj.connection.connection_id}`}>
					<UserConnection
						user={obj.user}
						avatarColor={obj.avatarColor}
					/>
					<div className='user-connection-actions'>
						<Tooltip title={'Cancel Connection Request'}>
							<p onClick={() => this.removeUserConnection(obj.connection)}>Cancel</p>
						</Tooltip>
					</div>
				</div>
			)
		})
	};

	addCollaboratorModal = () => {
		const { currentConnections, users, addingUser } = this.state;
		const { loggedInUser, projectUsers } = this.props;

		const displayAvailableConnections = (list) => {
			if (list.length === 0) {
				return <i style={{ color: 'gray', textAlign: 'left' }}>No connections available. Connect with a user to add them to the project.</i>
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
							{
								addingUser === user.user_id
								?
								<div className='adding-user-progress'>
									<CircularProgress size={25} />
								</div>
								:
								<div onClick={() => this.addProjectUser(user.user_id)}>
									<SmallAddButton title={'Add Person'}/>
								</div>
							}
						</div>
					)
				} else return null;
			});
		};

		let remainingConnections = currentConnections.filter(connection => {
			let isAvailable = true;
			for (let i = 0; i < projectUsers.length; i++) {
				if (connection.send_id === loggedInUser.user_id) {
					if (connection.receive_id === projectUsers[i].user_id) {
						isAvailable = false;
						break;
					}
				} else {
					if (connection.send_id === projectUsers[i].user_id) {
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

		userList.sort((a, b) => (a.first_name > b.first_name) ? 1 : -1);

		return (
			<div className='modal-wrapper' onClick={() => this.setState({ displayAddCollaboratorModal: false })}>
				<div className='add-project-collaborator-modal' onClick={e => e.stopPropagation()}>
					<div className='add-project-collaborator-modal-header'>
						<p>Add Person to Project</p>
						<i className="fas fa-times cursor-pointer" onClick={() => this.setState({ displayAddCollaboratorModal: false })}></i>
					</div>
					<div className='add-project-collaborator-connections-container'>
						<p style={{ marginBottom: '1rem' }}>Available Connections:</p>
						<div className='add-project-collaborator-connections'>
							{ displayAvailableConnections(userList) }
						</div>
					</div>
				</div>
			</div>
		)
	};

	addConnectionModal = () => {
		const { newUserEmail } = this.state;
		return (
			<div className='modal-wrapper' onClick={this.cancelAddUserConnection}>
				<div className='add-connection-modal' style={{ padding: '1rem' }} onClick={e => e.stopPropagation()}>
               <p style={{ fontSize: '1.2rem' }}>Add New Connection:</p>
               <TextField
                  id="standard-search"
						label="User Email"
						value={newUserEmail}
                  onChange={e => this.handleInput('newUserEmail', e.target.value)}
                  autoFocus
               />
               <div>
                  <Button style={{ margin: '1rem .5rem 0 .5rem' }} variant="outlined" color='secondary' onClick={this.cancelAddUserConnection}>Cancel</Button>
                  <Button style={{ margin: '1rem .5rem 0 .5rem' }} variant="outlined" color='primary' onClick={this.addUserConnection}>Save</Button>
               </div>
            </div>
			</div>
		)
	};

	render() {
		const { currentConnections, connectionRequests, pendingConnections, users } = this.state;
		const { projectId, projectUsers } = this.props;

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
								projectId
								?
								<>
								{
									projectUsers
									?
									this.displayProjectUsers()
									:
									<div className='progress-container'>
										<CircularProgress />
									</div>
								}
								</>
								:
								<div>
									<i style={{ color: 'gray' }}>Select a Project to see Collaborators.</i>
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
								<div onClick={() => this.setState({ displayAddConnectionModal: true })}>
									<SmallAddButton title={'Add Connection'}/>
								</div>
							}
						</div>
						<div className='connection-column-body'>
							{
								users && currentConnections
								?
								this.displayCurrentConnections()
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
								users && connectionRequests
								?
								this.displayConnectionRequests()
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
								users && pendingConnections
								?
								this.displayPendingConnections()
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
				{
					this.state.displayAddConnectionModal
					&&
					this.addConnectionModal()
				}
			</div>
		)
	}
}