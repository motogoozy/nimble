INSERT INTO task (title, status, list_id, created_at, created_by, project_id)
VALUES (${title}, ${status}, ${list_id}, ${created_at}, ${created_by}, ${project_id})

RETURNING *;