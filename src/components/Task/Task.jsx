import React, { Component } from 'react';
import './Task.scss';

import { Draggable } from 'react-beautiful-dnd';


export default class Task extends Component {
	state = {};
	
	
	render() {
		const { title, content, id, index, colorCode } = this.props;
		return (
			<Draggable draggableId={id} index={index}>
				{(provided, snapshot) => {
					const borderColor = `rgba(${[...colorCode]})`
					const style = {
						border: snapshot.isDragging ? `2px solid ${borderColor}` : `1px solid ${borderColor}`,
						boxShadow: snapshot.isDragging ? '0px 0px 10px 0px rgba(107,107,107,1)' : 'none',
						...provided.draggableProps.style
					};

					return (
						<div
							className='task'
							{...provided.draggableProps}
							{...provided.dragHandleProps}
							style={style}
							ref={provided.innerRef} 
						>
							<h4>{title}</h4>
							<p>{content}</p>
						</div>
					)
				}}
			</Draggable>
		)
	}
}
