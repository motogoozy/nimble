import React from 'react';
import './AddButton.scss';

import Tooltip from '@material-ui/core/Tooltip';


export default function AddButton(props) {
   return (
      <Tooltip title={props.title}>
         <div className='add-button cursor-pointer'>
               <i className="fas fa-plus"></i>
         </div>
      </Tooltip>
   )
}
