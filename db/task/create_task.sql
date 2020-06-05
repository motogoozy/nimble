INSERT INTO task (title, status, list_id, created_at, created_by, project_id, notes)
VALUES (${title}, ${status}, ${list_id}, ${created_at}, ${created_by}, ${project_id}, ${notes})

RETURNING *;