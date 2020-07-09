module.exports = {
  getLists: async (req, res, next) => {
    const { project_id } = req.params;
    const db = req.app.get('db');
    try {
      let lists = await db.list.get_lists({ project_id });
      res.status(200).send(lists);
    } catch (err) {
      err.clientMessage = 'Unable to get lists.';
      next(err);
    }
  },
  getListById: async (req, res, next) => {
    const { list_id } = req.params;
    const db = req.app.get('db');
    try {
      let list = await db.list.get_list_by_id({ list_id });
      res.status(200).send(list[0]);
    } catch (err) {
      err.clientMessage = 'Unable to get list.';
      next(err);
    }
  },
  createList: async (req, res, next) => {
    const { title, color_code, archived, task_order } = req.body;
    const { project_id } = req.params;
    const db = req.app.get('db');
    try {
      let newList = await db.list.create_list({
        title,
        color_code,
        archived,
        project_id,
        task_order,
      });
      res.status(200).send(newList);
    } catch (err) {
      err.clientMessage = 'Could not create list.';
      next(err);
    }
  },
  updateList: async (req, res, next) => {
    const { list_id } = req.params;
    const { title, color_code, archived, task_order } = req.body;
    const db = req.app.get('db');
    try {
      let updatedList = await db.list.update_list({
        list_id: list_id,
        title: title,
        color_code: color_code,
        archived: archived,
        task_order: task_order,
      });
      res.status(200).send(updatedList);
    } catch (err) {
      err.clientMessage = 'Could not update list.';
      next(err);
    }
  },
  deleteList: async (req, res, next) => {
    const { list_id } = req.params;
    const db = req.app.get('db');
    try {
      let deletedList = await db.list.delete_list({ list_id });
      res.status(200).send(deletedList);
    } catch (err) {
      err.clientMessage = 'Could not delete list.';
      next(err);
    }
  },
};
