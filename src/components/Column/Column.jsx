import React, { Component } from 'react';
import './Column.scss';

export default class Column extends Component {
	render() {
		return (
			<div className='column'>
				<div className='column-header'>
					<p>Column Header</p>
					<i className="fas fa-ellipsis-v"></i>
				</div>
				<div className='column-content'>
					<p>Column Content</p>
				</div>
			</div>
		)
	}
}