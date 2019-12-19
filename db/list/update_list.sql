UPDATE list
SET title = ${title}, color_code = ${color_code}, archived = ${archived}, task_order = ${task_order}
WHERE id = ${list_id}
returning *;