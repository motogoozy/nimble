import React, { Component } from 'react';
import './Dashboard.scss';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import List from '../../components/List/List';
import People from '../../components/People/People';
import ProjectSettings from '../../components/ProjectSettings/ProjectSettings';
import AddButton from '../../components/AddButton/AddButton';
import ColorPicker from '../../components/ColorPicker/ColorPicker';
import { formatColor } from '../../utils';

import axios from 'axios';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import PulseLoader from 'react-spinners/PulseLoader';
import Swal from 'sweetalert2';

export default class Dashboard extends Component {
  state = {
    connectionRequests: [],
    displayAddButton: false,
    displayAddListModal: false,
    displayLists: false,
    displayPeople: false,
    displaySettings: false,
    highlightTasksOfUser: 'all',
    isLoading: false,
    lists: '',
    listOrder: [], // array of strings of list_id's
    loggedInUser: '',
    newColorCode: [96, 125, 139, 1],
    project: {},
    projectId: null,
    projectPermissions: '',
    projectUsers: '',
    search: '',
    tasks: '',
    taskUsers: '',
    title: '',
  };

  componentDidMount = async () => {
    try {
      await this.getLoggedInUser();
      await this.getConnectionRequests().catch(err => console.log(err.response.data));
    } catch (err) {
      console.log(err.response.data);
    }
  };

  getLoggedInUser = async () => {
    const res = await axios.get('/auth/user_session');
    this.setState({ loggedInUser: res.data });

    return res.data;
  };

  logout = async () => {
    const { loggedInUser } = this.state;
    try {
      let res = await axios.get('/auth/logout');
      Swal.fire({
        // position: 'top-end',
        type: 'success',
        title: `${res.data}`,
        text: `See you next time, ${loggedInUser.first_name}`,
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        this.props.history.push('/welcome');
      });
    } catch (err) {
      console.log(err.response.data);
      this.props.history.push('/welcome');
    }
  };

  getCompleteProjectData = async id => {
    if (!this.state.displayPeople && !this.state.displaySettings) {
      this.setState({ displayLists: true });
    }
    this.setState(
      {
        isLoading: true,
        displayAddButton: false,
        projectId: id,
        lists: {},
        tasks: {},
        listOrder: [],
        search: '',
      },
      async () => {
        try {
          // !Keep function calls in this order!
          await this.getProjectUsers();
          await this.getTaskUsers();
          await this.getAllTasks();
          await this.getLists();
          await this.getProjectDetails();
          await this.getProjectPermissions();
        } catch (err) {
          // console.log(JSON.parse(err))
          console.log(err.response.data);
        } finally {
          this.setState({ isLoading: false });
        }
      }
    );
  };

  getProjectUsers = async () => {
    const { projectId } = this.state;

    const res = await axios.get(`/project/${projectId}/users`);

    this.setState({ projectUsers: res.data });
    return res.data;
  };

  getTaskUsers = async () => {
    const { projectId } = this.state;

    const res = await axios.get(`/task_users/${projectId}`);
    let taskUserObj = {};
    res.data.forEach(tu => {
      taskUserObj[tu.tu_id] = tu;
    });

    this.setState({
      taskUsers: taskUserObj,
    });
    return taskUserObj;
  };

  getAllTasks = async () => {
    const { projectId, taskUsers } = this.state;

    const res = await axios.get(`/project/${projectId}/tasks`);
    let tasks = {};
    let taskUserObj = {};
    for (let key in taskUsers) {
      let tu = taskUsers[key];
      if (!taskUserObj[tu.task_id]) {
        taskUserObj[tu.task_id] = [];
      }
      taskUserObj[tu.task_id].push(tu.user_id);
    }
    res.data.forEach(task => {
      if (taskUserObj[task.task_id]) {
        task.assignedUsers = taskUserObj[task.task_id];
      } else {
        task.assignedUsers = [];
      }
      task.databaseId = task.task_id;
      task.id = task.task_id.toString();
      tasks[task.id] = task;
      if (task.notes === null) {
        task.notes = '';
      }
    });

    this.setState({ tasks: tasks });
    return tasks;
  };

  getLists = async () => {
    const { projectId } = this.state;

    const res = await axios.get(`/project/${projectId}/lists`);
    let lists = {};
    res.data.forEach(list => {
      let taskOrderStrings = this.convertTaskIdsToStrings(list.task_order);
      let newList = {
        id: list.list_id.toString(),
        databaseId: list.list_id,
        title: list.title,
        colorCode: list.color_code,
        taskIds: taskOrderStrings,
        archived: list.archived,
      };
      lists[newList.id] = newList;
    });

    this.setState({
      lists: lists,
      displayAddButton: true,
    });
    return lists;
  };

