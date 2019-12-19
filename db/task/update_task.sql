UPDATE task
SET title = ${title}, status = ${status}, list_id = ${list_id}, created_at = ${created_at}, created_by = ${created_by}, project_id = ${project_id}
WHERE id = ${id}

returning *;