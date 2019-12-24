SELECT title
FROM task t
	JOIN task_users tu ON tu.task_id = t.task_id
	JOIN users u ON u.user_id = tu.user_id
WHERE u.user_id = ${user_id};