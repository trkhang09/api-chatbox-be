DO
$$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'chatboxdb') THEN
      PERFORM dblink_exec('dbname=postgres', 'CREATE DATABASE chatboxdb');
   END IF;
END
$$;

CREATE EXTENSION IF NOT EXISTS vector;