SELECT u.user_id, u.first_name, u.last_name, u.email, u.color
FROM users u
INNER JOIN project_users pu ON pu.user_id = u.user_id
WHERE pu.project_id = ${project_id};