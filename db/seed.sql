-- Initialize db tables

CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	first_name character varying(50) NOT NULL,
	last_name character varying(50) NOT NULL,
	email character varying(50) NOT NULL,
	hash character varying(256) NOT NULL
);

CREATE TABLE project (
	id SERIAL PRIMARY KEY,
	name character varying(50) NOT NULL,
	created_at timestamp without time zone NOT NULL,
	archived boolean NOT NULL
);e

CREATE TABLE list (
	id SERIAL PRIMARY KEY,
	title character varying(50) NOT NULL,
	color_code character varying(10) NOT NULL,
	archived boolean NOT NULL,
	project_id integer NOT NULL
);

CREATE TABLE task (
	id SERIAL PRIMARY KEY,
	name character varying(50) NOT NULL,
	status character varying(50) NOT NULL,
	list_id integer NOT NULL REFERENCES list(id)
);

CREATE TABLE project_users (
	id SERIAL PRIMARY KEY,
	project_id integer NOT NULL REFERENCES project(id),
	user_id integer NOT NULL REFERENCES user(id)
);

CREATE TABLE project_lists (
	id SERIAL PRIMARY KEY,
	project_id integer NOT NULL REFERENCES project(id),
	list_id integer NOT NULL REFERENCES list(id)
);

CREATE TABLE task_users (
	id SERIAL PRIMARY KEY,
	task_id integer NOT NULL REFERENCES task(id),
	user_id integer NOT NULL REFERENCES user(id)
);

CREATE TABLE checklist_item (
	id SERIAL PRIMARY KEY,
	name character varying(50) NOT NULL,
	completed boolean NOT NULL,
	list_id integer NOT NULL REFERENCES list(id)
);