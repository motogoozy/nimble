INSERT INTO list (title, color_code, archived, project_id, task_order)
VALUES (${title}, ${color_code}, ${archived}, ${project_id}, ${task_order})

RETURNING *;