UPDATE users
SET hash = ${hash}
WHERE user_id = ${user_id}
RETURNING user_id, first_name, last_name, email, color;