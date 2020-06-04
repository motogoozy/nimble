module.exports = {
   getAllTasks: async (req, res, next) => {
      const { project_id } = req.params;
      const db = req.app.get('db');
      try {
         let tasks = await db.task.get_tasks({ project_id });
         res.status(200).send(tasks);
      } catch (err) {
         err.clientMessage = 'Unable to get all tasks.';
         next(err);
      }
   },
   getTasksByUserId: async (req, res, next) => {
      const { user_id } = req.params;
      const db = req.app.get('db');
      try {
         let tasks = await db.task.get_tasks_by_user_id({ user_id });
         res.status(200).send(tasks);
      } catch (err) {
         err.clientMessage = 'Unable to get tasks.';
         next(err);
      }
   },
   createTask: async (req, res, next) => {
      const { project_id } = req.params;
      const { title, created_by, list_id } = req.body;
      let status = null;
      const created_at = new Date();
      const db = req.app.get('db');
      try {
         let added = await db.task.create_task({ project_id, title, status, created_by, created_at, list_id });
         res.status(200).send(added[0]);
      } catch (err) {
         err.clientMessage = 'Unable to create task.';
         next(err);
      }
   },
   updateTask: async (req, res, next) => {
      const { task_id } = req.params;
      const { title, notes, status, list_id, created_at, created_by } = req.body;
      const db = req.app.get('db');
      try {
         let updatedTask = await db.task.update_task({ task_id, title, notes, status, list_id, created_at, created_by });
         res.status(200).send(updatedTask[0]);
      } catch (err) {
         err.clientMessage = 'Unable to update task.';
         next(err);
      }
   },
   deleteTask: async (req, res, next) => {
      const { task_id } = req.params;
      const db = req.app.get('db');
      try {
         let deletedTask = await db.task.delete_task({ task_id });
         res.status(200).send(deletedTask[0]);
      } catch (err) {
         err.clientMessage = 'Unable to delete task.';
         next(err);
      }
   },
   deleteTasksByListId: async (req, res, next) => {
      const { list_id } = req.params;
      const db = req.app.get('db');

      try {
         let deleted = await db.task.delete_all_tasks_by_list({ list_id });
         res.status(200).send(deleted);
      } catch (err) {
         err.clientMessage = 'Unable to delete tasks.';
         next(err);
      }
   },
   getUnassignedTasks: async (req, res, next) => {
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
         err.clientMessage = 'Unable to get tasks.';
         next(err);
      }
   },
   getTaskUsers: async (req, res, next) => {
      const { project_id } = req.params;
      const db = req.app.get('db');
      try {
         let taskUsers = await db.task_users.get_all_task_users({ project_id });
         res.status(200).send(taskUsers)
      } catch (err) {
         err.clientMessage = 'Unable to get task users.';
         next(err);
      }
   },
   addTaskUser: async (req, res, next) => {
      const { project_id } = req.params;
      const { task_id, user_id } = req.body;
      const db = req.app.get('db');

      try {
         let added = await db.task_users.add_task_user({ task_id, user_id, project_id });
         res.status(200).send(added[0]);
      } catch (err) {
         err.clientMessage = 'Unable to add task user.';
         next(err);
      }
   },
   deleteTaskUser: async (req, res, next) => {
      const { tu_id } = req.params;
      const db = req.app.get('db');

      try {
         let deleted = await db.task_users.delete_task_user({ tu_id });
         res.status(200).send(deleted[0]);
      } catch (err) {
         err.clientMessage = 'Unable to delete task user.';
         next(err);
      }
   },
   deleteTaskUsersByProjectAndUser: async (req, res, next) => {
      const { project_id, user_id } = req.params;
      const db = req.app.get('db');

      try {
         let deleted = await db.task_users.delete_all_task_users_by_project_and_user({
            project_id: project_id,
            user_id: user_id,
         });
         res.status(200).send(deleted)
      } catch (err) {
         err.clientMessage = 'Unable to delete task users.';
         next(err);
      }
   },
   deleteTaskUsersByTask: async (req, res, next) => {
      const { task_id } = req.params;
      const db = req.app.get('db');

      try {
         let deleted = await db.task_users.delete_all_task_users_by_task({ task_id });
         res.status(200).send(deleted[0])
      } catch (err) {
         err.clientMessage = 'Unable to delete task users.';
         next(err);
      }
   },
};