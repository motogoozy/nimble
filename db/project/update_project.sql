UPDATE project
SET title = ${title}, list_order = ${list_order}
WHERE id = ${id}
returning *;