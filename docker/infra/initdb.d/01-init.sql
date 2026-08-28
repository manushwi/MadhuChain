-- Enable TimescaleDB extension on the target database.
-- The hypertable for sensor readings is created via Prisma migrations
-- (the extension must be installed before CREATE EXTENSION runs).
CREATE EXTENSION IF NOT EXISTS timescaledb;
