import React, { Component } from 'react';
import './Column.scss';
import Task from '../Task/Task';

export default class Column extends Component {
	state = {};

	displayTasks = () => {
		const { tasks } = this.props;
		return tasks.map(task => {
			return (
				<Task
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
			</div>
		)
	}
}
