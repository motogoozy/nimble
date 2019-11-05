import React, { Component } from 'react';
import './Dashboard.scss';
import Sidebar from '../../Sidebar/Sidebar';
import Header from '../../Header/Header';
import Column from '../../Column/Column';
import AddButton from '../../AddButton/AddButton';
import testData from '../Dashboard/testData';

import Tooltip from '@material-ui/core/Tooltip';

export default class Dashboard extends Component {
   state = {
      testData: testData,
   };
   
   displayColumns = () => {
      const { testData } = this.state;
      let columns = testData.columnOrder.map(columnId => {
         const column = testData.columns[columnId];
         const tasks = column.taskIds.map(taskId => testData.tasks[taskId]);
         return (
            <div className='column-container'>
               <Column key={column.id} column={column} tasks={tasks} />
            </div>
         )
      })

      return columns;
      // return (
      //    <div className='column-container'>
      //       <Column />
      //       <Column />
      //       <Column />
      //       <Column />
      //       {/* <Column />
      //       <Column /> */}
      //       <Tooltip title={'Add Column'}>
      //          <div>
      //             <AddButton />
      //          </div>
      //       </Tooltip>
      //    </div>
      // )
   }
	
	render() {
		return (
			<div className='dashboard'>
				<Sidebar />
            <div className='main-content-container'>
               <Header />
               <div className='main-content'>
                  { this.displayColumns() }
               </div>
            </div>
			</div>
		)
	}
}
