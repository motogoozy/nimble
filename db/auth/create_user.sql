INSERT INTO users (first_name, last_name, email, hash, color)
VALUES (${first_name}, ${last_name}, ${email}, ${hash}, ${color})
RETURNING user_id, first_name, last_name, email, color, most_recent_color;