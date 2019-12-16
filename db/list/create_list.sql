INSERT INTO list (title, color_code, archived, project_id)
VALUES (${title}, ${color_code}, ${archived}, ${project_id})

RETURNING *;