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
      const { id } = req.params;
      const db = req.app.get('db');
      try {
         let project = await db.project.get_project_by_id({ id });
         res.status(200).send(project);
      }
      catch (err) {
         console.log(err);
      }
   },
   addProject: async (req, res) => {
      const { title, created_by } = req.body;
      const created_at = new Date();
      const archived = false;
      const column_order = [];
      const db = req.app.get('db');
      try {
         let added = await db.project.add_project({
            title, column_order, created_at, created_by, archived,
         });
         res.status(200).send(added[0]);
      }
      catch (err) {
         console.log(err)
      }
   },
   updateProject: async (req, res) => {
      const { id } = req.params;
      const { title, column_order } = req.body;
      const db = req.app.get('db');
      try {
         let updatedProject = await db.project.update_project({ id, title, column_order });
         res.status(200).send(updatedProject);
      } catch (err) {
         console.log(err);
      }
   },
};