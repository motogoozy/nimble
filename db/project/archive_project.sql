UPDATE project
SET archived = TRUE
WHERE project_id = ${project_id}
returning *;