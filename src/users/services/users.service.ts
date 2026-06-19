import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { User } from '../models';
import { PG_POOL } from 'src/database/database.module';

@Injectable()
export class UsersService {
  constructor(@Inject(PG_POOL) private pool: Pool) {}

  async findOne(name: string): Promise<User | null> {
    const { rows } = await this.pool.query(
      `SELECT * FROM users WHERE name = $1`,
      [name],
    );
    return rows[0] ?? null;
  }

  async createOne({ name, email, password }: User): Promise<User> {
    const id = randomUUID();
    await this.pool.query(
      `INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4)`,
      [id, name, email ?? null, password],
    );
    return { id, name, email, password };
  }
}
