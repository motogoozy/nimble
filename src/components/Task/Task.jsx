import React, { Component } from 'react';
import './Task.scss';

export default class Task extends Component {
	state = {};

	render() {
		return (
			<div className='task'>
				<h4>{this.props.title}</h4>
				<p>{this.props.content}</p>
			</div>
		)
	}
}