  getProjectDetails = async () => {
    const { projectId } = this.state;
    const res = await axios.get(`/project/${projectId}`);
    const project = res.data[0];
    document.title = `Nimble - ${project.title}`;
    let listOrder = project.list_order.map(item => item.toString());

    const projectDetails = {
      listOrder: listOrder,
      project: project,
    };

    this.setState(projectDetails);
    return res;
  };

  getProjectPermissions = async () => {
    const { projectId } = this.state;

    const res = await axios.get(`/project/${projectId}/permissions`);

    this.setState({ projectPermissions: res.data });
    return res.data;
  };

  getUserById = userId => axios.get(`user/${userId}`);

  getTasksByUserId = async user_id => {
    const { projectId, lists } = this.state;
    const res = await axios.get(`/project/${projectId}/tasks/${user_id}`);
    let userTasks = {};
    let updatedLists = {};
    res.data.forEach(task => {
      task.databaseId = task.task_id;
      task.id = task.task_id.toString();
      userTasks[task.id] = task;
    });
    for (let key in lists) {
      let list = lists[key];
      let updatedTaskIds = list.taskIds.filter(taskId => {
        if (userTasks[taskId]) return true;
        else return false;
      });
      list.taskIds = updatedTaskIds;
      updatedLists[list.id] = list;
    }

    const tasksAndLists = {
      tasks: userTasks,
      lists: updatedLists,
    };

    this.setState(tasksAndLists);
    return tasksAndLists;
  };

  getConnectionRequests = async () => {
    const { loggedInUser } = this.state;

    const res = await axios.get(`/connection/user/${loggedInUser.user_id}`);
    let requests = [];
    res.data.forEach(connection => {
      if (connection.status === 1) {
        if (connection.receive_id === loggedInUser.user_id) {
          requests.push(connection);
        }
      }
    });

    this.setState({ connectionRequests: requests });
    return requests;
  };

  addList = async () => {
    const { projectId, newColorCode, title, lists, listOrder } = this.state;
    const body = {
      title: title,
      color_code: newColorCode,
      archived: false,
      task_order: [],
    };

    if (title.length > 50) {
      Swal.fire({
        type: 'warning',
        title: 'Oops!',
        text: 'List title must be under 50 characters in length.',
      });
      return;
    }

    this.setState({ displayAddListModal: false });
    try {
      let res = await axios.post(`/project/${projectId}/list`, body);
      let added = res.data[0];
      let newList = {
        id: added.list_id.toString(),
        title: added.title,
        databaseId: added.list_id,
        colorCode: added.color_code,
        taskIds: [],
        archived: added.archived,
      };
      let newLists = {
        ...lists,
        [newList.id]: newList,
      };
      let newOrder = [...listOrder, newList.id];
      this.setState(
        {
          lists: newLists,
          listOrder: newOrder,
          title: '',
        },
        () => {
          this.updateProject();
        }
      );
    } catch (err) {
      console.log(err.response.data);
    }
  };

  cancelAddList = () => {
    this.setState({
      title: '',
      newColorCode: [96, 125, 139, 1],
      displayAddListModal: false,
      displayColorPicker: false,
    });
  };

  updateList = async (id, body) => {
    const { projectId } = this.state;

    const res = await axios.put(`/project/${projectId}/list/${id}`, body);
    let updated = res.data[0];

    return updated;
  };

