import React, { useState, useEffect } from 'react';
import './ProjectSettings.scss';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import { withStyles } from '@material-ui/core/styles';

export default function ProjectSettings(props) {
   const [projectTitle, setProjectTitle] = useState(props.project.title);
   const [newProjectTitle, setNewProjectTitle] = useState(props.project.title);
   const [editProjectTitle, setEditProjectTitle] = useState(false);
   const [permissions, setPermissions] = useState({
      editLists: false,
      deleteLists: false,
      editTasks: false,
      deleteTasks: false,
   });

   useEffect(() => {
      setProjectTitle(props.project.title);
      setNewProjectTitle(props.project.title);
   }, [props.project.title]);

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
               {
                  editProjectTitle
                  ?
                  <div className='edit-project-title-container'>
                     <TextField
                        required
                        placeholder='Title (60 chars max)'
                        id="standard-required"
                        value={newProjectTitle}
                        onChange={e => setNewProjectTitle(e.target.value)}
                     />
                     <Tooltip title='Save changes'>
                        <i
                           className='cursor-pointer save-new-project-title fas fa-check'
                           onClick={async () => {
                              if (newProjectTitle !== projectTitle) {
                                 await props.updateProject(props.projectId, newProjectTitle, props.project.listOrder);
                                 props.getProjectDetails();
                              }
                              setEditProjectTitle(false);
                           }}
                        ></i>
                     </Tooltip>
                     <Tooltip title='Cancel changes'>
                        <i
                           className='cursor-pointer fas fa-times'
                           style={{ color: 'crimson' }}
                           onClick={async () => {
                              setNewProjectTitle(props.project.title);
                              setEditProjectTitle(false);
                           }}
                        ></i>
                     </Tooltip>
                  </div>
                  :
                  <div className='edit-project-title-container'>
                     <p>{projectTitle}</p>
                     <Tooltip title='Edit Title'>
                        <i className="fas fa-pencil-alt cursor-pointer" onClick={() => setEditProjectTitle(true)}></i>
                     </Tooltip>
                  </div>
               }
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
};