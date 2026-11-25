This project is a technical test.

### Setup

- Start `compose.yaml` to start the database.
- Run `npm run prisma:generate` to generate Prisma classes.

### Development

- Run `npm run dev`.

Alternatively, with Docker (including Docker Compose) and npm installed, start the development environment with:

```sh
./bootstrap-start-dev.sh
```

The script starts the database, generates Prisma classes, applies migrations, imports `sample.json`, and starts the development server. Ensure Docker is running and project dependencies are installed (`npm install`) before running it.

### Production

- Copy [.env.production.sample](config/.env.production.sample) as `.env.production`.
- Run `npm run start`.

### Import JSON data

Put your data in the `sample` folder and run the app with the `--import-json` argument. For example:

```sh
npm run dev -- --import-json sample.json
```

this will load the data through the app internal service and then stop the app.


