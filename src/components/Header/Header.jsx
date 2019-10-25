import React, { Component } from 'react';
import './Header.scss';
import AddButton from '../AddButton/AddButton';
import Avatar from '../Avatar/Avatar';
import SearchBar from '../SearchBar/SearchBar';

import { Link, withRouter } from 'react-router-dom';
import Select from 'react-select';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';


class Header extends Component {
   state = {
      currentPage: '',
      anchorEl: null,
   };

   componentDidMount = () => {
      this.setState({ currentPage: window.location.hash });
   }

   componentDidUpdate = () => {
      if (this.state.currentPage !== window.location.hash) {
         this.setState({ currentPage: window.location.hash });
      }
   };

   openMenu = (e) => {
      this.setState({ anchorEl: e.currentTarget });
   };

   closeMenu = () => {
      this.setState({ anchorEl: null });
   };

   render() {
      const { currentPage } = this.state;
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
                              />
                           </div>
                           <div>
                              <AddButton title='New Project' />
                           </div>
                     </>
                  }
                  {
                     currentPage === '#/profile' || currentPage === '#/settings'
                     ?
                           <Link to='/dashboard' className='header-link'>
                              <div className='header-back-container'>
                                 <i class="fas fa-undo" style={{ marginRight: '.5rem'}}></i>
                                 <span>Back To Dashboard</span>
                              </div>
                           </Link>
                     :
                     null
                  }
               </div>
               <div className='header-right-container'>
                  {
                     currentPage !== '#/profile' && currentPage !== '#/settings'
                     &&
                     <div className='header-searchbar-container'>
                           <SearchBar />
                     </div>
                  }
                  <div className='header-avatar-container cursor-pointer'>
                     <Button
                           aria-controls='simple-menu'
                           aria-haspopup='true'
                           onClick={this.openMenu}
                           style={{ backgroundColor: 'transparent' }}
                     >
                           <Avatar
                              letter={'kp'}
                              color={'crimson'}
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
         </div>
      )
   }
}

export default withRouter(Header);