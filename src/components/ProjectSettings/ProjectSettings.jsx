import React, { Component } from 'react';
import './ProjectSettings.scss';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';

export default class ProjectSettings extends Component {
   state = {
      projectTitle: '',
   };

   componentDidMount = async () => {
      this.setState({
         projectTitle: this.props.project.title
      })
   };

   handleInput = (key, value) => {
      this.setState({ [key]: value });
   };

   render() {
      const { projectTitle } = this.state;
      const { project } = this.props;
      return (
         <div className='project-settings-main'>
            <div className='project-settings-header'>
               <p>Project Settings - {project.title}</p>
            </div>
            <div className='project-settings-body'>
               <div className='project-settings-container'>
                  <div className='project-setting-container'>
                     <p>Project Title</p>
                     <TextField
								required
								placeholder='Title (60 chars max)'
                        id="standard-required"
                        value={projectTitle}
                        onChange={e => this.handleInput('projectTitle', e.target.value)}
                     />
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
         </div>
      )
   }
}
