import React, { Component } from 'react';
import './List.scss';
import Task from '../Task/Task';
import ColorPicker from '../ColorPicker/ColorPicker';
import { lightColors } from '../../assets/colors';
import { formatColor } from '../../utils';
import GlobalContext from '../../GlobalContext';

import axios from 'axios';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import Swal from 'sweetalert2/src/sweetalert2.js';

class List extends Component {
  state = {
    archived: false,
    displayAddTaskModal: false,
    displayColorPicker: false,
    displayEditModal: false,
    listColorCode: [],
    newListColorCode: [],
    newListTitle: '',
    newTaskTitle: '',
    newAssignedUsers: '',
    newTaskNotes: '',
    title: '', // current list title
  };

  componentDidMount = () => {
    const { list } = this.props;

    this.setState({
      title: list.title,
      newListTitle: list.title,
      listColorCode: list.colorCode,
      newListColorCode: list.colorCode,
      archived: list.archived,
    });
  };

  handleInput = (key, value) => {
    this.setState({ [key]: value });
  };

  handleCheckUser = event => {
    const { newAssignedUsers } = this.state;
    const userId = parseInt(event.target.value);
    let users = Array.from(newAssignedUsers);

    if (event.target.checked) {
      users.push(userId);
    } else {
      users.splice(users.indexOf(userId), 1);
    }

    this.setState({ newAssignedUsers: users });
  };

  handleAddTaskClick = () => {
    const { project, projectPermissions } = this.props;
    const { loggedInUser } = this.context;

    // Only allow add task if loggedInUser is project owner or has permission to add tasks
    if (!projectPermissions.add_tasks && project.created_by !== loggedInUser.user_id) {
      Swal.fire({
        type: 'warning',
        title: 'Oops!',
        text: 'You do not have permission to add tasks for this project.',
      });
      return;
    }

    this.setState({ displayAddTaskModal: true });
  };

  handleEditListClick = () => {
    const { projectPermissions, project } = this.props;
    const { loggedInUser } = this.context;
    // Only allow edit list if loggedInUser is project owner or has permission to edit lists
    if (!projectPermissions.edit_lists && project.created_by !== loggedInUser.user_id) {
      Swal.fire({
        type: 'warning',
        title: 'Oops!',
        text: 'You do not have permission to edit lists for this project.',
      });
      return;
    }

    this.setState({ displayEditModal: true });
  };

  handleColorChange = event => {
    const { r, g, b, a } = event.rgb;
    let codeArr = [r, g, b, a];
    this.setState({ newListColorCode: codeArr });
  };

  closeColorPicker = () => {
    this.setState({
      displayColorPicker: false,
    });
  };

  checkIsLight = currentColor => {
    let isLight = false;
    lightColors.forEach(colorArr => {
      if (colorArr.toString() === currentColor.toString()) {
        isLight = true;
      }
    });
    return isLight;
  };

  cancelChanges = () => {
    const { listColorCode, title } = this.state;
    this.setState({
      title: title,
      listColorCode: listColorCode,
      newListColorCode: listColorCode,
      displayEditModal: false,
      displayColorPicker: false,
    });
  };

  saveChanges = async () => {
    const { newListTitle, newListColorCode, archived } = this.state;
    const { list } = this.props;

    if (newListTitle.length > 50) {
      Swal.fire({
        type: 'warning',
        title: 'Oops!',
        text: 'List title must be under 50 characters in length.',
      });
      return;
    }
    try {
      let taskIdIntegers = this.props.convertTaskIdsToIntegers(list.taskIds);
      let oldList = await axios.get(`/list/${list.databaseId}`);
      let newTaskOrder = taskIdIntegers;
      let mergedTaskOrder = oldList.data.task_order.filter(task => {
        if (newTaskOrder.includes(task)) {
          return false;
        } else {
          return true;
        }
      });
      mergedTaskOrder = [...mergedTaskOrder, ...newTaskOrder];
      const body = {
        title: newListTitle,
        color_code: newListColorCode,
        archived: archived,
        task_order: mergedTaskOrder,
      };

      let updated = await this.props.updateList(list.databaseId, body);

      this.setState({
        title: updated.title,
        newListTitle: updated.title,
        listColorCode: updated.color_code,
        newListColorCode: updated.color_code,
        displayEditModal: false,
        displayColorPicker: false,
      });
    } catch (err) {
      console.log(err.response?.data ? err.response.data : err);
    }
  };

