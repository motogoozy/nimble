import React, { useState, useContext } from 'react';
import './RegisterPage.scss';
import NimbleLogo from '../../assets/nimble-logo.png';
import { avatarColors } from '../../assets/colors';
import GlobalContext from '../../GlobalContext';

import axios from 'axios';
import Avatar from '@material-ui/core/Avatar';
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
import Swal from 'sweetalert2';

function Copyright() {
  return (
    <Typography variant='body2' color='textSecondary' align='center'>
      {'Copyright © '}
      <Link color='inherit' href='#/welcome'>
        Nimble
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
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

export default function RegisterPage(props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginErrMsg, setLoginErrMsg] = useState('');
  const { setLoggedInUser } = useContext(GlobalContext);

  const register = async () => {
    if (!firstName || !lastName || !email || !password) {
      setLoginErrMsg('*Missing required field(s).');
      return;
    }
    if (!emailIsValid(email)) {
      setLoginErrMsg('*Please enter a valid email.');
      return;
    }

    const avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length - 1)];
    const body = {
      first_name: firstName,
      last_name: lastName,
      email: email.toLowerCase(),
      password: password,
      color: avatarColor,
    };

    try {
      let res = await axios.post('/auth/register', body);
      if (res.data.user_id) {
        Swal.fire({
          type: 'success',
          title: `Welcome, ${res.data.first_name}!`,
          text: 'Account successfully created.',
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          setLoggedInUser(res.data);
          props.history.push('/');
        });
      }
    } catch (err) {
      if (err.response?.data) {
        console.log(err.response.data);
        setLoginErrMsg(err.response.data);
      } else {
        console.log('Error registering user');
      }
    }
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
      register();
    }
  };

  const classes = useStyles();

  return (
    <div className='register-page-main'>
      <div className='register-page-left'>
        <div className='register-left-grid-container'>
          <Link href='#/welcome'>
            <i className='far fa-arrow-alt-circle-left cursor-pointer'></i>
          </Link>
          <img src={NimbleLogo} alt='Nimble Logo' />
          <p>NIMBLE</p>
        </div>
        <p style={{ color: 'white', fontSize: '1.5rem', marginTop: '1rem' }}>A Simple Approach to Project Management</p>
      </div>
      <div className='register-page-right'>
        <Container component='main' maxWidth='xs'>
          <CssBaseline />
          <div className={classes.paper}>
            <Avatar className={classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component='h1' variant='h5'>
              Sign up
            </Typography>
            <form className={classes.form} noValidate onKeyPress={onKeyPress}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    autoComplete='fname'
                    name='firstName'
                    variant='outlined'
                    required
                    fullWidth
                    id='firstName'
                    placeholder='First Name'
                    autoFocus
                    onChange={event => setFirstName(event.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    variant='outlined'
                    required
                    fullWidth
                    id='lastName'
                    placeholder='Last Name'
                    name='lastName'
                    autoComplete='lname'
                    onChange={event => setLastName(event.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    variant='outlined'
                    required
                    fullWidth
                    id='email'
                    placeholder='Email Address'
                    name='email'
                    autoComplete='email'
                    onChange={event => setEmail(event.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    variant='outlined'
                    required
                    fullWidth
                    name='password'
                    placeholder='Password'
                    type='password'
                    id='password'
                    autoComplete='current-password'
                    onChange={event => setPassword(event.target.value)}
                  />
                </Grid>
                {loginErrMsg && <p style={{ color: 'crimson', marginLeft: '1rem' }}>{loginErrMsg}</p>}
                {/* <Grid item xs={12}>
                  <FormControlLabel
                    control={<Checkbox value="allowExtraEmails" color="primary" />}
                    label="I want to receive inspiration, marketing promotions and updates via email."
                  />
                </Grid> */}
              </Grid>
              <Button fullWidth variant='contained' color='primary' className={classes.submit} onClick={register}>
                Sign Up
              </Button>
              <Grid container justify='flex-end'>
                <Grid item>
                  <Link href='#/login' variant='body2'>
                    Already have an account? Sign in
                  </Link>
                </Grid>
              </Grid>
            </form>
          </div>
          <Box mt={5}>
            <Copyright />
          </Box>
        </Container>
      </div>
    </div>
  );
}
