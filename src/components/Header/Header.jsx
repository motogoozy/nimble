import React, { Component } from 'react';
import './Header.scss';
import SmallAddButton from '../SmallAddButton/SmallAddButton';
import Avatar from '../Avatar/Avatar';
import { formatColor, getUserInitials } from '../../utils';

import axios from 'axios';
import { Link, withRouter } from 'react-router-dom';
import Select from 'react-select';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Swal from 'sweetalert2';

class Header extends Component {
   state = {
      anchorEl: null,
      currentPage: '',
      newProjectName: '',
      displayAddProjectModal: false,
      loggedInUser: '',
      projects: [],
      selectedProject: '',
   };

   componentDidMount = async () => {
      let userId = this.props.loggedInUser.user_id;
      try {
         await this.getUserProjects(userId);
         if (this.props.match.params.project_id) {
            // If logged in user isn't part of this project
            if (!this.state.projects.map(project => project.project_id).includes(parseInt(this.props.match.params.project_id))) {
               Swal.fire({
                  type: 'warning',
                  title: 'Oops!',
                  text: 'You are not a collaborator on this project. Please select another project.',
               })
               return;
            }
   
            const project = this.state.projects.filter(project => project.project_id === parseInt(this.props.match.params.project_id))[0];
            if (project) {
               this.handleSelection(project);
            }
         } else if (this.state.projects.length === 1) {
            this.handleSelection(this.state.projects[0]);
         }
         
         this.setState({ currentPage: window.location.hash });
      } catch (err) {
         console.log(err.response.data);
      }
   };

   componentDidUpdate = async (prevProps) => {
      if (this.state.currentPage !== window.location.hash) {
         this.setState({ currentPage: window.location.hash });
      };
      if (this.props.match.params.project_id !== prevProps.match.params.project_id) {
         // If logged in user isn't part of this project
         if (this.props.match.params.project_id && !this.state.projects.map(project => project.project_id).includes(parseInt(this.props.match.params.project_id))) {
            Swal.fire({
               type: 'warning',
               title: 'Oops!',
               text: 'You are not a collaborator on this project. Please select another project.',
            })
            return;
         }

         const project = this.state.projects.filter(project => project.project_id === parseInt(this.props.match.params.project_id))[0];
         if (project) {
            this.handleSelection(project)
         }
         this.setState({ currentPage: window.location.hash });
      };
      if (!prevProps.loggedInUser.user_id && this.props.loggedInUser.user_id) {
         try {
            await this.getUserProjects();
         } catch (err) {
            console.log(err.response.data);
         }
      }
      if (prevProps.project.title !== this.props.project.title) {
         try {
            await this.getUserProjects();
            const project = this.state.projects.filter(project => project.project_id === parseInt(this.props.match.params.project_id))[0];
            this.setState({ selectedProject: project })
         } catch (err) {
            console.log(err.response.data);
         }
      }
   };

   getUserProjects = async () => {
      const { loggedInUser } = this.props;

      const res = await axios.get(`/user/${loggedInUser.user_id}/projects`);
      let projectsArr = res.data.map(project => {
         project.value = project.project_id;
         if (project.created_by === loggedInUser.user_id) {
            project.label = `${project.title} *`;
         }
         else {
            project.label = project.title;
         }
         return project;
      });
      projectsArr.sort((a, b) => {
         if (a.label > b.label)
            return 1;
         else if (a.label < b.label)
            return -1;
         else
            return 0;
      });

      this.setState({ projects: projectsArr });
      return projectsArr;
   };

   addProject = async () => {
      const { newProjectName } = this.state;
      const { loggedInUser } = this.props;
      const body = {
         title: newProjectName,
         created_by: loggedInUser.user_id,
      };

      if (newProjectName.length > 50) {
         Swal.fire({
            type: 'warning',
            title: 'Oops!',
            text: 'Project name must be under 50 characters in length.',
         })
         return;
      }

      try {
         let res = await axios.post('/project', body);
         await axios.post(`/project/${res.data.project_id}/user/${loggedInUser.user_id}`);
         await this.getUserProjects();
         this.props.getCompleteProjectData(res.data.project_id);
         res.data.value = res.data.project_id;
         res.data.label = res.data.title;
         this.setState({
            selectedProject: res.data,
            displayAddProjectModal: false,
         });

         this.handleSelection(res.data);
         return res.data;
      }
      catch (err) {
         console.log(err.response.data);
      }
   };

   cancelAddProject = () => {
      this.setState({
         newProjectName: '',
         displayAddProjectModal: false,
      });
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
      this.props.getCompleteProjectData(project.project_id);
      this.projectSelectRef.select.state.isFocused = false;
      this.setState({
         selectedProject: project
      });
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
                  placeholder='Name (50 chars max)'
               />
               <div>
                  <Button style={{ margin: '1rem .5rem 0 .5rem' }} variant="outlined" color='secondary' onClick={this.cancelAddProject}>Cancel</Button>
                  <Button style={{ margin: '1rem .5rem 0 .5rem' }} variant="outlined" color='primary' onClick={this.addProject}>Save</Button>
               </div>
            </div>
         </div>
      )
   };

   render() {
      const { currentPage, projects } = this.state;
      const { loggedInUser } = this.props;
      const avatarColor = formatColor(loggedInUser.color);
      const userInitials = getUserInitials(loggedInUser);

      const brandColor = '#995D81';

      const selectStyles = {
      control: (base, state) => ({
         ...base,
         boxShadow: state.isFocused ? 0 : 0,
         border: state.isFocused ? `2px solid ${brandColor}` : `2px solid ${base.borderColor}`,
         outline: 'none',
         '&:hover': {
            border: state.isFocused ? `2px solid ${brandColor}` : `2px solid ${base.borderColor}`,
         }
      })
      };

      return (
         <div className='header'>
            <div className='header-left-container'>
               {
                  currentPage !== '#/profile'
                  &&
                  <>
                     <div className='header-select-container'>
                        <Select
                           ref={ref => {
                              this.projectSelectRef = ref;
                           }}
                           placeholder='Select Project'
                           options={projects}
                           value={this.state.selectedProject}
                           onChange={project => this.handleSelection(project)}
                           onClick={() => this.projectSelectRef.select.state.isFocused = true}
                           styles={selectStyles}
                           isDisabled={this.props.isLoading}
                        />
                     </div>
                     <div onClick={() => this.setState({ displayAddProjectModal: true })}>
                        <SmallAddButton title='New Project'/>
                     </div>
                  </>
               }
            </div>
            <div className='header-right-container'>
               <input
                  type="search"
                  placeholder='Search name or task'
                  value={this.props.search}
                  onChange={e => this.props.handleSearch(e.target.value)}
                  disabled={this.props.isLoading}
               />
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
                     <Link
                        to={{
                           pathname: '/profile',
                           state: {
                              prevPath: this.props.location.pathname
                           }
                        }}
                        style={{ textDecoration: 'none', color: 'black' }}
                     >
                        <MenuItem className='header-link'>Profile</MenuItem>
                     </Link>
                     <MenuItem className='header-link' onClick={this.props.logout}>Logout</MenuItem>
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