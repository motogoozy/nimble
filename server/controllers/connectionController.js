module.exports = {
   getUserConnections: async (req, res) => {
      const { user_id } = req.params;
      const db = req.app.get('db');
      try {
         let connections = await db.connection.get_connections({ user_id });
         res.status(200).send(connections);
      } catch(err) {
         console.log(err);
      }
   },
   addUserConnection: async (req, res) => {
      const { user_id } = req.params;
      const { email } = req.body;
      const db = req.app.get('db');
      try {
         let foundUser = await db.user.get_user_by_email({ email });
         if (foundUser[0]) {
            let inserted = await db.connection.add_user_connection({
               send_id: user_id,
               receive_id: foundUser[0].user_id,
               status: 1
            });
            res.status(200).send(inserted[0]);
         } else {
            res.status(404).send({
               message: 'User not found. Please try a different email.'
            })
         }
      } catch (err) {
         console.log(err)
      }
   },
   acceptUserConnection: async (req, res) => {
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
               res.status(403).send({
                  message: 'You do not have permission to perform this action.'
               })
            }
         } else {
            res.status(404).send({
               message: 'Connection not found.'
            })
         }
      } catch (err) {
         console.log(err);
      }
   },
   deleteUserConnection: async (req, res) => {
      const { connection_id, user_id } = req.params;
      const db = req.app.get('db');

      try {
         let foundConnection = await db.connection.get_connection_by_id({ connection_id });
         if (foundConnection[0]) {
            if (foundConnection[0].send_id === parseInt(user_id) || foundConnection[0].receive_id === parseInt(user_id)) {
               let deleted = await db.connection.delete_user_connection({ connection_id });
               res.status(200).send(deleted[0]);
            } else {
               res.status(403).send({
                  message: 'You do not have permission to perform this action.'
               })
            }
         } else {
            res.status(404).send({
               message: 'Connection not found.'
            })
         }
      } catch (err) {
         console.log(err);
      }
   },
};