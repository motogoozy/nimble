SELECT p.project_id, p.title, p.created_at, p.created_by, p.archived, p.list_order, pu.user_id
FROM project p
	JOIN project_users pu ON pu.project_id = p.project_id
WHERE pu.user_id = ${user_id};