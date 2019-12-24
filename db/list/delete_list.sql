DELETE FROM list
WHERE list_id = ${list_id}
returning *;