  deleteList = (databaseId, id) => {
    const { project, project_id, listOrder, lists, loggedInUser, projectPermissions } = this.state;

    if (!projectPermissions.delete_lists && project.created_by !== loggedInUser.user_id) {
      Swal.fire({
        type: 'warning',
        title: 'Oops!',
        text: 'You do not have permission to delete lists for this project.',
      });
      return;
    }

    Swal.fire({
      type: 'warning',
      title: 'Are you sure?',
      text: 'This list will be permanently deleted!',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then(async res => {
      if (res.value) {
        try {
          let tasksToRemove = lists[databaseId].taskIds;
          let removedTaskPromises = tasksToRemove.map(id => {
            return axios.delete(`/task_users/task/${id}`);
          });
          await Promise.all(removedTaskPromises);
          await axios.delete(`/tasks/list/${databaseId}`);
          await axios.delete(`/project/${project_id}/list/${databaseId}`);
          const indexToRemove = listOrder.indexOf(id);
          let newOrder = Array.from(listOrder);
          newOrder.splice(indexToRemove, 1);
          let newLists = lists;
          delete newLists[id];
          this.setState(
            {
              lists: newLists,
              listOrder: newOrder,
            },
            () => {
              this.updateProject();
            }
          );
        } catch (err) {
          console.log(err.response.data);
        }
      }
    });
  };

  updateListIdOnTask = async (taskId, listId) => {
    const { tasks } = this.state;
    const task = tasks[taskId];
    const body = {
      title: task.title,
      status: task.status,
      list_id: listId,
      created_at: task.created_at,
      created_by: task.created_by,
    };

    const res = await axios.put(`/task/${taskId}`, body);

    return res.data[0];
  };

  updateProject = async (idToUpdate, title, order) => {
    const { projectId, project, listOrder } = this.state;
    const id = idToUpdate || projectId;
    const body = {
      title: title || project.title,
      list_order: order || listOrder,
    };

    const res = await axios.put(`/project/${id}`, body);
    this.setState({ title: '' });

    return res;
  };

  updateMostRecentProject = async projectId => {
    const { loggedInUser } = this.state;
    const body = {
      projectId: projectId,
    };

    try {
      await axios.put(`/user/${loggedInUser.user_id}/recent_project`, body);
    } catch (err) {
      console.log(err.response.data);
    }
  };

  handleSidebarSelection = selection => {
    if (selection === 'people') {
      this.setState({
        displayPeople: true,
        displayLists: false,
        displaySettings: false,
      });
      return;
    }
    if (selection === 'settings') {
      this.setState({
        displaySettings: true,
        displayLists: false,
        displayPeople: false,
      });
      return;
    }

    this.setState({
      highlightTasksOfUser: selection,
      displayLists: true,
      displayPeople: false,
      displaySettings: false,
    });
  };

  handleInput = (key, value) => {
    this.setState({ [key]: value });
  };

  handleAddListClick = () => {
    // Only allow adding list if loggedInUser is project owner or has permission to add lists
    if (this.state.project.created_by === this.state.loggedInUser.user_id || this.state.projectPermissions.add_lists) {
      this.setState({ displayAddListModal: true, displayColorPicker: true });
    } else {
      Swal.fire({
        type: 'warning',
        title: 'Oops!',
        text: 'You do not have permission to add lists for this project.',
      });
    }
  };

  handleColorChange = event => {
    const { r, g, b, a } = event.rgb;
    let codeArr = [r, g, b, a];
    this.setState({ newColorCode: codeArr });
  };

  handleSearch = str => {
    this.setState({ search: str });
  };

  closeColorPicker = () => {
    this.setState({
      displayColorPicker: false,
    });
  };

  clearConnectionRequests = () => {
    this.setState({ connectionRequests: [] });
  };

  onDragStart = result => {
    const { type } = result;
    if (type === 'list') {
      this.setState({ displayAddButton: false });
    }
  };

  onDragUpdate = update => {};

  onDragEnd = result => {
    const { source, destination, draggableId, type } = result;

    if (!destination) {
      this.setState({ displayAddButton: true });
      return;
    }
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      this.setState({ displayAddButton: true });
      return;
    }

    if (type === 'list') {
      // If dragged item is a list
      // Only allow loggedInUser to move lists if they are the project owner or have permission to edit the project
      if (
        this.state.project.created_by !== this.state.loggedInUser.user_id &&
        !this.state.projectPermissions.edit_project
      ) {
        Swal.fire({
          type: 'warning',
          title: 'Oops!',
          text: 'You do not have permission to edit this project.',
        });
        this.setState({ displayAddButton: true });
        return;
      }

      const newListOrder = Array.from(this.state.listOrder);
      newListOrder.splice(source.index, 1); // removing list out of original position
      newListOrder.splice(destination.index, 0, draggableId); // putting list in new position

      const newState = {
        ...this.state,
        listOrder: newListOrder,
        displayAddButton: true,
      };

      const oldState = { ...this.state };
      this.setState(newState, async () => {
        try {
          await this.updateProject();
        } catch (err) {
          console.log(err.response.data);
          this.setState(oldState);
        }
      });

      return;
    } else if (type === 'task') {
      // If dragged item is a task
      // Only allow loggedInUser to move tasks if they are the project owner or have permissions to edit lists
      if (
        this.state.project.created_by !== this.state.loggedInUser.user_id &&
        !this.state.projectPermissions.edit_lists
      ) {
        Swal.fire({
          type: 'warning',
          title: 'Oops!',
          text: 'You do not have permission to edit this project.',
        });
        return;
      }

      const start = this.state.lists[source.droppableId];
      const finish = this.state.lists[destination.droppableId];

      if (start === finish) {
        // If task is moved within the same list
        const newTaskIds = Array.from(start.taskIds);
        newTaskIds.splice(source.index, 1);
        newTaskIds.splice(destination.index, 0, draggableId);

        const newList = {
          ...start,
          taskIds: newTaskIds,
        };

        const newState = {
          ...this.state,
          lists: {
            ...this.state.lists,
            [newList.id]: newList,
          },
        };

        let taskIdIntegers = newList.taskIds.map(id => parseInt(id));

        const newListBody = {
          title: newList.title,
          color_code: newList.colorCode,
          archived: newList.archived,
          task_order: taskIdIntegers,
        };

        const oldState = { ...this.state };
        this.setState(newState, async () => {
          const listId = newList.id;
          try {
            await this.updateList(listId, newListBody);
          } catch (err) {
            console.log(err.response.data);
            this.setState(oldState);
          }
        });
      } else {
        // If task is moved to another list
        const startTaskIds = Array.from(start.taskIds);
        startTaskIds.splice(source.index, 1);
        const newStart = {
          ...start,
          taskIds: startTaskIds,
        };

        const finishTaskIds = Array.from(finish.taskIds);
        finishTaskIds.splice(destination.index, 0, draggableId);
        const newFinish = {
          ...finish,
          taskIds: finishTaskIds,
        };

        const newState = {
          ...this.state,
          lists: {
            ...this.state.lists,
            [newStart.id]: newStart,
            [newFinish.id]: newFinish,
          },
        };

        const taskId = parseInt(draggableId);
        const startListId = parseInt(source.droppableId);
        const finishListId = parseInt(destination.droppableId);
        const startOrder = this.convertTaskIdsToIntegers(newStart.taskIds);
        const finishOrder = this.convertTaskIdsToIntegers(newFinish.taskIds);

        const newStartBody = {
          title: newStart.title,
          color_code: newStart.colorCode,
          archived: newStart.archived,
          task_order: startOrder,
        };

        const newFinishBody = {
          title: newFinish.title,
          color_code: newFinish.colorCode,
          archived: newFinish.archived,
          task_order: finishOrder,
        };

        const oldState = { ...this.state };
        this.setState(newState, async () => {
          try {
            await this.updateListIdOnTask(taskId, finishListId);
            await this.updateList(startListId, newStartBody); // Updating old list
            await this.updateList(finishListId, newFinishBody); // Updating new List
          } catch (err) {
            console.log(err.response.data);
            this.setState(oldState);
          }
        });
      }
    }
  };

  convertTaskIdsToIntegers = strArr => strArr.map(str => parseInt(str));

  convertTaskIdsToStrings = intArr => intArr.map(int => int.toString());

  displayLists = () => {
    const {
      tasks,
      lists,
      listOrder,
      projectId,
      projectUsers,
      loggedInUser,
      taskUsers,
      highlightTasksOfUser,
    } = this.state;
    let listArr = listOrder.map((listId, index) => {
      const list = lists[listId];
      const taskArr = list.taskIds.map(taskId => tasks[taskId]);
      return (
        <List
          key={list.id}
          list={list}
          tasks={taskArr}
          index={index}
          colorCode={list.colorCode}
          project={this.state.project}
          projectId={projectId}
          projectUsers={projectUsers}
          projectPermissions={this.state.projectPermissions}
          updateList={this.updateList}
          deleteList={this.deleteList}
          loggedInUser={loggedInUser}
          taskUsers={taskUsers}
          getAllTasks={this.getAllTasks}
          getTaskUsers={this.getTaskUsers}
          getLists={this.getLists}
          convertTaskIdsToIntegers={this.convertTaskIdsToIntegers}
          highlightTasksOfUser={highlightTasksOfUser}
          search={this.state.search}
        />
      );
    });
    return listArr;
  };

  addListModal = () => {
    const { title, newColorCode } = this.state;
    let defaultColor = formatColor(newColorCode);

    return (
      <div className='modal-wrapper' onClick={this.cancelAddList}>
        <div className='add-list-modal' style={{ padding: '1rem' }} onClick={e => e.stopPropagation()}>
          <p style={{ fontSize: '1.2rem' }}>New List:</p>
          <div className='add-list-modal-body'>
            <div className='add-modal-body-item'>
              <p>Title</p>
              <TextField
                required
                id='standard-required'
                onChange={e => this.handleInput('title', e.target.value)}
                autoFocus
                placeholder='Title'
              />
            </div>
            <div>
              <div className='add-modal-body-item'>
                <p>List Color:</p>
                <div
                  onClick={() =>
                    this.setState({
                      displayColorPicker: !this.state.displayColorPicker,
                    })
                  }
                  className='current-color-box cursor-pointer'
                  style={{
                    backgroundColor: defaultColor,
                    margin: '.5rem .5rem .5rem 0',
                  }}
                ></div>
                <div className='color-picker-container'>
                  {this.state.displayColorPicker && (
                    <div className='color-picker-container'>
                      <ColorPicker
                        handleColorChange={this.handleColorChange}
                        closeColorPicker={this.closeColorPicker}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div>
            <Button
              style={{ margin: '1rem .5rem 0 .5rem' }}
              variant='outlined'
              color='secondary'
              onClick={this.cancelAddList}
            >
              Cancel
            </Button>
            <Button
              style={{ margin: '1rem .5rem 0 .5rem' }}
              variant='outlined'
              color='primary'
              disabled={!title}
              onClick={this.addList}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className='dashboard'>
        {this.state.loggedInUser && (
          <Sidebar
            projectId={this.state.projectId}
            loggedInUser={this.state.loggedInUser}
            handleSidebarSelection={this.handleSidebarSelection}
            connectionRequests={this.state.connectionRequests}
          />
        )}
        <div className='main-content-container'>
          {this.state.loggedInUser && (
            <Header
              project={this.state.project}
              loggedInUser={this.state.loggedInUser}
              isLoading={this.state.isLoading}
              getCompleteProjectData={this.getCompleteProjectData}
              updateMostRecentProject={this.updateMostRecentProject}
              logout={this.logout}
              handleSearch={this.handleSearch}
              search={this.state.search}
              displayPeople={this.state.displayPeople}
              displaySettings={this.state.displaySettings}
            />
          )}

          {this.state.displayLists && (
            <>
              {this.state.lists && !this.state.isLoading ? (
                <>
                  <DragDropContext
                    onDragStart={this.onDragStart}
                    onDragUpdate={this.onDragUpdate}
                    onDragEnd={this.onDragEnd}
                  >
                    <Droppable droppableId='all-lists' direction='horizontal' type='list'>
                      {provided => {
                        return (
                          <div className='main-content' {...provided.droppableProps} ref={provided.innerRef}>
                            <div className='list-container'>
                              {this.displayLists()}
                              {provided.placeholder}
                            </div>
                            <div
                              style={{
                                display: this.state.displayAddButton ? 'block' : 'none',
                              }}
                            >
                              <Tooltip title={'Add New List'}>
                                <div
                                  className='add-list-button'
                                  style={{ width: '0px' }}
                                  onClick={this.handleAddListClick}
                                >
                                  <AddButton />
                                </div>
                              </Tooltip>
                            </div>
                          </div>
                        );
                      }}
                    </Droppable>
                  </DragDropContext>
                  {this.state.displayAddListModal && this.addListModal()}
                </>
              ) : (
                <>
                  {this.state.projectId && (
                    <div className='progress-container'>
                      <PulseLoader size={15} color={'#995D81'} />
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {this.state.displayPeople && (
            <>
              <People
                loggedInUser={this.state.loggedInUser}
                project={this.state.project}
                projectId={this.state.projectId}
                projectUsers={this.state.projectUsers}
                projectPermissions={this.state.projectPermissions}
                getProjectUsers={this.getProjectUsers}
                getTaskUsers={this.getTaskUsers}
                getAllTasks={this.getAllTasks}
                getConnectionRequests={this.getConnectionRequests}
                getUserById={this.getUserById}
                isLoading={this.state.isLoading}
                clearConnectionRequests={this.clearConnectionRequests}
              />
            </>
          )}

          {this.state.displaySettings && this.state.projectId && (
            <>
              <ProjectSettings
                loggedInUser={this.state.loggedInUser}
                projectId={this.state.projectId}
                project={this.state.project}
                getProjectDetails={this.getProjectDetails}
                updateProject={this.updateProject}
                projectPermissions={this.state.projectPermissions}
                isLoading={this.state.isLoading}
              />
            </>
          )}

          {this.state.loggedInUser && !this.state.projectId && !this.state.displayPeople && !this.state.isLoading && (
            <div className='no-project-prompt-container'>
              <div className='bounce'>
                <i className='fas fa-chevron-up'></i>
                <p>Select or Add a Project to Begin</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
