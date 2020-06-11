import React, { useState, useEffect } from 'react';
import './ProfilePage.scss';
import Avatar from '../../components/Avatar/Avatar';
import { formatColor, getUserInitials } from '../../utils';
import ColorPicker from '../../components/ColorPicker/ColorPicker';

import axios from 'axios';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Swal from 'sweetalert2';

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
   const [userDetails, setUserDetails] = useState();
   const [newUserDetails, setNewUserDetails] = useState();
   const [oldPassword, setOldPassword] = useState('');
   const [newPassword, setNewPassword] = useState('');
   const [confirmNewPassword, setConfirmNewPassword] = useState('');
   const [editUserDetails, setEditUserDetails] = useState(false);
   const [editPassword, setEditPassword] = useState(false);
   const [displayColorPicker, setDisplayColorPicker] = useState(false);
   const [passwordErrMsg, setPasswordErrMsg] = useState('');

   useEffect(() => {
      axios.get('/auth/user_session')
         .then(res => {
            setUserDetails(res.data);
            setNewUserDetails(res.data);
            if (localStorage.getItem('nimblePasswordReset')) {
               setEditPassword(true);
            }
         })
         .catch(err => console.log(err.response.data));
   }, []);

   const updateUserDetails = async (newColor) => {
      const { user_id } = userDetails;
      const body = {
         first_name: newUserDetails.first_name,
         last_name: newUserDetails.last_name,
         email: newUserDetails.email,
         color: newColor || userDetails.color
      };

      if (
         userDetails.first_name === newUserDetails.first_name &&
         userDetails.last_name === newUserDetails.last_name &&
         userDetails.email === newUserDetails.email &&
         newColor === newUserDetails.color
      ) {
         console.log('No changes to commit.');
         setEditUserDetails(false);
         return;
      };

      try {
         let res = await axios.put(`/user/${user_id}`, body);
         Swal.fire({
            type: 'success',
            title: 'Profile successfully updated.',
            showConfirmButton: false,
            timer: 1000
         })
         setUserDetails(res.data);
         setNewUserDetails(res.data);
      } catch (err) {
         console.log(err);
      } finally {
         setEditUserDetails(false);
      }
   };

   const updatePassword = async () => {
      const { user_id } = userDetails;
      const body = {
         oldPassword: oldPassword,
         newPassword: newPassword
      };

      if (newPassword !== confirmNewPassword) {
         setPasswordErrMsg('Passwords do not match.');
         return;
      }

      try {
         let res = await axios.put(`/auth/change_password/${user_id}`, body);
         Swal.fire({
            type: 'success',
            title: res.data,
            showConfirmButton: false,
            timer: 1000
         }).then(() => {
            clearFields();
            setEditPassword(false);
            setEditUserDetails(false);
            if (localStorage.getItem('nimblePasswordReset')) {
               localStorage.removeItem('nimblePasswordReset');
            }
         })
      } catch (err) {
         console.log(err.response.data);
         setPasswordErrMsg(err.response.data);
      }
   };

   const clearFields = () => {
      setPasswordErrMsg('');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
   };

   const handleEditUserDetails = (key, value) => {
      setNewUserDetails({...newUserDetails, [key]: value});
   };

   const handleColorChange = (event) => {
		const { r, g, b, a } = event.rgb;
      const codeArr = [r, g, b, a];
      setDisplayColorPicker(false);
      updateUserDetails(codeArr);
	};

   const cancelEditUserDetails = () => {
      setNewUserDetails({...userDetails});
      setEditUserDetails(false);
   };

   const cancelEditPassword = () => {
      clearFields();
      setEditPassword(false);
      setEditUserDetails(false);
   };

   const closeColorPicker = () => {
      setDisplayColorPicker(false);
   };

   const classes = useStyles();

   return (
      <div className='profile-page page-content'>
         <i className="far fa-arrow-alt-circle-left cursor-pointer profile-back-button" onClick={() => {
            if (props.location.state?.prevPath && props.location.state.prevPath.includes('/dashboard/project/')) {
               props.history.goBack();
            } else {
               props.history.push('/dashboard');
            }
         }}></i>

         {
            newUserDetails && userDetails
            &&
            <div className='user-info-container'>
               <Avatar
                  color={formatColor(userDetails.color)}
                  initials={getUserInitials(userDetails)}
                  size={'5rem'}
                  fontSize={'2.5rem'}
               />
               <p onClick={() => setDisplayColorPicker(true)} className='change-color-button'>Change Color</p>

               {
                  displayColorPicker
                  &&
                  <div className='modal-wrapper' onClick={() => setDisplayColorPicker(false)}>
                     <div className='profile-color-container' onClick={e => e.stopPropagation()}>
                        <p>Select New Color:</p>
                        <ColorPicker
                           handleColorChange={e => handleColorChange(e)}
                           closeColorPicker={closeColorPicker}
                        />
                     </div>
                  </div>
               }

               <Container component="main" maxWidth="xs">
                  <CssBaseline />
                  <div className={classes.paper}>
                     <Typography component="h1" variant="h5">
                        {
                           !editPassword
                           ?
                           <p style={{ color: displayColorPicker ? 'white' : 'black' }}>Profile Settings</p>
                           :
                           <p style={{ color: displayColorPicker ? 'white' : 'black' }}>Change Password</p>
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
                                                onClick={() => updateUserDetails()}
                                                disabled={
                                                   !newUserDetails.first_name ||
                                                   !newUserDetails.last_name ||
                                                   !newUserDetails.email
                                                }
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

                                 {
                                    passwordErrMsg
                                    &&
                                    <div className='password-err-msg-container'>
                                       <p>{passwordErrMsg}</p>
                                    </div>
                                 }

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
                                          onClick={updatePassword}
                                          disabled={!oldPassword || !newPassword || !confirmNewPassword}
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
                              <p onClick={() => setEditPassword(true)}>Change Password</p>
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
