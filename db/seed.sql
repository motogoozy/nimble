-- Initialize db tables

CREATE TABLE users (
	user_id SERIAL PRIMARY KEY,
	first_name character varying(50) NOT NULL,
	last_name character varying(50) NOT NULL,
	email character varying(50) NOT NULL,
	hash character varying(256) NOT NULL,
	color integer[]
);

CREATE TABLE project (
	project_id SERIAL PRIMARY KEY,
	title character varying(50) NOT NULL,
	list_order text[] NOT NULL,
	created_at timestamp without time zone NOT NULL,
	created_by integer NOT NULL REFERENCES users(id),
	archived boolean NOT NULL
);

CREATE TABLE list (
	list_id SERIAL PRIMARY KEY,
	title character varying(50) NOT NULL,
	color_code integer[] NOT NULL,
	archived boolean NOT NULL,
	project_id integer NOT NULL,
	task_order integer[] NOT NULL
);

CREATE TABLE task (
	task_id SERIAL PRIMARY KEY,
	title character varying(60) NOT NULL,
	status character varying(50) NOT NULL,
	list_id integer NOT NULL REFERENCES list(id),
	project_id integer NOT NULL REFERENCES project(id),
	created_at timestamp without time zone,
	created_by integer NOT NULL REFERENCES users(id),
	notes character varying(250)
);

CREATE TABLE project_users (
	id SERIAL PRIMARY KEY,
	project_id integer NOT NULL REFERENCES project(id),
	user_id integer NOT NULL REFERENCES users(id)
);

CREATE TABLE project_lists (
	id SERIAL PRIMARY KEY,
	project_id integer NOT NULL REFERENCES project(id),
	list_id integer NOT NULL REFERENCES list(id)
);

CREATE TABLE task_users (
	tu_id SERIAL PRIMARY KEY,
	task_id integer NOT NULL REFERENCES task(id),
	user_id integer NOT NULL REFERENCES users(id)
);

CREATE TABLE checklist_item (
	id SERIAL PRIMARY KEY,
	title character varying(50) NOT NULL,
	completed boolean NOT NULL,
	list_id integer NOT NULL REFERENCES list(id)
);

CREATE TABLE connection (
	connection_id SERIAL PRIMARY KEY,
	send_id integer NOT NULL REFERENCES users(user_id),
	receive_id integer NOT NULL REFERENCES users(user_id),
	status integer NOT NULL
);