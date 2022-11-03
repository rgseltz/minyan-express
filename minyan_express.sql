\echo 'Delete and recreate minaynExpress db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE minyan_express;
CREATE DATABASE minyan_express;
\connect minyan_express

\i minyan_express_schema.sql
\i minyan_express_seed.sql

\echo 'Delete and recreate minyan_express_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE minyan_express_test;
CREATE DATABASE minyan_express_test;
\connect minyan_express_test

\i minyan_express_schema.sql