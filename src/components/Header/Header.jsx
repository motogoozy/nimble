import React, { Component } from 'react';
import './Header.scss';
import SmallAddButton from '../SmallAddButton/SmallAddButton';
import Avatar from '../Avatar/Avatar';

import axios from 'axios';
import { Link, withRouter } from 'react-router-dom';
import Select from 'react-select';
import TextField from '@material-ui/core/TextField';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

class Header extends Component {
   state = {
      anchorEl: null,
      currentPage: '',
      search: '',
      newProjectName: '',
      displayAddProjectModal: false,
      loggedInUser: '',
      projects: [],
      selectedProject: '',
   };

   componentDidMount = async () => {
      let userId = this.props.loggedInUser.user_id;
      await this.getUserProjects(userId);
      if (this.props.match.params.project_id) {
         const project = this.state.projects.filter(project => project.project_id === parseInt(this.props.match.params.project_id))[0];
         if (project) {
            this.handleSelection(project)
         }
      }
      this.setState({ currentPage: window.location.hash });
   };

   componentDidUpdate = async (prevProps) => {
      if (this.state.currentPage !== window.location.hash) {
         this.setState({ currentPage: window.location.hash });
      };
      if (this.props.match.params.project_id !== prevProps.match.params.project_id) {
         const project = this.state.projects.filter(project => project.project_id === parseInt(this.props.match.params.project_id))[0];
         if (project) {
            this.handleSelection(project)
         }
         this.setState({ currentPage: window.location.hash });
      };
      if (!prevProps.loggedInUser.user_id && this.props.loggedInUser.user_id) {
         this.getUserProjects();
      }
      if (prevProps.project.title !== this.props.project.title) {
         await this.getUserProjects();
         const project = this.state.projects.filter(project => project.project_id === parseInt(this.props.match.params.project_id))[0];
         this.handleSelection(project)
      }
   };

   getUserProjects = async () => {
      const { loggedInUser } = this.props;
      let res = await axios.get(`/user/${loggedInUser.user_id}/projects`);
      let projectsArr = res.data.map(project => {
         project.value = project.project_id;
         if (project.created_by === loggedInUser.user_id) {
            project.label = `${project.title} *`
         } else {
            project.label = project.title;
         }
         return project;
      });
      projectsArr.sort((a, b) => (a.label > b.label) ? 1 : -1); // sorting alphabetically descending
      this.setState({ projects: projectsArr });
   };

   openMenu = (e) => {
      this.setState({ anchorEl: e.currentTarget });
   };

   closeMenu = () => {
      this.setState({ anchorEl: null });
   };

   handleInput = (key, value) => {
      this.setState({ [key]: value });
   };

   handleSelection = (project) => {
      this.props.history.push(`/dashboard/project/${project.project_id}`);
      this.props.getProjectData(project.project_id);
      this.setState({
         selectedProject: project
      });
   }

   addProject = async () => {
      const { newProjectName } = this.state;
      const { loggedInUser } = this.props;
      const body = {
         title: newProjectName,
         created_by: loggedInUser.user_id,
      };
      try {
         let res = await axios.post('/project', body);
         await axios.post(`/project/${res.data.project_id}/user/${loggedInUser.user_id}`);
         await this.getUserProjects();
         this.props.getProjectData(res.data.project_id);
         res.data.value = res.data.project_id;
         res.data.label = res.data.title;
         this.setState({
            selectedProject: res.data,
            displayAddProjectModal: false,
         });
      }
      catch (err) {
         console.log(err);
      }
   };

   cancelAddProject = () => {
      this.setState({
         newProjectName: '',
         displayAddProjectModal: false,
      });
   };

   logout = async () => {
      try {
         let res = await axios.get('/auth/logout');
         this.props.history.push('/')
         console.log(res.data);
      } catch (err) {
         console.log(err);
      }
   };

   addProjectModal = () => {
      return (
         <div className='modal-wrapper' onClick={this.cancelAddProject}>
            <div className='add-project-modal' style={{ padding: '1rem' }} onClick={e => e.stopPropagation()}>
               <p style={{ fontSize: '1.2rem' }}>New Project:</p>
               <TextField
                  id="standard-search"
                  label="Project Name"
                  onChange={e => this.handleInput('newProjectName', e.target.value)}
                  autoFocus
               />
               <div>
                  <Button style={{ margin: '1rem .5rem 0 .5rem' }} variant="outlined" color='secondary' onClick={this.cancelAddProject}>Cancel</Button>
                  <Button style={{ margin: '1rem .5rem 0 .5rem' }} variant="outlined" color='primary' onClick={this.addProject}>Save</Button>
               </div>
            </div>
         </div>
      )
   };

   formatColor = (arr) => `rgba(${arr[0]}, ${arr[1]}, ${arr[2]}, ${arr[3]})`;

   getUserInitials = (user) => `${user.first_name.split('')[0]}${user.last_name.split('')[0]}`;

   render() {
      const { currentPage, projects } = this.state;
      const { loggedInUser } = this.props;
      const avatarColor = this.formatColor(loggedInUser.color);
      const userInitials = this.getUserInitials(loggedInUser);

      return (
         <div className='header'>
            <div className='header-left-container'>
               {
                  currentPage !== '#/profile' && currentPage !== '#/settings'
                  &&
                  <>
                     <div className='header-select-container'>
                        <Select
                           placeholder='Select Project'
                           options={projects}
                           value={this.state.selectedProject}
                           styles={{ backgroundColor: 'green' }}
                           onChange={project => this.handleSelection(project)}
                        />
                     </div>
                     <div onClick={() => this.setState({ displayAddProjectModal: true })}>
                        <SmallAddButton title='New Project'/>
                     </div>
                  </>
               }
               {
                  currentPage === '#/profile' || currentPage === '#/settings'
                  ?
                  // <Link to='/dashboard' className='header-link'>
                     <div className='header-back-container cursor-pointer' onClick={this.props.history.goBack}>
                        <i className="fas fa-undo" style={{ marginRight: '.5rem'}}></i>
                        <span>Back To Dashboard</span>
                     </div>
                  // </Link>
                  :
                  null
               }
            </div>
            <div className='header-right-container'>
               {
                  currentPage !== '#/profile' && currentPage !== '#/settings'
                  &&
                  <Input type='search' placeholder='Search name or task'/>
               }
               <div className='header-avatar-container cursor-pointer'>
                  <Button
                     aria-controls='simple-menu'
                     aria-haspopup='true'
                     onClick={this.openMenu}
                     style={{ backgroundColor: 'transparent' }}
                  >
                     <Avatar
                        initials={userInitials}
                        color={avatarColor}
                     />
                  </Button>
                  <Menu
                     id='simple-menu'
                     anchorEl={this.state.anchorEl}
                     keepMounted
                     open={Boolean(this.state.anchorEl)}
                     onClose={this.closeMenu}
                  >
                     {/* <Link to='/profile' className='header-link' onClick={this.closeMenu}> */}
                        <MenuItem>Profile</MenuItem>
                     {/* </Link> */}
                     {/* <Link to='/settings' className='header-link' onClick={this.closeMenu}> */}
                        {/* <MenuItem>Settings</MenuItem> */}
                     {/* </Link> */}
                     <MenuItem className='header-link' onClick={this.logout}>Logout</MenuItem>
                  </Menu>
               </div>
            </div>
            {
               this.state.displayAddProjectModal
               &&
               this.addProjectModal()
            }
         </div>
      )
   }
}

export default withRouter(Header);