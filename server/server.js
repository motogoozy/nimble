const userController = require('./controllers/userController');
const projectController = require('./controllers/projectController');
const listController = require('./controllers/listController');
const taskController = require('./controllers/taskController');
const connectionController = require('./controllers/connectionController');
const authController = require('./controllers/authController');

const express = require('express');
const massive = require('massive');
const session = require('express-session');
const path = require('path');
const winston = require('winston');
const { format, transports } = winston;
require('dotenv').config();

const app = express();
const { PORT, DEV_PORT, DATABASE_URL, SESSION_SECRET } = process.env;
const port = PORT || DEV_PORT;

// MIDDLEWARE
app.use(express.static(`${__dirname}/../build`));
app.use(express.json());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 }, // 30 days
    rolling: true,
  })
);
app.use((req, res, next) => {
  // authentication before every request
  if (
    req.url !== '/api/auth/login' &&
    req.url !== '/api/auth/register' &&
    req.url !== '/api/auth/logout' &&
    req.url !== '/api/auth/reset_password' &&
    !req.session.loggedInUser
  ) {
    res.status(401).send('Please log in.');
  } else {
    next();
  }
});

// DATABASE CONNECTION / START SERVER
massive(DATABASE_URL)
  .then(db => {
    app.set('db', db);
    console.log('Connected to database');
    app.listen(port, () => {
      console.log(`Listening on port: ${port}`);
      logger.log({
        level: 'activity',
        message: 'Server Restarted',
      });
    });
  })
  .catch(err => console.log(`Error connecting to database: ${err}`));

// LOGGER
const logger = winston.createLogger({
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  levels: {
    error: 0,
    activity: 1,
  },
  transports: [
    new transports.File({ filename: path.join(__dirname, '../error.log'), level: 'error' }),
    new transports.File({ filename: path.join(__dirname, '../activity.log'), level: 'activity' }),
  ],
});

// If we're not in production then log to the `console` with the format:`${info.level}: ${info.message} JSON.stringify({ ...rest )
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(format.colorize(), format.simple()),
    })
  );
}

// ENDPOINTS
// Project
app.get('/api/project/:project_id', projectController.getProjectById); // Get project by Id
app.get('/api/project/:project_id/users', projectController.getProjectUsers); // Get all project users
app.get('/api/project/:project_id/permissions', projectController.getProjectPermissions); // Get Project Permissions
app.post('/api/project', projectController.createProject); // Create Project
app.post('/api/project/:project_id/user/:user_id', projectController.addProjectUser); // Add User to Project (Collaborator)
app.put('/api/project/archive/:project_id', projectController.archiveProject); // Archive project
app.put('/api/project/:project_id', projectController.updateProject); // Update Project
app.put('/api/project/:project_id/permissions', projectController.updateProjectPermissions); // Update Project Permissions
app.delete('/api/project/:project_id/user/:user_id', projectController.deleteProjectUser); // Remove User from Project (Collaborator)

// User
app.get('/api/user/:user_id', userController.getUserById); // Get user by id
app.get('/api/find-user', userController.getUserByEmail); // Get user by email
app.get('/api/user/:user_id/projects', projectController.getProjectsByUserId); // Get all user's projects
app.put('/api/user/:user_id', userController.updateUserDetails); // Edit User
app.put('/api/user/:user_id/recent_project', userController.updateMostRecentProject); // Update most recently viewed project

// List
app.get('/api/project/:project_id/lists', listController.getLists); // Get all project lists
app.get('/api/list/:list_id', listController.getListById); // Get list by list_id
app.post('/api/project/:project_id/list', listController.createList); // Add list
app.put('/api/project/:project_id/list/:list_id', listController.updateList); // Edit List
app.delete('/api/project/:project_id/list/:list_id', listController.deleteList); // Delete list

// Task
app.get('/api/project/:project_id/tasks', taskController.getAllTasks); // Get all project tasks
app.get('/api/project/:project_id/tasks/:user_id', taskController.getTasksByUserId); // Get all tasks assigned to a specific user
app.get('/api/task_users/:project_id', taskController.getTaskUsers); // Get all task-user relationships from task_users table
app.post('/api/project/:project_id/task', taskController.createTask); // Create new task
app.post('/api/task_users/:project_id', taskController.addTaskUser); // Assign user to task
app.put('/api/task/:task_id', taskController.updateTask); // Update task
app.delete('/api/task/:task_id', taskController.deleteTask); // Delete task
app.delete('/api/tasks/list/:list_id', taskController.deleteTasksByListId);
app.delete('/api/task_users/:tu_id', taskController.deleteTaskUser); // Remove user from task
app.delete('/api/task_users/project/:project_id/user/:user_id', taskController.deleteTaskUsersByProjectAndUser); // Remove user from all tasks in project
app.delete('/api/task_users/task/:task_id', taskController.deleteTaskUsersByTask); // Delete all task_users by task_id

// Connection
app.get('/api/connection/user/:user_id', connectionController.getUserConnections); // Get all connections for user
app.post('/api/connection/user/:user_id', connectionController.addUserConnection); // Add user connection
app.put(`/api/connection/:connection_id`, connectionController.acceptUserConnection); // Accept user connection
app.delete('/api/connection/:connection_id/user/:user_id', connectionController.deleteUserConnection); // Remove, ignore, and cancel user connection,

// Auth
app.get('/api/auth/user_session', authController.getUserSession); // Get user session (logged in user)
app.get('/api/auth/logout', authController.logout); // Logout
app.post('/api/auth/login', authController.login, (req, res, next) => {
  logger.log({
    level: 'activity',
    message: 'New Login',
    user: res.locals.user || 'Unavailable',
  });
  next();
}); // Login
app.post('/api/auth/register', authController.register, (req, res, next) => {
  logger.log({
    level: 'activity',
    message: 'New Login',
    user: res.locals.user || 'Unavailable',
  });
  next();
}); // Register/Create new user
app.put('/api/auth/change_password/:user_id', authController.updateUserPassword); // Change user's password
app.put('/api/auth/reset_password', authController.resetUserPassword); // Reset user password

// Error Handler
app.use((err, req, res, next) => {
  if (!err) {
    next();
  } else {
    let statusCode = err.statusCode || 500;
    let clientMessage = err.clientMessage || err.message || 'Internal Server Error.';

    if (statusCode === 500) {
      logger.log({
        level: 'error',
        clientMessage: clientMessage,
        message: err.message || 'Unknown',
        endpoint: req.path || 'Unknown',
        user: req.session.loggedInUser || 'Unknown',
        stack: err.stack || 'Unavailable',
      });
    }
    res.status(statusCode).send(clientMessage);
  }
});

// Return main app file for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});
