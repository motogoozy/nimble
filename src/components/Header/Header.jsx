import React, { Component } from 'react';
import './Header.scss';
import AddButton from '../AddButton/AddButton';
import Avatar from '../Avatar/Avatar';
import SearchBar from '../SearchBar/SearchBar';

import Select from 'react-select';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';


export default class Header extends Component {
    state = {
        anchorEl: null,
    };

    openMenu = (e) => {
        this.setState({ anchorEl: e.currentTarget });
    };

    closeMenu = () => {
        this.setState({ anchorEl: null });
    };

    render() {
        return (
            <div className='header'>
                <div className='header-left-container'>
                    <div className='header-select-container'>
                        <Select
                            placeholder='Select Project'
                        />
                    </div>
                    <div>
                        <AddButton title='Add Project' />
                    </div>
                </div>
                <div className='header-right-container'>
                    <div classname='header-searchbar-container'>
                        <SearchBar />
                    </div>
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
                            <MenuItem>Profile</MenuItem>
                            <MenuItem>Settings</MenuItem>
                            <MenuItem>Logout</MenuItem>
                        </Menu>
                    </div>
                </div>
            </div>
        )
    }
}
