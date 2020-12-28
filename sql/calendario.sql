-- Created for Postgres
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP DATABASE IF EXISTS calendario;
CREATE DATABASE calendario WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'English_United States.1252';

\connect calendario

DROP TYPE IF EXISTS enum_events_status CASCADE;
CREATE TYPE enum_events_status AS ENUM
    ('busy', 'free');

DROP TYPE IF EXISTS enum_events_repeats CASCADE; 
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

INSERT INTO events(title, status, description, start_date, end_date, repeats) 
    VALUES ('Order takeout', 'busy', NULL, '2020-12-26 17:00:00-06', '2020-12-26 17:30:00-06', 'never'),
            ('Open presents', 'busy', NULL, '2020-12-25 00:00:00-06', '2020-12-25 00:00:00-06', 'never'),
            ('Be a bum', 'busy', NULL, '2020-12-25 00:00:00-06', '2020-12-25 00:00:00-06', 'never'),
            ('Workout', 'busy', 'This happens every weekday', NULL, NULL, 'every weekday'),
            ('Pay water bill', 'free', 'This happens every month', '2021-01-01 00:00:00-06', NULL, 'monthly'),
            ('Pay electric bill', 'free', 'This happens every month', '2021-01-01 00:00:00-06', NULL, 'monthly'),
            ('Pay cell phone bill', 'free', 'This happens every month', '2021-01-15 00:00:00-06', NULL, 'monthly'),
            ('Meet with accountant', 'free', 'This happens every month', '2021-01-15 09:00:00-06', '2021-01-15 10:00:00-06', 'monthly'),
            ('Breakfast with the fam', 'busy', 'This happens every month', '2020-12-27 09:00:00-06', '2020-12-27 11:00:00-06', 'monthly'),
            ('Go to the park', 'busy', 'This happens every weekend', NULL, NULL, 'every weekend');