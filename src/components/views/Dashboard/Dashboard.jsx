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
      columns: {
         // 'column-1': {
         //    id: 'column-1',
         //    databaseId: 1,
         //    title: 'To Dos',
         //    taskIds: ['task-1', 'task-2', 'task-3'],
         //    colorCode: [255, 183, 77, 1],
         // },
         // 'column-2': {
         //    id: 'column-2',
         //    databaseId: 2,
         //    title: 'In Progress',
         //    taskIds: ['task-4', 'task-5', 'task-6'],
         //    colorCode: [194, 24, 91, 1],
         // },
         // 'column-3': {
         //    id: 'column-3',
         //    databaseId: 3,
         //    title: 'Completed',
         //    taskIds: ['task-7', 'task-8', 'task-9'],
         //    colorCode: [0, 151, 167, 1],
         // },
      },
      tasks: {
         // 'task-1': { id: 'task-1', databaseId: 1, title: 'Task 1', content: 'Wash Dishes'},
         // 'task-2': { id: 'task-2', databaseId: 2, title: 'Task 2', content: 'Take out trash'},
         // 'task-3': { id: 'task-3', databaseId: 3, title: 'Task 3', content: 'Clean Car'},
         // 'task-4': { id: 'task-4', databaseId: 4, title: 'Task 4', content: 'Walk the Dog'},
         // 'task-5': { id: 'task-5', databaseId: 5, title: 'Task 5', content: 'Get Groceries'},
         // 'task-6': { id: 'task-6', databaseId: 6, title: 'Task 6', content: 'Mow the Lawn'},
         // 'task-7': { id: 'task-7', databaseId: 7, title: 'Task 7', content: 'Do Laundry'},
         // 'task-8': { id: 'task-8', databaseId: 8, title: 'Task 8', content: 'Vacuum'},
         // 'task-9': { id: 'task-9', databaseId: 9, title: 'Task 9', content: 'Go to the gym'},
      },
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
            title: column.title,
            databaseId: column.id,
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
         <div className='modal-wrapper'>
            <div className='add-list-modal' style={{ padding: '1rem' }}>
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
