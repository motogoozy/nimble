import React, { Component } from 'react';
import './Dashboard.scss';
import Sidebar from '../../Sidebar/Sidebar';
import Header from '../../Header/Header';
import Column from '../../Column/Column';
import AddButton from '../../AddButton/AddButton';

import axios from 'axios';
import Tooltip from '@material-ui/core/Tooltip';
import { DragDropContext } from 'react-beautiful-dnd';
import { Droppable } from 'react-beautiful-dnd';

export default class Dashboard extends Component {
   state = {
      columns: {
         'column-1': {
            id: 'column-1',
            title: 'To Dos',
            taskIds: ['task-1', 'task-2', 'task-3'],
            colorCode: [255, 183, 77, 1],
         },
         'column-2': {
            id: 'column-2',
            title: 'In Progress',
            taskIds: ['task-4', 'task-5', 'task-6'],
            colorCode: [194, 24, 91, 1],
         },
         'column-3': {
            id: 'column-3',
            title: 'Completed',
            taskIds: ['task-7', 'task-8', 'task-9'],
            colorCode: [0, 151, 167, 1],
         },
      },
      tasks: {
         'task-1': { id: 'task-1', title: 'Task 1', content: 'Wash Dishes'},
         'task-2': { id: 'task-2', title: 'Task 2', content: 'Take out trash'},
         'task-3': { id: 'task-3', title: 'Task 3', content: 'Clean Car'},
         'task-4': { id: 'task-4', title: 'Task 4', content: 'Walk the Dog'},
         'task-5': { id: 'task-5', title: 'Task 5', content: 'Get Groceries'},
         'task-6': { id: 'task-6', title: 'Task 6', content: 'Mow the Lawn'},
         'task-7': { id: 'task-7', title: 'Task 7', content: 'Do Laundry'},
         'task-8': { id: 'task-8', title: 'Task 8', content: 'Vacuum'},
         'task-9': { id: 'task-9', title: 'Task 9', content: 'Go to the gym'},
      },
      columnOrder: ['column-1', 'column-2', 'column-3'],
      displayAddButton: true,
      projectId: 1,
      title: 'Test List',
   };

   componentDidMount = async () => {
      // await this.getLists();
   };

   getLists = async () => {
      // const { projectId } = this.state;
      // let res = await axios.get(`/project/${projectId}/lists`);
      // console.log(res.data)
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
         this.setState(newState);
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

   handleInput = (key, value) => {
      this.props.handleClick();
      this.setState({ key: value });
   }

   addList = async () => {
      // const { projectId, title } = this.state;
      // const body = {
      //    title: title,
      //    color_code: [96, 125, 139, 1],
      //    archived: false,
      // };
      // let res = await axios.post(`/project/${projectId}/list`, body);
      // console.log(res.data);
   }
   
   displayColumns = () => {
      const { tasks, columns, columnOrder } = this.state;
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
            />
         );
      })

      return (
         <div className='column-container'>
            { columnArr }
            <div style={{ display: this.state.displayAddButton ? 'block' : 'none' }}>
               <Tooltip title={'Add New List'}>
                  <div style={{ width: '0px' }} onClick={this.addList}>
                     <AddButton />
                  </div>
               </Tooltip>
            </div>
         </div>
      )
   };
	
	render() {
		return (
			<div className='dashboard'>
				<Sidebar />
            <div className='main-content-container'>
               <Header />
               <DragDropContext onDragStart={this.onDragStart} onDragUpdate={this.onDragUpdate} onDragEnd={this.onDragEnd} >
                  <Droppable droppableId='all-columns' direction='horizontal' type='column' >
                     {(provided) => {
                        return (
                           <div
                              className='main-content'
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                           >
                              { this.displayColumns() }
                              { provided.placeholder }
                           </div>
                        )
                     }}
                  </Droppable>
               </DragDropContext>
            </div>
			</div>
		)
	}
}
