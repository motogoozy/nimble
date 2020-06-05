module.exports = {
   getProjectsByUserId: async (req, res, next) => {
      const { user_id } = req.params;
      const db = req.app.get('db');
      try {
         let projects = await db.project.get_projects_by_user_id({ user_id });
         res.status(200).send(projects);
      }
      catch (err) {
         err.clientMessage = 'Unable to get user projects.';
         next(err);
      }
   },
   getProjectById: async (req, res, next) => {
      const { project_id } = req.params;
      const db = req.app.get('db');
      try {
         let project = await db.project.get_project_by_id({ project_id });
         res.status(200).send(project);
      }
      catch (err) {
         err.clientMessage = 'Unable to get project.';
         next(err);
      }
   },
   getProjectUsers: async (req, res, next) => {
      const { project_id } = req.params;
      const db = req.app.get('db');
      try {
         let users = await db.project.get_project_users({ project_id });
         res.status(200).send(users);
      } catch (err) {
         err.clientMessage = 'Unable to get project users.';
         next(err);
      }
   },
   getProjectPermissions: async (req, res, next) => {
      const { project_id } = req.params;
      const db = req.app.get('db');
      try {
         let permissions = await db.project.get_project_permissions({ project_id });
         res.status(200).send(permissions[0]);
      } catch (err) {
         err.clientMessage = 'Unable to get project permissions.';
         next(err);
      }
   },
   createProject: async (req, res, next) => {
      const { title, created_by } = req.body;
      const created_at = new Date();
      const archived = false;
      const list_order = [];
      const db = req.app.get('db');
      try {
         let added = await db.project.create_project({
            title, list_order, created_at, created_by, archived,
         });
         await db.project.add_project_permissions({ project_id: added[0].project_id});
         res.status(200).send(added[0]);
      }
      catch (err) {
         err.clientMessage = 'Unable to create project.';
         next(err);
      }
   },
   addProjectUser: async (req, res, next) => {
      const { project_id, user_id } = req.params;
      const db = req.app.get('db');
      try {
         let addedUser = await db.project.add_project_user({ project_id, user_id });
         res.status(200).send(addedUser[0]);
      } catch (err) {
         err.clientMessage = 'Error adding user to project. Please try again.';
         next(err);
      }
   },
   updateProject: async (req, res, next) => {
      const { project_id } = req.params;
      const { title, list_order } = req.body;
      const db = req.app.get('db');
      try {
         let updatedProject = await db.project.update_project({ project_id, title, list_order });
         res.status(200).send(updatedProject);
      } catch (err) {
         err.clientMessage = 'Unable to update project.';
         next(err);
      }
   },
   updateProjectPermissions: async (req, res, next) => {
      const { project_id } = req.params;
      const { permissions } = req.body;
      const db = req.app.get('db');
      try {
         let updatedPermissions = await db.project.update_project_permissions({ ...permissions, project_id });
         res.status(200).send(updatedPermissions[0]);
      } catch (err) {
         err.clientMessage = 'Unable to update project permissions.';
         next(err);
      }
   },
   deleteProjectUser: async (req, res, next) => {
      const { project_id, user_id } = req.params;
      const db = req.app.get('db');
      try {
         let deletedUser = await db.project.delete_project_user({ project_id, user_id });
         res.status(200).send(deletedUser[0]);
      } catch(err) {
         err.clientMessage = 'Could not remove user from project.';
         next(err);
      }
   },
   archiveProject: async (req, res, next) => {
      const { project_id } = req.params;
      const db = req.app.get('db');
      try {

      } catch (err) {
         
      }
   }
};