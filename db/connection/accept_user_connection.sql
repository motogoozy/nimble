UPDATE connection
SET status = 2
WHERE connection_id = ${connection_id}
RETURNING *;