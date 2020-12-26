-- Created for Postgres
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP DATABASE IF EXISTS calendario;
CREATE DATABASE calendario WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'English_United States.1252';

\connect calendario

DROP TYPE IF EXISTS enum_events_status;
CREATE TYPE enum_events_status AS ENUM
    ('busy', 'free');

DROP TYPE IF EXISTS enum_events_repeats; 
CREATE TYPE enum_events_repeats AS ENUM
    ('never', 'daily', 'weekly', 'monthly', 'annually', 'every weekday', 'every weekend');


DROP TABLE IF EXISTS events;
CREATE TABLE events (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    title character varying(512) NOT NULL,
    status enum_events_status DEFAULT 'busy'::enum_events_status,
    description character varying(2048),
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    repeats enum_events_repeats DEFAULT 'never'::enum_events_repeats,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP INDEX IF EXISTS event_start_date;
CREATE INDEX event_start_date
    ON events USING btree
    (start_date ASC NULLS LAST)
    TABLESPACE pg_default;

INSERT INTO events(title, status, start_date, end_date, repeats) 
    VALUES ('Order takeout', 'busy', '2020-12-26 17:00:00-06', '2020-12-26 17:30:00-06', 'never'),
            ('Open presents', 'busy', '2020-12-25 00:00:00-06', '2020-12-25 00:00:00-06', 'never'),
            ('Be a bum', 'busy', '2020-12-25 00:00:00-06', '2020-12-25 00:00:00-06', 'never'),
            ('Workout', 'busy', NULL, NULL, 'every weekday');
