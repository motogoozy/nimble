INSERT INTO task_users (task_id, user_id)
VALUES (${task_id}, ${user_id})

RETURNING *;