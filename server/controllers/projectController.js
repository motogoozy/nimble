module.exports = {
   getProjectsByUserId: async (req, res) => {
      const { user_id } = req.params;
      const db = req.app.get('db');
      try {
         let projects = await db.project.get_projects_by_user_id({ user_id });
         res.status(200).send(projects);
      }
      catch (err) {
         console.log(err);
         res.status(500).send({ message: 'Unable to get projects by user id.'});
      }
   },
   getProjectById: async (req, res) => {
      const { project_id } = req.params;
      const db = req.app.get('db');
      try {
         let project = await db.project.get_project_by_id({ project_id });
         res.status(200).send(project);
      }
      catch (err) {
         console.log(err);
         res.status(500).send({ message: 'Unable to get project by id.'});
      }
   },
   getProjectUsers: async (req, res) => {
      const { project_id } = req.params;
      const db = req.app.get('db');
      try {
         let users = await db.project.get_project_users({ project_id });
         res.status(200).send(users);
      } catch (err) {
         console.log(err);
         res.status(500).send({ message: 'Unable to get project users.'});
      }
   },
   getProjectPermissions: async (req, res) => {
      const { project_id } = req.params;
      const db = req.app.get('db');
      try {
         let permissions = await db.project.get_project_permissions({ project_id });
         res.status(200).send(permissions[0]);
      } catch (err) {
         console.log(err);
         res.status(500).send({ message: 'Unable to get project permissions.'});
      }
   },
   createProject: async (req, res) => {
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
         console.log(err);
         res.status(500).send({ message: 'Unable to create project.'});
      }
   },
   addProjectUser: async (req, res) => {
      const { project_id, user_id } = req.params;
      const db = req.app.get('db');
      try {
         let addedUser = await db.project.add_project_user({ project_id, user_id });
         res.status(200).send(addedUser[0]);
      } catch (err) {
         console.log(err);
         res.status(400).send({ message: 'Error adding user to project. Please try again.' });
      }
   },
   updateProject: async (req, res) => {
      const { project_id } = req.params;
      const { title, list_order } = req.body;
      const db = req.app.get('db');
      try {
         let updatedProject = await db.project.update_project({ project_id, title, list_order });
         res.status(200).send(updatedProject);
      } catch (err) {
         console.log(err);
         res.status(500).send({ message: 'Unable to update project.' });
      }
   },
   updateProjectPermissions: async (req, res) => {
      const { project_id } = req.params;
      const { permissions } = req.body;
      const db = req.app.get('db');
      try {
         let updatedPermissions = await db.project.update_project_permissions({ ...permissions, project_id });
         res.status(200).send(updatedPermissions[0]);
      } catch (err) {
         console.log(err);
         res.status(500).send({ message: 'Unable to update project permissions.' });
      }
   },
   deleteProjectUser: async (req, res) => {
      const { project_id, user_id } = req.params;
      const db = req.app.get('db');
      try {
         let deletedUser = await db.project.delete_project_user({ project_id, user_id });
         res.status(200).send(deletedUser[0]);
      } catch(err) {
         console.log(err);
         res.status(500).send({
            message: 'Could not remove user from project.'
         })
      }
   },
};