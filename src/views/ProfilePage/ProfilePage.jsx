import React, { useState, useEffect } from 'react';
import './ProfilePage.scss';
import Avatar from '../../components/Avatar/Avatar';
import { formatColor, getUserInitials } from '../../utils';

import axios from 'axios';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

const useStyles = makeStyles(theme => ({
   root: {
      height: '100vh',
   },
   left: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(146deg, rgba(45,49,66,1) 0%, rgba(153,93,129,1) 50%, rgba(235,130,88,1) 100%)'
   },
   paper: {
      marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
   },
   avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
   },
   form: {
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(3),
   },
   submit: {
      margin: theme.spacing(3, 0, 2),
   },
}));

export default function ProfilePage() {
   const [loggedInUser, setLoggedInUser] = useState();
   const [newColor, setNewColor] = useState();

   useEffect(() => {
      axios.get('/auth/user_session').then(res => {
         setLoggedInUser(res.data);
      })
   }, []);

   const classes = useStyles();

   return (
      <div className='profile-page page-content'>
         {
            loggedInUser
            &&
            <div className='user-info-container'>
               <Avatar
                  color={formatColor(loggedInUser.color)}
                  initials={getUserInitials(loggedInUser)}
                  size={'5rem'}
                  fontSize={'2.5rem'}
               />
               <p className='change-color-button'>Change Color</p>

               <Container component="main" maxWidth="xs">
                  <CssBaseline />
                  <div className={classes.paper}>
                     <Typography component="h1" variant="h5">
                        Profile Settings
                     </Typography>
                     <form className={classes.form} noValidate>
                        <Grid container spacing={2}>
                           <Grid item xs={12} sm={6}>
                              <TextField
                                 value={loggedInUser.first_name}
                                 name="firstName"
                                 variant="outlined"
                                 required
                                 fullWidth
                                 id="firstName"
                                 label="First Name"
                                 autoFocus
                                 // onChange={event => setFirstName(event.target.value)}
                              />
                           </Grid>
                           <Grid item xs={12} sm={6}>
                              <TextField
                                 variant="outlined"
                                 required
                                 fullWidth
                                 id="lastName"
                                 label="Last Name"
                                 name="lastName"
                                 autoComplete="lname"
                                 // onChange={event => setLastName(event.target.value)}
                              />
                           </Grid>
                           <Grid item xs={12}>
                              <TextField
                                 variant="outlined"
                                 required
                                 fullWidth
                                 id="email"
                                 label="Email Address"
                                 name="email"
                                 autoComplete="email"
                                 // onChange={event => setEmail(event.target.value)}
                              />
                           </Grid>
                           <Grid item xs={12}>
                              <TextField
                                 variant="outlined"
                                 required
                                 fullWidth
                                 name="password"
                                 label="Password"
                                 type="password"
                                 id="password"
                                 autoComplete="current-password"
                                 // onChange={event => setPassword(event.target.value)}
                              />
                           </Grid>
                           <Grid item xs={12}>
                              <TextField
                                 variant="outlined"
                                 required
                                 fullWidth
                                 name="confirm-password"
                                 label="Confirm Password"
                                 type="password"
                                 id="confirm-password"
                                 autoComplete="current-password"
                                 // onChange={event => setPassword(event.target.value)}
                              />
                           </Grid>
                        </Grid>

                        <div className='profile-button-container'>
                           <div className='profile-button'>
                              <Button
                                 fullWidth
                                 variant="contained"
                                 color="secondary"
                                 width={12}
                                 // className={classes.submit}
                                 // onClick={register}
                              >
                                 Cancel
                              </Button>
                           </div>
                           <div className='profile-button'>
                              <Button
                                 fullWidth
                                 variant="contained"
                                 color="primary"
                                 // className={classes.submit}
                                 // onClick={register}
                              >
                                 Save
                              </Button>
                           </div>
                        </div>
                     </form>
                  </div>
               </Container>
            </div>
         }
      </div>
   )
}
