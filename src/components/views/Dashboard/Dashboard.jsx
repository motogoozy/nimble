import React, { Component } from 'react';
import './Dashboard.scss';
import Sidebar from '../../Sidebar/Sidebar';
import Header from '../../Header/Header';
import Column from '../../Column/Column';
import AddButton from '../../AddButton/AddButton';

import axios from 'axios';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { DragDropContext } from 'react-beautiful-dnd';
import { Droppable } from 'react-beautiful-dnd';

export default class Dashboard extends Component {
   state = {
      columns: {},
      tasks: {},
      columnOrder: [], // must be strings
      projectId: null,
      project: {},
      title: '',
      displayAddButton: false,
      displayAddListModal: false,
   };

   componentDidMount = async () => {

   };

   getProjectDetails = async () => {
      const { projectId } = this.state;
      let res = await axios.get(`/project/${projectId}`);
      const project = res.data[0];
      document.title = `Nimble - ${project.title}`
      let columnOrder = project.column_order.map(item => item.toString());
      this.setState({
         columnOrder: columnOrder,
         project: project,
      });
   };

   getLists = async () => {
      const { projectId } = this.state;
      let res = await axios.get(`/project/${projectId}/lists`);
      let columns = {};
      res.data.forEach(column => {
         let newColumn = {
            id: column.id.toString(),
            databaseId: column.id,
            title: column.title,
            colorCode: column.color_code,
            taskIds: [],
            archived: column.archived,
         };
         columns[newColumn.id] = newColumn;
      });
      this.setState({
         columns: columns,
         displayAddButton: true,
      });
   };

   handleInput = (key, value) => {
      this.setState({ [key]: value });
   };

   getTasks = async () => {
      const { projectId } = this.state;
      let res = await axios.get(`/project/${projectId}/tasks`)
      let tasks = {};
      res.data.forEach(task => {
         let newTask = {
            id: task.id.toString(),
            databaseId: task.id,
            title: task.title,
            content: '',
            list_id: task.list_id
         };
         tasks[newTask.id] = newTask;
      });
      this.setState({
         tasks: tasks,
      });
   };

   assignTasksToColumns = () => {
      const { columns, tasks } = this.state;
      let updatedColumns = columns;
      for (let id in tasks) {
         let task = tasks[id];
         let column = columns[task.list_id];
         if (column.taskIds.indexOf(task.id) === -1) {
            column.taskIds.push(task.id);
         }
         updatedColumns[column.id] = column;
      };
      this.setState({ columns: updatedColumns });
   };

   handleProjectSelection = async (id) => {
      this.setState({
         projectId: id,
         columns: {},
         tasks: {},
         columnOrder: [],
         displayAddButton: false,
      }, async () => {
         try {
            await this.getLists();
            await this.getProjectDetails();
            await this.getTasks();
            await this.assignTasksToColumns();
         }
         catch(err) {
            console.log(err);
         }
      })
   };

   addList = async () => {
      const { projectId, title, columns, columnOrder } = this.state;
      const body = {
         title: title,
         color_code: [96, 125, 139, 1],
         archived: false,
      };
      try {
         let res = await axios.post(`/project/${projectId}/list`, body);
         let added = res.data[0];
         let newColumn = {
            id: added.id.toString(),
            title: added.title,
            databaseId: added.id,
            colorCode: added.color_code,
            taskIds: [],
            archived: added.archived,
         };
         let newColumns = {
            ...columns,
            [newColumn.id]: newColumn
         };
         let newOrder = [
            ...columnOrder,
            newColumn.id,
         ];
         this.setState({
            columns: newColumns,
            columnOrder: newOrder,
            displayAddListModal: false,
            title: '',
         }, () => {
            this.updateProject()
         });
      } catch(err) {
         console.log(err);
      }
   };

   cancelAddList = () => {
      this.setState({
         title: '',
         displayAddListModal: false
      });
   };

   updateList = async (id, body) => {
      const { projectId } = this.state;
      let res = await axios.put(`/project/${projectId}/list/${id}`, body);
      let updated = res.data[0];
      return new Promise((resolve, reject) => {
         resolve(updated);
      });
   };

   deleteList = async (databaseId, id) => {
      const { project_id, columnOrder, columns } = this.state;
      
      try {
         await axios.delete(`/project/${project_id}/list/${databaseId}`);
         const indexToRemove = columnOrder.indexOf(id);
         let newOrder = Array.from(columnOrder);
         newOrder.splice(indexToRemove, 1);
         let newColumns = columns;
         delete newColumns[id];
         this.setState({
            columns: newColumns,
            columnOrder: newOrder,
         }, () => {
            this.updateProject();
         });
      } catch(err) {
         console.log(err)
      }
   };

