CREATE TABLE todos (
	id          SERIAL,
	description TEXT NOT NULL,
	complete    BOOL NOT NULL DEFAULT FALSE,
	created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
