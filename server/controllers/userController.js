const bcrypt = require('bcryptjs');

module.exports = {
	createUser: async (req, res) => {
		const { first_name, last_name, email, password } = req.body;
		const db = req.app.get('db');
		let hash = password;
		try {
			let newUser = await db.user.create_user({ first_name, last_name, email, hash });
			res.status(200).send(newUser);
		} catch(err) {
			console.log(err);
		}
	},
}
