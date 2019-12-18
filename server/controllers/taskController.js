module.exports = {
   getTasks: async (req, res) => {
      const { project_id } = req.params;
      const db = req.app.get('db');
      try {
         let tasks = await db.task.get_tasks({ project_id });
         res.status(200).send(tasks);
      } catch(err) {
         console.log(err);
      }
   },
};