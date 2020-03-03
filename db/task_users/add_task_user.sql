INSERT INTO task_users (task_id, user_id, project_id)
VALUES (${task_id}, ${user_id}, ${project_id})

RETURNING *;