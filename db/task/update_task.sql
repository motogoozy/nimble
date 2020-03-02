UPDATE task
SET title = ${title}, notes = ${notes}, status = ${status}, list_id = ${list_id}, created_at = ${created_at}, created_by = ${created_by}
WHERE task_id = ${task_id}

returning *;