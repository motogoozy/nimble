UPDATE project
SET title = ${title}, column_order = ${column_order}
WHERE id = ${id}
returning *;