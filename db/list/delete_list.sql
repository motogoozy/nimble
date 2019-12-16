DELETE FROM list
WHERE id = ${list_id}
returning *;