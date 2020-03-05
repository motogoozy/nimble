DELETE FROM task
WHERE list_id = ${list_id}
RETURNING *;