INSERT INTO project_permissions (project_id)
VALUES (${project_id})
RETURNING *;