   updateProject = async () => {
      const { projectId, project, columnOrder } = this.state;
      const body = {
         title: project.title,
         column_order: columnOrder
      };
      try {
         await axios.put(`/project/${projectId}`, body);
         this.setState({
            title: ''
         });
      }
      catch (err) {
         console.log(err);
      }
   };

   onDragStart = (result ) => {
      const { type } = result;
      if (type === 'column') {
         this.setState({ displayAddButton: false });
      }
   };

   onDragUpdate = update => {

   };

   onDragEnd = result => {
      const { source, destination, draggableId, type } = result;

      if (!destination) {
         this.setState({ displayAddButton: true });
         return;
      }
      if (
         destination.droppableId === source.droppableId &&
         destination.index === source.index
      ) {
         this.setState({ displayAddButton: true });
         return;
      }

      // If dragged item is a column
      if (type === 'column') {
         const newColumnOrder = Array.from(this.state.columnOrder);
         newColumnOrder.splice(source.index, 1); // removing column out of original position
         newColumnOrder.splice(destination.index, 0, draggableId); // putting column in new position

         const newState = {
            ...this.state,
            columnOrder: newColumnOrder,
            displayAddButton: true,
         };
         this.setState(newState, () => {
            this.updateProject();
         });
         return;
      }

      const start = this.state.columns[source.droppableId];
      const finish = this.state.columns[destination.droppableId];

      // If task is moved within the same column
      if (start === finish) {
         const newTaskIds = Array.from(start.taskIds);
         newTaskIds.splice(source.index, 1);
         newTaskIds.splice(destination.index, 0, draggableId);
   
         const newColumn = {
            ...start,
            taskIds: newTaskIds
         };
   
         const newState = {
            ...this.state,
            columns: {
               ...this.state.columns,
               [newColumn.id]: newColumn
            },
         };
   
         this.setState(newState);
      } else {
         // Moving task from one column to another
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
            taskIds: finishTaskIds
         };
   
         const newState = {
            ...this.state,
            columns: {
               ...this.state.columns,
               [newStart.id]: newStart,
               [newFinish.id]: newFinish
            },
         };
   
         this.setState(newState);
      }
   };
   
   displayColumns = () => {
      const { tasks, columns, columnOrder, projectId } = this.state;
      let columnArr = columnOrder.map((columnId, index) => {
         const column = columns[columnId];
         const taskArr = column.taskIds.map(taskId => tasks[taskId]);
         return (
            <Column
               key={column.id}
               column={column}
               tasks={taskArr}
               index={index}
               colorCode={column.colorCode}
               projectId={projectId}
               updateList={this.updateList}
               deleteList={this.deleteList}
            />
         );
      });
      return columnArr;
   };

   addListModal = () => {
      return (
         <div className='modal-wrapper' onClick={this.cancelAddList}>
            <div className='add-list-modal' style={{ padding: '1rem' }} onClick={e => e.stopPropagation()}
            >
               <h3>New List:</h3>
               <TextField
                  id="standard-search"
                  label="List Name"
                  onChange={e => this.handleInput('title', e.target.value)}
                  autoFocus
               />
               <div>
                  <Button style={{ margin: '1rem .5rem 0 .5rem' }} variant="outlined" color='secondary' onClick={this.cancelAddList}>Cancel</Button>
                  <Button style={{ margin: '1rem .5rem 0 .5rem' }} variant="outlined" color='primary' onClick={this.addList}>Save</Button>
               </div>
            </div>
         </div>
      )
   }
	
	render() {
		return (
			<div className='dashboard'>
				<Sidebar />
            <div className='main-content-container'>
               <Header
                  handleProjectSelection={this.handleProjectSelection}
               />
               <DragDropContext onDragStart={this.onDragStart} onDragUpdate={this.onDragUpdate} onDragEnd={this.onDragEnd} >
                  <Droppable droppableId='all-columns' direction='horizontal' type='column' >
                     {(provided) => {
                        return (
                           <div className='main-content' {...provided.droppableProps} ref={provided.innerRef}>
                              <div className='column-container'>
                                 { this.displayColumns() }
                                 { provided.placeholder }
                              </div>
                              <div style={{ display: this.state.displayAddButton ? 'block' : 'none' }}>
                                 <Tooltip title={'Add New List'}>
                                    <div style={{ width: '0px' }} onClick={() => this.setState({ displayAddListModal: true })}>
                                       <AddButton />
                                    </div>
                                 </Tooltip>
                              </div>
                              {
                                 !this.state.projectId
                                 &&
                                 <div className='no-project-prompt-container'>
                                    <div className='bounce'>
                                       <i className="fas fa-chevron-up"></i> 
                                       <p>Select or Add a Project to Begin</p>
                                    </div>
                                 </div>
                              }
                           </div>
                        )
                     }}
                  </Droppable>
               </DragDropContext>
               {
                  this.state.displayAddListModal
                  &&
                  this.addListModal()
               }
            </div>
			</div>
		)
	}
}
