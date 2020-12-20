# Calendario (server)

The backend for the Calendario web application.

## Getting Started

[PostgreSQL](https://www.postgresql.org/) is used for the database. Follow the link to install and set up a local instance.

Next, create a `.env` file at the root of the application. In the `.env` file add the following:

`POSTGRES_URL=postgres://dev:password_123@localhost:5432/calendario`

Replace `dev` and `password_123` with your username and password for Postgres. 
Once you have finished setting up the database, you are ready to run the application.

In a terminal, navigate to the root of the application and run `npm start`. Alternatively, you can run `node server.js` -- whichever you prefer.
