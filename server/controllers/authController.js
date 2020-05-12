const bcrypt = require('bcryptjs');

module.exports = {
   register: async (req, res) => {
      const { first_name, last_name, email, password, color } = req.body;
      const db = req.app.get('db');

      try {
         const existingUser = await db.auth.find_user({ email });

         if (existingUser.length >= 1) {
            res.status(400).send('A user with this email already exists. Please enter a different email.')
            return;
         }

         const salt = bcrypt.genSaltSync();
         const hash = bcrypt.hashSync(password, salt);

         const newUser = await db.auth.create_user({ first_name, last_name, email, hash, color });
         req.session.loggedInUser = newUser[0];
         res.status(200).send(newUser[0]);
      } catch (err) {
         res.status(500).send('Error creating user.');
      }
   },
   login: async (req, res) => {
      const { email, password } = req.body;
      const db = req.app.get('db');

      try {
         const user = await db.auth.find_user({ email });

         if (!user[0]) {
            res.status(404).send('Incorrect username or password. Please try again.');
            return;
         }

         const passwordMatch = bcrypt.compareSync(password, user[0].hash);
         if (!passwordMatch) {
            res.status(401).send('Incorrect username or password. Please try again.');
         } else {
            const userObj = {
               user_id: user[0].user_id,
               first_name: user[0].first_name,
               last_name: user[0].last_name,
               email: user[0].email,
               color: user[0].color,
            }
            req.session.loggedInUser = userObj;
            res.status(200).send(userObj);
         }
      } catch (err) {
         console.log(err);
         res.status(500).send('Error logging in.');
      }
   },
   logout: (req, res) => {
      try {
         req.session.destroy();
         res.status(200).send('Successfully logged out.')
      } catch (err) {
         console.log(err);
         res.status(500).send('Error logging out.');
      }
   },
   getUserSession: (req, res) => {
      if (req.session.loggedInUser) {
         res.status(200).send(req.session.loggedInUser);
      } else {
         res.status(404).send('Please log in.')
      }
   },
}