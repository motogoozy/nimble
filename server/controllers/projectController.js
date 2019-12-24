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
      }
   },
   createProject: async (req, res) => {
      const { title, created_by } = req.body;
      const created_at = new Date();
      const archived = false;
      const list_order = [];
      const db = req.app.get('db');
      try {
         let added = await db.project.add_project({
            title, list_order, created_at, created_by, archived,
         });
         res.status(200).send(added[0]);
      }
      catch (err) {
         console.log(err)
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
      }
   },
};