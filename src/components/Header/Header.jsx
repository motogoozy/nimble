import React, { Component } from 'react';
import './Header.scss';
import SmallAddButton from '../SmallAddButton/SmallAddButton';
import Avatar from '../Avatar/Avatar';
import SearchBar from '../SearchBar/SearchBar';

import axios from 'axios';
import { Link, withRouter } from 'react-router-dom';
import Select from 'react-select';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Badge from '@material-ui/core/Badge';


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

   componentDidUpdate = (prevProps) => {
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
   };

   getUserProjects = async () => {
      const { loggedInUser } = this.props;
      let res = await axios.get(`/projects/${loggedInUser.user_id}`);
      let projectsArr = res.data.map(project => {
         project.value = project.project_id;
         project.label = project.title;
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

   addProjectModal = () => {
      return (
         <div className='modal-wrapper' onClick={this.cancelAddProject}>
            <div className='add-project-modal' style={{ padding: '1rem' }} onClick={e => e.stopPropagation()}>
               <h3>New Project:</h3>
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

   render() {
      const { currentPage, projects } = this.state;
      const { loggedInUser } = this.props;
      const avatarColor = this.formatColor(loggedInUser.color);

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
                  <div className='header-searchbar-container'>
                     <SearchBar
                        onChangeFunc={e => console.log(e.target.value)}
                     />
                  </div>
               }
               <Badge classes={{ colorPrimary: 'badge-style' }} color="primary" badgeContent={3} overlap='circle'>
                  <i className="far fa-bell cursor-pointer"></i>
               </Badge>
               <div className='header-avatar-container cursor-pointer'>
                  <Button
                     aria-controls='simple-menu'
                     aria-haspopup='true'
                     onClick={this.openMenu}
                     style={{ backgroundColor: 'transparent' }}
                  >
                     <Avatar
                        initials={'kp'}
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
                     <Link to='/profile' className='header-link' onClick={this.closeMenu}>
                        <MenuItem>Profile</MenuItem>
                     </Link>
                     <Link to='/settings' className='header-link' onClick={this.closeMenu}>
                        <MenuItem>Settings</MenuItem>
                     </Link>
                     <MenuItem className='header-link'>Logout</MenuItem>
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