import React from 'react';
import './AddButton.scss';

import Tooltip from '@material-ui/core/Tooltip'


export default function AddButton(props) {
    return (
        <Tooltip title={props.title}>
            <div className='add-button cursor-pointer'>
                <i class="fas fa-plus"></i>
            </div>
        </Tooltip>
    )
}
