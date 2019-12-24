SELECT t.task_id, t.title, t.list_id, t.project_id, t.created_at, t.created_by, t.status, u.user_id
FROM task t
	JOIN task_users tu ON tu.task_id = t.task_id
	JOIN users u ON u.user_id = tu.user_id
WHERE u.user_id = ${user_id};