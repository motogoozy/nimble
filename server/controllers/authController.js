const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const metrics = {
   totalLogins: 0,
   userActivity: {}
};

module.exports = {
   register: async (req, res, next) => {
      const { first_name, last_name, email, password, color } = req.body;
      const db = req.app.get('db');

      try {
         const existingUser = await db.auth.find_user_by_email({ email });

         if (existingUser.length >= 1) {
            let err = new Error('A user with this email already exists. Please enter a different email.');
            err.statusCode = 403;
            return next(err);
         }

         const salt = bcrypt.genSaltSync();
         const hash = bcrypt.hashSync(password, salt);

         const newUser = await db.auth.create_user({ first_name, last_name, email, hash, color });
         req.session.loggedInUser = newUser[0];
         req.session.cookie.maxAge = 1000 * 60 * 30;
         res.status(200).send(newUser[0]);

         // Logging traffic
         metrics.totalLogins++;
         metrics.userActivity[newUser[0].user_id] = {
            name: `${newUser[0].first_name} ${newUser[0].last_name}` || 'Unknown',
            email: newUser[0].email || 'Unknown',
            logins: 1,
         };
         res.locals.metrics = metrics;
         next();
      } catch (err) {
         err.clientMessage = 'Error creating user.';
         next(err)
      }
   },
   login: async (req, res, next) => {
      const { email, password } = req.body;
      const db = req.app.get('db');

      try {
         const user = await db.auth.find_user_by_email({ email });

         if (!user[0]) {
            let err = new Error('Incorrect username or password. Please try again.');
            err.statusCode = 404;
            return next(err);
         }

         const passwordMatch = bcrypt.compareSync(password, user[0].hash);
         if (!passwordMatch) {
            let err = new Error('Incorrect username or password. Please try again.');
            err.statusCode = 401;
            next(err);
         } else {
            const userObj = {
               user_id: user[0].user_id,
               first_name: user[0].first_name,
               last_name: user[0].last_name,
               email: user[0].email,
               color: user[0].color,
            }
            req.session.loggedInUser = userObj;
            req.session.cookie.maxAge = 1000 * 60 * 30;
            res.status(200).send(userObj);

            // Logging traffic
            metrics.totalLogins++;
            metrics.userActivity[userObj.user_id] = metrics.userActivity[userObj.user_id] || {
               name: `${userObj.first_name} ${userObj.last_name}` || 'Unknown',
               email: userObj.email || 'Unknown',
               logins: 0,
            }
            metrics.userActivity[userObj.user_id].logins++;
            res.locals.metrics = metrics;
            next();
         }
      } catch (err) {
         err.clientMessage = 'Error logging in.';
         next(err);
      }
   },
   logout: (req, res, next) => {
      try {
         req.session.destroy();
         res.status(200).send('Successfully logged out.');
      } catch (err) {
         err.clientMessage('Error logging out.');
         next(err);
      }
   },
   getUserSession: (req, res, next) => {
      if (req.session.loggedInUser) {
         res.status(200).send(req.session.loggedInUser);
      } else {
         let err = new Error('Please log in.');
         err.statusCode = 401;
         next(err);
      }
   },
   updateUserPassword: async (req, res, next) => {
      const { user_id } = req.params;
      const { oldPassword, newPassword } = req.body;
      const db = req.app.get('db');

      try {
         const user = await db.auth.find_user_by_id({ user_id });

         if (!user[0]) {
            let err = new Error('User not found.');
            err.statusCode = 404;
            return next(err);
         }

         const passwordMatch = bcrypt.compareSync(oldPassword, user[0].hash);
         if (!passwordMatch) {
            let err = new Error('Incorrect password. Please try again.');
            err.statusCode = 400;
            next(err);
         } else {
            const salt = bcrypt.genSaltSync();
            const hash = bcrypt.hashSync(newPassword, salt);
            await db.auth.update_user_password({ user_id, hash });
            res.status(200).send('Password successfully updated.');
         }
      } catch (err) {
         err.clientMessage = 'Unable to change password.';
         next(err);
      }
   },
   resetUserPassword: async (req, res, next) => {
      const { email } = req.body;
      const db = req.app.get('db');
      const { NODEMAILER_HOST, NODEMAILER_USER, NODEMAILER_PASSWORD } = process.env;
      
      try {
         const user = await db.auth.find_user_by_email({ email });
         if (user[0]) {
            let randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            const salt = bcrypt.genSaltSync();
            const hash = bcrypt.hashSync(randomString, salt);
            
            // Send Recovery Email
            const transporter = await nodemailer.createTransport({
               host: `${NODEMAILER_HOST}`,
               secure: false,
               port: 587, // default port for insecure
               auth: {
                  user: `${NODEMAILER_USER}`,
                  pass: `${NODEMAILER_PASSWORD}`
               }
            });

            await transporter.sendMail({
               from: '"Nimble Support" <kspayne93@outlook.com',
               to: email,
               subject: 'Nimble Password Reset',
               html: `
                  <p>${user[0].first_name},</p>
                  <div>
                     <p>
                        Here is your temporary password:
                        <b>${randomString}</b>
                     </p>
                     <br/>
                     <p>Use it to login to your account and update your password.</p>
                  </div>
               `
            });
            
            await db.auth.update_user_password({
               user_id: user[0].user_id,
               hash: hash
            });
         }
         res.status(200).send();
      } catch (err) {
         err.clientMessage = 'Unable to reset password.';
         next(err);
      }
   }
}