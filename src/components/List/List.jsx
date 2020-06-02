import React, { Component } from 'react';
import './List.scss';
import Task from '../Task/Task';
import ColorPicker from '../ColorPicker/ColorPicker';
import { lightColors } from '../../assets/colors';
import { formatColor } from '../../utils';

import axios from 'axios';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import TextField from '@material-ui/core/TextField';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import Swal from 'sweetalert2/src/sweetalert2.js'


export default class List extends Component {
	state = {
		archived: false,
		displayAddTaskModal: false,
		displayColorPicker: false,
		displayEditModal: false,
		listColorCode: [],
		newListColorCode: [],
		newTaskTitle: '',
		newTitle: '',
		title: '',
	};

	componentDidMount = () => {
		const { list } = this.props;
		this.setState({ 
			title: list.title,
			newTitle: list.title,
			listColorCode: list.colorCode,
			newListColorCode: list.colorCode,
			archived: list.archived,
		});
	};

	handleInput = (key, value) => {
      this.setState({ [key]: value });
	};
	
	handleAddTaskClick = () => {
		// Only allow add task if loggedInUser is project owner or has permission to add tasks
		if (this.props.project.created_by === this.props.loggedInUser.user_id || this.props.projectPermissions.add_tasks) {
			this.setState({ displayAddTaskModal: true });
		} else {
			Swal.fire({
				type: 'warning',
				title: 'Oops!',
				text: 'You do not have permission to add tasks for this project.',
			})
		}
	};

	handleEditListClick = () => {
		// Only allow edit list if loggedInUser is project owner or has permission to edit lists
		if (this.props.project.created_by === this.props.loggedInUser.user_id || this.props.projectPermissions.edit_lists) {
			this.setState({ displayEditModal: true });
		} else {
			Swal.fire({
				type: 'warning',
				title: 'Oops!',
				text: 'You do not have permission to edit lists for this project.',
			})
		}
	};

	handleColorChange = (event) => {
		const { r, g, b, a } = event.rgb;
		let codeArr = [r, g, b, a];
		this.setState({ newListColorCode: codeArr });
	};

	closeColorPicker = () => {
		this.setState({ 
			displayColorPicker: false,
		});
	};
	
	checkIsLight = (currentColor) => {
		let isLight = false;
		lightColors.forEach(colorArr => {
			if (colorArr.toString() === currentColor.toString()) {
				isLight = true;
			}
		});
		return isLight;
	};

	cancelChanges = () => {
		const { listColorCode, title } = this.state;
		this.setState({ 
			title: title,
			listColorCode: listColorCode,
			newListColorCode: listColorCode,
			displayEditModal: false,
			displayColorPicker: false,
		});
	};

	saveChanges = async () => {
		const { newTitle, newListColorCode, archived } = this.state;
		const { list } = this.props;
		try {
			let taskIdIntegers = this.props.convertTaskIdsToIntegers(list.taskIds);
			let oldList = await axios.get(`/list/${list.databaseId}`);
			let newTaskOrder = taskIdIntegers;
			let mergedTaskOrder = oldList.data.task_order.filter(task => {
				if (newTaskOrder.includes(task)) {
					return false;
				} else {
					return true;
				}
			});
			mergedTaskOrder = [...mergedTaskOrder, ...newTaskOrder];
			const body = {
				title: newTitle,
				color_code: newListColorCode,
				archived: archived,
				task_order: mergedTaskOrder,
			};

			let updated = await this.props.updateList(list.databaseId, body);

			this.setState({
				title: updated.title,
				newTitle: updated.title,
				listColorCode: updated.color_code,
				newListColorCode: updated.color_code,
				displayEditModal: false,
				displayColorPicker: false,
			});
		}
		catch (err) {
			console.log(err.response.data);
		}
	};

	addTask = async () => {
		const { newTaskTitle } = this.state;
		const { loggedInUser, list, projectId, updateList, getLists } = this.props;
		const taskBody = {
			title: newTaskTitle,
			created_by: loggedInUser.user_id,
			list_id: list.databaseId,
		};
		this.setState({ displayAddTaskModal: false });
		try {
			let res = await axios.post(`/project/${projectId}/task`, taskBody);
			let added = res.data;
			let newTaskOrder = list.taskIds.map(id => parseInt(id));
			let newTaskId = added.task_id;
			newTaskOrder.push(newTaskId)
			const listBody = {
				title: list.title,
				color_code: list.colorCode,
				archived: list.archived,
				task_order: newTaskOrder,
			};
			await this.props.getAllTasks();
			await updateList(added.list_id, listBody);			
			await getLists();
			this.setState({
				newTaskTitle: '',
			});
		} catch (err) {
			console.log(err.response.data);
		}
	};

