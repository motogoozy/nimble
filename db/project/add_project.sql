INSERT INTO project (title, list_order, created_at, created_by, archived)
VALUES (${title}, ${list_order}, ${created_at}, ${created_by}, ${archived})

RETURNING *;