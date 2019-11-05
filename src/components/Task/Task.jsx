import React, { Component } from 'react';
import './Task.scss';

export default class Task extends Component {
	state = {};

	render() {
		return (
			<div className='task'>
				<h5>{this.props.title}</h5>
				<p>{this.props.content}</p>
			</div>
		)
	}
}
