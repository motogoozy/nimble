UPDATE list
SET title = ${title}, color_code = ${color_code}, archived = ${archived}
WHERE id = ${list_id}
returning *;