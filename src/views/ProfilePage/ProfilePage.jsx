import React, { useState, useEffect } from 'react';
import './ProfilePage.scss';
import Avatar from '../../components/Avatar/Avatar';
import { formatColor, getUserInitials } from '../../utils';

import axios from 'axios';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

const useStyles = makeStyles(theme => ({
   root: {
      height: '100vh',
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

export default function ProfilePage(props) {
   const [oldUserDetails, setOldUserDetails] = useState();
   const [newUserDetails, setNewUserDetails] = useState();
   const [newColor, setNewColor] = useState();
   const [editUserDetails, setEditUserDetails] = useState(false);
   const [editPassword, setEditPassword] = useState(false);
   const [oldPassword, setOldPassword] = useState('');
   const [newPassword, setNewPassword] = useState('');
   const [confirmNewPassword, setConfirmNewPassword] = useState('');

   useEffect(() => {
      axios.get('/auth/user_session')
         .then(res => {
            setOldUserDetails(res.data);
            setNewUserDetails(res.data);
         })
         .catch(err => console.log(err.response.data));
   }, []);

   // useEffect(() => {
   //    console.log(oldPassword)
   //    console.log(newPassword)
   //    console.log(confirmNewPassword)
   // }, [oldPassword, newPassword, confirmNewPassword])

   const handleEditUserDetails = (key, value) => {
      setNewUserDetails({...oldUserDetails, [key]: value});
   };

   const cancelEditUserDetails = () => {
      setNewUserDetails({...oldUserDetails});
      setEditUserDetails(false);
   };

   const cancelEditPassword = () => {
      setEditPassword(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
   };

   const classes = useStyles();

   return (
      <div className='profile-page page-content'>
         <i className="far fa-arrow-alt-circle-left cursor-pointer profile-back-button" onClick={() => props.history.goBack()}></i>

         {
            newUserDetails
            &&
            <div className='user-info-container'>
               <Avatar
                  color={formatColor(newUserDetails.color)}
                  initials={getUserInitials(newUserDetails)}
                  size={'5rem'}
                  fontSize={'2.5rem'}
               />
               <p className='change-color-button'>Change Color</p>

               <Container component="main" maxWidth="xs">
                  <CssBaseline />
                  <div className={classes.paper}>
                     <Typography component="h1" variant="h5">
                        {
                           !editPassword
                           ?
                           'Profile Settings'
                           :
                           'Change Password'
                        }
                     </Typography>
                     <form className={classes.form} noValidate>
                        <Grid container spacing={2}>
                           {
                              !editPassword
                              ?
                              <>
                                 <Grid item xs={12} sm={6}>
                                    <TextField
                                       autoFocus
                                       disabled={!editUserDetails}
                                       fullWidth
                                       id="firstName"
                                       name="firstName"
                                       onChange={e => handleEditUserDetails('first_name', e.target.value)}
                                       placeholder="First Name"
                                       value={newUserDetails.first_name}
                                       variant="outlined"
                                    />
                                 </Grid>
                                 <Grid item xs={12} sm={6}>
                                    <TextField
                                       fullWidth
                                       disabled={!editUserDetails}
                                       id="lastName"
                                       name="lastName"
                                       onChange={e => handleEditUserDetails('last_name', e.target.value)}
                                       placeholder="Last Name"
                                       value={newUserDetails.last_name}
                                       variant="outlined"
                                    />
                                 </Grid>
                                 <Grid item xs={12}>
                                    <TextField
                                       fullWidth
                                       disabled={!editUserDetails}
                                       id="email"
                                       name="email"
                                       onChange={e => handleEditUserDetails('email', e.target.value)}
                                       placeholder="Email Address"
                                       value={newUserDetails.email}
                                       variant="outlined"
                                    />
                                 </Grid>

                                 <div className='profile-button-container'>
                                    {
                                       editUserDetails
                                       ?
                                       <>
                                          <div className='profile-button'>
                                             <Button
                                                fullWidth
                                                variant="contained"
                                                color="secondary"
                                                width={12}
                                                onClick={cancelEditUserDetails}
                                             >Cancel</Button>
                                          </div>
                                          <div className='profile-button'>
                                             <Button
                                                fullWidth
                                                variant="contained"
                                                color="primary"
                                                // onClick={register}
                                             >Save</Button>
                                          </div>
                                       </>
                                       :
                                       <div className='profile-button'>
                                       <Button
                                             fullWidth
                                             variant="contained"
                                             color="primary"
                                             onClick={setEditUserDetails}
                                          >Edit</Button>
                                       </div>
                                    }
                                 </div>
                              </>
                              :
                              <>
                                 <Grid item xs={12}>
                                    <TextField
                                       fullWidth
                                       id="old-password"
                                       name="old-password"
                                       onChange={event => setOldPassword(event.target.value)}
                                       placeholder="Old Password"
                                       required
                                       type="password"
                                       value={oldPassword}
                                       variant="outlined"
                                    />
                                 </Grid>
                                 <Grid item xs={12}>
                                    <TextField
                                       fullWidth
                                       id="password"
                                       name="password"
                                       onChange={event => setNewPassword(event.target.value)}       
                                       placeholder="New Password"
                                       required
                                       type="password"
                                       value={newPassword}
                                       variant="outlined"
                                    />
                                 </Grid>
                                 <Grid item xs={12}>
                                    <TextField
                                       fullWidth
                                       id="confirm-password"
                                       name="confirm-password"
                                       onChange={event => setConfirmNewPassword(event.target.value)}
                                       placeholder="Confirm Password"
                                       required
                                       type="password"
                                       value={confirmNewPassword}
                                       variant="outlined"
                                    />
                                 </Grid>

                                 <div className='profile-button-container'>
                                    <div className='profile-button'>
                                       <Button
                                          fullWidth
                                          variant="contained"
                                          color="secondary"
                                          width={12}
                                          onClick={cancelEditPassword}
                                       >Cancel</Button>
                                    </div>
                                    <div className='profile-button'>
                                       <Button
                                          fullWidth
                                          variant="contained"
                                          color="primary"
                                          // onClick={register}
                                       >Save</Button>
                                    </div>
                                 </div>
                              </>
                           }
                        </Grid>

                        {
                           !editPassword
                           &&
                           <div className='change-password-container'>
                              <p onClick={setEditPassword}>Change Password</p>
                           </div>
                        }
                     </form>
                  </div>
               </Container>
            </div>
         }
      </div>
   )
}
