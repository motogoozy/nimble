module.exports = {
   getTasks: async (req, res) => {
      const { project_id } = req.params;
      const db = req.app.get('db');
      try {
         let tasks = await db.task.get_tasks({ project_id });
         res.status(200).send(tasks);
      } catch (err) {
         console.log(err);
      }
   },
   createTask: async (req, res) => {
      const { project_id } = req.params;
      const { title, created_by, list_id } = req.body;
      let status = null;
      const created_at = new Date();
      const db = req.app.get('db');
      try {
         let added = await db.task.create_task({ project_id, title, status, created_by, created_at, list_id });
         res.status(200).send(added[0]);
      } catch (err) {
         console.log(err);
      }
   },
   updateTask: async (req, res) => {
      const { id } = req.params;
      const { title, status, list_id, created_at, created_by } = req.body;
      const db = req.app.get('db');
      try {
         let updatedTask = await db.task.update_task({ id, title, status, list_id, created_at, created_by });
         res.status(200).send(updatedTask[0]);
      } catch (err) {
         console.log(err)
      }
   },
};