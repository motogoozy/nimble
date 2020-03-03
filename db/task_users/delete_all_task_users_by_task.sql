DELETE FROM task_users
WHERE task_id = ${task_id}

RETURNING *;