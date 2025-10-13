import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import 'dotenv/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../drizzle/schema';

const env = process.env.ENV!;
const host = env === 'prod' ? process.env.POSTGRES_HOST! : 'localhost';
const port = env === 'prod' ? 5432 : parseInt(process.env.POSTGRES_PORT!);

@Injectable()
export class DrizzleService implements OnModuleDestroy, OnModuleInit {
  private readonly pool: Pool;
  public db: NodePgDatabase<typeof schema>;

  constructor() {
    this.pool = new Pool({
      user: process.env.POSTGRES_USER!,
      host,
      database: process.env.POSTGRES_DB!,
      password: process.env.POSTGRES_PASSWORD!,
      port,
      ssl: false,
    });
  }

  async onModuleInit() {
    await this.pool.connect();
    this.db = drizzle(this.pool, { casing: 'snake_case' });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
