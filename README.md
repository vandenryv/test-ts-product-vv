This project is a technical test.

### Setup

- Start `compose.yaml` to start the database.
- Run `npm run prisma:generate` to generate Prisma classes.

### Development

- Run `npm run dev`.

### Production

- Copy [.env.production.sample](config/.env.production.sample) as `.env.production`.
- Run `npm run start`.

### Import JSON data

Put your data in the `sample` folder and run the app with the `--import-json` argument. For example:

```sh
npm run dev -- --import-json sample.json
```