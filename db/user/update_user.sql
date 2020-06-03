UPDATE users
SET
   first_name = ${first_name},
   last_name = ${last_name},
   email = ${email},
   color = ${color}
WHERE user_id = ${user_id}
RETURNING user_id, first_name, last_name, email, color;