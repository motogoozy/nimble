import React, { Component } from 'react';
import './Column.scss';
import Task from '../Task/Task';

import Tooltip from '@material-ui/core/Tooltip';
import { Droppable } from 'react-beautiful-dnd';


export default class Column extends Component {
	state = {};

	displayTasks = () => {
		const { tasks } = this.props;
		return tasks.map((task, index) => {
			return (
				<Task
					key={task.id}
					id={task.id}
					index={index}
					title={task.title}
					content={task.content}
				/>
			)
		});
	};

	render() {
		const { headerColor } = this.state;
		const { column } = this.props;
		return (
			<div className='column'>
				<div className='column-header' style={{ backgroundColor: headerColor }}>
					<p>Column Header</p>
					<i className="fas fa-ellipsis-v cursor-pointer"></i>
				</div>
				<Droppable droppableId={column.id}>
					{(provided, snapshot) => {
						const style = {
							backgroundColor: snapshot.isDraggingOver ? 'skyblue': 'white',
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
	}
}
