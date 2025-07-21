CREATE DATABASE gwarchivist;
\c gwarchivist;

\i /docker-entrypoint-initdb.d/schema.sql; 