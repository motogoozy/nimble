module.exports = {
   getUserConnections: async (req, res, next) => {
      const { user_id } = req.params;
      const db = req.app.get('db');
      try {
         let connections = await db.connection.get_connections({ user_id });
         res.status(200).send(connections);
      } catch(err) {
         err.clientMessage = 'Could not get user connections.';
         next(err);
      }
   },
   addUserConnection: async (req, res, next) => {
      const { user_id } = req.params;
      const { email } = req.body;
      const db = req.app.get('db');
      try {
         let foundUser = await db.user.get_user_by_email({ email });
         if (foundUser[0]) {
            let addedConnection = await db.connection.add_user_connection({
               send_id: user_id,
               receive_id: foundUser[0].user_id,
               status: 1
            });
            res.status(200).send(addedConnection[0]);
         } else {
            let err = new Error('User not found. Please try a different email.');
            err.statusCode = 404;
            next(err);
         }
      } catch (err) {
         err.clientMessage('Could not add user connection.');
         next(err);
      }
   },
   acceptUserConnection: async (req, res, next) => {
      const { connection_id } = req.params;
      const { user_id } = req.body;
      const db = req.app.get('db');

      try {
         let foundConnection = await db.connection.get_connection_by_id({ connection_id });
         if (foundConnection[0]) {
            if (foundConnection[0].receive_id === user_id) {
               let added = await db.connection.accept_user_connection({ connection_id });
               res.status(200).send(added[0]);
            } else {
               let err = new Error('You do not have permission to perform this action.');
               err.statusCode = 403;
               next(err);
            }
         } else {
            let err = new Error('Connection not found.');
            err.statusCode = 404;
            next(err);
         }
      } catch (err) {
         err.clientMessage = 'Could not accept user connection.';
         next(err);
      }
   },
   deleteUserConnection: async (req, res, next) => {
      const { connection_id, user_id } = req.params;
      const db = req.app.get('db');

      try {
         let foundConnection = await db.connection.get_connection_by_id({ connection_id });
         if (foundConnection[0]) {
            if (foundConnection[0].send_id === parseInt(user_id) || foundConnection[0].receive_id === parseInt(user_id)) {
               let deleted = await db.connection.delete_user_connection({ connection_id });
               res.status(200).send(deleted[0]);
            } else {
               let err = new Error('You do not have permission to perform this action.');
               err.statusCode = 403;
               next(err);
            }
         } else {
            let err = new Error('Connection not found.');
            err.statusCode = 404;
            next(err);
         }
      } catch (err) {
         err.clientMessage = 'Could not delete user connection';
         next(err);
      }
   },
};