import React, { Component } from 'react';
import './Column.scss';
import Task from '../Task/Task';
import ColorPicker from '../ColorPicker/ColorPicker';


import Tooltip from '@material-ui/core/Tooltip';
import { Draggable, Droppable } from 'react-beautiful-dnd';


export default class Column extends Component {
	state = {
		displayEditModal: false,
		columnColorCode: [],
	};

	componentDidMount = () => {
		const { column } = this.props;
		this.setState({ columnColorCode: column.colorCode });
	}

	displayTasks = () => {
		const { tasks, colorCode } = this.props;
		return tasks.map((task, index) => {
			return (
				<Task
					key={task.id}
					id={task.id}
					index={index}
					title={task.title}
					content={task.content}
					colorCode={colorCode}
				/>
			)
		});
	};

	formatColor = (arr) => `rgba(${arr[0]}, ${arr[1]}, ${arr[2]}, ${arr[3]})`;

	handleColorChange = (event) => {
		const { r, g, b, a } = event.rgb;
		let codeArr = [r, g, b, a];
		this.setState({ columnColorCode: codeArr });
	};

	closeColorPicker = () => {
		this.setState({ displayColorPicker: false })
	};

	displayEditModal = () => {
		const { column } = this.props;
		const { columnColorCode } = this.state;
		const currentColor = this.formatColor(columnColorCode);
		return (
			<div className='modal-wrapper' onClick={() => this.setState({ displayEditModal: false})}>
				<div className='edit-column-modal' onClick={e => e.stopPropagation()}>
					<h2>{column.title}</h2>
					<h4>Edit Column Color:</h4>
					<div onClick={() => this.setState({ displayColorPicker: true })} className='current-color-box' style={{ backgroundColor: currentColor }}></div>
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
			</div>
		)
	};

	render() {
		const { column, index } = this.props;

		return (
			<Draggable draggableId={column.id} index={index}>
				{(provided) => {
					const headerColor = this.formatColor(this.state.columnColorCode);
					const dragColor = `rgba(${this.state.columnColorCode[0]}, ${this.state.columnColorCode[1]}, ${this.state.columnColorCode[2]}, .25)`
					return (
						<div className='column' {...provided.draggableProps} ref={provided.innerRef} >
							<div className='column-header' style={{ backgroundColor: headerColor }} {...provided.dragHandleProps}>
								<p>Column Title</p>
								<i onClick={() => this.setState({ displayEditModal: true })} className="fas fa-ellipsis-v cursor-pointer"></i>
							</div>
							{
								this.state.displayEditModal
								&&
								this.displayEditModal()
							}
							<Droppable droppableId={column.id} type='task'>
								{(provided, snapshot) => {
									const style = {
										backgroundColor: snapshot.isDraggingOver ? dragColor : 'white',
										...provided.droppableProps.style
									};

									return (
										<div
											className='column-content'
											ref={provided.innerRef}
											style={style}
											{...provided.droppableProps}
											isDraggingOver={snapshot.isDraggingOver}
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
								<Tooltip title={'Delete List'}>
									<div className='column-delete-button cursor-pointer'>
										<i className="far fa-trash-alt"></i>
									</div>
								</Tooltip>
							</div>
						</div>
					)
				}}
			</Draggable>
		)
	}
}
