INSERT INTO connection (send_id, receive_id, status)
VALUES (${send_id}, ${receive_id}, ${status})
RETURNING *;