const userController = require('./controllers/userController');
const projectController = require('./controllers/projectController');
const listController = require('./controllers/listController');
const taskController = require('./controllers/taskController');

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const massive = require('massive');

const { SERVER_PORT, CONNECTION_STRING, SECRET } = process.env;

const app = express();
app.use( express.static( `${__dirname}/../build` ) );

// MIDDLEWARE
app.use(express.json());
app.use(session({
   secret: SECRET,
   resave: false,
   saveUninitialized: false
}));

// DATABASE CONNECTION
massive(CONNECTION_STRING).then(db => {
   app.set('db', db)
		console.log(('Connected to database'))
   app.listen(SERVER_PORT, () => {
      console.log(`Listening on port: ${SERVER_PORT}`)
   })
})

// ENDPOINTS
// Project
app.get('/projects/:user_id', projectController.getProjectsByUserId) // Get all user's projects
app.get('/project/:id', projectController.getProjectById); // Get project by Id
app.post('/project', projectController.createProject);
app.put('/project/:id', projectController.updateProject) // Update Project

// User
app.post(`/user`, userController.createUser); // Add user

// List
app.get('/project/:project_id/lists', listController.getLists) // Get all project lists
app.post('/project/:project_id/list', listController.createList); // Add list
app.put('/project/:project_id/list/:list_id', listController.updateList); // Edit List
app.delete('/project/:project_id/list/:list_id', listController.deleteList); // Delete list

// Task
app.get('/project/:project_id/tasks', taskController.getTasks); // Get all project tasks
app.post('/project/:project_id/task', taskController.createTask); // Create new task
app.put('/task/:id', taskController.updateTask) // Update task