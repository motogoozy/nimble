import React, { Component } from 'react';
import './Dashboard.scss';
import Sidebar from '../../Sidebar/Sidebar';
import Header from '../../Header/Header';
import Column from '../../Column/Column';
import AddButton from '../../AddButton/AddButton';

import Tooltip from '@material-ui/core/Tooltip';
import { DragDropContext } from 'react-beautiful-dnd';

export default class Dashboard extends Component {
   state = {
      columns: {
         'column-1': {
            id: 'column-1',
            title: 'To Dos',
            taskIds: ['task-1', 'task-2', 'task-3']
         },
         'column-2': {
            id: 'column-2',
            title: 'To Dos',
            taskIds: ['task-4', 'task-5', 'task-6']
         },
         'column-3': {
            id: 'column-3',
            title: 'To Dos',
            taskIds: ['task-7', 'task-8', 'task-9']
         },
      },
      tasks: {
         'task-1': { id: 'task-1', title: 'Task 1', content: 'Wash Dishes'},
         'task-2': { id: 'task-2', title: 'Task 2', content: 'Take out trash'},
         'task-3': { id: 'task-3', title: 'Task 3', content: 'Clean Car'},
         'task-4': { id: 'task-4', title: 'Task 4', content: 'Wash Dishes'},
         'task-5': { id: 'task-5', title: 'Task 5', content: 'Take out trash'},
         'task-6': { id: 'task-6', title: 'Task 6', content: 'Clean Car'},
         'task-7': { id: 'task-7', title: 'Task 7', content: 'Wash Dishes'},
         'task-8': { id: 'task-8', title: 'Task 8', content: 'Take out trash'},
         'task-9': { id: 'task-9', title: 'Task 9', content: 'Clean Car'},
      },
      columnOrder: ['column-1', 'column-2', 'column-3'],
   };

   onDragStart = () => {

   };

   onDragUpdate = update => {

   };

   onDragEnd = result => {
      const { source, destination, draggableId } = result;

      if (!destination) {
         return;
      }
      if (
         destination.droppableId === source.droppableId &&
         destination.index === source.index
      ) {
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
            }
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
            }
         };
   
         this.setState(newState);
      }

   };
   
   displayColumns = () => {
      const { tasks, columns, columnOrder } = this.state;
      let columnArr = columnOrder.map(columnId => {
         const column = columns[columnId];
         const taskArr = column.taskIds.map(taskId => tasks[taskId]);
         return (
            <Column key={column.id} column={column} tasks={taskArr} />
         );
      })

      return (
         <div className='column-container'>
            { columnArr }
            <Tooltip title={'Add New List'}>
               <div className='add-list-button-container'>
                  <AddButton />
               </div>
            </Tooltip>
         </div>
      )
   }
	
	render() {
		return (
			<div className='dashboard'>
				<Sidebar />
            <div className='main-content-container'>
               <Header />
               <div className='main-content'>
                  <DragDropContext
                     onDragStart={this.onDragStart}
                     onDragUpdate={this.onDragUpdate}
                     onDragEnd={this.onDragEnd}
                  >
                     { this.displayColumns() }
                  </DragDropContext>
               </div>
            </div>
			</div>
		)
	}
}
