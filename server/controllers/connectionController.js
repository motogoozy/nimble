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
   addConnection: async (req, res) => {
      const { user_id } = req.params;
      const { email } = req.body;
      const db = req.app.get('db');
      try {
         let foundUser = await db.user.get_user_by_email({ email });
         if (foundUser[0]) {
            let inserted = await db.connection.add_connection({
               send_id: user_id,
               receive_id: foundUser[0].user_id,
               status: 1
            });
            res.status(200).send(inserted);
         } else {
            res.status(404).send('User not found. Please try a different email.')
         }
      } catch (err) {
         console.log(err)
      }
   },
};