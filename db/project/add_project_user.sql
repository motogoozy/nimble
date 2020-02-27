INSERT INTO project_users (project_id, user_id)
VALUES (${project_id}, ${user_id})
RETURNING *;