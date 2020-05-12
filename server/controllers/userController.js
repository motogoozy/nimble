module.exports = {
	getUserById: async (req, res) => {
		const { user_id } = req.params;
		const db = req.app.get('db');
		try {
			let user = await db.user.get_user_by_id({ user_id });
			res.status(200).send(user[0]);
		} catch (err) {
			console.log(err);
			res.status(500).send('Unable to get user by id.');
		}
	},
	getUserByEmail: async (req, res) => {
		const { email } = req.body;
		const db = req.app.get('db');
		try {
			let foundUser = await db.user.get_user_by_email({ email });
			res.status(200).send(foundUser);
		} catch(err) {
			console.log(err);
			res.status(500).send('Unable to get user by email.');
		}
	},
}
