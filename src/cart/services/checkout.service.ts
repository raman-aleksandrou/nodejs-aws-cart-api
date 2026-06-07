import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { PG_POOL } from 'src/database/database.module';
import { Order } from 'src/order/models';
import { Address } from 'src/order/type';

@Injectable()
export class CheckoutService {
  constructor(@Inject(PG_POOL) private pool: Pool) {}

  async checkout(
    userId: string,
    cartId: string,
    address: Address,
    total: number,
  ): Promise<Order> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const orderId = randomUUID();
      await client.query(
        `INSERT INTO orders (id, user_id, cart_id, payment, delivery, comments, total, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::order_status)`,
        [orderId, userId, cartId, null, JSON.stringify(address), null, total, 'OPEN'],
      );

      await client.query(
        `UPDATE carts SET status = 'ORDERED'::cart_status, updated_at = $1 WHERE id = $2`,
        [new Date(), cartId],
      );

      await client.query('COMMIT');

      const { rows } = await client.query(
        `SELECT * FROM orders WHERE id = $1`,
        [orderId],
      );
      const row = rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        cartId: row.cart_id,
        address: row.delivery,
        items: [],
        statusHistory: [{ status: row.status, timestamp: 0, comment: row.comments ?? '' }],
      };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}