  addTask = async () => {
    const { newTaskTitle, newTaskNotes, newAssignedUsers } = this.state;
    const { list, projectId, updateList, getLists } = this.props;
    const { loggedInUser } = this.context;
    const taskBody = {
      title: newTaskTitle,
      created_by: loggedInUser.user_id,
      list_id: list.databaseId,
      notes: newTaskNotes,
    };

    if (newTaskTitle.length > 250) {
      Swal.fire({
        type: 'warning',
        title: 'Oops!',
        text: 'Task title must be under 250 characters in length.',
      });
      return;
    }

    this.setState({ displayAddTaskModal: false });
    try {
      let res = await axios.post(`/project/${projectId}/task`, taskBody);

      if (newAssignedUsers) {
        let taskUserPromises = newAssignedUsers.map(userId => {
          const body = {
            user_id: userId,
            task_id: res.data.task_id,
          };
          return axios.post(`/task_users/${projectId}`, body);
        });
        await Promise.all(taskUserPromises);
      }

      let added = res.data;
      let newTaskOrder = list.taskIds.map(id => parseInt(id));
      let newTaskId = added.task_id;
      newTaskOrder.push(newTaskId);
      const listBody = {
        title: list.title,
        color_code: list.colorCode,
        archived: list.archived,
        task_order: newTaskOrder,
      };
      await this.props.getTaskUsers();
      await this.props.getAllTasks();
      await updateList(added.list_id, listBody);
      await getLists();
      this.setState({
        newTaskTitle: '',
        newAssignedUsers: '',
        newTaskNotes: '',
      });
    } catch (err) {
      console.log(err.response?.data ? err.response.data : err);
    }
  };

  cancelAddTask = () => {
    this.setState({
      displayAddTaskModal: false,
      newTaskTitle: '',
      newAssignedUsers: '',
      newTaskNotes: '',
    });
  };

