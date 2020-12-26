# Calendario (server)

The backend for the Calendario web application.

## Getting Started

### Installing Postgres
[PostgreSQL](https://www.postgresql.org/) is used for the database. Follow the link to install and set up a local instance.

Open a terminal then copy and paste the following to create and seed the database:
`psql -f <path_to_project>/sql/calendario.sql -d calendario -U dev`

Make sure to replace `dev` with your user for Postgres.

### Installing the required dependencies
Navigate to the root of the project and run `npm install`

### Running the application
Next, create a `.env` file at the root of the application. In the `.env` file add the following:

`POSTGRES_URL=postgres://dev:password_123@localhost:5432/calendario`

Replace `dev` and `password_123` with your username and password for Postgres. 
Once you have finished setting up the database, you are ready to run the application.

In a terminal, navigate to the root of the application and run `npm start`. Alternatively, you can run `node server.js` -- whichever you prefer.
