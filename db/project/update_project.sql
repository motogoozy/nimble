UPDATE project
SET title = ${title}, list_order = ${list_order}
WHERE project_id = ${project_id}
returning *;