DELETE FROM task_users
WHERE tu_id = ${tu_id}

RETURNING *;