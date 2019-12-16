module.exports = {
   createList: async (req, res) => {
      const { title, color_code, archived } = req.body;
      const { project_id } = req.params;
		const db = req.app.get('db');
		try {
			let newList = await db.list.create_list({ title, color_code, archived, project_id });
			res.status(200).send(newList);
		} catch(err) {
			console.log(err);
		}
   },
   getLists: async (req, res) => {
      const { project_id } = req.params;
      const db = req.app.get('db');
      try {
         let lists = await db.list.get_lists({ project_id });
         res.status(200).send(lists);
      } catch(err) {
         console.log(err);
      }
   }
};