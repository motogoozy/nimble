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
require('dotenv').config();

const { PORT, DEV_PORT, DATABASE_URL, SECRET } = process.env;
const port = PORT || DEV_PORT;
const app = express();

// MIDDLEWARE
app.use(express.static( `${__dirname}/../build` ));
app.use(express.json());
app.use(session({
   secret: SECRET,
   resave: false,
   saveUninitialized: false
}));

// DATABASE CONNECTION
massive(DATABASE_URL)
   .then(db => {
      app.set('db', db)
      console.log(('Connected to database'));
      app.listen(port, () => {
         console.log(`Listening on port: ${port}`);
      })
   })
   .catch(err => console.log(err))

// ENDPOINTS
// Project
app.get('/project/:project_id', projectController.getProjectById); // Get project by Id
app.get('/project/:project_id/users', projectController.getProjectUsers) // Get all project users
app.get('/project/:project_id/permissions', projectController.getProjectPermissions) // Get Project Permissions
app.post('/project', projectController.createProject); // Create Project
app.post('/project/:project_id/user/:user_id', projectController.addProjectUser) // Add User to Project (Collaborator)
app.put('/project/:project_id', projectController.updateProject); // Update Project
app.put('/project/:project_id/permissions', projectController.updateProjectPermissions) // Update Project Permissions
app.delete('/project/:project_id/user/:user_id', projectController.deleteProjectUser) // Remove User from Project (Collaborator)

// User
app.get('/user/:user_id', userController.getUserById) // Get user by id
app.get('/find-user', userController.getUserByEmail) // Get user by email
app.get('/user/:user_id/projects', projectController.getProjectsByUserId) // Get all user's projects

// List
app.get('/project/:project_id/lists', listController.getLists); // Get all project lists
app.get('/list/:list_id', listController.getListById); // Get list by list_id
app.post('/project/:project_id/list', listController.createList); // Add list
app.put('/project/:project_id/list/:list_id', listController.updateList); // Edit List
app.delete('/project/:project_id/list/:list_id', listController.deleteList); // Delete list

// Task
app.get('/project/:project_id/tasks', taskController.getAllTasks); // Get all project tasks
app.get('/project/:project_id/tasks/:user_id', taskController.getTasksByUserId); // Get all tasks assigned to a specific user
app.get('/task_users/:project_id', taskController.getTaskUsers); // Get all task-user relationships from task_users table
app.post('/project/:project_id/task', taskController.createTask); // Create new task
app.post('/task_users/:project_id', taskController.addTaskUser) // Assign user to task
app.put('/task/:task_id', taskController.updateTask); // Update task
app.delete('/task/:task_id', taskController.deleteTask); // Delete task
app.delete('/tasks/list/:list_id', taskController.deleteTasksByListId)
app.delete('/task_users/:tu_id', taskController.deleteTaskUser) // Remove user from task
app.delete('/task_users/project/:project_id/user/:user_id', taskController.deleteTaskUsersByProjectAndUser) // Remove user from all tasks in project
app.delete('/task_users/task/:task_id', taskController.deleteTaskUsersByTask) // Delete all task_users by task_id

// Connection
app.get('/connection/user/:user_id', connectionController.getUserConnections); // Get all connections for user
app.post('/connection/user/:user_id', connectionController.addUserConnection); // Add user connection
app.put(`/connection/:connection_id`, connectionController.acceptUserConnection); // Accept user connection
app.delete('/connection/:connection_id/user/:user_id', connectionController.deleteUserConnection); // Remove, ignore, and cancel user connection,

// Auth
app.get('/auth/user_session', authController.getUserSession) // Get user session (logged in user)
app.get('/auth/logout', authController.logout) // Logout
app.post('/auth/login', authController.login); // Login
app.post('/auth/register', authController.register); // Register/Create new user

app.get('*', (req, res)=>{
   res.sendFile(path.join(__dirname, '../build/index.html'));
});
