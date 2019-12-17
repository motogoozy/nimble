import React, { Component } from 'react';
import './Column.scss';
import Task from '../Task/Task';
import ColorPicker from '../ColorPicker/ColorPicker';

import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import TextField from '@material-ui/core/TextField';
import { Draggable, Droppable } from 'react-beautiful-dnd';

let lightColors = [
	[255, 205, 210, 1],
	[248, 187, 208, 1],
	[225, 190, 231, 1],
	[209, 196, 233, 1],
	[197, 202, 233, 1],
	[187, 222, 251, 1],
	[179, 229, 252, 1],
	[178, 235, 242, 1],
	[178, 223, 219, 1],
	[200, 230, 201, 1],
	[220, 237, 200, 1],
	[240, 244, 195, 1],
	[255, 249, 196, 1],
	[255, 236, 179, 1],
	[255, 224, 178, 1],
	[255, 204, 188, 1],
	[215, 204, 200, 1],
	[207, 216, 220, 1],
	[255, 255, 255, 1],
	[217, 217, 217, 1],
	[255, 241, 118, 1],
	[220, 231, 117, 1],
	[255, 235, 59, 1],
	[255, 213, 79, 1],
];

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

	checkIsLight = (currentColor) => {
		let isLight = false;
		lightColors.forEach(colorArr => {
			if (colorArr.toString() === currentColor.toString()) {
				isLight = true;
			}
		});
		return isLight;
	};
	
	closeColorPicker = () => {
		this.setState({ 
			displayColorPicker: false,
		});
	};

	cancelChanges = () => {
		const { column } = this.props;
		this.setState({ 
			title: column.title,
			columnColorCode: column.colorCode,
			newColumnColorCode: column.colorCode,
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
				columnColorCode: updated.color_code,
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
		const { newColumnColorCode } = this.state;
		const currentColor = this.formatColor(newColumnColorCode);
		const headerTextColor = this.checkIsLight(newColumnColorCode) === true ? 'black' : 'white';

		return (
			<div className='modal-wrapper' onClick={this.cancelChanges}>
				<div className='edit-column-modal' onClick={e => e.stopPropagation()}>
					<div className='edit-modal-header' style={{ backgroundColor: currentColor, color: headerTextColor }}>
						<h4>{column.title}</h4>
					</div>
					<div className='edit-modal-body'>
						<div className='edit-modal-body-item'>
							<h4>Title</h4>
							<TextField
								required
								id="standard-required"
								defaultValue={column.title}
								onChange={e => this.handleInput('newTitle', e.target.value)}
							/>
						</div>
						<div className='edit-modal-body-item'>
							<h4>Column Color:</h4>
							<div onClick={() => this.setState({ displayColorPicker: true })} className='current-color-box cursor-pointer' style={{ backgroundColor: currentColor, margin: '.5rem .5rem .5rem 0' }}></div>
							{
								this.state.displayColorPicker
								&&
								<ColorPicker
									formatColor={this.formatColor}
									handleColorChange={this.handleColorChange}
									closeColorPicker={this.closeColorPicker}
								/>
							}
						</div>

						<div className='edit-modal-buttons'>
							<div className='edit-modal-delete-container'>
								<Tooltip title={'Delete List'}>
									<IconButton aria-label="delete" onClick={() => this.props.deleteList(column.databaseId, column.id)}>
										<DeleteIcon fontSize='small'/>
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
