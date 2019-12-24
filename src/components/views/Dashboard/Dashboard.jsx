import React, { Component } from 'react';
import './Dashboard.scss';
import Sidebar from '../../Sidebar/Sidebar';
import Header from '../../Header/Header';
import List from '../../List/List';
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
      loggedInUserId: 1,
      projectId: null,
      project: {},
      tasks: {},
      lists: {},
      listOrder: [], // array of strings of list-id's
      title: '',
      newColorCode: [96, 125, 139, 1],
      displayAddButton: false,
      displayAddListModal: false,
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
      let lists = {};
      res.data.forEach(list => {
         let taskOrderStrings = this.convertTaskIdsToStrings(list.task_order);
         let newList = {
            id: list.id.toString(),
            databaseId: list.id,
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
         lists: {},
         tasks: {},
         listOrder: [],
         displayAddButton: false,
      }, async () => {
         try {
            await this.getTasks();
            await this.getLists();
            await this.getProjectDetails();
         }
         catch(err) {
            console.log(err);
         }
      })
   };

   addList = async () => {
      const { projectId, newColorCode, title, lists, listOrder } = this.state;
      const body = {
         title: title,
         color_code: newColorCode,
         archived: false,
         task_order: [],
      };
      this.setState({ displayAddListModal: false });
      try {
         let res = await axios.post(`/project/${projectId}/list`, body);
         let added = res.data[0];
         let newList = {
            id: added.id.toString(),
            title: added.title,
            databaseId: added.id,
            colorCode: added.color_code,
            taskIds: [],
            archived: added.archived,
         };
         let newLists = {
            ...lists,
            [newList.id]: newList
         };
         let newOrder = [
            ...listOrder,
            newList.id,
         ];
         this.setState({
            lists: newLists,
            listOrder: newOrder,
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
      return updated;
      // return new Promise((resolve, reject) => {
      //    resolve(updated);
      // });
   };

   deleteList = async (databaseId, id) => {
      const { project_id, listOrder, lists } = this.state;

      try {
         await axios.delete(`/project/${project_id}/list/${databaseId}`);
         const indexToRemove = listOrder.indexOf(id);
         let newOrder = Array.from(listOrder);
         newOrder.splice(indexToRemove, 1);
         let newLists = lists;
         delete newLists[id];
         this.setState({
            lists: newLists,
            listOrder: newOrder,
         }, () => {
            this.updateProject();
            console.log('List and tasks successfully deleted.')
         });
      } catch(err) {
         console.log(err)
      }
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
      if (type === 'list') {
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

      if (type === 'list') { // If dragged item is a list
         const newListOrder = Array.from(this.state.listOrder);
         newListOrder.splice(source.index, 1); // removing list out of original position
         newListOrder.splice(destination.index, 0, draggableId); // putting list in new position

         const newState = {
            ...this.state,
            listOrder: newListOrder,
            displayAddButton: true,
         };
         this.setState(newState, () => {
            this.updateProject();
         });
         return;
      } else if (type === 'task') { // If dragged item is a task
         const start = this.state.lists[source.droppableId];
         const finish = this.state.lists[destination.droppableId];
   
         if (start === finish) { // If task is moved within the same list
            const newTaskIds = Array.from(start.taskIds);
            newTaskIds.splice(source.index, 1);
            newTaskIds.splice(destination.index, 0, draggableId);
      
            const newList = {
               ...start,
               taskIds: newTaskIds
            };
      
            const newState = {
               ...this.state,
               lists: {
                  ...this.state.lists,
                  [newList.id]: newList
               },
            };

            let taskIdIntegers = newList.taskIds.map(id => parseInt(id));

            const newListBody = {
               title: newList.title,
               color_code: newList.colorCode,
               archived: newList.archived,
               task_order: taskIdIntegers,
            };

            this.setState(newState, () => {
               const listId = newList.id;
               try {
                  this.updateList(listId, newListBody);
               } catch (err) {
                  console.log(err);
               }
            });
         } else { // If task is moved to another list
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
               lists: {
                  ...this.state.lists,
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
               this.updateListIdOnTask(taskId, finishListId);
               this.updateList(startListId, newStartBody); // Updating old list
               this.updateList(finishListId, newFinishBody); // Updating new List
            });
         }
      }
   };

   convertTaskIdsToIntegers = strArr => strArr.map(str => parseInt(str));

   convertTaskIdsToStrings = intArr => intArr.map(int => int.toString());

   filterTasksByUser = (tasks) => {
      //TODO Filter tasks by assigned users
   };
   
   displayLists = () => {
      const { tasks, lists, listOrder, projectId, loggedInUserId } = this.state;
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
               projectId={projectId}
               updateList={this.updateList}
               deleteList={this.deleteList}
               loggedInUserId={loggedInUserId}
               getTasks={this.getTasks}
               getLists={this.getLists}
               convertTaskIdsToIntegers={this.convertTaskIdsToIntegers}
            />
         );
      });
      return listArr;
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
                  <Droppable droppableId='all-lists' direction='horizontal' type='list' >
                     {(provided) => {
                        return (
                           <div className='main-content' {...provided.droppableProps} ref={provided.innerRef}>
                              <div className='list-container'>
                                 { this.displayLists() }
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