  deleteTask = task_id => {
    const { projectPermissions, project } = this.props;
    const { loggedInUser } = this.context;

    // Only allow task deletion if loggedInUser is project owner or has permission to add tasks
    if (!projectPermissions.delete_tasks && project.created_by !== loggedInUser.user_id) {
      Swal.fire({
        type: 'warning',
        title: 'Oops!',
        text: 'You do not have permission to delete tasks for this project.',
      });
      return;
    }

    Swal.fire({
      type: 'warning',
      title: 'Are you sure?',
      text: 'This task will be permanently deleted!',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then(async res => {
      if (res.value) {
        this.setState({ displayEditModal: false });
        const { list } = this.props;
        let removedIndex = list.taskIds.indexOf(task_id.toString());
        let taskOrder = list.taskIds;
        taskOrder.splice(removedIndex, 1);
        let newTaskOrder = taskOrder.map(task => parseInt(task));
        const body = {
          title: list.title,
          color_code: list.colorCode,
          archived: list.archived,
          task_order: newTaskOrder,
        };
        try {
          await axios.delete(`/task_users/task/${task_id}`);
          await axios.delete(`/task/${task_id}`);
          await this.props.updateList(list.id, body);
          await this.props.getAllTasks();
          await this.props.getTaskUsers();
          this.props.getLists();
        } catch (err) {
          console.log(err.response?.data ? err.response.data : err);
        }
      }
    });
  };

  displayTasks = () => {
    const {
      tasks,
      highlightTasksOfUser,
      projectUsers,
      projectId,
      taskUsers,
      getAllTasks,
      getTaskUsers,
      getLists,
      search,
    } = this.props;
    const { listColorCode } = this.state;

    const projectUsersObj = {};
    projectUsers.forEach(user => {
      projectUsersObj[user.user_id] = user;
    });

    return tasks.map((task, index) => {
      let highlight = false;

      if (search) {
        let titleMatch = false;
        let firstNameMatch = false;
        let lastNameMatch = false;
        let fullNameMatch = false;

        if (task.title.toLowerCase().includes(search.toLowerCase())) {
          titleMatch = true;
        }

        task.assignedUsers.forEach(user_id => {
          const firstName = projectUsersObj[user_id].first_name;
          const lastName = projectUsersObj[user_id].last_name;
          const fullName = firstName + ' ' + lastName;
          if (firstName.toLowerCase().includes(search.toLowerCase())) {
            firstNameMatch = true;
          }
          if (lastName.toLowerCase().includes(search.toLowerCase())) {
            lastNameMatch = true;
          }
          if (fullName.toLowerCase().includes(search.toLowerCase())) {
            fullNameMatch = true;
          }
        });

        if (titleMatch || firstNameMatch || lastNameMatch || fullNameMatch) {
          highlight = true;
        } else if (!titleMatch && !firstNameMatch && !lastNameMatch && fullNameMatch) {
          highlight = false;
        }
      } else {
        // Overview & My Tasks
        if (highlightTasksOfUser === 'all' || task.assignedUsers.includes(highlightTasksOfUser)) {
          highlight = true;
        }

        // Unassigned
        if (task.assignedUsers.length === 0 && highlightTasksOfUser === 'none') {
          highlight = true;
        }
      }

      return (
        <Task
          key={task.id}
          id={task.id}
          index={index}
          title={task.title}
          notes={task.notes}
          colorCode={listColorCode}
          list_id={task.list_id}
          created_at={task.created_at}
          created_by={task.created_by}
          checkIsLight={this.checkIsLight}
          deleteTask={this.deleteTask}
          getAllTasks={getAllTasks}
          getTaskUsers={getTaskUsers}
          getLists={getLists}
          highlightTasksOfUser={highlightTasksOfUser}
          assignedUsers={task.assignedUsers}
          project={this.props.project}
          projectId={projectId}
          projectUsers={projectUsers}
          taskUsers={taskUsers}
          search={search}
          highlight={highlight}
          projectPermissions={this.props.projectPermissions}
        />
      );
    });
  };

  addTaskModal = () => {
    const { projectUsers } = this.props;
    const { newAssignedUsers, newTaskNotes } = this.state;

    projectUsers.sort((a, b) => (a.first_name > b.first_name ? 1 : -1));

    const availableUserList = projectUsers.map(user => {
      return (
        <div key={user.user_id} className='new-task-assigned-user'>
          <Checkbox
            color='primary'
            value={user.user_id}
            onChange={event => this.handleCheckUser(event)}
            checked={newAssignedUsers.includes(user.user_id)}
          />
          <p>
            {user.first_name} {user.last_name}
          </p>
        </div>
      );
    });

    return (
      <div className='modal-wrapper' onClick={this.cancelAddTask}>
        <div className='add-task-modal' style={{ padding: '1rem' }} onClick={e => e.stopPropagation()}>
          <div className='add-task-modal-header'>
            <p>New Task:</p>
          </div>
          <div className='add-task-modal-body'>
            <div className='add-task-modal-body-item add-task-title-container'>
              <p className='add-task-body-item-header'>Title</p>
              <TextField
                required
                autoFocus
                fullWidth
                placeholder='Title (60 chars max)'
                id='standard-required'
                onChange={e => this.handleInput('newTaskTitle', e.target.value)}
              />
            </div>
            <div className='add-task-modal-body-item new-task-assigned-users-container'>
              <p className='add-task-body-item-header'>Assigned Users:</p>
              <div className='new-task-assigned-users'>{availableUserList}</div>
            </div>
            <div className='add-task-modal-body-item new-task-notes'>
              <p className='add-task-body-item-header'>Notes</p>
              <textarea
                name='task-notes'
                id='task-notes'
                maxLength='250'
                value={newTaskNotes}
                onChange={e => this.handleInput('newTaskNotes', e.target.value)}
              ></textarea>
            </div>
          </div>
          <div className='add-task-modal-footer'>
            <Button
              style={{ margin: '1rem .5rem 0 .5rem' }}
              variant='outlined'
              color='secondary'
              onClick={this.cancelAddTask}
            >
              Cancel
            </Button>
            <Button
              style={{ margin: '1rem .5rem 0 .5rem' }}
              variant='outlined'
              color='primary'
              onClick={this.addTask}
              disabled={!this.state.newTaskTitle}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    );
  };

  editModal = () => {
    const { list } = this.props;
    const { title, newListColorCode } = this.state;
    const currentColor = formatColor(newListColorCode);
    const headerTextColor = this.checkIsLight(newListColorCode) === true ? 'black' : 'white';

    return (
      <div className='modal-wrapper' onClick={this.cancelChanges}>
        <div className='edit-list-modal' onClick={e => e.stopPropagation()}>
          <div
            className='edit-modal-header'
            style={{
              backgroundColor: currentColor,
              color: headerTextColor,
            }}
          >
            <p style={{ fontSize: '1.2rem' }}>{title}</p>
          </div>
          <div className='edit-modal-body' onClick={() => this.setState({ displayColorPicker: false })}>
            <div className='edit-modal-body-item'>
              <p style={{ fontWeight: '500' }}>Title</p>
              <TextField
                required
                id='standard-required'
                fullWidth={true}
                value={this.state.newListTitle}
                onChange={e => this.handleInput('newListTitle', e.target.value)}
              />
            </div>
            <div className='edit-modal-body-item'>
              <p style={{ fontWeight: '500' }}>List Color:</p>
              <div
                onClick={e => {
                  this.setState({
                    displayColorPicker: !this.state.displayColorPicker,
                  });
                  e.stopPropagation();
                }}
                className='current-color-box cursor-pointer'
                style={{
                  backgroundColor: currentColor,
                  margin: '.5rem .5rem .5rem 0',
                }}
              />
              {this.state.displayColorPicker && (
                <div className='color-picker-container'>
                  <ColorPicker
                    handleColorChange={e => this.handleColorChange(e)}
                    closeColorPicker={this.closeColorPicker}
                  />
                </div>
              )}
            </div>

            <div className='edit-modal-buttons'>
              <div className='edit-modal-delete-container'>
                <Tooltip title={'Delete List'}>
                  <IconButton aria-label='delete' onClick={() => this.props.deleteList(list.databaseId, list.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </div>
              <div className='edit-save-cancel-container'>
                <div>
                  <Button variant='outlined' color='secondary' onClick={this.cancelChanges}>
                    Cancel
                  </Button>
                </div>
                <div>
                  <Button variant='outlined' color='primary' onClick={this.saveChanges}>
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    const { list, index } = this.props;
    const { title, listColorCode } = this.state;

    return (
      <Draggable draggableId={list.id} index={index}>
        {(provided, snapshot) => {
          const headerBackgroundColor = formatColor(listColorCode);
          const headerTextColor = this.checkIsLight(listColorCode) === true ? 'black' : 'white';
          const dragColor = `rgba(${listColorCode[0]}, ${listColorCode[1]}, ${listColorCode[2]}, .25)`;
          const listStyle = {
            boxShadow: snapshot.isDragging ? '0px 0px 10px 1px rgba(107,107,107,1)' : '',
            ...provided.draggableProps.style,
          };

          return (
            <div className='list' ref={provided.innerRef} {...provided.draggableProps} style={listStyle}>
              <div
                className='list-header'
                style={{
                  backgroundColor: headerBackgroundColor,
                  color: headerTextColor,
                }}
                {...provided.dragHandleProps}
              >
                <p style={{ fontSize: '1.2rem' }}>{title}</p>
                <Tooltip title={'Edit List'}>
                  <i
                    style={{ padding: '.25rem .5rem' }}
                    onClick={this.handleEditListClick}
                    className='fas fa-ellipsis-v cursor-pointer'
                  ></i>
                </Tooltip>
              </div>

              {this.state.displayEditModal && this.editModal()}

              {this.state.displayAddTaskModal && this.addTaskModal()}

              <Droppable droppableId={list.id} type='task'>
                {(provided, snapshot) => {
                  const style = {
                    backgroundColor: snapshot.isDraggingOver ? dragColor : '',
                    ...provided.droppableProps.style,
                  };

                  return (
                    <div className='list-content' ref={provided.innerRef} style={style} {...provided.droppableProps}>
                      {this.displayTasks()}
                      {provided.placeholder}
                    </div>
                  );
                }}
              </Droppable>
              <div className='list-footer'>
                <div className='list-add-button-container cursor-pointer' onClick={this.handleAddTaskClick}>
                  <i className='fas fa-plus'></i>
                  <p>ADD NEW TASK</p>
                </div>
              </div>
            </div>
          );
        }}
      </Draggable>
    );
  }
}

List.contextType = GlobalContext;
export default List;
