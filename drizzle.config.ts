import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const env = process.env.ENV!;

const host = env === 'prod' ? process.env.POSTGRES_HOST! : 'localhost';
const port = env === 'prod' ? 5432 : parseInt(process.env.POSTGRES_PORT!);

const {
  POSTGRES_USER: user,
  POSTGRES_PASSWORD: password,
  POSTGRES_DB: database,
  DATABASE_URL,
} = process.env;

const url =
  DATABASE_URL ??
  `postgresql://${user}:${password}@${host}:${port}/${database}`;

export default defineConfig({
  out: './drizzle',
  schema: './src/drizzle/schema',
  dialect: 'postgresql',
  dbCredentials: {
    url,
  },
});
