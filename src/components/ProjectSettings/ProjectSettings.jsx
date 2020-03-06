import React, { useState, useEffect } from 'react';
import './ProjectSettings.scss';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import { withStyles } from '@material-ui/core/styles';

export default function ProjectSettings(props) {
   const [projectTitle, setProjectTitle] = useState('');
   const [permissions, setPermissions] = useState({
      editLists: false,
      deleteLists: false,
      editTasks: false,
      deleteTasks: false,
   });

   useEffect(() => setProjectTitle(props.project.title), [props.project.title]);
   useEffect(() => console.log(permissions), [permissions]);


   const handleSwitch = (key, event) => {
      setPermissions({ ...permissions, [key]: event.target.checked })
   };

   const CustomSwitch = withStyles({
      switchBase: {
      color: '#663f56',
      '&$checked': {
         color: '#995D81',
      },
      '&$checked + $track': {
         backgroundColor: '#995D81',
      },
      },
      checked: {},
      track: {},
   })(Switch);

   return (
      <div className='project-settings-main'>
         <div className='project-settings-header'>
            <p style={{ fontWeight: '500' }}>Project Settings - {projectTitle}</p>
         </div>
         <div className='project-settings-body'>
            <p style={{ fontWeight: '400' }}>Project Title:</p>
            <div className='project-setting project-title-input-container'>
               <TextField
                  required
                  placeholder='Title (60 chars max)'
                  id="standard-required"
                  value={projectTitle}
                  onChange={e => setProjectTitle(e.target.value)}
               />
            </div>
            <div className='project-permissions-container'>
               <p style={{ fontWeight: '400' }}>Allow Collaborators to:</p>
               <div className='project-setting permission-switch'>
                  <p>Edit Lists</p>
                  <CustomSwitch
                     checked={permissions.editLists}
                     onChange={event => handleSwitch('editLists', event)}
                  />
               </div>
               <div className='project-setting permission-switch'>
                  <p>Delete Lists</p>
                  <CustomSwitch
                     checked={permissions.deleteLists}
                     onChange={event => handleSwitch('deleteLists', event)}
                  />
               </div>
               <div className='project-setting permission-switch'>
                  <p>Edit Tasks</p>
                  <CustomSwitch
                     checked={permissions.editTasks}
                     onChange={event => handleSwitch('editTasks', event)}
                  />
               </div>
               <div className='project-setting permission-switch'>
                  <p>Delete Tasks</p>
                  <CustomSwitch
                     checked={permissions.deleteTasks}
                     onChange={event => handleSwitch('deleteTasks', event)}
                  />
               </div>
            </div>
            <Tooltip title={'Delete List'}>
               <div className='delete-project-container cursor-pointer'>
                  <IconButton aria-label="delete">
                     <DeleteIcon />
                  </IconButton>
                  <p>Delete Project</p>
               </div>
            </Tooltip>
         </div>
      </div>
   )
}