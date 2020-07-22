UPDATE users
SET
	most_recent_project = ${projectId}
WHERE user_id = ${user_id}
RETURNING user_id, first_name, last_name, email, color, most_recent_project;