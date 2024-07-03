@echo off
REM Set the PostgreSQL password as an environment variable
set PGPASSWORD=mysql

REM Connect to PostgreSQL and execute schema.sql
psql -U postgres -f schema.sql

REM Clear the PostgreSQL password environment variable for security reasons
set PGPASSWORD=

REM Execute the Node.js application
node index.js

pause