	cancelAddTask = () => {
		this.setState({
			newTaskTitle: '',
			displayAddTaskModal: false,
		});
	};

	deleteTask = async (task_id) => {
		this.setState({ displayEditModal: false });
		const { list } = this.props;
		let removedIndex = list.taskIds.indexOf(task_id.toString());
		let taskOrder = list.taskIds;
		taskOrder.splice(removedIndex, 1);
		let newTaskOrder = taskOrder.map(task => parseInt(task));
		const body = {
			title: list.title,
			color_code: list.colorCode,
			archived: list.archived,
			task_order: newTaskOrder,
		};
		try {
			await axios.delete(`/task_users/task/${task_id}`);
			await axios.delete(`/task/${task_id}`);
			await this.props.updateList(list.id, body);
			await this.props.getAllTasks();
			await this.props.getTaskUsers();
			this.props.getLists();
		} catch (err) {
			console.log(err.response.data);
		}
	};

	displayTasks = () => {
		const { tasks, highlightTasksOfUser, projectUsers, projectId, taskUsers, getAllTasks, getTaskUsers, getLists, search } = this.props;
		const { listColorCode } = this.state;

		const projectUsersObj = {};
		projectUsers.forEach(user => {
			projectUsersObj[user.user_id] = user;
		});
		
		return tasks.map((task, index) => {
			let highlight = false;
			
			if (search) {
			let titleMatch = false;
				let firstNameMatch = false;
				let lastNameMatch = false;
				let fullNameMatch = false;

				if (task.title.toLowerCase().includes(search.toLowerCase())) {
					titleMatch = true;
				}
				
				task.assignedUsers.forEach(user_id => {
					const firstName = projectUsersObj[user_id].first_name;
					const lastName = projectUsersObj[user_id].last_name;
					const fullName = firstName + ' ' + lastName;
					if (firstName.toLowerCase().includes(search.toLowerCase())) {
						firstNameMatch = true;
					}
					if (lastName.toLowerCase().includes(search.toLowerCase())) {
						lastNameMatch = true;
					}
					if (fullName.toLowerCase().includes(search.toLowerCase())) {
						fullNameMatch = true;
					}
				})
				
				if (titleMatch || firstNameMatch || lastNameMatch || fullNameMatch) {
					highlight = true;
				} else if (!titleMatch && !firstNameMatch && !lastNameMatch && fullNameMatch) {
					highlight = false;
				}
			} else {
				// Overview & My Tasks
				if (highlightTasksOfUser === 'all' || task.assignedUsers.includes(highlightTasksOfUser)) {
					highlight = true;
				}
	
				// Unassigned
				if (task.assignedUsers.length === 0 && highlightTasksOfUser === 'none') {
					highlight = true;
				}
			}

			return (
				<Task
					key={task.id}
					id={task.id}
					index={index}
					title={task.title}
					notes={task.notes}
					colorCode={listColorCode}
					list_id={task.list_id}
					created_at={task.created_at}
					created_by={task.created_by}
					checkIsLight={this.checkIsLight}
					deleteTask={this.deleteTask}
					getAllTasks={getAllTasks}
					getTaskUsers={getTaskUsers}
					getLists={getLists}
					highlightTasksOfUser={highlightTasksOfUser}
					assignedUsers={task.assignedUsers}
					project={this.props.project}
					projectId={projectId}
					projectUsers={projectUsers}
					taskUsers={taskUsers}
					loggedInUser={this.props.loggedInUser}
					search={search}
					highlight={highlight}
					projectPermissions={this.props.projectPermissions}
				/>
			)
		});
	};

	addTaskModal = () => {
		return (
			<div className='modal-wrapper' onClick={this.cancelAddTask}>
            <div className='add-task-modal' style={{ padding: '1rem' }} onClick={e => e.stopPropagation()}>
               <p style={{ fontSize: '1.2rem' }}>New Task:</p>
               <div className='add-task-modal-body'>
                  <div className='add-modal-body-item'>
                     <p>Title</p>
                     <TextField
								required
								autoFocus
								placeholder='Title (60 chars max)'
								id="standard-required"
								onChange={e => this.handleInput('newTaskTitle', e.target.value)}
                     />
                  </div>
               </div>
               <div>
                  <Button style={{ margin: '1rem .5rem 0 .5rem' }} variant="outlined" color='secondary' onClick={this.cancelAddTask}>Cancel</Button>
                  <Button style={{ margin: '1rem .5rem 0 .5rem' }} variant="outlined" color='primary' onClick={this.addTask}>Save</Button>
               </div>
            </div>
         </div>
		)
	};

