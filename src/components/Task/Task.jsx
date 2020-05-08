import React, { Component } from 'react';
import './Task.scss';
// import Avatar from '../Avatar/Avatar';

import axios from 'axios';
import { Draggable } from 'react-beautiful-dnd';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import Avatar from '@material-ui/core/Avatar';
import { makeStyles } from '@material-ui/core/styles';

export default class Task extends Component {
	state = {
		title: '',
		newTitle: '',
		notes: '',
		status: '',
		assignedUsers: '',
		displayEditModal: false,
	};

	componentDidMount = () => {
		const { title, status, assignedUsers, notes } = this.props;
		this.setState({
			title: title,
			notes: notes,
			newTitle: title,
			status: status,
			assignedUsers: assignedUsers,
		});
	};

	handleInput = (key, value) => {
      this.setState({ [key]: value });
	};

	updateTask = async () => {
		this.setState({ displayEditModal: false });
		const { newTitle, notes, status, assignedUsers } = this.state;
		const { id, list_id, created_at, created_by, projectId, taskUsers } = this.props;
		const taskBody = {
			title: newTitle,
			notes: notes,
			status: status,
			list_id: list_id,
			created_at: created_at,
			created_by: created_by,
		};
		try {
			let previouslyAssigned = this.props.assignedUsers;
			let usersToAdd = [];
			let usersToRemove = [];

			assignedUsers.forEach(user => {
				if (!previouslyAssigned.includes(user)) {
					usersToAdd.push(user);
				}
			});
			previouslyAssigned.forEach(user => {
				if (!assignedUsers.includes(user)) {
					usersToRemove.push(user);
				}
			});

			if (usersToAdd.length > 0 || usersToRemove.length > 0) {
				try {
					let addPromises = usersToAdd.map(userId => {
						const body = {
							user_id: userId,
							task_id: id,
						};
						return axios.post(`/task_users/${projectId}`, body);
					});
					let removePromises = usersToRemove.map(userId => {
						let idToRemove;
						for (let key in taskUsers) {
							let tu = taskUsers[key];
							if (
								tu.task_id === parseInt(id) &&
								tu.user_id === userId &&
								tu.project_id === projectId
							) {
								idToRemove = tu.tu_id;
							}
						}
						if (idToRemove) {
							return axios.delete(`/task_users/${idToRemove}`);
						} else return null;
					});
					await Promise.all(addPromises, removePromises);
					await this.props.getTaskUsers();
					await this.props.getAllTasks();
				} catch (err) {
					console.log(err);
				}
			}

			let edited = await axios.put(`/task/${parseInt(id)}`, taskBody);
			await this.props.getAllTasks();
			this.props.getLists();
			this.setState({
				title: edited.data.title,
				newTitle: edited.data.title,
			});
		} catch (err) {
			console.log(err);
		}
	};
	
	cancelUpdateTask = () => {
		const { title, assignedUsers } = this.props;
		this.setState({
			newTitle: title,
			displayEditModal: false,
			assignedUsers: assignedUsers,
		});
	};

	deleteTask = async () => {
		const { id } = this.props;
		try {
			await this.props.deleteTask(id);
		} catch (err) {
			console.log(err);
		}
	};

	handleCheckUser = event => {
		const { assignedUsers } = this.state;
		const userId = parseInt(event.target.value)
		let newAssignedUsers = Array.from(assignedUsers);

		if (event.target.checked) {
			newAssignedUsers.push(userId);
		} else {
			newAssignedUsers.splice(newAssignedUsers.indexOf(userId), 1);
		}

		this.setState({ assignedUsers: newAssignedUsers });
	};

	getUserInitials = (user) => `${user.first_name.split('')[0]}${user.last_name.split('')[0]}`;

	formatColor = (arr) => `rgba(${arr[0]}, ${arr[1]}, ${arr[2]}, ${arr[3]})`;

	displayTaskUserAvatars = () => {
		const { projectUsers, highlightTasksOfUser } = this.props;
		const projectUserMap = {};
		projectUsers.forEach(projectUser => {
			projectUserMap[projectUser.user_id] = projectUser;
		});
		const { assignedUsers } = this.state;
		let displayUsers = [];
		let remainingUsers = [];
		if (assignedUsers.length > 3) {
			displayUsers = assignedUsers.slice(0, 3);
			remainingUsers = assignedUsers.slice(3);
		} 
		else {
			displayUsers = [...assignedUsers];
		}

		// Styling for user avatars
		let styleObj = {
			default: {
				backgroundColor: 'rgba(150, 150, 150, 1)',
				border: 'none',
			}
		};
		displayUsers.forEach(userId => {
			const user = projectUserMap[userId];
			const userColor = this.formatColor(user.color);
			let backgroundColor = userColor;
			if ((this.props.highlightTasksOfUser === 'none' && !this.props.search) || !this.props.highlight) {
				backgroundColor = 'gray';
			}
			styleObj[userId] = {
				backgroundColor: backgroundColor,
				border: 'none',
			}
		})
		const useStyles = makeStyles(styleObj);
		const classes = useStyles();

		let avatarList = displayUsers.map(userId => {
			const user = projectUserMap[userId];
			const userInitials = this.getUserInitials(user);

			if (highlightTasksOfUser === 'all' || highlightTasksOfUser === 'none' || highlightTasksOfUser === userId) {
				return (
					<Tooltip key={userId} title={`${user.first_name} ${user.last_name}`}>
						<Avatar className={classes[userId]}>{userInitials}</Avatar>
					</Tooltip>
				)
			}  else return null;
		});

		if (remainingUsers.length > 0 && highlightTasksOfUser === 'all') {
			avatarList.push(
				<Tooltip key={'remaining-users-avatar'} title={`${remainingUsers.length} more...`}>
					<Avatar className={classes.default}>{`+${remainingUsers.length}`}</Avatar>
				</Tooltip>
			)
		}

		return (
			<AvatarGroup>
				{ avatarList }
			</AvatarGroup>
		);
	};

