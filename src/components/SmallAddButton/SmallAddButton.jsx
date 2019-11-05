import React from 'react';
import './SmallAddButton.scss';

import Tooltip from '@material-ui/core/Tooltip';


export default function SmallAddButton(props) {
   return (
      <Tooltip title={props.title}>
         <div className='add-button cursor-pointer'>
            <i className="fas fa-plus"></i>
         </div>
      </Tooltip>
   )
}
