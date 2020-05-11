UPDATE project_permissions
SET 
	add_tasks = ${add_tasks},
	edit_tasks = ${edit_tasks},
	delete_tasks = ${delete_tasks},
	add_lists = ${add_lists},
	edit_lists = ${edit_lists},
	delete_lists = ${delete_lists},
	edit_project = ${edit_project},
	add_collaborators = ${add_collaborators},
	remove_collaborators = ${remove_collaborators}
WHERE project_id = ${project_id}
RETURNING *;