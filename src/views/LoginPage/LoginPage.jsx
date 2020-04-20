import React, { useState, useEffect } from 'react';
import './LoginPage.scss';
import NimbleLogo from '../../assets/nimble-logo.png';

import axios from 'axios';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

function Copyright() {
   return (
      <Typography variant="body2" color="textSecondary" align="center">
         {'Copyright © '}
         <Link color="inherit" href="#">
         Nimble
         </Link>{' '}
         {new Date().getFullYear()}
         {'.'}
      </Typography>
   );
};

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
      background: 'linear-gradient(146deg, rgba(45,49,66,1) 0%, rgba(153,93,129,1) 50%, rgba(235,130,88,1) 100%)',
      paddingBottom: '5rem',
   },
   paper: {
      margin: theme.spacing(8, 4),
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
      marginTop: theme.spacing(1),
   },
   submit: {
      margin: theme.spacing(3, 0, 2),
   },
}));

export default function LoginPage(props) {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [rememberMe, setRememberMe] = useState(true);
   const [loginErrMsg, setLoginErrMsg] = useState('');

   // Getting user's email from localStorage
   useEffect(() => {
      let userEmail = localStorage.getItem('nimbleEmail');
      if (userEmail) {
         setEmail(userEmail);
      }
   }, []);

   const login = async () => {
      if (!email || !password) {
         setLoginErrMsg('*Missing required field(s).');
         return;
      }

      let body = {
         email: email,
         password: password
      };

      try {
         let res = await axios.post('/auth/login', body);
         if (res.data.user_id) {
            if (rememberMe) {
               localStorage.setItem('nimbleEmail', `${res.data.email}`)
            } else {
               if (localStorage.getItem('nimbleEmail')) {
                  localStorage.removeItem('nimbleEmail');
               }
            }
            props.history.push('/dashboard');
         }
      } catch (err) {
         if (err.response.data) {
            setLoginErrMsg(err.response.data);
         }
      }
   };

   const onKeyPress = e => {
      if (e.which === 13) {
         login();
      }
   };
   
   const classes = useStyles();

   return (
      <Grid container component="main" className={classes.root}>
         <CssBaseline />
         <Grid item xs={false} sm={4} md={7} className={classes.left}>
            <div className='login-left-grid-container'>
               <Link href='#'>
                  <i className="far fa-arrow-alt-circle-left cursor-pointer" ></i>
               </Link>
               <img src={NimbleLogo} alt="Nimble Logo" />
               <p>NIMBLE</p>
            </div>
            <p style={{ color: 'white', fontSize: '1.5rem', marginTop: '1rem' }}>A Simple Approach to Project Management</p>
         </Grid>
         <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
            <div className={classes.paper}>
               <Avatar className={classes.avatar}>
                  <LockOutlinedIcon />
               </Avatar>
               <Typography component="h1" variant="h5">
                  Sign in
               </Typography>
               <form className={classes.form} noValidate onKeyPress={onKeyPress}>
                  <TextField
                     variant="outlined"
                     margin="normal"
                     required
                     fullWidth
                     id="email"
                     label="Email Address"
                     name="email"
                     autoComplete="email"
                     autoFocus
                     value={email}
                     onChange={event => setEmail(event.target.value)}
                     // onKeyPress={onKeyPress}
                  />
                  <TextField
                     variant="outlined"
                     margin="normal"
                     required
                     fullWidth
                     name="password"
                     label="Password"
                     type="password"
                     id="password"
                     autoComplete="current-password"
                     onChange={event => setPassword(event.target.value)}
                     // onKeyPress={onKeyPress}
                  />
                  {
                     loginErrMsg && <p style={{ color: 'crimson' }}>{loginErrMsg}</p>
                  }
                  <FormControlLabel
                     control={<Checkbox value="remember" color="primary" />}
                     label="Remember me"
                     checked={rememberMe}
                     onChange={event => setRememberMe(event.target.checked)}
                  />
                  <Button
                     fullWidth
                     variant="contained"
                     color="primary"
                     className={classes.submit}
                     onClick={login}
                  >
                     Sign In
                  </Button>
                  <Grid container>
                  <Grid item xs>
                     <Link href="#" variant="body2">
                        Forgot password?
                     </Link>
                  </Grid>
                  <Grid item>
                     <Link href="#/register" variant="body2">
                        {"Don't have an account? Sign Up"}
                     </Link>
                  </Grid>
                  </Grid>
                  <Box mt={5}>
                  <Copyright />
                  </Box>
               </form>
            </div>
         </Grid>
      </Grid>
   );
};