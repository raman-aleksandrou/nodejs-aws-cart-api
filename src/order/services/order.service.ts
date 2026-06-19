import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { Order } from '../models';
import { CreateOrderPayload } from '../type';
import { PG_POOL } from 'src/database/database.module';

@Injectable()
export class OrderService {
  constructor(@Inject(PG_POOL) private pool: Pool) {}

  async getAll(): Promise<Order[]> {
    const { rows } = await this.pool.query(`SELECT * FROM orders`);
    return rows.map(this.mapRow);
  }

  async findById(orderId: string): Promise<Order> {
    const { rows } = await this.pool.query(
      `SELECT * FROM orders WHERE id = $1`,
      [orderId],
    );
    return rows[0] ? this.mapRow(rows[0]) : null;
  }

  async create(data: CreateOrderPayload): Promise<Order> {
    const id = randomUUID();
    const { userId, cartId, address, total } = data;

    await this.pool.query(
      `INSERT INTO orders (id, user_id, cart_id, payment, delivery, comments, total, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::order_status)`,
      [id, userId, cartId, null, JSON.stringify(address), null, total, 'OPEN'],
    );

    return this.findById(id);
  }

  async update(orderId: string, data: Order): Promise<void> {
    const order = await this.findById(orderId);

    if (!order) {
      throw new Error('Order does not exist.');
    }

    const lastStatus = data.statusHistory?.[data.statusHistory.length - 1];
    await this.pool.query(
      `UPDATE orders SET user_id = $1, cart_id = $2, delivery = $3, status = $4, comments = $5 WHERE id = $6`,
      [
        data.userId,
        data.cartId,
        JSON.stringify(data.address),
        lastStatus?.status ?? 'OPEN',
        lastStatus?.comment ?? null,
        orderId,
      ],
    );
  }

  private mapRow(row: any): Order {
    return {
      id: row.id,
      userId: row.user_id,
      cartId: row.cart_id,
      address: row.delivery,
      items: [],
      statusHistory: [{ status: row.status, timestamp: 0, comment: row.comments ?? '' }],
    };
  }
}
