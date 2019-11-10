import React, { Component } from 'react';
import './Column.scss';
import Task from '../Task/Task';

import Tooltip from '@material-ui/core/Tooltip';

export default class Column extends Component {
	state = {};

	displayTasks = () => {
		const { tasks } = this.props;
		return tasks.map(task => {
			return (
				<Task
					key={task.id}
					id={task.id}
					title={task.title}
					content={task.content}
				/>
			)
		});
	}

	render() {
		const { tasks, headerColor } = this.state;
		return (
			<div className='column'>
				<div className='column-header' style={{ backgroundColor: headerColor }}>
					<p>Column Header</p>
					<i className="fas fa-ellipsis-v cursor-pointer"></i>
				</div>
				<div className='column-content'>
					{ this.displayTasks(tasks) }
				</div>
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
