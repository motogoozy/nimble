module.exports = {
   getAllTasks: async (req, res) => {
      const { project_id } = req.params;
      const db = req.app.get('db');
      try {
         let tasks = await db.task.get_tasks({ project_id });
         res.status(200).send(tasks);
      } catch (err) {
         console.log(err);
         res.status(500).send('Unable to get all tasks.');
      }
   },
   getTasksByUserId: async (req, res) => {
      const { user_id } = req.params;
      const db = req.app.get('db');
      try {
         let tasks = await db.task.get_tasks_by_user_id({ user_id });
         res.status(200).send(tasks);
      } catch (err) {
         console.log(err);
         res.status(500).send('Unable to get tasks.');
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
         res.status(500).send('Unable to create task.');
      }
   },
   updateTask: async (req, res) => {
      const { task_id } = req.params;
      const { title, notes, status, list_id, created_at, created_by } = req.body;
      const db = req.app.get('db');
      try {
         let updatedTask = await db.task.update_task({ task_id, title, notes, status, list_id, created_at, created_by });
         res.status(200).send(updatedTask[0]);
      } catch (err) {
         console.log(err);
         res.status(500).send('Unable to update task.');
      }
   },
   deleteTask: async (req, res) => {
      const { task_id } = req.params;
      const db = req.app.get('db');
      try {
         await db.task_users.delete_all_task_users_by_task({ task_id });
         let deletedTask = await db.task.delete_task({ task_id });
         res.status(200).send(deletedTask[0]);
      } catch (err) {
         console.log(err);
         res.status(500).send('Unable to delete task.');
      }
   },
   deleteTasksByListId: async (req, res) => {
      const { list_id } = req.params;
      const db = req.app.get('db');

      try {
         let deleted = await db.task.delete_all_tasks_by_list({ list_id });
         res.status(200).send(deleted);
      } catch (err) {
         console.log(err);
         res.status(500).send('Unable to delete tasks.');
      }
   },
   getUnassignedTasks: async (req, res) => {
      const { project_id } = req.params;
      const db = req.app.get('db');
      try {
         let allTasks = await db.task.get_tasks({ project_id });
         let taskUsers = await db.task_users.get_all_task_users({ project_id });
         let tasksWithUsers = {};
         taskUsers.forEach(taskUser => {
            tasksWithUsers[taskUser.task_id] = taskUser;
         });
         let unassignedTasks = allTasks.filter(task => {
            if (tasksWithUsers[task.task_id.toString()]) return false;
            else return true;
         });
         res.status(200).send(unassignedTasks);
      } catch (err) {
         console.log(err);
         res.status(500).send('Unable to get tasks.');
      }
   },
   getTaskUsers: async (req, res) => {
      const { project_id } = req.params;
      const db = req.app.get('db');
      try {
         let taskUsers = await db.task_users.get_all_task_users({ project_id });
         res.status(200).send(taskUsers)
      } catch (err) {
         console.log(err);
         res.status(500).send('Unable to get task users.');
      }
   },
   addTaskUser: async (req, res) => {
      const { project_id } = req.params;
      const { task_id, user_id } = req.body;
      const db = req.app.get('db');

      try {
         let added = await db.task_users.add_task_user({ task_id, user_id, project_id });
         res.status(200).send(added[0]);
      } catch (err) {
         console.log(err);
         res.status(500).send('Unable to add task user.');
      }
   },
   deleteTaskUser: async (req, res) => {
      const { tu_id } = req.params;
      const db = req.app.get('db');

      try {
         let deleted = await db.task_users.delete_task_user({ tu_id });
         res.status(200).send(deleted[0]);
      } catch (err) {
         console.log(err);
         res.status(500).send('unable to delete task user.');
      }
   },
   deleteTaskUsersByProjectAndUser: async (req, res) => {
      const { project_id, user_id } = req.params;
      const db = req.app.get('db');

      try {
         let deleted = await db.task_users.delete_all_task_users_by_project_and_user({
            project_id: project_id,
            user_id: user_id,
         });
         res.status(200).send(deleted)
      } catch (err) {
         console.log(err);
         res.status(500).send('Unable to delete task users.');
      }
   },
   deleteTaskUsersByTask: async (req, res) => {
      const { task_id } = req.params;
      const db = req.app.get('db');

      try {
         let deleted = await db.task_users.delete_all_task_users_by_task({ task_id });
         res.status(200).send(deleted[0])
      } catch (err) {
         console.log(err);
         res.status(500).send('Unable to delete task users.');
      }
   },
};