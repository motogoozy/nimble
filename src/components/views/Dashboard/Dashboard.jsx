import React, { Component } from 'react';
import './Dashboard.scss';
import Sidebar from '../../Sidebar/Sidebar';
import Header from '../../Header/Header';
import Column from '../../Column/Column';
import AddButton from '../../AddButton/AddButton';
import ColorPicker from '../../ColorPicker/ColorPicker';

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
      listOrder: [], // array of strings
      projectId: null,
      project: {},
      title: '',
      newColorCode: [96, 125, 139, 1],
      displayAddButton: false,
      displayAddListModal: false,
      loggedInUser: 1,
   };

   componentDidMount = async () => {};

   getProjectDetails = async () => {
      const { projectId } = this.state;
      let res = await axios.get(`/project/${projectId}`);
      const project = res.data[0];
      document.title = `Nimble - ${project.title}`
      let listOrder = project.list_order.map(item => item.toString());
      this.setState({
         listOrder: listOrder,
         project: project,
      });
   };

   getLists = async () => {
      const { projectId } = this.state;
      let res = await axios.get(`/project/${projectId}/lists`);
      let columns = {};
      res.data.forEach(column => {
         let taskOrderStrings = this.convertTaskIdsToStrings(column.task_order);
         let newColumn = {
            id: column.id.toString(),
            databaseId: column.id,
            title: column.title,
            colorCode: column.color_code,
            taskIds: taskOrderStrings,
            archived: column.archived,
         };
         columns[newColumn.id] = newColumn;
      });
      this.setState({
         columns: columns,
         displayAddButton: true,
      });
   };

   getTasks = async () => {
      const { projectId } = this.state;
      let res = await axios.get(`/project/${projectId}/tasks`)
      let tasks = {};
      res.data.forEach(task => {
         task.databaseId = task.id;
         task.id = task.id.toString();
         task.content = '';
         tasks[task.id] = task;
      });
      this.setState({
         tasks: tasks,
      });
   };

   handleInput = (key, value) => {
      this.setState({ [key]: value });
   };

   handleColorChange = (event) => {
		const { r, g, b, a } = event.rgb;
		let codeArr = [r, g, b, a];
		console.log(codeArr)
		this.setState({ newColorCode: codeArr });
   };
   
   closeColorPicker = () => {
		this.setState({ 
			displayColorPicker: false,
		});
	};

   handleProjectSelection = async (id) => {
      this.setState({
         projectId: id,
         columns: {},
         tasks: {},
         listOrder: [],
         displayAddButton: false,
      }, async () => {
         try {
            await this.getTasks();
            await this.getLists();
            await this.getProjectDetails();
            // await this.assignTasksToColumns();
         }
         catch(err) {
            console.log(err);
         }
      })
   };

   addList = async () => {
      const { projectId, newColorCode, title, columns, listOrder } = this.state;
      const body = {
         title: title,
         color_code: newColorCode,
         archived: false,
         task_order: [],
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
            ...listOrder,
            newColumn.id,
         ];
         this.setState({
            columns: newColumns,
            listOrder: newOrder,
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
         newColorCode: [96, 125, 139, 1],
         displayAddListModal: false,
         displayColorPicker: false,
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
      const { project_id, listOrder, columns } = this.state;
      
      try {
         await axios.delete(`/project/${project_id}/list/${databaseId}`);
         const indexToRemove = listOrder.indexOf(id);
         let newOrder = Array.from(listOrder);
         newOrder.splice(indexToRemove, 1);
         let newColumns = columns;
         delete newColumns[id];
         this.setState({
            columns: newColumns,
            listOrder: newOrder,
         }, () => {
            this.updateProject();
         });
      } catch(err) {
         console.log(err)
      }
   };

   updateTask = async (taskId, listId) => {
      const { tasks } = this.state;
      const task = tasks[taskId];
      const body = {
         title: task.title,
         status: task.status,
         list_id: listId,
         created_at: task.created_at,
         created_by: task.created_by,
         project_id: task.project_id
      };

      let res = await axios.put(`/task/${taskId}`, body);
      let updated = res.data[0];

      return new Promise((resolve, reject) => {
         resolve(updated);
      });
   };

   updateProject = async () => {
      const { projectId, project, listOrder } = this.state;
      const body = {
         title: project.title,
         list_order: listOrder
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

      if (type === 'column') { // If dragged item is a column
         const newlistOrder = Array.from(this.state.listOrder);
         newlistOrder.splice(source.index, 1); // removing column out of original position
         newlistOrder.splice(destination.index, 0, draggableId); // putting column in new position

         const newState = {
            ...this.state,
            listOrder: newlistOrder,
            displayAddButton: true,
         };
         this.setState(newState, () => {
            this.updateProject();
         });
         return;
      } else if (type === 'task') { // If dragged item is a task
         const start = this.state.columns[source.droppableId];
         const finish = this.state.columns[destination.droppableId];
   
         if (start === finish) { // If task is moved within the same column
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

            let taskIdIntegers = newColumn.taskIds.map(id => parseInt(id));

            const newColumnBody = {
               title: newColumn.title,
               color_code: newColumn.colorCode,
               archived: newColumn.archived,
               task_order: taskIdIntegers,
            };

            this.setState(newState, () => {
               const listId = newColumn.id;
               try {
                  this.updateList(listId, newColumnBody);
               } catch (err) {
                  console.log(err);
               }
            });
         } else { // If task is moved to another column
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
            }

            this.setState(newState, () => {
               this.updateTask(taskId, finishListId);
               this.updateList(startListId, newStartBody);
               this.updateList(finishListId, newFinishBody);
            });
         }
      }
   };

   convertTaskIdsToIntegers = strArr => strArr.map(str => parseInt(str));

   convertTaskIdsToStrings = intArr => intArr.map(int => int.toString());
   
   displayColumns = () => {
      const { tasks, columns, listOrder, projectId, loggedInUser } = this.state;
      let columnArr = listOrder.map((columnId, index) => {
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
               loggedInUser={loggedInUser}
               getTasks={this.getTasks}
               getLists={this.getLists}
               convertTaskIdsToIntegers={this.convertTaskIdsToIntegers}
            />
         );
      });
      return columnArr;
   };

   formatColor = (arr) => `rgba(${arr[0]}, ${arr[1]}, ${arr[2]}, ${arr[3]})`;

   addListModal = () => {
      const { newColorCode } = this.state;
      let defaultColor = this.formatColor(newColorCode);
      
      return (
         <div className='modal-wrapper' onClick={this.cancelAddList}>
            <div className='add-list-modal' style={{ padding: '1rem' }} onClick={e => e.stopPropagation()}>
               <h3>New List:</h3>
               <div className='add-list-modal-body'>
                  <div className='add-modal-body-item'>
                     <h4>Title</h4>
                     <TextField
                     required
                     id="standard-required"
                     onChange={e => this.handleInput('title', e.target.value)}
                     autoFocus
                     />
                  </div>
                  <div>
                     <div className='add-modal-body-item'>
                        <h4>List Color:</h4>
                        <div onClick={()=> this.setState({ displayColorPicker: !this.state.displayColorPicker })} className='current-color-box cursor-pointer' style={{ backgroundColor: defaultColor, margin: '.5rem .5rem .5rem 0' }}></div>
                        <div className='color-picker-container'>
                           {
                              this.state.displayColorPicker
                              &&
                              <div className='color-picker-container'>   
                                 <ColorPicker
                                    formatColor={this.formatColor}
                                    handleColorChange={this.handleColorChange}
                                    closeColorPicker={this.closeColorPicker}
                                 />
                              </div>
                           }
                        </div>
                     </div>
                  </div>
               </div>
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
               <Header handleProjectSelection={this.handleProjectSelection}/>
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
                                    <div style={{ width: '0px' }} onClick={() => this.setState({ displayAddListModal: true, displayColorPicker: true })}>
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
