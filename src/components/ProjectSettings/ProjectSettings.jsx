import React, { useState, useEffect } from 'react';
import './ProjectSettings.scss';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import { withStyles } from '@material-ui/core/styles';
import axios from 'axios';

export default function ProjectSettings(props) {
   const [projectTitle, setProjectTitle] = useState(props.project.title);
   const [newProjectTitle, setNewProjectTitle] = useState(props.project.title);
   const [editProjectTitle, setEditProjectTitle] = useState(false);
   const [permissions, setPermissions] = useState({
      add_tasks: false,
      edit_tasks: false,
      delete_tasks: false,
      add_lists: false,
      edit_lists: false,
      delete_lists: false,
   });

   useEffect(() => {
      setProjectTitle(props.project.title);
      setNewProjectTitle(props.project.title);
   }, [props.project.title]);
   
   useEffect(() => {
      setPermissions(props.projectPermissions);
   }, [props.projectPermissions])

   const handleSwitch = async (key, event) => {
      const body = {
         permissions: {...permissions, [key]: event.target.checked}
      }
      try {
         let res = await axios.put(`/project/${props.project.project_id}/permissions`, body);
         setPermissions(res.data);
      } catch (err) {
         console.log(err);
      }
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
            <div className='project-settings-panel project-details-panel'>
               <div className='project-settings-panel-header'>
                  <p>Details</p>
               </div>
               <p style={{ fontWeight: '400' }}>Project Title</p>
               <div className='details-setting project-title-input-container'>
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
            </div>

            <div className='settings-panel-divider'/>

            <div className='project-settings-panel project-permissions-panel'>
               <div className='project-settings-panel-header'>
                  <p>Permissions</p>
               </div>

               <p style={{ fontWeight: '400', marginBottom: '1rem' }}>Allow Collaborators to:</p>

               <div className='project-permissions-container'>
                  <div className='permissions-category-container'>
                     <p className='permissions-category'>Tasks</p>
                     <div className='permission-switch-container'>
                        <div className='permission-switch'>
                           <p><span style={{ color: 'green' }}>Add</span> Tasks</p>
                           <CustomSwitch
                              checked={permissions.add_tasks}
                              onChange={event => handleSwitch('add_tasks', event)}
                           />
                        </div>
                        <div className='permission-switch'>
                           <p><span style={{ color: 'orange' }}>Edit</span> Tasks</p>
                           <CustomSwitch
                              checked={permissions.edit_tasks}
                              onChange={event => handleSwitch('edit_tasks', event)}
                           />
                        </div>
                        <div className='permission-switch'>
                           <p><span style={{ color: 'crimson' }}>Delete</span> Tasks</p>
                           <CustomSwitch
                              checked={permissions.delete_tasks}
                              onChange={event => handleSwitch('delete_tasks', event)}
                           />
                        </div>
                     </div>
                  </div>

                  <div className='permissions-category-container'>
                     <p className='permissions-category'>Lists</p>
                     <div className='permission-switch-container'>
                        <div className='permission-switch'>
                           <p><span style={{ color: 'green' }}>Add</span> Lists</p>
                           <CustomSwitch
                              checked={permissions.add_lists}
                              onChange={event => handleSwitch('add_lists', event)}
                           />
                        </div>
                        <div className='permission-switch'>
                           <p><span style={{ color: 'orange' }}>Edit</span> Lists</p>
                           <CustomSwitch
                              checked={permissions.edit_lists}
                              onChange={event => handleSwitch('edit_lists', event)}
                           />
                        </div>
                        <div className='permission-switch'>
                           <p><span style={{ color: 'crimson' }}>Delete</span> Lists</p>
                           <CustomSwitch
                              checked={permissions.delete_lists}
                              onChange={event => handleSwitch('delete_lists', event)}
                           />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className='project-settings-footer'>
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