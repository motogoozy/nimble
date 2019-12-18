import React, { Component } from 'react';
import './Column.scss';
import Task from '../Task/Task';
import ColorPicker from '../ColorPicker/ColorPicker';
import { lightColors } from './colors.js';

import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import TextField from '@material-ui/core/TextField';
import { Draggable, Droppable } from 'react-beautiful-dnd';



export default class Column extends Component {
	state = {
		title: '',
		newTitle: '',
		columnColorCode: [],
		newColumnColorCode: [],
		displayEditModal: false,
		displayColorPicker: false,
		archived: false,
	};

	componentDidMount = () => {
		const { column } = this.props;
		this.setState({ 
			title: column.title,
			newTitle: column.title,
			columnColorCode: column.colorCode,
			newColumnColorCode: column.colorCode,
			archived: column.archived,
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
		this.setState({ newColumnColorCode: codeArr });
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
		const { columnColorCode, title } = this.state;
		this.setState({ 
			title: title,
			columnColorCode: columnColorCode,
			newColumnColorCode: columnColorCode,
			displayEditModal: false,
			displayColorPicker: false,
		});
	};

	saveChanges = async () => {
		const { newTitle, newColumnColorCode, archived } = this.state;
		const { column } = this.props;
		const body = {
			title: newTitle,
			color_code: newColumnColorCode,
			archived: archived,
		};
		try {
			let updated = await this.props.updateList(column.databaseId, body);
			this.setState({
				title: updated.title,
				newTitle: updated.title,
				columnColorCode: updated.color_code,
				newColumnColorCode: updated.color_code,
				displayEditModal: false,
				displayColorPicker: false,
			});
		}
		catch (err) {
			console.log(err);
		}
	};

	displayTasks = () => {
		const { tasks } = this.props;
		const { columnColorCode } = this.state;
		return tasks.map((task, index) => {
			return (
				<Task
					key={task.id}
					id={task.id}
					index={index}
					title={task.title}
					content={task.content}
					colorCode={columnColorCode}
				/>
			)
		});
	};

	editModal = () => {
		const { column } = this.props;
		const { title, newColumnColorCode } = this.state;
		const currentColor = this.formatColor(newColumnColorCode);
		const headerTextColor = this.checkIsLight(newColumnColorCode) === true ? 'black' : 'white';

		return (
			<div className='modal-wrapper' onClick={this.cancelChanges}>
				<div className='edit-column-modal' onClick={e => e.stopPropagation()}>
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
									<IconButton aria-label="delete" onClick={() => this.props.deleteList(column.databaseId, column.id)}>
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
		const { column, index } = this.props;
		const { title, columnColorCode } = this.state;

		return (
			<Draggable draggableId={column.id} index={index}>
				{(provided, snapshot) => {
					const headerBackgroundColor = this.formatColor(columnColorCode);
					const headerTextColor = this.checkIsLight(columnColorCode) === true ? 'black' : 'white';
					const dragColor = `rgba(${columnColorCode[0]}, ${columnColorCode[1]}, ${columnColorCode[2]}, .25)`;
					const columnStyle = {
						boxShadow: snapshot.isDragging ? '0px 0px 10px 1px rgba(107,107,107,1)' : '',
						...provided.draggableProps.style
					}

					return (
						<div
							className='column'
							ref={provided.innerRef}
							{...provided.draggableProps}
							style={columnStyle}
							>
							<div className='column-header' style={{ backgroundColor: headerBackgroundColor, color: headerTextColor }} {...provided.dragHandleProps}>
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
							<Droppable droppableId={column.id} type='task'>
								{(provided, snapshot) => {
									const style = {
										backgroundColor: snapshot.isDraggingOver ? dragColor : '',
										...provided.droppableProps.style
									};

									return (
										<div
											className='column-content'
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
							<div className='column-footer'>
								<div className='column-add-button-container cursor-pointer'>
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
