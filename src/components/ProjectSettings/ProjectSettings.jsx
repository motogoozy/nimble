import React, { useState, useEffect } from 'react';
import './ProjectSettings.scss';

import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import { withStyles } from '@material-ui/core/styles';
import axios from 'axios';
import PulseLoader from 'react-spinners/PulseLoader';
import Swal from 'sweetalert2';

export default function ProjectSettings(props) {
  const [projectTitle, setProjectTitle] = useState();
  const [newProjectTitle, setNewProjectTitle] = useState();
  const [editProjectTitle, setEditProjectTitle] = useState(false);
  const [permissions, setPermissions] = useState({
    add_tasks: false,
    edit_tasks: false,
    delete_tasks: false,
    add_lists: false,
    edit_lists: false,
    delete_lists: false,
    edit_project: false,
    add_collaborators: false,
    remove_collaborators: false,
  });

  useEffect(() => {
    setProjectTitle(props.project.title);
    setNewProjectTitle(props.project.title);
  }, [props.project.title]);

  useEffect(() => {
    setPermissions(props.projectPermissions);
  }, [props.projectPermissions]);

  const handleToggleSwitch = async (key, event) => {
    const body = {
      permissions: { ...permissions, [key]: event.target.checked },
    };
    try {
      let res = await axios.put(`/project/${props.project.project_id}/permissions`, body);
      setPermissions(res.data);
    } catch (err) {
      console.log(err.response.data);
    }
  };

  const handleEditTitleClick = () => {
    if (props.loggedInUser.user_id === props.project.created_by || permissions.edit_project) {
      setEditProjectTitle(true);
    } else {
      Swal.fire({
        type: 'warning',
        title: 'Oops!',
        text: 'You do not have permission to edit this project.',
      });
    }
  };

  const archiveProject = () => {
    Swal.fire({
      type: 'warning',
      title: 'Are you sure?',
      text: 'This project and all associated lists and tasks will be permanently deleted!',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then(async res => {
      if (res.value) {
        await axios.put(`/project/archive/${props.project.project_id}`);
        Swal.fire({
          type: 'success',
          title: 'Project deleted',
          showConfirmButton: false,
          timer: 1000,
        })
          .then(() => {
            window.location.hash = '/';
            window.location.reload();
          })
          .catch(err => {
            console.log(err);
          });
      }
    });
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
      {projectTitle && permissions && !props.isLoading ? (
        <>
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
                {editProjectTitle ? (
                  <div className='edit-project-title-container'>
                    <TextField
                      required
                      placeholder='Title (60 chars max)'
                      id='standard-required'
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
                ) : (
                  <div className='edit-project-title-container'>
                    <p>{projectTitle}</p>
                    <Tooltip title='Edit Title'>
                      <i className='fas fa-pencil-alt cursor-pointer' onClick={handleEditTitleClick}></i>
                    </Tooltip>
                  </div>
                )}
              </div>
            </div>

            <div className='settings-panel-divider' />

            <div className='project-settings-panel project-permissions-panel'>
              <div className='project-settings-panel-header'>
                <p>Permissions</p>
              </div>

              {props.loggedInUser.user_id === props.project.created_by ? (
                <>
                  <p
                    style={{
                      fontWeight: '400',
                      marginBottom: '1rem',
                    }}
                  >
                    Allow Collaborators to:
                  </p>

                  <div className='project-permissions-container'>
                    <div className='permissions-category-container'>
                      <p className='permissions-category'>Tasks</p>
                      <div className='permission-switch-container'>
                        <div className='permission-switch'>
                          <p>
                            <span style={{ color: 'green' }}>Add</span> Tasks
                          </p>
                          <CustomSwitch
                            checked={permissions.add_tasks}
                            onChange={event => handleToggleSwitch('add_tasks', event)}
                          />
                        </div>
                        <div className='permission-switch'>
                          <p>
                            <span style={{ color: 'orange' }}>Edit</span> Tasks
                          </p>
                          <CustomSwitch
                            checked={permissions.edit_tasks}
                            onChange={event => handleToggleSwitch('edit_tasks', event)}
                          />
                        </div>
                        <div className='permission-switch'>
                          <p>
                            <span style={{ color: 'crimson' }}>Delete</span> Tasks
                          </p>
                          <CustomSwitch
                            checked={permissions.delete_tasks}
                            onChange={event => handleToggleSwitch('delete_tasks', event)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className='permissions-category-container'>
                      <p className='permissions-category'>Lists</p>
                      <div className='permission-switch-container'>
                        <div className='permission-switch'>
                          <p>
                            <span style={{ color: 'green' }}>Add</span> Lists
                          </p>
                          <CustomSwitch
                            checked={permissions.add_lists}
                            onChange={event => handleToggleSwitch('add_lists', event)}
                          />
                        </div>
                        <div className='permission-switch'>
                          <p>
                            <span style={{ color: 'orange' }}>Edit</span> Lists
                          </p>
                          <CustomSwitch
                            checked={permissions.edit_lists}
                            onChange={event => handleToggleSwitch('edit_lists', event)}
                          />
                        </div>
                        <div className='permission-switch'>
                          <p>
                            <span style={{ color: 'crimson' }}>Delete</span> Lists
                          </p>
                          <CustomSwitch
                            checked={permissions.delete_lists}
                            onChange={event => handleToggleSwitch('delete_lists', event)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className='permissions-category-container'>
                      <p className='permissions-category'>Collaborators</p>
                      <div className='permission-switch-container'>
                        <div className='permission-switch'>
                          <p>
                            <span style={{ color: 'green' }}>Add</span> Collaborators
                          </p>
                          <CustomSwitch
                            checked={permissions.add_collaborators}
                            onChange={event => handleToggleSwitch('add_collaborators', event)}
                          />
                        </div>
                        <div className='permission-switch'>
                          <p>
                            <span style={{ color: 'crimson' }}>Remove</span> Collaborators
                          </p>
                          <CustomSwitch
                            checked={permissions.remove_collaborators}
                            onChange={event => handleToggleSwitch('remove_collaborators', event)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className='permissions-category-container'>
                      <p className='permissions-category'>Project</p>
                      <div className='permission-switch-container'>
                        <div className='permission-switch'>
                          <p>
                            <span style={{ color: 'orange' }}>Edit</span> Project / List Order
                          </p>
                          <CustomSwitch
                            checked={permissions.edit_project}
                            onChange={event => handleToggleSwitch('edit_project', event)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className='permissions-owner-message'>
                  <p>Only Project Owners can change permissions.</p>
                </div>
              )}
            </div>
          </div>

          <div className='project-settings-footer'>
            {props.loggedInUser.user_id === props.project.created_by && (
              <Tooltip title={'Delete List'}>
                <div className='delete-project-container cursor-pointer' onClick={archiveProject}>
                  <IconButton aria-label='delete'>
                    <DeleteIcon />
                  </IconButton>
                  <p>Delete Project</p>
                </div>
              </Tooltip>
            )}
          </div>
        </>
      ) : (
        <div className='progress-container'>
          <PulseLoader size={12} color={'#995D81'} />
        </div>
      )}
    </div>
  );
}
