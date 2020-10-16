import React, { useState, useEffect, useContext } from 'react';
import './LoginPage.scss';
import NimbleLogo from '../../assets/nimble-logo.png';
import GlobalContext from '../../GlobalContext';

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
import Swal from 'sweetalert2';

function Copyright() {
  return (
    <Typography variant='body2' color='textSecondary' align='center'>
      {'Copyright © '}
      <Link color='inherit' href='#/welcome'>
        Nimble
      </Link>
      {` ${new Date().getFullYear()}.`}
    </Typography>
  );
}

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
  const [displayForgotPassword, setDisplayForgotPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [loginErrMsg, setLoginErrMsg] = useState('');
  const [resetErrMsg, setResetErrMsg] = useState('');
  const { setLoggedInUser } = useContext(GlobalContext);

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
      password: password,
    };

    try {
      let res = await axios.post('/auth/login', body);
      if (res.data.user_id) {
        if (rememberMe) {
          localStorage.setItem('nimbleEmail', `${res.data.email}`);
        } else {
          if (localStorage.getItem('nimbleEmail')) {
            localStorage.removeItem('nimbleEmail');
          }
        }
        Swal.fire({
          type: 'success',
          title: 'Logged In',
          text: `Welcome back, ${res.data.first_name}`,
          showConfirmButton: false,
          timer: 1000,
        }).then(() => {
          setLoggedInUser(res.data);
          if (localStorage.getItem('nimblePasswordReset')) {
            props.history.push('/profile');
          } else {
            props.history.push('/');
          }
        });
      }
    } catch (err) {
      if (err.response?.data) {
        console.log(err.response.data);
        setLoginErrMsg(err.response.data);
      } else {
        console.log(err);
        setLoginErrMsg('Error logging in');
      }
    }
  };

  const resetPassword = async () => {
    if (!recoveryEmail) {
      setResetErrMsg('*Missing required field.');
      return;
    }
    if (!emailIsValid(recoveryEmail)) {
      setResetErrMsg('*Please enter a valid email');
      return;
    }

    try {
      axios.put('/auth/reset_password', { email: recoveryEmail });
      Swal.fire({
        type: 'success',
        text: 'A recovery email be will sent to the email you provided. It may take a few minutes.',
      }).then(() => {
        setLoginErrMsg('');
        setResetErrMsg('');
        setDisplayForgotPassword(false);
        setRecoveryEmail('');

        if (localStorage) {
          localStorage.setItem('nimblePasswordReset', true);
        }
      });
    } catch (err) {
      if (err.response?.data) {
        console.log(err.response.data);
        setResetErrMsg(err.response.data);
      } else {
        console.log(err);
        setResetErrMsg('Error resetting password');
      }
    }
  };

  const cancelResetPassword = () => {
    setDisplayForgotPassword(false);
    setRecoveryEmail('');
    setResetErrMsg('');
    setLoginErrMsg('');
  };

  const emailIsValid = email => {
    if (!email.includes('@') || !email.includes('.')) {
      return false;
    } else {
      return true;
    }
  };

  const onKeyPress = e => {
    if (e.which === 13) {
      login();
    }
  };

  const classes = useStyles();

  return (
    <Grid container component='main' className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.left}>
        <div className='login-left-grid-container'>
          <Link href='#/welcome'>
            <i className='far fa-arrow-alt-circle-left cursor-pointer'></i>
          </Link>
          <img src={NimbleLogo} alt='Nimble Logo' />
          <p>NIMBLE</p>
        </div>
        <p style={{ color: 'white', fontSize: '1.5rem', marginTop: '1rem' }}>A Simple Approach to Project Management</p>
      </Grid>
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component='h1' variant='h5'>
            {!displayForgotPassword ? 'Sign in' : 'Reset Password'}
          </Typography>
          {!displayForgotPassword ? (
            <form className={classes.form} noValidate onKeyPress={onKeyPress}>
              <TextField
                variant='outlined'
                margin='normal'
                required
                fullWidth
                id='email'
                placeholder='Email Address'
                name='email'
                autoComplete='email'
                autoFocus
                value={email}
                onChange={event => setEmail(event.target.value)}
                // onKeyPress={onKeyPress}
              />
              <TextField
                variant='outlined'
                margin='normal'
                required
                fullWidth
                name='password'
                placeholder='Password'
                type='password'
                id='password'
                autoComplete='current-password'
                onChange={event => setPassword(event.target.value)}
                // onKeyPress={onKeyPress}
              />
              {loginErrMsg && <p style={{ color: 'crimson' }}>{loginErrMsg}</p>}
              <FormControlLabel
                control={<Checkbox value='remember' color='primary' />}
                label='Remember me'
                checked={rememberMe}
                onChange={event => setRememberMe(event.target.checked)}
              />
              <Button fullWidth variant='contained' color='primary' className={classes.submit} onClick={login}>
                Sign In
              </Button>
              <Grid container>
                <div className='login-options-button-container'>
                  <Grid item>
                    <p className='cursor-pointer' onClick={() => setDisplayForgotPassword(true)}>
                      Forgot password?
                    </p>
                  </Grid>
                  <Grid item>
                    <Link href='#/register' variant='body2'>
                      Don't have an account? Sign Up
                    </Link>
                  </Grid>
                </div>
              </Grid>
              <Box mt={5}>
                <Copyright />
              </Box>
            </form>
          ) : (
            <div className='reset-password-container'>
              <TextField
                variant='outlined'
                margin='normal'
                required
                fullWidth
                name='email'
                placeholder='Enter your email'
                type='email'
                id='email'
                onChange={event => setRecoveryEmail(event.target.value)}
                // onKeyPress={onKeyPress}
              />
              {resetErrMsg && <p style={{ color: 'crimson' }}>{resetErrMsg}</p>}
              <Button fullWidth variant='contained' color='primary' className={classes.submit} onClick={resetPassword}>
                Reset
              </Button>
              <p className='cursor-pointer cancel-reset-password-button' onClick={cancelResetPassword}>
                Cancel
              </p>
            </div>
          )}
        </div>
      </Grid>
    </Grid>
  );
}