	editModal = () => {
		const { list } = this.props;
		const { title, newListColorCode } = this.state;
		const currentColor = formatColor(newListColorCode);
		const headerTextColor = this.checkIsLight(newListColorCode) === true ? 'black' : 'white';

		return (
			<div className='modal-wrapper' onClick={this.cancelChanges}>
				<div className='edit-list-modal' onClick={e => e.stopPropagation()}>
					<div className='edit-modal-header' style={{ backgroundColor: currentColor, color: headerTextColor }}>
						<p style={{ fontSize: '1.2rem' }}>{title}</p>
					</div>
					<div className='edit-modal-body' onClick={() => this.setState({ displayColorPicker: false })}>
						<div className='edit-modal-body-item'>
							<p style={{ fontWeight: '500' }}>Title</p>
							<TextField
								required
								id="standard-required"
								fullWidth={true}
								value={this.state.newTitle}
								onChange={e => this.handleInput('newTitle', e.target.value)}
							/>
						</div>
						<div className='edit-modal-body-item'>
							<p style={{ fontWeight: '500' }}>List Color:</p>
							<div
								onClick={e => {
									this.setState({ displayColorPicker: !this.state.displayColorPicker });
									e.stopPropagation();
								}}
								className='current-color-box cursor-pointer'
								style={{ backgroundColor: currentColor, margin: '.5rem .5rem .5rem 0' }}
							/>
							{
								this.state.displayColorPicker
								&&
								<div className='color-picker-container'>   
									<ColorPicker
										handleColorChange={e => this.handleColorChange(e)}
										closeColorPicker={this.closeColorPicker}
									/>
								</div>
							}
						</div>

						<div className='edit-modal-buttons'>
							<div className='edit-modal-delete-container'>
								<Tooltip title={'Delete List'}>
									<IconButton aria-label="delete" onClick={() => this.props.deleteList(list.databaseId, list.id)}>
										<DeleteIcon />
									</IconButton>
								</Tooltip>
							</div>
							<div className='edit-save-cancel-container'>
								<div>
									<Button variant="outlined" color='secondary' onClick={this.cancelChanges}>Cancel</Button>
								</div>
								<div>
									<Button variant="outlined" color='primary' onClick={this.saveChanges}>Save</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	};


	render() {
		const { list, index } = this.props;
		const { title, listColorCode } = this.state;

		return (
			<Draggable draggableId={list.id} index={index}>
				{(provided, snapshot) => {
					const headerBackgroundColor = formatColor(listColorCode);
					const headerTextColor = this.checkIsLight(listColorCode) === true ? 'black' : 'white';
					const dragColor = `rgba(${listColorCode[0]}, ${listColorCode[1]}, ${listColorCode[2]}, .25)`;
					const listStyle = {
						boxShadow: snapshot.isDragging ? '0px 0px 10px 1px rgba(107,107,107,1)' : '',
						...provided.draggableProps.style
					}

					return (
						<div
							className='list'
							ref={provided.innerRef}
							{...provided.draggableProps}
							style={listStyle}
						>
							<div className='list-header' style={{ backgroundColor: headerBackgroundColor, color: headerTextColor }} {...provided.dragHandleProps}>
								<p style={{ fontSize: '1.2rem' }}>{title}</p>
								<Tooltip title={'Edit List'}>
									<i style={{ padding: '.25rem .5rem' }} onClick={this.handleEditListClick} className="fas fa-ellipsis-v cursor-pointer"></i>
								</Tooltip>
							</div>

							{
								this.state.displayEditModal
								&&
								this.editModal()
							}

							{
								this.state.displayAddTaskModal
								&&
								this.addTaskModal()
							}

							<Droppable droppableId={list.id} type='task'>
								{(provided, snapshot) => {
									const style = {
										backgroundColor: snapshot.isDraggingOver ? dragColor : '',
										...provided.droppableProps.style
									};

									return (
										<div
											className='list-content'
											ref={provided.innerRef}
											style={style}
											{...provided.droppableProps}
										>
											{ this.displayTasks() }
											{ provided.placeholder }
										</div>
									)
								}}
							</Droppable>
							<div className='list-footer'>
								<div className='list-add-button-container cursor-pointer' onClick={this.handleAddTaskClick}>
									<i className="fas fa-plus"></i>
									<p>ADD NEW TASK</p>
								</div>
							</div>
						</div>
					)
				}}
			</Draggable>
		)
	}
}
