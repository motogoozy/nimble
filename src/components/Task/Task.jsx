import React, { Component } from 'react';
import './Task.scss';

import axios from 'axios';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import TextField from '@material-ui/core/TextField';
import { Draggable } from 'react-beautiful-dnd';


export default class Task extends Component {
	state = {
		title: '',
		newTitle: '',
		content: '',
		displayEditModal: false,
	};

	componentDidMount = () => {
		const { title, content, status } = this.props;
		this.setState({
			title: title,
			newTitle: title,
			content: content,
			status: status,
		});
	};

	handleInput = (key, value) => {
      this.setState({ [key]: value });
	};

	updateTask = async () => {
		const { newTitle, status } = this.state;
		const { id, list_id, created_at, created_by } = this.props;
		const body = {
			title: newTitle,
			status: status,
			list_id: list_id,
			created_at: created_at,
			created_by: created_by,
		};
		try {
			let res = await axios.put(`/task/${id}`, body);
			this.props.getTasks();
			this.setState({
				displayEditModal: false,
				title: res.data.title,
				newTitle: res.data.newTitle,
			});
		} catch (err) {
			console.log(err);
		}
	};
	
	cancelUpdateTask = () => {
		const { title, content } = this.props;
		this.setState({
			newTitle: title,
			content: content,
			displayEditModal: false,
		});
	};

	editModal = () => {
		const { colorCode, formatColor, checkIsLight } = this.props;
		const { title } = this.state;
		const currentColor = formatColor(colorCode);
		const headerTextColor = checkIsLight(colorCode) === true ? 'black' : 'white';

		return (
			<div className='modal-wrapper' onClick={this.cancelUpdateTask}>
				<div className='edit-task-modal' onClick={e => e.stopPropagation()}>
					<div className='edit-task-modal-header' style={{ backgroundColor: currentColor, color: headerTextColor }}>
						<h4>{title}</h4>
					</div>
					<div className='edit-task-modal-body'>
						<div className='edit-task-modal-body-item'>
							<h4>Title</h4>
							<TextField
								required
								id="standard-required"
								defaultValue={title}
								onChange={e => this.handleInput('newTitle', e.target.value)}
							/>
						</div>
						<div className='edit-modal-buttons'>
							<div className='edit-modal-delete-container'>
								<Tooltip title={'Delete List'}>
									<IconButton aria-label="delete">
										<DeleteIcon />
									</IconButton>
								</Tooltip>
							</div>
							<div className='edit-save-cancel-container'>
								<div>
									<Button variant="outlined" color='secondary' onClick={this.cancelUpdateTask}>Cancel</Button>
								</div>
								<div>
									<Button variant="outlined" color='primary' onClick={this.updateTask}>Save</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	};
	
	
	render() {
		const { title, content } = this.state;
		const { id, index, colorCode } = this.props;
		return (
			<>
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
								<div className='task-header'>
									<p>{title}</p>
									<i className="fas fa-pencil-alt cursor-pointer" onClick={() => this.setState({ displayEditModal: true })}></i>
								</div>
								<p>{content}</p>
							</div>
						)
					}}
				</Draggable>
				{
					this.state.displayEditModal
					&&
					this.editModal()
				}
			</>
		)
	}
}
