SELECT * FROM connection
WHERE send_id = ${user_id}
OR receive_id = ${user_id};