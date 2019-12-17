INSERT INTO project (title, column_order, created_at, created_by, archived)
VALUES (${title}, ${column_order}, ${created_at}, ${created_by}, ${archived})

RETURNING *;