	editModal = () => {
		const { colorCode, formatColor, checkIsLight, projectUsers } = this.props;
		const { title, newTitle, notes, assignedUsers } = this.state;
		const currentColor = formatColor(colorCode);
		const headerTextColor = checkIsLight(colorCode) === true ? 'black' : 'white';
		
		projectUsers.sort((a, b) => (a.first_name > b.first_name) ? 1 : -1);
		
		const availableUserList = projectUsers.map(user => {
			return (
				<div key={user.user_id} className='task-assigned-user'>
					<Checkbox
						color='primary'
						value={user.user_id}
						onChange={event => this.handleCheckUser(event)}
						checked={assignedUsers.includes(user.user_id)}
					/>
					<p>{user.first_name} {user.last_name}</p>
				</div>
			)
		});

		return (
			<div className='modal-wrapper' onClick={this.cancelUpdateTask}>
				<div className='edit-task-modal' onClick={e => e.stopPropagation()}>
					<div className='edit-task-modal-header' style={{ backgroundColor: currentColor, color: headerTextColor }}>
						<p style={{ fontSize: '1.2rem' }}>{title}</p>
					</div>
					<div className='edit-task-modal-body'>
						<div className='edit-task-title'>
							<p style={{ fontWeight: '500' }}>Title</p>
							<TextField
								required
								id="standard-required"
								fullWidth={true}
								value={newTitle}
								onChange={e => this.handleInput('newTitle', e.target.value)}
							/>
						</div>
						<div className='task-assigned-users-container'>
							<p style={{ fontWeight: '500', marginBottom: '.2rem' }}>Assigned User(s)</p>
							<div className='task-assigned-users'>
								{ availableUserList }
							</div>
						</div>
						<div className='task-notes-container'>
							<p style={{ fontWeight: '500', marginBottom: '.2rem' }}>Notes</p>
							<textarea
								name="task-notes"
								id="task-notes"
								maxLength='250'
								value={notes}
								onChange={e => this.handleInput('notes', e.target.value )}
							></textarea>
						</div>
						<div className='edit-modal-buttons'>
							<div className='edit-modal-delete-container'>
								<Tooltip title={'Delete List'}>
									<IconButton aria-label="delete" onClick={this.deleteTask}>
										<DeleteIcon />
									</IconButton>
								</Tooltip>
							</div>
							<div className='edit-save-cancel-container'>
								<div>
									<Button variant="outlined" color='secondary' onClick={this.cancelUpdateTask}>Cancel</Button>
								</div>
								<div>
									<Button variant="outlined" color='primary' onClick={this.updateTask}>Save</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	};
	
	render() {
		const { title } = this.state;
		const { id, index, colorCode, highlight } = this.props;

		return (
			<>
				<Draggable draggableId={id} index={index}>
					{(provided, snapshot) => {
						const borderColor = `rgba(${[...colorCode]})`
						const mainStyle = {
							border: snapshot.isDragging ? `2px solid ${borderColor}` : `1px solid ${borderColor}`,
							boxShadow: snapshot.isDragging ? '0px 0px 10px 0px rgba(107,107,107,1)' : 'none',
						};

						const borderStyle = {
							border: highlight ? `2px solid ${borderColor}` : 'none',
							...provided.draggableProps.style
						}

						return (
							<div
								className={highlight ? 'task' : ' task unselected-task'}
								{...provided.draggableProps}
								{...provided.dragHandleProps}
								style={{...mainStyle, ...borderStyle}}
								ref={provided.innerRef} 
							>
								<div className='task-header'>
									<p>{title}</p>
									<Tooltip title={'Edit Task'}>
										<i className={highlight ? 'fas fa-pencil-alt cursor-pointer' : 'fas fa-pencil-alt cursor-pointer unselected-task'} onClick={() => this.setState({ displayEditModal: true })}></i>
									</Tooltip>
								</div>
								<div className='assigned-user-avatars' onClick={() => this.setState({ displayEditModal: true })}>
									{ this.displayTaskUserAvatars() }
								</div>
							</div>
						)
					}}
				</Draggable>
				{
					this.state.displayEditModal
					&&
					this.editModal()
				}
			</>
		)
	}
}
