import React, { Component } from 'react';
import './List.scss';
import Task from '../Task/Task';
import ColorPicker from '../ColorPicker/ColorPicker';
import { lightColors } from './colors.js';

import axios from 'axios';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import TextField from '@material-ui/core/TextField';
import { Draggable, Droppable } from 'react-beautiful-dnd';


export default class List extends Component {
	state = {
		title: '',
		newTitle: '',
		newTaskTitle: '',
		listColorCode: [],
		newListColorCode: [],
		displayAddTaskModal: false,
		displayEditModal: false,
		displayColorPicker: false,
		archived: false,
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

	formatColor = (arr) => `rgba(${arr[0]}, ${arr[1]}, ${arr[2]}, ${arr[3]})`;

	handleInput = (key, value) => {
      this.setState({ [key]: value });
   };

	handleColorChange = (event) => {
		const { r, g, b, a } = event.rgb;
		let codeArr = [r, g, b, a];
		console.log(codeArr)
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
		let taskIdIntegers = this.props.convertTaskIdsToIntegers(list.taskIds);
		const body = {
			title: newTitle,
			color_code: newListColorCode,
			archived: archived,
			task_order: taskIdIntegers,
		};
		try {
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
			console.log(err);
		}
	};

	addTask = async () => {
		const { newTaskTitle } = this.state;
		const { loggedInUser, list, projectId, updateList, getLists } = this.props;
		const taskBody = {
			title: newTaskTitle,
			created_by: loggedInUser,
			list_id: list.databaseId,
		};
		try {
			let res = await axios.post(`/project/${projectId}/task`, taskBody);
			let added = res.data;
			let newTaskOrder = list.taskIds.map(id => parseInt(id));
			let newTaskId = added.id;
			newTaskOrder.push(newTaskId)
			const listBody = {
				title: list.title,
				color_code: list.colorCode,
				archived: list.archived,
				task_order: newTaskOrder,
			};
			await this.props.getTasks();
			await updateList(added.list_id, listBody);
			await getLists();
			this.setState({
				newTaskTitle: '',
				displayAddTaskModal: false,
			});
		} catch (err) {
			console.log(err);
		}
	};

	cancelAddTask = () => {
		this.setState({
			newTaskTitle: '',
			displayAddTaskModal: false,
		});
	};

	displayTasks = () => {
		const { tasks } = this.props;
		const { listColorCode } = this.state;
		return tasks.map((task, index) => {
			return (
				<Task
					key={task.id}
					id={task.id}
					index={index}
					title={task.title}
					content={task.content}
					colorCode={listColorCode}
					formatColor={this.formatColor}
					checkIsLight={this.checkIsLight}
				/>
			)
		});
	};

	addTaskModal = () => {
		return (
			<div className='modal-wrapper' onClick={this.cancelAddTask}>
            <div className='add-task-modal' style={{ padding: '1rem' }} onClick={e => e.stopPropagation()}>
               <h3>New Task:</h3>
               <div className='add-task-modal-body'>
                  <div className='add-modal-body-item'>
                     <h4>Title</h4>
                     <TextField
                     required
                     id="standard-required"
                     onChange={e => this.handleInput('newTaskTitle', e.target.value)}
                     autoFocus
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
		const currentColor = this.formatColor(newListColorCode);
		const headerTextColor = this.checkIsLight(newListColorCode) === true ? 'black' : 'white';

		return (
			<div className='modal-wrapper' onClick={this.cancelChanges}>
				<div className='edit-list-modal' onClick={e => e.stopPropagation()}>
					<div className='edit-modal-header' style={{ backgroundColor: currentColor, color: headerTextColor }}>
						<h4>{title}</h4>
					</div>
					<div className='edit-modal-body'>
						<div className='edit-modal-body-item'>
							<h4>Title</h4>
							<TextField
								required
								id="standard-required"
								defaultValue={title}
								onChange={e => this.handleInput('newTitle', e.target.value)}
							/>
						</div>
						<div className='edit-modal-body-item'>
							<h4>List Color:</h4>
							<div onClick={() => this.setState({ displayColorPicker: !this.state.displayColorPicker })} className='current-color-box cursor-pointer' style={{ backgroundColor: currentColor, margin: '.5rem .5rem .5rem 0' }}></div>
							{
								this.state.displayColorPicker
								&&
								<div className='color-picker-container'>   
									<ColorPicker
										formatColor={this.formatColor}
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
					const headerBackgroundColor = this.formatColor(listColorCode);
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
								<p>{title}</p>
								<Tooltip title='Edit List'>
									<i style={{ padding: '.25rem .5rem' }} onClick={() => this.setState({ displayEditModal: true })} className="fas fa-ellipsis-v cursor-pointer"></i>
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
								<div className='list-add-button-container cursor-pointer' onClick={() => this.setState({ displayAddTaskModal: true })}>
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
