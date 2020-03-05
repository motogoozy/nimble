DELETE FROM connection
WHERE connection_id = ${connection_id}
RETURNING *;