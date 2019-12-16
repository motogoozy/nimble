const userController = require('./controllers/userController');
const listController = require('./controllers/listController');

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
// User
app.post(`/user`, userController.createUser); // Add user

// List
app.get('/project/:project_id/lists', listController.getLists) // Get all project lists
app.post('/project/:project_id/list', listController.createList); // Add list