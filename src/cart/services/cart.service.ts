import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { Cart, CartStatuses } from '../models';
import { PutCartPayload } from 'src/order/type';
import { PG_POOL } from 'src/database/database.module';

@Injectable()
export class CartService {
  constructor(@Inject(PG_POOL) private pool: Pool) {}

  async findByUserId(userId: string): Promise<Cart | null> {
    const { rows: cartRows } = await this.pool.query(
      `SELECT * FROM carts WHERE user_id = $1 AND status = $2`,
      [userId, CartStatuses.OPEN],
    );

    if (!cartRows.length) return null;

    const cart = cartRows[0];
    const { rows: itemRows } = await this.pool.query(
      `SELECT * FROM cart_items WHERE cart_id = $1`,
      [cart.id],
    );

    return {
      id: cart.id,
      user_id: cart.user_id,
      created_at: new Date(cart.created_at).getTime(),
      updated_at: new Date(cart.updated_at).getTime(),
      status: cart.status,
      items: itemRows.map((row) => ({
        product: { id: row.product_id, title: '', description: '', price: 0 },
        count: row.count,
      })),
    };
  }

  async createByUserId(user_id: string): Promise<Cart> {
    const id = randomUUID();
    const now = new Date();

    await this.pool.query(
      `INSERT INTO carts (id, user_id, created_at, updated_at, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, user_id, now, now, CartStatuses.OPEN],
    );

    return {
      id,
      user_id,
      created_at: now.getTime(),
      updated_at: now.getTime(),
      status: CartStatuses.OPEN,
      items: [],
    };
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    const cart = await this.findByUserId(userId);
    return cart ?? this.createByUserId(userId);
  }

  async updateByUserId(userId: string, payload: PutCartPayload): Promise<Cart> {
    const cart = await this.findOrCreateByUserId(userId);
    const { product, count } = payload;

    if (count === 0) {
      await this.pool.query(
        `DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2`,
        [cart.id, product.id],
      );
    } else {
      await this.pool.query(
        `INSERT INTO cart_items (cart_id, product_id, count)
         VALUES ($1, $2, $3)
         ON CONFLICT (cart_id, product_id)
         DO UPDATE SET count = $3`,
        [cart.id, product.id, count],
      );
    }

    await this.pool.query(
      `UPDATE carts SET updated_at = $1 WHERE id = $2`,
      [new Date(), cart.id],
    );

    return this.findByUserId(userId);
  }

  async setOrdered(cartId: string): Promise<void> {
    await this.pool.query(
      `UPDATE carts SET status = $1::cart_status, updated_at = $2 WHERE id = $3`,
      [CartStatuses.ORDERED, new Date(), cartId],
    );
  }

  async removeByUserId(userId: string): Promise<void> {
    await this.pool.query(`DELETE FROM carts WHERE user_id = $1`, [userId]);
  }
}
