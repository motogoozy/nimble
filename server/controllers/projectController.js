module.exports = {
   getProject: async (req, res) => {
      const { id } = req.params;
      const db = req.app.get('db');
      try {
         let project = await db.project.get_project({ id });
         res.status(200).send(project);
      } catch(err) {
         console.log(err);
      }
   },
   updateProject: async (req, res) => {
      const { id } = req.params;
      const { title, column_order } = req.body;
      const db = req.app.get('db');
      try {
         let updatedProject = await db.project.update_project({ id, title, column_order });
         res.status(200).send(updatedProject);
      } catch(err) {
         console.log(err);
      }
   },
};